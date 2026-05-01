export type Provider = "openrouter" | "opencode-zen" | "custom";

export interface Model {
  id: string;
  name: string;
  description: string;
  category: "fast" | "smart" | "reasoning";
  provider: Provider;
  contextLength: number;
  free?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

// Custom models for LM Studio, Ollama, or any OpenAI-compatible endpoint
export interface CustomModel {
  id: string;
  name: string;
  description?: string;
  modelId: string;
  baseUrl: string;
  apiKey?: string;
  contextLength: number;
  category: "fast" | "smart" | "reasoning";
}

// OpenRouter models - updated May 2026
export const OPENROUTER_MODELS: Model[] = [
  // Free models
  {
    id: "xiaomi/mimo-v2-flash:free",
    name: "MiMo V2 Flash",
    description: "Free Xiaomi model, great for coding tasks",
    category: "fast",
    provider: "openrouter",
    contextLength: 262000,
    free: true,
  },
  {
    id: "minimax/minimax-m2.5:free",
    name: "MiniMax M2.5 Free",
    description: "Free MiniMax model for trying out open-source generation",
    category: "smart",
    provider: "openrouter",
    contextLength: 196608,
    free: true,
  },
  // Fast models
  {
    id: "deepseek/deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    description: "DeepSeek's latest fast open-source model",
    category: "fast",
    provider: "openrouter",
    contextLength: 1048576,
  },
  {
    id: "z-ai/glm-5-turbo",
    name: "GLM 5 Turbo",
    description: "Z.ai's latest fast GLM model",
    category: "fast",
    provider: "openrouter",
    contextLength: 202752,
  },
  // Smart models
  {
    id: "moonshotai/kimi-k2.6",
    name: "Kimi K2.6",
    description: "Moonshot's latest Kimi model for coding agents",
    category: "smart",
    provider: "openrouter",
    contextLength: 262142,
  },
  {
    id: "deepseek/deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    description: "DeepSeek's latest high-context open-source model",
    category: "smart",
    provider: "openrouter",
    contextLength: 1048576,
  },
  {
    id: "z-ai/glm-5.1",
    name: "GLM 5.1",
    description: "Z.ai's latest GLM model",
    category: "smart",
    provider: "openrouter",
    contextLength: 202752,
  },
  {
    id: "minimax/minimax-m2.7",
    name: "MiniMax M2.7",
    description: "MiniMax's latest model",
    category: "smart",
    provider: "openrouter",
    contextLength: 196608,
  },
  // Reasoning models
  {
    id: "moonshotai/kimi-k2-thinking",
    name: "Kimi K2 Thinking",
    description: "Moonshot's reasoning-focused open-source model",
    category: "reasoning",
    provider: "openrouter",
    contextLength: 262144,
  },
];

// OpenCode Zen models - model IDs match the API exactly (no prefix needed for API calls)
export const OPENCODE_ZEN_MODELS: Model[] = [
  // Free models (great for trying out)
  {
    id: "minimax-m2.5-free",
    name: "MiniMax M2.5 Free",
    description: "MiniMax's free model (limited time)",
    category: "fast",
    provider: "opencode-zen",
    contextLength: 196608,
    free: true,
  },
  {
    id: "kimi-k2.6-free",
    name: "Kimi K2.6 Free",
    description: "Moonshot's latest model (free, limited time)",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 262144,
    free: true,
  },
  {
    id: "deepseek-v4-flash-free",
    name: "DeepSeek V4 Flash Free",
    description: "DeepSeek's latest fast model (free, limited time)",
    category: "fast",
    provider: "opencode-zen",
    contextLength: 1048576,
    free: true,
  },
  {
    id: "gpt-5-nano",
    name: "GPT 5 Nano",
    description: "OpenAI's fastest GPT model (free)",
    category: "fast",
    provider: "opencode-zen",
    contextLength: 200000,
    free: true,
  },

  // Fast models
  {
    id: "claude-3-5-haiku",
    name: "Claude Haiku 3.5",
    description: "Anthropic's fast and efficient model",
    category: "fast",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    description: "Anthropic's latest fast model",
    category: "fast",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "gemini-3-flash",
    name: "Gemini 3 Flash",
    description: "Google's fast Gemini model",
    category: "fast",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "gpt-5.1-codex-mini",
    name: "GPT 5.1 Codex Mini",
    description: "OpenAI's fast codex model",
    category: "fast",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    description: "DeepSeek's latest fast open-source model",
    category: "fast",
    provider: "opencode-zen",
    contextLength: 1048576,
  },

  // Smart models
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    description: "Anthropic's balanced model for complex tasks",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "gemini-3-pro",
    name: "Gemini 3 Pro",
    description: "Google's high-end Gemini model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "gpt-5.2",
    name: "GPT 5.2",
    description: "OpenAI's flagship GPT model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "gpt-5.2-codex",
    name: "GPT 5.2 Codex",
    description: "OpenAI's coding-focused GPT model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "gpt-5.1",
    name: "GPT 5.1",
    description: "OpenAI's balanced GPT model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "gpt-5.1-codex",
    name: "GPT 5.1 Codex",
    description: "OpenAI's coding model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "gpt-5",
    name: "GPT 5",
    description: "OpenAI's prior generation GPT model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "gpt-5-codex",
    name: "GPT 5 Codex",
    description: "OpenAI's prior generation codex model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "minimax-m2.7",
    name: "MiniMax M2.7",
    description: "MiniMax's latest model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 196608,
  },
  {
    id: "kimi-k2.6",
    name: "Kimi K2.6",
    description: "Moonshot's latest model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 262144,
  },
  {
    id: "deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    description: "DeepSeek's latest high-context open-source model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 1048576,
  },
  {
    id: "glm-5.1",
    name: "GLM 5.1",
    description: "Z.ai's latest GLM model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 202752,
  },

