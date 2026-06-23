#!/usr/bin/env bun

import {
  createCliRenderer,
  BoxRenderable,
  TextRenderable,
  InputRenderable,
  InputRenderableEvents,
  TextareaRenderable,
  SelectRenderable,
  SelectRenderableEvents,
  ScrollBoxRenderable,
  type CliRenderer,
  type KeyEvent,
  type SelectOption,
  type StyledText,
  type PasteEvent,
  t,
  fg,
  bold,
} from "@opentui/core";
import { spawn } from "child_process";
import { cwd as getCwd } from "process";

import {
  ALL_MODELS,
  OPENCODE_ZEN_MODELS,
  getProviderDisplayName,
  getProviderModels,
  sortModelsByCost,
  type Model,
  type CustomModel,
  type CostTier,
  type CommandHistory,
  type Config,
  type Provider,
  type ThinkingLevel,
  type ChatMessage,
  type SafetyAnalysis,
  isCustomModel,
} from "./lib/types";
import { loadConfig, saveConfig, getApiKey, setApiKey, loadHistory, addToHistory, getCustomModels, getCustomModel } from "./lib/config";
import { analyzeCommand, getSeverityColor } from "./lib/safety";
import { translateToCommand, getShellInfo } from "./lib/api";
import { getTheme, setTheme, themes, themeNames, loadTheme } from "./lib/theme";
import {
  getCurrentVersion,
  processUpdateCheck,
  formatUpdateMessageForTui,
} from "./lib/update-checker";

// Global state
let renderer: CliRenderer;
let currentModel: Model | CustomModel = OPENCODE_ZEN_MODELS[0]; // Default to current free Zen model
let config: Config;
let history: CommandHistory[] = [];
let currentCwd = getCwd();
let dryRunMode = false;

// Chat state
let chatMessages: ChatMessage[] = [];
let messageIdCounter = 0;
let selectedMessageIndex = -1; // -1 means input is focused, >= 0 means a message is selected

// UI Elements
let mainContainer: BoxRenderable;
let headerText: TextRenderable;
let statusBarText: TextRenderable;
let chatScrollBox: ScrollBoxRenderable;
let inputField: TextareaRenderable;
let inputContainer: BoxRenderable;

function getApiKeyUrl(provider: Provider): string {
  switch (provider) {
    case "opencode-zen":
      return "https://opencode.ai/auth";
    case "openrouter":
      return "https://openrouter.ai/keys";
    case "vercel-ai-gateway":
      return "https://vercel.com/docs/ai-gateway";
    case "cloudflare-ai-gateway":
      return "https://developers.cloudflare.com/ai-gateway/";
    case "workers-ai":
      return "https://dash.cloudflare.com/profile/api-tokens";
    case "custom":
      return "";
  }
}
let inputHintText: TextRenderable;
let helpBarText: TextRenderable;
let slashCommandMatches: SlashCommand[] = [];
let slashCommandSelectedIndex = 0;
let slashCommandSyncQueued = false;
let slashCommandExecuting = false;
let slashCommandDismissedInput: string | null = null;

// Pending command state (for the most recent assistant message awaiting confirmation)
let pendingMessageId: string | null = null;
let awaitingConfirmation = false;

// Helper to generate message IDs
function generateMessageId(): string {
  return `msg-${++messageIdCounter}`;
}

function isFreeModel(model: Model | CustomModel): model is Model & { cost: "free" } {
  return !isCustomModel(model) && model.cost === "free";
}

function getCostTier(model: Model | CustomModel): CostTier {
  if (!isCustomModel(model)) return model.cost;
  return model.category === "fast" ? "lower-cost" : "premium";
}

function costTierLabel(tier: CostTier): string {
  switch (tier) {
    case "free":
      return "Free";
    case "lower-cost":
      return "Lower Cost";
    case "premium":
      return "Premium";
  }
}

function getModelDisplayName(model: Model): string {
  return model.cost === "free" ? model.name.replace(/\s+Free$/i, "") : model.name;
}

async function main() {
  config = loadConfig();
  history = loadHistory();
  dryRunMode = config.dryRunByDefault;
  loadTheme(); // Load theme from config

  // Set current model from config - check custom models first
  const customModel = await getCustomModel(config.defaultModel);
  if (customModel) {
    currentModel = customModel;
  } else {
    const savedModel = ALL_MODELS.find((m) => m.id === config.defaultModel);
    if (savedModel) {
      currentModel = savedModel;
    }
  }

  renderer = await createCliRenderer({
    exitOnCtrlC: false,
    useMouse: false,
  });

  // Use theme background color
  const theme = getTheme();
  renderer.setBackgroundColor(theme.colors.background);

  // Check for API key for current provider
  const apiKey = await getApiKey(config.provider);
  if (!apiKey) {
    await showProviderSetup();
  } else {
    createMainUI();
  }
}

async function showProviderSetup() {
  const container = new BoxRenderable(renderer, {
    id: "setup-container",
    flexDirection: "column",
    padding: 2,
    width: "100%",
    height: "100%",
  });
  renderer.root.add(container);

  const title = new TextRenderable(renderer, {
    id: "setup-title",
    content: t`${bold(fg("#60a5fa")("Magic Shell Setup"))}`,
    marginBottom: 1,
  });
  container.add(title);

  const subtitle = new TextRenderable(renderer, {
    id: "setup-subtitle",
    content: t`${fg("#94a3b8")("Choose your AI provider:")}`,
    marginBottom: 1,
  });
  container.add(subtitle);

  const options: SelectOption[] = [
    {
      name: "OpenCode Zen (Recommended)",
      description: "Curated coding models with a generous free tier.",
      value: "opencode-zen",
    },
    {
      name: "OpenRouter",
      description: "Broad model catalog across major providers.",
      value: "openrouter",
    },
    {
      name: "Vercel AI Gateway",
      description: "Vercel-hosted gateway for managed model access.",
      value: "vercel-ai-gateway",
    },
    {
      name: "Cloudflare AI Gateway",
      description: "Cloudflare gateway for provider and Workers AI routing.",
      value: "cloudflare-ai-gateway",
    },
    {
      name: "Cloudflare Workers AI",
      description: "Cloudflare-hosted models with direct Workers AI access.",
      value: "workers-ai",
    },
  ];

  let providerSetupModal: ModalListHandle | null = null

  providerSetupModal = openModalList({
    containerId: "provider-setup-container",
    selectorId: "provider-select",
    title: "Choose Provider",
    width: 65,
    options,
    onSelect: async (_: number, option: SelectOption) => {
      const provider = option.value as Provider;
      config.provider = provider;
      saveConfig(config);

      providerSetupModal?.close();
      providerSetupModal = null;
      renderer.root.remove("setup-container");

      await showApiKeyInput(provider, {
        onCancel: () => {
          showProviderSetup()
        },
      });
    },
  });

  const hint = new TextRenderable(renderer, {
    id: "setup-hint",
    content: t`
${fg("#64748b")("Use arrow keys to select | Enter to confirm | Ctrl+C to exit")}`,
    marginTop: 1,
  });
  container.add(hint);
}

async function showApiKeyInput(provider: Provider, options?: { onCancel?: () => void }) {
  if (apiKeyModal) return
  apiKeyModalOnCancel = options?.onCancel ?? null

  const url = getApiKeyUrl(provider)
  const extraText = provider === "opencode-zen"
    ? "Tip: OpenCode Zen has free models like Kimi K2.6 and DeepSeek V4 Flash!"
    : undefined

  apiKeyModal = openInputModal({
    containerId: "apikey-modal",
    title: `${getProviderDisplayName(provider)} Setup`,
    width: 72,
    height: provider === "opencode-zen" ? 13 : 11,
    placeholder: provider === "openrouter" ? "API key or token" : "API token",
    description: [
      `Get your API key from: ${url}`,
      "",
      "Enter your API key below:",
    ].join("\n"),
    extraText,
    onSubmit: (value: string) => {
      const trimmed = value.trim()
      if (!trimmed) return

      setApiKey(provider, trimmed)

      const providerModels = getProviderModels(provider)
      currentModel = providerModels.find((m) => !m.disabled) || providerModels[0] || OPENCODE_ZEN_MODELS[0]
      config.defaultModel = currentModel.id
      saveConfig(config)

      closeApiKeyModal()
      createMainUI()
    },
  })

}

