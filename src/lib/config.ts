import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import type { Config, CommandHistory, Provider, CustomModel } from "./types";
import { deleteSecret, getSecret, setSecret, isSecureStorageAvailable } from "./keychain";

const CONFIG_DIR = join(homedir(), ".magic-shell");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");
const HISTORY_FILE = join(CONFIG_DIR, "history.json");

// Keys for keychain storage
const KEYCHAIN_OPENROUTER = "openrouter-api-key";
const KEYCHAIN_OPENCODE_ZEN = "opencode-zen-api-key";
const KEYCHAIN_VERCEL_AI_GATEWAY = "vercel-ai-gateway-api-key";
const KEYCHAIN_CLOUDFLARE_AI_GATEWAY = "cloudflare-ai-gateway-api-key";
const KEYCHAIN_WORKERS_AI = "workers-ai-api-key";

const DEFAULT_CONFIG: Config = {
  provider: "opencode-zen",
  openrouterApiKey: "", // Only used as fallback if keychain unavailable
  opencodeZenApiKey: "", // Only used as fallback if keychain unavailable
  vercelAiGatewayApiKey: "", // Only used as fallback if keychain unavailable
  cloudflareAiGatewayApiKey: "", // Only used as fallback if keychain unavailable
  workersAiApiKey: "", // Only used as fallback if keychain unavailable
  cloudflareAccountId: "",
  cloudflareAiGatewayId: "default",
  defaultModel: "kimi-k2.6-free", // Current free OpenCode Zen model
  safetyLevel: "moderate",
  dryRunByDefault: false,
  blockedCommands: [
    ":(){ :|:& };:", // fork bomb
    "> /dev/sda",
    "mkfs",
    "dd if=/dev/zero",
    "chmod -R 777 /",
    "chown -R",
  ],
  confirmedDangerousPatterns: [],
  repoContext: false, // Opt-in for privacy
  customModels: [],
};

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): Config {
  ensureConfigDir();

  if (!existsSync(CONFIG_FILE)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const data = readFileSync(CONFIG_FILE, "utf-8");
    const loaded = JSON.parse(data) as Partial<Config>;
    return { ...DEFAULT_CONFIG, ...loaded };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: Config): void {
  ensureConfigDir();

  // Don't save API keys to the config file if we have secure storage
  const configToSave = { ...config };
  if (isSecureStorageAvailable()) {
    configToSave.openrouterApiKey = "";
    configToSave.opencodeZenApiKey = "";
    configToSave.vercelAiGatewayApiKey = "";
    configToSave.cloudflareAiGatewayApiKey = "";
    configToSave.workersAiApiKey = "";
  }

  writeFileSync(CONFIG_FILE, JSON.stringify(configToSave, null, 2));
}

export async function getApiKey(provider: Provider): Promise<string> {
  // Check environment variables first (highest priority)
  if (provider === "openrouter") {
    const envKey = process.env.OPENROUTER_API_KEY;
    if (envKey) return envKey;
  } else if (provider === "opencode-zen") {
    const envKey = process.env.OPENCODE_ZEN_API_KEY;
    if (envKey) return envKey;
  } else if (provider === "vercel-ai-gateway") {
    const envKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_AI_GATEWAY_API_KEY;
    if (envKey) return envKey;
  } else if (provider === "cloudflare-ai-gateway") {
    const envKey = process.env.CLOUDFLARE_AI_GATEWAY_API_KEY || process.env.CF_AIG_TOKEN;
    if (envKey) return envKey;
  } else if (provider === "workers-ai") {
    const envKey = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_KEY;
    if (envKey) return envKey;
  }

  // Try to get from secure storage (keychain)
  const keychainKey = getKeychainKey(provider);
  const secureKey = await getSecret(keychainKey);
  if (secureKey) return secureKey;

  // Fallback to config file (for platforms without secure storage)
  const config = loadConfig();
  switch (provider) {
    case "openrouter":
      return config.openrouterApiKey;
    case "opencode-zen":
      return config.opencodeZenApiKey;
    case "vercel-ai-gateway":
      return config.vercelAiGatewayApiKey || "";
    case "cloudflare-ai-gateway":
      return config.cloudflareAiGatewayApiKey || "";
    case "workers-ai":
      return config.workersAiApiKey || "";
    case "custom":
      return "";
  }
}

export async function setApiKey(provider: Provider, key: string): Promise<void> {
  const config = loadConfig();
  config.provider = provider;

  // Try to store in secure storage first
  const keychainKey = getKeychainKey(provider);
  const stored = await setSecret(keychainKey, key);

  if (!stored) {
    // Fallback: store in config file (less secure)
    switch (provider) {
      case "openrouter":
        config.openrouterApiKey = key;
        break;
      case "opencode-zen":
        config.opencodeZenApiKey = key;
        break;
      case "vercel-ai-gateway":
        config.vercelAiGatewayApiKey = key;
        break;
      case "cloudflare-ai-gateway":
        config.cloudflareAiGatewayApiKey = key;
        break;
      case "workers-ai":
        config.workersAiApiKey = key;
        break;
      case "custom":
        break;
    }
  }

  saveConfig(config);
}

function getKeychainKey(provider: Provider): string {
  switch (provider) {
    case "openrouter":
      return KEYCHAIN_OPENROUTER;
    case "opencode-zen":
      return KEYCHAIN_OPENCODE_ZEN;
    case "vercel-ai-gateway":
      return KEYCHAIN_VERCEL_AI_GATEWAY;
    case "cloudflare-ai-gateway":
      return KEYCHAIN_CLOUDFLARE_AI_GATEWAY;
    case "workers-ai":
      return KEYCHAIN_WORKERS_AI;
    case "custom":
      return "custom-api-key";
  }
}

export function loadHistory(): CommandHistory[] {
  ensureConfigDir();

  if (!existsSync(HISTORY_FILE)) {
    return [];
  }

  try {
    const data = readFileSync(HISTORY_FILE, "utf-8");
    return JSON.parse(data) as CommandHistory[];
  } catch {
    return [];
  }
}

export function saveHistory(history: CommandHistory[]): void {
  ensureConfigDir();
  // Keep only last 100 entries
  const trimmed = history.slice(-100);
  writeFileSync(HISTORY_FILE, JSON.stringify(trimmed, null, 2));
}

export function addToHistory(entry: CommandHistory): void {
  const history = loadHistory();
  history.push(entry);
  saveHistory(history);
}

// Custom model management
export function getCustomModels(): CustomModel[] {
  const config = loadConfig();
  return config.customModels || [];
}

function normalizeCustomModel(model: CustomModel): CustomModel {
  const id = model.id?.trim();
  if (!id) {
    throw new Error("Custom model id is required");
  }

  const modelId = model.modelId?.trim();
  if (!modelId) {
    throw new Error("Custom model modelId is required");
  }

  const baseUrl = model.baseUrl?.trim();
  if (!baseUrl) {
    throw new Error("Custom model baseUrl is required");
  }

  try {
    new URL(baseUrl);
  } catch {
    throw new Error("Custom model baseUrl must be a valid URL");
  }

  const name = model.name?.trim() || id;
  const description = model.description?.trim() || undefined;
  const apiKey = model.apiKey?.trim() || undefined;

  return {
    ...model,
    id,
    name,
    description,
    modelId,
    baseUrl,
    apiKey,
  };
}

export async function getCustomModel(id: string): Promise<CustomModel | undefined> {
  const customModels = getCustomModels();
  const model = customModels.find((m) => m.id === id);
  if (!model) {
    return undefined;
  }

  const keychainKey = `customModel:${model.id}:apiKey`;
  try {
    const apiKey = await getSecret(keychainKey);
    return apiKey ? { ...model, apiKey } : model;
  } catch (error) {
    if (process.env.DEBUG_API === "1") {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[DEBUG] Custom model keychain get error: ${message}`);
    }
    return model;
  }
}

export async function addCustomModel(model: CustomModel): Promise<void> {
  const normalizedModel = normalizeCustomModel(model);
  const keychainKey = `customModel:${normalizedModel.id}:apiKey`;

  if (normalizedModel.apiKey) {
    try {
      const stored = await setSecret(keychainKey, normalizedModel.apiKey);
      if (!stored) {
        throw new Error("Secure storage unavailable");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to store custom model API key: ${message}`);
    }
  }

  const config = loadConfig();
  if (!config.customModels) {
    config.customModels = [];
  }
  // Check if model with same ID exists
  const existingIndex = config.customModels.findIndex((m) => m.id === normalizedModel.id);
  const modelToSave = { ...normalizedModel, apiKey: undefined };
  if (existingIndex >= 0) {
    // Replace existing
    config.customModels[existingIndex] = modelToSave;
  } else {
    config.customModels.push(modelToSave);
  }
  saveConfig(config);
}

export async function removeCustomModel(id: string): Promise<boolean> {
  const config = loadConfig();
  if (!config.customModels) {
    return false;
  }
  const initialLength = config.customModels.length;
  config.customModels = config.customModels.filter((m) => m.id !== id);
  if (config.customModels.length !== initialLength) {
    saveConfig(config);
    const keychainKey = `customModel:${id}:apiKey`;
    try {
      const deleted = await deleteSecret(keychainKey);
      if (!deleted && process.env.DEBUG_API === "1") {
        console.error(`[DEBUG] Custom model keychain delete returned false`);
      }
    } catch (error) {
      if (process.env.DEBUG_API === "1") {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[DEBUG] Custom model keychain delete error: ${message}`);
      }
    }
    return true;
  }
  return false;
}

export { isSecureStorageAvailable };