  // Reasoning models
  {
    id: "claude-sonnet-4-5",
    name: "Claude Sonnet 4.5",
    description: "Anthropic's hybrid reasoning model",
    category: "reasoning",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    description: "Anthropic's newest Opus model",
    category: "reasoning",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "claude-opus-4-5",
    name: "Claude Opus 4.5",
    description: "Anthropic's most capable model",
    category: "reasoning",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "claude-opus-4-1",
    name: "Claude Opus 4.1",
    description: "Anthropic's powerful reasoning model",
    category: "reasoning",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "gpt-5.1-codex-max",
    name: "GPT 5.1 Codex Max",
    description: "OpenAI's largest coding model",
    category: "reasoning",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "kimi-k2-thinking",
    name: "Kimi K2 Thinking",
    description: "Moonshot's reasoning model",
    category: "reasoning",
    provider: "opencode-zen",
    contextLength: 262144,
  },
];

export const ALL_MODELS = [...OPENCODE_ZEN_MODELS, ...OPENROUTER_MODELS];

export interface Config {
  provider: Provider;
  openrouterApiKey: string;
  opencodeZenApiKey: string;
  defaultModel: string;
  safetyLevel: "strict" | "moderate" | "relaxed";
  dryRunByDefault: boolean;
  blockedCommands: string[];
  confirmedDangerousPatterns: string[];
  theme?: string;
  /** Enable project context detection (opt-in for privacy). Sends script names from package.json, Makefile, etc to AI. */
  repoContext?: boolean;
  customModels?: CustomModel[];
}

export interface RepoContext {
  type: string; // e.g., "node", "python", "rust", "go", "make"
  packageManager?: string; // e.g., "npm", "bun", "yarn", "pnpm"
  scripts?: string[]; // Available npm/bun scripts
  makeTargets?: string[]; // Makefile targets
  cargoCommands?: string[]; // Cargo subcommands
  hasDocker?: boolean;
  hasGit?: boolean;
}

export interface CommandHistory {
  input: string;
  command: string;
  output: string;
  timestamp: number;
}

export interface SafetyAnalysis {
  isDangerous: boolean;
  severity: "low" | "medium" | "high" | "critical";
  reason?: string;
  patterns: string[];
}

// Chat-style TUI message types
export type ChatMessageType = "user" | "assistant" | "system" | "result";

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  content: string;
  timestamp: number;
  // For assistant messages (translated commands)
  command?: string;
  safety?: SafetyAnalysis;
  // For result messages (after execution)
  executed?: boolean;
  output?: string;
  exitCode?: number;
  executionKind?: "auto" | "manual" | "dry-run";
  parentMessageId?: string;
  // For expandable output view
  expanded?: boolean;
}

// Type guard to check if a model is a custom model
export function isCustomModel(model: Model | CustomModel): model is CustomModel {
  return "baseUrl" in model;
}