function createMainUI() {
  const theme = getTheme();

  // Main container - full screen flex column
  mainContainer = new BoxRenderable(renderer, {
    id: "main-container",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    padding: 1,
  });
  renderer.root.add(mainContainer);

  // === Header Row ===
  const headerRow = new BoxRenderable(renderer, {
    id: "header-row",
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    marginBottom: 1,
  });
  mainContainer.add(headerRow);

  headerText = new TextRenderable(renderer, {
    id: "header-text",
    content: t`${bold(fg(theme.colors.primary)("magic-shell"))}`,
    flexGrow: 1,
  });
  headerRow.add(headerText);

  // === Status Bar (provider, model info, safe indicator) ===
  statusBarText = new TextRenderable(renderer, {
    id: "status-bar-text",
    content: getStatusBarContent(),
    marginBottom: 1,
  });
  mainContainer.add(statusBarText);

  // === Chat History (scrollable) ===
  chatScrollBox = new ScrollBoxRenderable(renderer, {
    id: "chat-scroll-box",
    flexGrow: 1,
    width: "100%",
    scrollY: true,
    scrollX: false,
    stickyScroll: true,
    stickyStart: "bottom",
    rootOptions: {
      border: true,
      borderColor: theme.colors.border,
      borderStyle: "single",
    },
    viewportOptions: {
      backgroundColor: theme.colors.background,
      paddingLeft: 1,
      paddingRight: 1,
      paddingTop: 1,
    },
    contentOptions: {
      flexDirection: "column",
      gap: 1,
    },
  });
  mainContainer.add(chatScrollBox);

  // Add welcome message
  addSystemMessage(getWelcomeMessage());
  void handleStartupUpdateCheck();

  // === Input Container (at bottom) - OpenCode style ===
  inputContainer = new BoxRenderable(renderer, {
    id: "input-container",
    flexDirection: "column",
    width: "100%",
    marginTop: 1,
    border: true,
    borderColor: theme.colors.primary, // Use primary color for accent
    borderStyle: "rounded",
    paddingLeft: 1,
    paddingRight: 1,
    paddingTop: 0,
    paddingBottom: 1,
    backgroundColor: theme.colors.backgroundPanel,
  });
  mainContainer.add(inputContainer);

  // Textarea input field (multiline)
  // Custom keybindings: Enter = submit
  inputField = new TextareaRenderable(renderer, {
    id: "input-field",
    width: "100%",
    height: 3,
    placeholder: t`${fg(theme.colors.textMuted)("Describe what you want to do...")}`,
    backgroundColor: "transparent",
    focusedBackgroundColor: "transparent",
    textColor: theme.colors.text,
    keyBindings: [
      // Match OpenCode: Enter submits; shifted/modified Enter inserts a newline.
      { name: "return", action: "submit" },
      { name: "linefeed", action: "submit" },
      { name: "return", shift: true, action: "newline" },
      { name: "linefeed", shift: true, action: "newline" },
      { name: "return", ctrl: true, action: "newline" },
      { name: "return", meta: true, action: "newline" },
      { name: "j", ctrl: true, action: "newline" },
    ],
    onSubmit: () => {
      if (slashCommandModal && slashCommandMatches.length > 0) {
        void executeSelectedSlashCommand();
        return;
      }
      const value = inputField.editBuffer.getText();
      void handleInput(value);
    },
  });
  inputContainer.add(inputField);

  // Input hint bar (outside the border, below textarea)
  inputHintText = new TextRenderable(renderer, {
    id: "input-hint",
    content: getInputHintContent(),
    marginTop: 1,
  });
  mainContainer.add(inputHintText);

  // === Help Bar (bottom) ===
  helpBarText = new TextRenderable(renderer, {
    id: "help-bar-text",
    content: getHelpBarContent(),
    marginTop: 1,
  });
  mainContainer.add(helpBarText);

  // Event handlers
  renderer.keyInput.on("keypress", handleKeypress);
  renderer.keyInput.on("keypress", queueSlashCommandSync);

  inputField.focus();
}

// === Chat Message Rendering Helpers ===

function getStatusBarContent(): StyledText {
  const theme = getTheme();
  const providerName = getProviderDisplayName(config.provider);
  const safeModeIndicator = dryRunMode ? fg(theme.colors.warning)("[DRY RUN]") : "";
  const safetyLevelColor = config.safetyLevel === "strict" ? theme.colors.warning : config.safetyLevel === "relaxed" ? theme.colors.error : theme.colors.success;
  const safetyIndicator = fg(safetyLevelColor)(`[${config.safetyLevel}]`);
  const thinkingIndicator = config.thinkingLevel !== "off" ? fg(theme.colors.secondary)(`[Think:${config.thinkingLevel}]`) : "";
  const repoContextIndicator = config.repoContext ? fg(theme.colors.info)("[Repo]") : "";

  return t`${fg(theme.colors.textMuted)("Provider:")} ${fg(theme.colors.text)(providerName)}  ${fg(theme.colors.textMuted)("Model:")} ${fg(theme.colors.text)(currentModel.name)}  ${safetyIndicator}${thinkingIndicator ? " " : ""}${thinkingIndicator}${safeModeIndicator ? " " : ""}${safeModeIndicator}${repoContextIndicator ? " " : ""}${repoContextIndicator}`;
}

function getHelpBarContent(): StyledText {
  const theme = getTheme();
  if (awaitingConfirmation) {
    return t`${fg(theme.colors.warning)(">>> Cmd+Enter or Enter to execute <<<")} ${fg(theme.colors.textMuted)("|")} ${fg(theme.colors.error)("Esc")}${fg(theme.colors.textMuted)(" Cancel")} ${fg(theme.colors.primary)("e")}${fg(theme.colors.textMuted)(" Edit")} ${fg(theme.colors.primary)("c")}${fg(theme.colors.textMuted)(" Copy")}`;
  }
  return t`${fg(theme.colors.primary)("Ctrl+P")}${fg(theme.colors.textMuted)(" Commands")}  ${fg(theme.colors.primary)("Ctrl+T")}${fg(theme.colors.textMuted)(" Think")}  ${fg(theme.colors.primary)("Ctrl+Y")}${fg(theme.colors.textMuted)(" Safety")}  ${fg(theme.colors.primary)("Ctrl+C")}${fg(theme.colors.textMuted)(" Exit")}  ${fg(theme.colors.primary)("Esc")}${fg(theme.colors.textMuted)(" Cancel")}`;
}

function getInputHintContent(): StyledText {
  const theme = getTheme();
  return t`${fg(theme.colors.primary)("Enter")} ${fg(theme.colors.textMuted)("to send")}`;
}

function getWelcomeMessage(): string {
  const providerName = getProviderDisplayName(config.provider);
  return `Ready. Using ${providerName}.\nType what you want to do, or press Ctrl+P for Commands.`;
}

async function handleStartupUpdateCheck(): Promise<void> {
  try {
    const result = await processUpdateCheck({
      checkForUpdates: config.checkForUpdates !== false,
      autoUpdate: config.autoUpdate === true,
    });

    switch (result.action) {
      case "notified":
        addSystemMessage(formatUpdateMessageForTui(result.update, false));
        break;
      case "updated":
        if (result.success) {
          addSystemMessage(
            `Updated to v${result.update.latestVersion}. Restart mshell to use the new version.`,
          );
        } else {
          addSystemMessage(
            `Auto-update failed:\n${result.output}\nTry manually: ${result.update.updateCommand}`,
          );
        }
        break;
    }
  } catch {
    // Silently ignore update check errors
  }
}

