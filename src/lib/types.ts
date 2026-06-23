export type Provider =
  | "openrouter"
  | "opencode-zen"
  | "vercel-ai-gateway"
  | "cloudflare-ai-gateway"
  | "workers-ai"
  | "custom";

export type ThinkingLevel = "off" | "low" | "medium" | "high";

export type ZenApiType = "openai-responses" | "anthropic" | "openai-compatible" | "google";

export type CostTier = "free" | "lower-cost" | "premium";

export interface Model {
  id: string;
  name: string;
  description: string;
  category: "fast" | "smart" | "reasoning";
  provider: Provider;
  contextLength: number;
  cost: CostTier;
  zenApiType?: ZenApiType;
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

export {
  OPENROUTER_MODELS,
  VERCEL_AI_GATEWAY_MODELS,
  CLOUDFLARE_AI_GATEWAY_MODELS,
  WORKERS_AI_MODELS,
  OPENCODE_ZEN_MODELS,
  ALL_MODELS,
  getProviderModels,
  getProviderDisplayName,
  sortModelsByCost,
} from "./models";

export interface Config {
  provider: Provider;
  openrouterApiKey: string;
  opencodeZenApiKey: string;
  vercelAiGatewayApiKey?: string;
  cloudflareAiGatewayApiKey?: string;
  workersAiApiKey?: string;
  cloudflareAccountId?: string;
  cloudflareAiGatewayId?: string;
  defaultModel: string;
  thinkingLevel: ThinkingLevel;
  safetyLevel: "strict" | "moderate" | "relaxed";
  dryRunByDefault: boolean;
  blockedCommands: string[];
  confirmedDangerousPatterns: string[];
  theme?: string;
  /** Enable project context detection (opt-in for privacy). Sends script names from package.json, Makefile, etc to AI. */
  repoContext?: boolean;
  /** Check npm for new versions on startup (default: true). */
  checkForUpdates?: boolean;
  /** Automatically install updates when available (default: false). */
  autoUpdate?: boolean;
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