async function runManualUpdate(): Promise<void> {
  addSystemMessage("Checking for updates...");

  try {
    const result = await processUpdateCheck({
      checkForUpdates: true,
      autoUpdate: false,
      force: true,
      install: true,
    });

    switch (result.action) {
      case "up-to-date":
        addSystemMessage(`Already on the latest version (${result.currentVersion}).`);
        break;
      case "updated":
        if (result.success) {
          addSystemMessage(
            `Updated to v${result.update.latestVersion}. Restart mshell to use the new version.`,
          );
        } else {
          addSystemMessage(
            `Update failed:\n${result.output}\nTry manually: ${result.update.updateCommand}`,
          );
        }
        break;
      case "none":
        addSystemMessage("Could not check for updates.");
        break;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    addSystemMessage(`Update check failed: ${message}`);
  }
}

function toggleAutoUpdate(): void {
  config.autoUpdate = !config.autoUpdate;
  if (config.autoUpdate) {
    config.checkForUpdates = true;
  }
  saveConfig(config);
  addSystemMessage(`Auto-update: ${config.autoUpdate ? "ON" : "OFF"}`);
}

function addSystemMessage(content: string): ChatMessage {
  const msg: ChatMessage = {
    id: generateMessageId(),
    type: "system",
    content,
    timestamp: Date.now(),
  };
  chatMessages.push(msg);
  renderMessage(msg);
  return msg;
}

function addUserMessage(content: string): ChatMessage {
  const msg: ChatMessage = {
    id: generateMessageId(),
    type: "user",
    content,
    timestamp: Date.now(),
  };
  chatMessages.push(msg);
  renderMessage(msg);
  return msg;
}

function addAssistantMessage(content: string, command: string, safety: SafetyAnalysis): ChatMessage {
  const msg: ChatMessage = {
    id: generateMessageId(),
    type: "assistant",
    content,
    command,
    safety,
    timestamp: Date.now(),
    executed: false,
  };
  chatMessages.push(msg);
  renderMessage(msg);
  return msg;
}

function addResultMessage(content: string, exitCode: number | undefined, executionKind: ChatMessage["executionKind"], parentMessageId?: string): ChatMessage {
  const msg: ChatMessage = {
    id: generateMessageId(),
    type: "result",
    content,
    timestamp: Date.now(),
    exitCode,
    executionKind,
    parentMessageId,
  };
  chatMessages.push(msg);
  renderMessage(msg);
  return msg;
}

function renderMessage(msg: ChatMessage): void {
  const theme = getTheme();
  const msgBox = createMessageRenderable(msg, theme);
  chatScrollBox.add(msgBox);
}

function createMessageRenderable(msg: ChatMessage, theme: ReturnType<typeof getTheme>): BoxRenderable {
  switch (msg.type) {
    case "user":
      return createUserMessageRenderable(msg, theme);
    case "assistant":
      return createAssistantMessageRenderable(msg, theme);
    case "result":
      return createResultMessageRenderable(msg, theme);
    case "system":
    default:
      return createSystemMessageRenderable(msg, theme);
  }
}

function createUserMessageRenderable(msg: ChatMessage, theme: ReturnType<typeof getTheme>): BoxRenderable {
  const box = new BoxRenderable(renderer, {
    id: `msg-${msg.id}`,
    flexDirection: "row",
    width: "100%",
  });

  const text = new TextRenderable(renderer, {
    id: `msg-${msg.id}-text`,
    content: t`${fg(theme.colors.success)(">")} ${fg(theme.colors.text)(msg.content)}`,
  });
  box.add(text);

  return box;
}

function createAssistantMessageRenderable(msg: ChatMessage, theme: ReturnType<typeof getTheme>): BoxRenderable {
  const isSelected = pendingMessageId === msg.id;

  // Card container
  const card = new BoxRenderable(renderer, {
    id: `msg-${msg.id}`,
    flexDirection: "column",
    width: "100%",
    border: true,
    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
    borderStyle: "rounded",
    paddingLeft: 1,
    paddingRight: 1,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: theme.colors.backgroundPanel,
  });

  // Command line
  const commandText = new TextRenderable(renderer, {
    id: `msg-${msg.id}-cmd`,
    content: t`${fg(theme.colors.textMuted)("Command:")} ${fg(theme.colors.secondary)(msg.command || "")}`,
  });
  card.add(commandText);

  // Safety badge
  if (msg.safety) {
    const severityColor = getSeverityColor(msg.safety.severity);
    const severityLabel = msg.safety.severity === "low" ? "Low risk" : `${msg.safety.severity[0].toUpperCase()}${msg.safety.severity.slice(1)} risk`;

    const safetyText = new TextRenderable(renderer, {
      id: `msg-${msg.id}-safety`,
      content: t`${fg(severityColor)(severityLabel)}`,
    });
    card.add(safetyText);

    if (msg.safety.isDangerous && msg.safety.reason) {
      const reasonText = new TextRenderable(renderer, {
        id: `msg-${msg.id}-safety-reason`,
        content: t`${fg(theme.colors.textMuted)(msg.safety.reason)}`,
      });
      card.add(reasonText);
    }
  }

  // Actions hint (only if awaiting confirmation for this message)
  if (isSelected && !msg.executed) {
    const actionsText = new TextRenderable(renderer, {
      id: `msg-${msg.id}-actions`,
      content: t`${fg(theme.colors.warning)("Cmd+Enter or Enter to run")} ${fg(theme.colors.textMuted)("|")} ${fg(theme.colors.primary)("[c]")} ${fg(theme.colors.textMuted)("Copy")} ${fg(theme.colors.primary)("[e]")} ${fg(theme.colors.textMuted)("Edit")} ${fg(theme.colors.error)("[Esc]")} ${fg(theme.colors.textMuted)("Cancel")}`,
    });
    card.add(actionsText);
  }

  return card;
}

function createResultMessageRenderable(msg: ChatMessage, theme: ReturnType<typeof getTheme>): BoxRenderable {
  const isSuccess = msg.exitCode === undefined || msg.exitCode === 0;
  const isExpanded = msg.expanded ?? false;
  const hasOutput = msg.content && msg.content.trim().length > 0;
  const outputLines = hasOutput ? msg.content.trim().split("\n") : [];
  const isLongOutput = outputLines.length > 5;
  const PREVIEW_LINES = 3;
  const executionKind = msg.executionKind || "manual";

  const card = new BoxRenderable(renderer, {
    id: `msg-${msg.id}`,
    flexDirection: "column",
    width: "100%",
    border: true,
    borderColor: theme.colors.border,
    borderStyle: "rounded",
    paddingLeft: 1,
    paddingRight: 1,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: theme.colors.backgroundPanel,
    // Click to expand/collapse
    onMouseDown: isLongOutput
      ? () => {
          toggleResultExpand(msg.id);
        }
      : undefined,
  });

  // Status line with expand/collapse indicator
  const statusColor = isSuccess ? theme.colors.success : theme.colors.error;
  const statusLabel = isSuccess ? (executionKind === "auto" ? "Auto-executed (safe command)" : executionKind === "dry-run" ? "Dry run (not executed)" : "Executed (confirmed)") : `Command failed (exit code: ${msg.exitCode})`;
  const expandIcon = isLongOutput ? (isExpanded ? "▼" : "▶") : "";
  const lineCount = isLongOutput ? ` (${outputLines.length} lines)` : "";

  const statusText = new TextRenderable(renderer, {
    id: `msg-${msg.id}-status`,
    content: t`${fg(statusColor)(">")} ${fg(statusColor)(statusLabel)}${fg(theme.colors.textMuted)(lineCount)} ${fg(theme.colors.primary)(expandIcon)}`,
  });
  card.add(statusText);

  // Output display
  if (hasOutput) {
    let displayContent: string;

    if (isExpanded || !isLongOutput) {
      // Show full output
      displayContent = msg.content.trim();
    } else {
      // Show preview with truncation indicator
      const previewLines = outputLines.slice(0, PREVIEW_LINES);
      displayContent = previewLines.join("\n") + `\n... ${outputLines.length - PREVIEW_LINES} more lines`;
    }

    const outputBox = new BoxRenderable(renderer, {
      id: `msg-${msg.id}-output-box`,
      flexDirection: "column",
      width: "100%",
      border: true,
      borderColor: theme.colors.borderSubtle,
      borderStyle: "single",
      paddingLeft: 1,
      paddingRight: 1,
      paddingTop: 0,
      paddingBottom: 0,
      backgroundColor: theme.colors.backgroundElement,
      marginTop: 1,
    });

    const outputText = new TextRenderable(renderer, {
      id: `msg-${msg.id}-output`,
      content: t`${fg(theme.colors.textMuted)(displayContent)}`,
    });
    outputBox.add(outputText);
    card.add(outputBox);

    // Show expand/collapse hint for long output
    if (isLongOutput) {
      const hintText = new TextRenderable(renderer, {
        id: `msg-${msg.id}-hint`,
        content: t`${fg(theme.colors.primary)("[o]")} ${fg(theme.colors.textMuted)(isExpanded ? "Collapse" : "Expand output")}`,
      });
      card.add(hintText);
    }
  }

  return card;
}

function createSystemMessageRenderable(msg: ChatMessage, theme: ReturnType<typeof getTheme>): BoxRenderable {
  const box = new BoxRenderable(renderer, {
    id: `msg-${msg.id}`,
    flexDirection: "column",
    width: "100%",
  });

  const text = new TextRenderable(renderer, {
    id: `msg-${msg.id}-text`,
    content: t`${fg(theme.colors.textMuted)(msg.content)}`,
  });
  box.add(text);

  return box;
}

function updateAssistantMessage(msgId: string, updates: Partial<ChatMessage>): void {
  const msgIndex = chatMessages.findIndex((m) => m.id === msgId);
  if (msgIndex === -1) return;

  const msg = chatMessages[msgIndex];
  Object.assign(msg, updates);

  // Re-render the message by removing and re-adding
  chatScrollBox.remove(`msg-${msgId}`);
  const theme = getTheme();
  const newBox = createMessageRenderable(msg, theme);
  // Insert at correct position (after user message)
  chatScrollBox.add(newBox);
}

function updateResultMessage(msgId: string, updates: Partial<ChatMessage>): void {
  const msgIndex = chatMessages.findIndex((m) => m.id === msgId);
  if (msgIndex === -1) return;

  const msg = chatMessages[msgIndex];
  Object.assign(msg, updates);

  // Re-render the message
  chatScrollBox.remove(`msg-${msgId}`);
  const theme = getTheme();
  const newBox = createMessageRenderable(msg, theme);
  chatScrollBox.add(newBox);
}

function toggleResultExpand(msgId: string): void {
  const msg = chatMessages.find((m) => m.id === msgId);
  if (!msg || msg.type !== "result") return;

  // Only toggle if it has content worth expanding
  const outputLines = msg.content?.trim().split("\n") || [];
  if (outputLines.length <= 5) return; // Not long enough to need expand

  // Toggle expanded state
  updateResultMessage(msgId, { expanded: !msg.expanded });
}

function toggleLastResultExpand(): void {
  // Find the most recent result message
  const resultMessages = chatMessages.filter((m) => m.type === "result");
  if (resultMessages.length === 0) return;

  const lastResult = resultMessages[resultMessages.length - 1];
  toggleResultExpand(lastResult.id);
}

// Refresh all UI elements with current theme colors
function refreshThemeColors() {
  const theme = getTheme();

  // Update renderer background
  renderer.setBackgroundColor(theme.colors.background);

  // Update header
  if (headerText) {
    headerText.content = t`${bold(fg(theme.colors.primary)("magic-shell"))}`;
  }

  // Update status bar
  if (statusBarText) {
    statusBarText.content = getStatusBarContent();
  }

  // Update help bar
  if (helpBarText) {
    helpBarText.content = getHelpBarContent();
  }

  // Update chat scroll box border
  if (chatScrollBox) {
    chatScrollBox.rootOptions = {
      borderColor: theme.colors.border,
    };
  }

  // Update input field and container colors
  if (inputField) {
    inputField.focusedBackgroundColor = "transparent";
    inputField.textColor = theme.colors.text;
    inputField.placeholder = t`${fg(theme.colors.textMuted)("Describe what you want to do...")}`;
  }
  if (inputContainer) {
    inputContainer.borderColor = theme.colors.primary;
    inputContainer.backgroundColor = theme.colors.backgroundPanel;
  }
  if (inputHintText) {
    inputHintText.content = getInputHintContent();
  }
}

async function handleInput(value: string) {
  const input = value.trim();
  if (!input) return;

  // Handle special commands (both ! and / prefixes)
  if (input.startsWith("/") && await tryHandleSlashCommand(input)) {
    inputField.setText("");
    closeSlashCommandMenu();
    return;
  }

  inputField.setText("");
  closeSlashCommandMenu();

  if (input.startsWith("!")) {
    await handleSpecialCommand(input);
    return;
  }

  // Add user message to chat
  addUserMessage(input);

  // Check if it looks like a direct shell command
  if (isDirectCommand(input)) {
    await processDirectCommand(input, input);
    return;
  }

  // Translate natural language to command
  await translateAndProcess(input);
}

async function executeSelectedSlashCommand(): Promise<void> {
  if (slashCommandExecuting || !slashCommandModal || slashCommandMatches.length === 0) return;

  slashCommandExecuting = true;
  try {
    const selected = slashCommandMatches[Math.min(slashCommandSelectedIndex, slashCommandMatches.length - 1)];
    inputField.setText("");
    closeSlashCommandMenu();
    await selected.action();
  } finally {
    slashCommandExecuting = false;
  }
}

async function tryHandleSlashCommand(input: string): Promise<boolean> {
  if (!input.startsWith("/")) return false;

  const slashBody = input.slice(1).trim().toLowerCase()

  if (!slashBody.includes(" ") && slashCommandMatches.length > 0) {
    const selected = slashCommandMatches[Math.min(slashCommandSelectedIndex, slashCommandMatches.length - 1)]
    const exactMatch = slashCommandMatches.find((cmd) => cmd.slash === slashBody)
    await (exactMatch ?? selected).action()
    return true
  }

  const exactCommand = getSlashCommands().find((cmd) => cmd.slash === slashBody)
  if (exactCommand) {
    await exactCommand.action()
    return true
  }

  await handleSpecialCommand(input);
  return true;
}

function isDirectCommand(input: string): boolean {
  const directCommands = ["ls", "pwd", "cd", "cat", "echo", "mkdir", "touch", "rm", "cp", "mv", "git", "npm", "bun", "node", "python", "pip", "brew", "apt", "docker", "kubectl"];
  const firstWord = input.split(/\s+/)[0].toLowerCase();
  return directCommands.includes(firstWord) || input.startsWith("./") || input.startsWith("/") || input.startsWith("~");
}

async function translateAndProcess(input: string) {
  const apiKey = await getApiKey(config.provider);
  const customModel = isCustomModel(currentModel);
  if (!customModel && !apiKey) {
    addSystemMessage("Error: No API key configured. Run !provider to set up.");
    return;
  }

  // Show a temporary "translating" system message
  const loadingMsg = addSystemMessage("Translating...");

  try {
    const command = await translateToCommand(apiKey, currentModel, input, currentCwd, history, config.repoContext, config);

    // Remove the loading message
    chatScrollBox.remove(`msg-${loadingMsg.id}`);
    chatMessages = chatMessages.filter((m) => m.id !== loadingMsg.id);

    // Analyze safety
    const safety = analyzeCommand(command, config);

    // Add assistant message with the translated command
    const assistantMsg = addAssistantMessage(input, command, safety);

    if (safety.isDangerous) {
      // Mark this message as pending confirmation
      pendingMessageId = assistantMsg.id;
      awaitingConfirmation = true;
      helpBarText.content = getHelpBarContent();
    } else {
      // Safe command - execute immediately
      await executeAndShowResult(input, command, assistantMsg.id);
    }
  } catch (error) {
    // Remove loading message on error
    chatScrollBox.remove(`msg-${loadingMsg.id}`);
    chatMessages = chatMessages.filter((m) => m.id !== loadingMsg.id);

    const message = error instanceof Error ? error.message : String(error);
    addSystemMessage(`Error: ${message}`);
  }
}

// Process a direct shell command (not translated)
async function processDirectCommand(input: string, command: string) {
  // Analyze safety even for direct commands
  const safety = analyzeCommand(command, config);
  const assistantMsg = addAssistantMessage(input, command, safety);

  if (safety.isDangerous) {
    pendingMessageId = assistantMsg.id;
    awaitingConfirmation = true;
    helpBarText.content = getHelpBarContent();
  } else {
    await executeAndShowResult(input, command, assistantMsg.id);
  }
}

// Execute a command and show result in chat
async function executeAndShowResult(input: string, command: string, assistantMsgId: string) {
  const executionKind = getExecutionKind(assistantMsgId, dryRunMode);
  updateAssistantMessage(assistantMsgId, { executed: true });
  // Handle cd specially
  if (command.startsWith("cd ")) {
    const path = command
      .slice(3)
      .trim()
      .replace(/^["']|["']$/g, "");
    try {
      const expandedPath = path.startsWith("~") ? path.replace("~", process.env.HOME || "") : path;
      process.chdir(expandedPath);
      currentCwd = getCwd();

      // Update status bar with new cwd info
      statusBarText.content = getStatusBarContent();

      addResultMessage(`Changed directory to ${currentCwd}`, 0, executionKind, assistantMsgId);

      addToHistory({
        input,
        command,
        output: `Changed to ${currentCwd}`,
        timestamp: Date.now(),
      });
      history = loadHistory();
    } catch (err) {
      addResultMessage(`cd: ${err instanceof Error ? err.message : String(err)}`, 1, executionKind, assistantMsgId);
    }
    clearCommandState();
    return;
  }

  if (dryRunMode) {
    addResultMessage(`[DRY RUN] Would execute: ${command}`, 0, executionKind, assistantMsgId);
    clearCommandState();
    return;
  }

  // Execute command
  try {
    const { output, exitCode } = await executeCommandWithCode(command);
    addResultMessage(output || "Command completed successfully", exitCode, executionKind, assistantMsgId);

    addToHistory({
      input,
      command,
      output: output.slice(0, 500),
      timestamp: Date.now(),
    });
    history = loadHistory();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    addResultMessage(`Error: ${message}`, 1, executionKind, assistantMsgId);
  }

  clearCommandState();
}

function getExecutionKind(assistantMsgId: string, isDryRun: boolean): ChatMessage["executionKind"] {
  if (isDryRun) return "dry-run";
  const assistantMsg = chatMessages.find((msg) => msg.id === assistantMsgId);
  if (!assistantMsg || assistantMsg.type !== "assistant") return "manual";
  return assistantMsg.safety?.isDangerous ? "manual" : "auto";
}

interface CommandResult {
  output: string;
  exitCode: number;
}

function executeCommandWithCode(command: string): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell: true,
      cwd: currentCwd,
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      const exitCode = code ?? 0;
      const output = stdout || stderr || (exitCode === 0 ? "" : `Command exited with code ${exitCode}`);
      resolve({ output, exitCode });
    });
  });
}

function clearCommandState() {
  pendingMessageId = null;
  awaitingConfirmation = false;
  helpBarText.content = getHelpBarContent();
}

async function handleSpecialCommand(input: string) {
  const cmd = input.slice(1).toLowerCase().trim();

  switch (cmd.split(/\s+/)[0]) {
    case "help":
      showHelp();
      break;
    case "model":
    case "models":
      showModelSelector();
      break;
    case "provider":
    case "providers":
      await switchProvider();
      break;
    case "theme":
    case "themes":
      showThemeSelector();
      break;
    case "dry":
      dryRunMode = !dryRunMode;
      statusBarText.content = getStatusBarContent();
      addSystemMessage(`Dry-run mode: ${dryRunMode ? "ON" : "OFF"}`);
      break;
    case "thinking":
    case "think":
      showThinkingSelector();
      break;
    case "safety":
      showSafetySelector();
      break;
    case "config":
      await showConfig();
      break;
    case "history":
      showHistory();
      break;
    case "update":
      await runManualUpdate();
      break;
    case "auto-update":
      toggleAutoUpdate();
      break;
    case "clear":
      clearChat();
      break;
    case "exit":
    case "quit":
      renderer.destroy();
      process.exit(0);
    default:
      // Try to execute as shell command
      if (cmd) {
        addUserMessage(cmd);
        await processDirectCommand(input, cmd);
      }
  }
}

function clearChat() {
  closeSlashCommandMenu();
  // Remove all messages from scroll box and array
  for (const msg of chatMessages) {
    chatScrollBox.remove(`msg-${msg.id}`);
  }
  chatMessages = [];
  // Add fresh welcome message
  addSystemMessage(getWelcomeMessage());
}

function showHelp() {
  const helpText = `Shortcuts:
Ctrl+P  Commands
Ctrl+T  Select thinking level
Ctrl+Y  Select safety level
Ctrl+C  Exit magic-shell
Ctrl+D  Exit magic-shell
Esc     Cancel / Close popup
Ctrl+C  Close popup/cancel first when active

OpenCode Leader (Ctrl+X then...):
M  Change model
T  Change theme
Q  Exit

Commands (type ! or / followed by):
help      Show this help      models    Change model
provider  Switch provider     themes    Change theme
dry       Toggle dry-run      safety   Select safety
thinking  Select thinking
config    Show config         history   Show history
update    Check for updates   auto-update Toggle auto-update
clear     Clear chat          exit      Exit

Safety Levels:
- strict:   Confirm ALL potentially dangerous commands
- moderate: Confirm high/critical severity commands (default)
- relaxed:  Only confirm critical commands

Thinking Levels:
- low:     Default low-cost reasoning for supported models
- medium:  More reasoning for harder translations
- high:    Maximum reasoning for supported models
- off:     Do not request provider thinking controls

Tips:
- Type naturally: "list all files" -> ls -la
- Use ! or / commands: !help, /help, or /models
- Reference history: "do that again", "undo"
- Enable repo context from Commands to use project scripts`;

  addSystemMessage(helpText);
}

async function showConfig() {
  const theme = getTheme();
  const providerName = getProviderDisplayName(config.provider);
  const apiKey = await getApiKey(config.provider);
  const apiKeyStatus = apiKey ? "configured" : "not set";
  const isCustom = isCustomModel(currentModel);
  const freeBadge = isFreeModel(currentModel) ? " (FREE)" : "";
  const customBadge = isCustom ? " (custom)" : "";
  const shellInfo = getShellInfo();

  const configText = `Current Configuration

Provider:     ${providerName}
Model:        ${currentModel.name}${freeBadge}${customBadge}
Model ID:     ${currentModel.id}
Category:     ${currentModel.category}
Theme:        ${theme.name}
Shell:        ${shellInfo.shell} (${shellInfo.shellPath})
Platform:     ${shellInfo.platform}${shellInfo.isWSL ? " (WSL)" : ""}
Safety:       ${config.safetyLevel}
Thinking:     ${config.thinkingLevel}
Dry-run:      ${dryRunMode ? "ON" : "OFF"}
Repo context: ${config.repoContext ? "ON" : "OFF"}
Version:      ${getCurrentVersion()}
Updates:      ${config.checkForUpdates !== false ? "checking enabled" : "checking disabled"}
Auto-update:  ${config.autoUpdate ? "ON" : "OFF"}
API Key:      ${apiKeyStatus}
History:      ${history.length} commands`;

  addSystemMessage(configText);
}

function showHistory() {
  if (history.length === 0) {
    addSystemMessage("No command history yet.");
    return;
  }

  const recent = history.slice(-10);
  const lines = recent.map((entry, i) => {
    const date = new Date(entry.timestamp).toLocaleTimeString();
    return `${i + 1}. [${date}] ${entry.command}`;
  });

  addSystemMessage(`Recent Command History\n\n${lines.join("\n")}`);
}

async function switchProvider() {
  if (providerModal) return;

  const providers: Array<{ provider: Provider; description: string }> = [
    { provider: "opencode-zen", description: "Curated coding models with a generous free tier." },
    { provider: "openrouter", description: "Broad model catalog across major providers." },
    { provider: "vercel-ai-gateway", description: "Vercel-hosted gateway for managed model access." },
    { provider: "cloudflare-ai-gateway", description: "Cloudflare gateway for provider and Workers AI routing." },
    { provider: "workers-ai", description: "Cloudflare-hosted models with direct Workers AI access." },
  ];

  const options: SelectOption[] = await Promise.all(
    providers.map(async ({ provider, description }) => {
      const key = await getApiKey(provider);
      return {
        name: `${getProviderDisplayName(provider)}${key ? " (configured)" : ""}`,
        description,
        value: provider,
      };
    }),
  );

  providerModal = openModalList({
    containerId: "provider-selector-container",
    selectorId: "provider-switch-select",
    title: "Switch Provider",
    width: 65,
    options,
    selectedIndex: Math.max(0, providers.findIndex(({ provider }) => provider === config.provider)),
    onSelect: async (_: number, option: SelectOption) => {
      const newProvider = option.value as Provider;
      const existingKey = await getApiKey(newProvider);

      if (existingKey) {
        config.provider = newProvider;
        const models = getProviderModels(newProvider);
        currentModel = models.find((m) => m.id === config.defaultModel) || models[0];
        config.defaultModel = currentModel.id;
        saveConfig(config);
        statusBarText.content = getStatusBarContent();
        closeProviderModal();

        const providerName = getProviderDisplayName(newProvider);
        addSystemMessage(`Switched to ${providerName}. Model: ${currentModel.name}`);
      } else {
        closeProviderModal();
        await showApiKeyInput(newProvider);
      }
    },
  });
}

function showModelSelector() {
  if (modelModal) return;

  const allModels = getProviderModels(config.provider);
  const availableModels = allModels.filter((m) => !m.disabled);
  const sortedModels = sortModelsByCost(availableModels);
  const customModels = getCustomModels().sort((a, b) => a.name.localeCompare(b.name));

  const options: SelectOption[] = [
    ...sortedModels.map((model) => ({
      name: `${getModelDisplayName(model)} [${costTierLabel(model.cost)}]`,
      description: model.description,
      value: model as Model | CustomModel,
    })),
    ...customModels.map((model) => ({
      name: `${model.name} [Custom]`,
      description: `${model.baseUrl} - ${model.modelId}`,
      value: model as Model | CustomModel,
    })),
  ];

  modelModal = openModalList({
    containerId: "model-selector-container",
    selectorId: "model-select",
    title: `Select Model (${getProviderDisplayName(config.provider)})`,
    width: 75,
    options,
    showScrollIndicator: true,
    selectedIndex: Math.max(0, options.findIndex((option) => (option.value as Model | CustomModel).id === currentModel.id)),
    onSelect: (_: number, option: SelectOption) => {
      currentModel = option.value as Model | CustomModel;
      config.defaultModel = currentModel.id;
      saveConfig(config);
      statusBarText.content = getStatusBarContent();
      closeModelModal();

      const isCustom = isCustomModel(currentModel);
      const freeBadge = isFreeModel(currentModel) ? " (FREE)" : "";
      const customBadge = isCustom ? " (custom)" : "";
      addSystemMessage(`Model changed to ${currentModel.name}${freeBadge}${customBadge}`);
    },
  });
}

function showThemeSelector() {
  if (themeModal) return;

  const currentTheme = getTheme();
  const options: SelectOption[] = themeNames.map((name) => ({
    name: name === currentTheme.name ? `${name} (current)` : name,
    description: "",
    value: name,
  }));

  themeModal = openModalList({
    containerId: "theme-selector-container",
    selectorId: "theme-select",
    title: "Select Theme",
    width: 45,
    options,
    showDescription: false,
    selectedIndex: Math.max(0, themeNames.findIndex((name) => name === currentTheme.name)),
    onSelect: (_: number, option: SelectOption) => {
      const themeName = option.value as string;
      setTheme(themeName);
      closeThemeModal();
      refreshThemeColors();
      addSystemMessage(`Theme changed to ${themeName}`);
    },
  });
}

function showSafetySelector(): void {
  if (safetyModal) return;

  const levels: Array<Config["safetyLevel"]> = ["strict", "moderate", "relaxed"];
  const descriptions: Record<Config["safetyLevel"], string> = {
    strict: "Confirm every potentially dangerous command.",
    moderate: "Confirm high and critical risk commands.",
    relaxed: "Only confirm critical risk commands.",
  };

  safetyModal = openModalList({
    containerId: "safety-selector-container",
    selectorId: "safety-select",
    title: "Safety Level",
    width: 58,
    options: levels.map((level) => ({
      name: level === config.safetyLevel ? `${level} (current)` : level,
      description: descriptions[level],
      value: level,
    })),
    selectedIndex: Math.max(0, levels.findIndex((level) => level === config.safetyLevel)),
    onSelect: (_: number, option: SelectOption) => {
      config.safetyLevel = option.value as Config["safetyLevel"];
      saveConfig(config);
      statusBarText.content = getStatusBarContent();
      closeSafetyModal();
      addSystemMessage(`Safety level: ${config.safetyLevel}`);
    },
  });
}

function showThinkingSelector(): void {
  if (thinkingModal) return;

  const levels: ThinkingLevel[] = ["low", "medium", "high", "off"];
  const descriptions: Record<ThinkingLevel, string> = {
    low: "Use light reasoning for supported models.",
    medium: "Use balanced reasoning for supported models.",
    high: "Use maximum reasoning for supported models.",
    off: "Disable extra reasoning controls.",
  };

  thinkingModal = openModalList({
    containerId: "thinking-selector-container",
    selectorId: "thinking-select",
    title: "Thinking Level",
    width: 58,
    options: levels.map((level) => ({
      name: level === config.thinkingLevel ? `${level} (current)` : level,
      description: descriptions[level],
      value: level,
    })),
    selectedIndex: Math.max(0, levels.findIndex((level) => level === config.thinkingLevel)),
    onSelect: (_: number, option: SelectOption) => {
      config.thinkingLevel = option.value as ThinkingLevel;
      saveConfig(config);
      statusBarText.content = getStatusBarContent();
      closeThinkingModal();
      addSystemMessage(`Thinking level: ${config.thinkingLevel}`);
    },
  });
}

// Modal list state (shared by command palette and slash commands)
const MODAL_LIST_WIDTH = 55;
const MODAL_LIST_MAX_ITEMS = 12;
const MODAL_LIST_FRAME_HEIGHT = 4;

interface ModalListHandle {
  containerId: string;
  container: BoxRenderable;
  selector: SelectRenderable;
  updateOptions: (options: SelectOption[], selectedIndex?: number) => void;
  close: () => void;
}

interface InputModalHandle {
  containerId: string;
  container: BoxRenderable;
  input: InputRenderable;
  close: () => void;
}

let providerModal: ModalListHandle | null = null;
let modelModal: ModalListHandle | null = null;
let themeModal: ModalListHandle | null = null;
let safetyModal: ModalListHandle | null = null;
let thinkingModal: ModalListHandle | null = null;
let commandPaletteModal: ModalListHandle | null = null;
let slashCommandModal: ModalListHandle | null = null;
let apiKeyModal: InputModalHandle | null = null;
let apiKeyModalOnCancel: (() => void) | null = null;
let commandPaletteQuery = "";
let chordMode: "none" | "ctrl-x" = "none";

interface AppCommand {
  name: string;
  description: string;
  slash?: string;
  shortcut?: string;
  chord?: string;
  action: () => void | Promise<void>;
}

type PaletteCommand = AppCommand;
type SlashCommand = AppCommand & { slash: string };

function getAppCommands(): AppCommand[] {
  return [
    {
      name: "Change Model",
      description: `Current: ${currentModel.name}`,
      slash: "models",
      shortcut: "Ctrl+X M",
      chord: "m",
      action: () => showModelSelector(),
    },
    {
      name: "Switch Provider",
      description: `Current: ${getProviderDisplayName(config.provider)}`,
      slash: "providers",
      action: () => switchProvider(),
    },
    {
      name: "Toggle Dry Run",
      description: dryRunMode ? "Currently ON" : "Currently OFF",
      slash: "dry",
      action: () => {
        dryRunMode = !dryRunMode;
        statusBarText.content = getStatusBarContent();
        addSystemMessage(`Dry-run mode: ${dryRunMode ? "ON" : "OFF"}`);
      },
    },
    {
      name: "Select Safety Level",
      description: `Current: ${config.safetyLevel}`,
      slash: "safety",
      shortcut: "Ctrl+Y",
      action: () => showSafetySelector(),
    },
    {
      name: "Select Thinking Level",
      description: `Current: ${config.thinkingLevel}`,
      slash: "thinking",
      shortcut: "Ctrl+T",
      action: () => showThinkingSelector(),
    },
    {
      name: "Toggle Project Context",
      description: config.repoContext ? "Currently ON (sends script names to AI)" : "Currently OFF",
      action: () => {
        config.repoContext = !config.repoContext;
        saveConfig(config);
        statusBarText.content = getStatusBarContent();
        addSystemMessage(`Project context: ${config.repoContext ? "ON - AI can see your package.json scripts, Makefile targets, etc." : "OFF"}`);
      },
    },
    {
      name: "Check for Updates",
      description: `Current: v${getCurrentVersion()}`,
      slash: "update",
      action: () => runManualUpdate(),
    },
    {
      name: "Toggle Auto-Update",
      description: config.autoUpdate ? "Currently ON" : "Currently OFF",
      slash: "auto-update",
      action: () => toggleAutoUpdate(),
    },
    {
      name: "Show Config",
      description: "View current configuration",
      slash: "config",
      action: () => showConfig(),
    },
    {
      name: "Show History",
      description: `${history.length} commands`,
      slash: "history",
      action: () => showHistory(),
    },
    {
      name: "Change Theme",
      description: `Current: ${getTheme().name}`,
      slash: "themes",
      shortcut: "Ctrl+X T",
      chord: "t",
      action: () => showThemeSelector(),
    },
    {
      name: "Clear Chat",
      description: "Clear the chat history",
      slash: "clear",
      action: () => clearChat(),
    },
    {
      name: "Show Help",
      description: "View all commands and shortcuts",
      slash: "help",
      action: () => showHelp(),
    },
    {
      name: "Exit",
      description: "Close magic-shell",
      slash: "exit",
      shortcut: "Ctrl+D / Ctrl+X Q",
      chord: "q",
      action: () => {
        renderer.destroy();
        process.exit(0);
      },
    },
  ];
}

function getCommandPaletteOptions(): PaletteCommand[] {
  return getAppCommands();
}

function getSlashCommands(): SlashCommand[] {
  return getAppCommands().filter((cmd): cmd is SlashCommand => Boolean(cmd.slash));
}
function getSlashCommandMatches(inputText: string): SlashCommand[] {
  if (!inputText.startsWith("/")) return [];

  const slashBody = inputText.slice(1);
  if (slashBody.includes(" ")) return [];

  const query = slashBody.trim().toLowerCase();
  return getSlashCommands().filter((cmd) => {
    if (!query) return true;
    return `${cmd.slash} ${cmd.name} ${cmd.description}`.toLowerCase().includes(query);
  });
}

function openModalList(config: {
  containerId: string;
  selectorId: string;
  title: string;
  options: SelectOption[];
  width?: number;
  focusList?: boolean;
  selectedIndex?: number;
  showDescription?: boolean;
  showScrollIndicator?: boolean;
  onSelect?: (index: number, option: SelectOption) => void | Promise<void>;
}): ModalListHandle {
  const theme = getTheme();
  const width = config.width ?? MODAL_LIST_WIDTH;
  const termWidth = process.stdout.columns || 80;
  const left = Math.max(2, Math.floor((termWidth - width) / 2));
  const visibleRows = Math.max(config.options.length, 1);
  const maxRows = Math.max(4, (process.stdout.rows || 24) - 8);
  const listHeight = Math.min(visibleRows, MODAL_LIST_MAX_ITEMS, maxRows);
  const showDetail = config.showDescription !== false && config.options.some((option) => option.description);
  const detailHeight = showDetail ? 2 : 0;
  const containerHeight = listHeight + MODAL_LIST_FRAME_HEIGHT + detailHeight;
  let currentOptions = config.options;
  const formatDetail = (index: number): StyledText => {
    const description = currentOptions[index]?.description;
    if (!description || !showDetail) return t``;

    const maxLength = Math.max(20, width - 16);
    const text = description.length > maxLength
      ? `${description.slice(0, maxLength - 1)}…`
      : description;

    return t`${fg(theme.colors.textMuted)(` ▶ ${text}`)}`;
  };
  const formatOptions = (options: SelectOption[]): SelectOption[] => options.map((option) => ({
    ...option,
    description: "",
  }));

  const container = new BoxRenderable(renderer, {
    id: config.containerId,
    position: "absolute",
    left,
    top: 3,
    width,
    height: containerHeight,
    backgroundColor: theme.colors.backgroundPanel,
    border: true,
    borderColor: theme.colors.primary,
    borderStyle: "single",
    title: config.title,
    titleAlignment: "center",
    zIndex: 200,
    padding: 1,
  });
  renderer.root.add(container);

  const selector = new SelectRenderable(renderer, {
    id: config.selectorId,
    width: "100%",
    height: listHeight,
    options: formatOptions(config.options),
    backgroundColor: "transparent",
    focusedBackgroundColor: "transparent",
    selectedBackgroundColor: theme.colors.backgroundElement,
    textColor: theme.colors.text,
    selectedTextColor: theme.colors.primary,
    descriptionColor: theme.colors.textMuted,
    selectedDescriptionColor: theme.colors.textMuted,
    showDescription: false,
    showScrollIndicator: config.showScrollIndicator ?? false,
    wrapSelection: true,
  });
  container.add(selector);

  const detailText = showDetail
    ? new TextRenderable(renderer, {
      id: `${config.containerId}-detail`,
      content: formatDetail(config.selectedIndex ?? 0),
      marginTop: 1,
    })
    : null;
  if (detailText) {
    container.add(detailText);
  }

  const handle: ModalListHandle = {
    containerId: config.containerId,
    container,
    selector,
    updateOptions(options, selectedIndex = 0) {
      currentOptions = options;
      const rows = Math.max(options.length, 1);
      const maxHeight = Math.max(4, (process.stdout.rows || 24) - 8);
      const newListHeight = Math.min(rows, MODAL_LIST_MAX_ITEMS, maxHeight);
      selector.options = formatOptions(options);
      selector.height = newListHeight;
      container.height = newListHeight + MODAL_LIST_FRAME_HEIGHT + detailHeight;
      selector.setSelectedIndex(Math.min(selectedIndex, Math.max(options.length - 1, 0)));
      if (detailText) {
        detailText.content = formatDetail(selector.getSelectedIndex());
      }
    },
    close() {
      renderer.root.remove(config.containerId);
      inputField?.focus();
    },
  };

  if (config.onSelect) {
    selector.on(SelectRenderableEvents.ITEM_SELECTED, async (index: number, option: SelectOption) => {
      await config.onSelect?.(index, currentOptions[index] ?? option);
    });
  }

  selector.on(SelectRenderableEvents.SELECTION_CHANGED, (index: number) => {
    if (detailText) {
      detailText.content = formatDetail(index);
    }
  });

  const initialIndex = config.selectedIndex ?? 0;
  selector.setSelectedIndex(initialIndex);
  if (config.focusList !== false) {
    selector.focus();
  }

  return handle;
}

function openInputModal(config: {
  containerId: string;
  title: string;
  placeholder: string;
  description: string;
  extraText?: string;
  hintText?: string;
  width?: number;
  height?: number;
  onSubmit: (value: string) => void;
}): InputModalHandle {
  const theme = getTheme()
  const width = config.width ?? 72
  const termWidth = process.stdout.columns || 80
  const left = Math.max(2, Math.floor((termWidth - width) / 2))

  const container = new BoxRenderable(renderer, {
    id: config.containerId,
    position: "absolute",
    left,
    top: 3,
    width,
    height: config.height ?? 11,
    backgroundColor: theme.colors.backgroundPanel,
    border: true,
    borderColor: theme.colors.primary,
    borderStyle: "single",
    title: config.title,
    titleAlignment: "center",
    zIndex: 200,
    padding: 1,
  })
  renderer.root.add(container)

  const description = new TextRenderable(renderer, {
    id: `${config.containerId}-description`,
    content: t`${fg(theme.colors.text)(config.description)}`,
    marginBottom: 1,
  })
  container.add(description)

  const input = new InputRenderable(renderer, {
    id: `${config.containerId}-input`,
    width: "100%",
    placeholder: config.placeholder,
    backgroundColor: theme.colors.backgroundElement,
    focusedBackgroundColor: theme.colors.backgroundElement,
    textColor: theme.colors.text,
    cursorColor: theme.colors.primary,
  })
  container.add(input)

  if (config.extraText) {
    const extra = new TextRenderable(renderer, {
      id: `${config.containerId}-extra`,
      content: t`${fg(theme.colors.success)(config.extraText)}`,
      marginTop: 1,
    })
    container.add(extra)
  }

  const hint = new TextRenderable(renderer, {
    id: `${config.containerId}-hint`,
    content: t`${fg(theme.colors.textMuted)(config.hintText ?? "Press Enter to save | Esc to cancel | Ctrl+C to exit")}`,
    marginTop: 1,
  })
  container.add(hint)

  input.on(InputRenderableEvents.ENTER, (value: string) => {
    config.onSubmit(value)
  })

  const handle: InputModalHandle = {
    containerId: config.containerId,
    container,
    input,
    close() {
      renderer.root.remove(config.containerId)
      inputField?.focus()
    },
  }

  input.focus()
  return handle
}

function getSlashCommandSelectOptions(): SelectOption[] {
  return slashCommandMatches.map((cmd) => ({
    name: `/${cmd.slash}`,
    description: cmd.description,
    value: cmd,
  }));
}

function closeProviderModal(): void {
  if (!providerModal) return;
  providerModal.close();
  providerModal = null;
}

function closeModelModal(): void {
  if (!modelModal) return;
  modelModal.close();
  modelModal = null;
}

function closeThemeModal(): void {
  if (!themeModal) return;
  themeModal.close();
  themeModal = null;
}

function closeSafetyModal(): void {
  if (!safetyModal) return;
  safetyModal.close();
  safetyModal = null;
}

function closeThinkingModal(): void {
  if (!thinkingModal) return;
  thinkingModal.close();
  thinkingModal = null;
}

function closeApiKeyModal(invokeCancel = false): void {
  if (!apiKeyModal) return
  apiKeyModal.close()
  apiKeyModal = null
  const onCancel = apiKeyModalOnCancel
  apiKeyModalOnCancel = null
  if (invokeCancel) onCancel?.()
}

function closeSlashCommandMenu(dismissCurrentInput = false): void {
  if (slashCommandModal) {
    slashCommandModal.close();
    slashCommandModal = null;
  }
  if (dismissCurrentInput) {
    slashCommandDismissedInput = inputField?.editBuffer.getText() ?? null;
  }
  slashCommandMatches = [];
  slashCommandSelectedIndex = 0;
}

function updateSlashCommandModalOptions(): void {
  if (!slashCommandModal) return;
  slashCommandModal.updateOptions(getSlashCommandSelectOptions(), slashCommandSelectedIndex);
}

function syncSlashCommandMenu(): void {
  const inputText = inputField.editBuffer.getText();
  if (slashCommandDismissedInput !== null) {
    if (inputText === slashCommandDismissedInput) {
      return;
    }
    slashCommandDismissedInput = null;
  }

  const matches = getSlashCommandMatches(inputText);

  if (matches.length === 0) {
    closeSlashCommandMenu();
    return;
  }

  slashCommandMatches = matches;
  slashCommandSelectedIndex = Math.min(slashCommandSelectedIndex, slashCommandMatches.length - 1);
  const options = getSlashCommandSelectOptions();

  if (slashCommandModal) {
    slashCommandModal.updateOptions(options, slashCommandSelectedIndex);
    return;
  }

  slashCommandModal = openModalList({
    containerId: "slash-command-modal",
    selectorId: "slash-command-select",
    title: "Commands",
    options,
    focusList: false,
    selectedIndex: slashCommandSelectedIndex,
  });
}

function queueSlashCommandSync(): void {
  if (slashCommandSyncQueued) return;
  slashCommandSyncQueued = true;
  setTimeout(() => {
    slashCommandSyncQueued = false;
    if (inputField) syncSlashCommandMenu();
  }, 0);
}

function showCommandPalette() {
  if (commandPaletteModal) {
    return;
  }

  commandPaletteQuery = "";
  commandPaletteModal = openModalList({
    containerId: "command-palette-container",
    selectorId: "command-palette-select",
    title: "Commands",
    options: getCommandPaletteSelectOptions(),
    focusList: true,
    onSelect: async (_: number, option: SelectOption) => {
      if (!option.value) return;
      const cmd = option.value as PaletteCommand;
      closeCommandPalette();
      await cmd.action();
    },
  });
}

function getCommandPaletteSelectOptions(): SelectOption[] {
  const query = commandPaletteQuery.toLowerCase();
  const commands = getCommandPaletteOptions().filter((cmd) => {
    if (!query) return true;
    return `${cmd.name} ${cmd.description} ${cmd.shortcut ?? ""}`.toLowerCase().includes(query);
  });

  if (commands.length === 0) {
    return [{
      name: "No commands found",
      description: commandPaletteQuery,
      value: null,
    }];
  }

  return commands.map((cmd) => ({
    name: cmd.name,
    description: cmd.shortcut ? `${cmd.description} · ${cmd.shortcut}` : cmd.description,
    value: cmd,
  }));
}

function updateCommandPaletteOptions(): void {
  if (!commandPaletteModal) return;
  commandPaletteModal.updateOptions(getCommandPaletteSelectOptions(), 0);
}

function closeCommandPalette() {
  if (commandPaletteModal) {
    commandPaletteModal.close();
    commandPaletteModal = null;
    commandPaletteQuery = "";
  }
}

function handleKeypress(key: KeyEvent) {
  const commands = getCommandPaletteOptions();

  if (slashCommandModal && slashCommandMatches.length > 0) {
    if (key.name === "up") {
      slashCommandSelectedIndex = slashCommandSelectedIndex === 0 ? slashCommandMatches.length - 1 : slashCommandSelectedIndex - 1;
      updateSlashCommandModalOptions();
      return;
    }
    if (key.name === "down") {
      slashCommandSelectedIndex = (slashCommandSelectedIndex + 1) % slashCommandMatches.length;
      updateSlashCommandModalOptions();
      return;
    }
    if (key.name === "tab") {
      inputField.setText(`/${slashCommandMatches[slashCommandSelectedIndex].slash}`);
      syncSlashCommandMenu();
      inputField.focus();
      return;
    }
  }

  if (key.ctrl && key.name === "p") {
    showCommandPalette();
    return;
  }

  if (key.ctrl && key.name === "t") {
    showThinkingSelector();
    return;
  }

  if (key.ctrl && key.name === "y") {
    showSafetySelector();
    return;
  }

  if (key.ctrl && key.name === "d") {
    renderer.destroy();
    process.exit(0);
  }

  if (key.ctrl && key.name === "x") {
    chordMode = "ctrl-x";
    return;
  }

  if (chordMode === "ctrl-x") {
    chordMode = "none";
    const keyName = key.name || key.sequence;
    const cmd = commands.find((c) => c.chord === keyName);
    if (cmd) {
      cmd.action();
      return;
    }
    return;
  }

  if (commandPaletteModal) {
    if (key.name === "backspace" || key.name === "delete") {
      commandPaletteQuery = commandPaletteQuery.slice(0, -1);
      updateCommandPaletteOptions();
      return;
    }
    const sequence = key.sequence ?? "";
    if (!key.ctrl && !key.meta && sequence.length === 1 && sequence >= " ") {
      commandPaletteQuery += sequence;
      updateCommandPaletteOptions();
      return;
    }
  }

  // Ctrl+C - close popups/cancel operations first, then exit like a standard TUI.
  if (key.ctrl && key.name === "c") {
    if (commandPaletteModal) {
      closeCommandPalette();
      return;
    }
    if (slashCommandModal) {
      closeSlashCommandMenu(true);
      return;
    }
    if (providerModal) {
      closeProviderModal();
      return;
    }
    if (modelModal) {
      closeModelModal();
      return;
    }
    if (themeModal) {
      closeThemeModal();
      return;
    }
    if (safetyModal) {
      closeSafetyModal();
      return;
    }
    if (thinkingModal) {
      closeThinkingModal();
      return;
    }
    if (apiKeyModal) {
      closeApiKeyModal(true)
      return
    }
    if (awaitingConfirmation && pendingMessageId) {
      clearCommandState();
      addSystemMessage("Command cancelled.");
      inputField.focus();
      return;
    }
    renderer.destroy();
    process.exit(0);
  }

  // Escape to cancel/close
  if (key.name === "escape") {
    chordMode = "none";
    if (commandPaletteModal) {
      closeCommandPalette();
      return;
    }
    if (slashCommandModal) {
      closeSlashCommandMenu(true);
      return;
    }
    if (providerModal) {
      closeProviderModal();
      return;
    }
    if (modelModal) {
      closeModelModal();
      return;
    }
    if (themeModal) {
      closeThemeModal();
      return;
    }
    if (safetyModal) {
      closeSafetyModal();
      return;
    }
    if (thinkingModal) {
      closeThinkingModal();
      return;
    }
    if (apiKeyModal) {
      closeApiKeyModal(true)
      return
    }

    if (awaitingConfirmation && pendingMessageId) {
      clearCommandState();
      addSystemMessage("Command cancelled.");
      inputField.focus();
    }
  }

  // Enter to confirm dangerous command
  if (key.name === "return" && awaitingConfirmation && pendingMessageId) {
    const msg = chatMessages.find((m) => m.id === pendingMessageId);
    if (msg && msg.command) {
      const command = msg.command;
      const msgId = pendingMessageId;
      clearCommandState();
      executeAndShowResult(msg.content, command, msgId);
    }
  }

  // 'e' to edit command
  if (key.name === "e" && awaitingConfirmation && pendingMessageId) {
    const msg = chatMessages.find((m) => m.id === pendingMessageId);
    if (msg && msg.command) {
      inputField.setText(msg.command);
      clearCommandState();
      inputField.focus();
    }
  }

  // 'c' to copy command to clipboard (macOS)
  if (key.name === "c" && awaitingConfirmation && pendingMessageId) {
    const msg = chatMessages.find((m) => m.id === pendingMessageId);
    if (msg && msg.command) {
      // Use pbcopy on macOS, or xclip on Linux
      const copyCmd = process.platform === "darwin" ? "pbcopy" : "xclip -selection clipboard";
      const child = spawn(copyCmd, { shell: true });
      child.stdin?.write(msg.command);
      child.stdin?.end();
      addSystemMessage(`Copied to clipboard: ${msg.command}`);
    }
  }

  // 'o' to toggle expand/collapse on the most recent result message
  if (key.name === "o" && !awaitingConfirmation && !commandPaletteModal && !modelModal) {
    toggleLastResultExpand();
  }
}

// Run if called directly, export for use by index.ts
if (import.meta.main) {
  main().catch(console.error);
}

export default main;
