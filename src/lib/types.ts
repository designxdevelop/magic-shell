export type Provider =
  | "openrouter"
  | "opencode-zen"
  | "vercel-ai-gateway"
  | "cloudflare-ai-gateway"
  | "workers-ai"
  | "custom";

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
  // Fast models
  {
    id: "xiaomi/mimo-v2.5",
    name: "MiMo V2.5",
    description: "Xiaomi's latest long-context MiMo model",
    category: "fast",
    provider: "openrouter",
    contextLength: 1048576,
  },
  {
    id: "xiaomi/mimo-v2.5-pro",
    name: "MiMo V2.5 Pro",
    description: "Xiaomi's latest pro MiMo model for agentic coding",
    category: "smart",
    provider: "openrouter",
    contextLength: 1048576,
  },
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
    id: "openai/gpt-latest",
    name: "OpenAI GPT Latest",
    description: "OpenRouter alias that redirects to the latest OpenAI GPT model",
    category: "smart",
    provider: "openrouter",
    contextLength: 1050000,
  },
  {
    id: "openai/gpt-5.5",
    name: "GPT 5.5",
    description: "OpenAI's latest flagship GPT model",
    category: "smart",
    provider: "openrouter",
    contextLength: 1050000,
  },
  {
    id: "anthropic/claude-sonnet-latest",
    name: "Claude Sonnet Latest",
    description: "OpenRouter alias that redirects to the latest Claude Sonnet model",
    category: "smart",
    provider: "openrouter",
    contextLength: 1000000,
  },
  {
    id: "anthropic/claude-sonnet-4.6",
    name: "Claude Sonnet 4.6",
    description: "Anthropic's latest Sonnet model",
    category: "smart",
    provider: "openrouter",
    contextLength: 1000000,
  },
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
    id: "anthropic/claude-opus-latest",
    name: "Claude Opus Latest",
    description: "OpenRouter alias that redirects to the latest Claude Opus model",
    category: "reasoning",
    provider: "openrouter",
    contextLength: 1000000,
  },
  {
    id: "anthropic/claude-opus-4.7",
    name: "Claude Opus 4.7",
    description: "Anthropic's latest Opus model",
    category: "reasoning",
    provider: "openrouter",
    contextLength: 1000000,
  },
  {
    id: "openai/gpt-5.5-pro",
    name: "GPT 5.5 Pro",
    description: "OpenAI's latest high-capability reasoning model",
    category: "reasoning",
    provider: "openrouter",
    contextLength: 1050000,
  },
  {
    id: "moonshotai/kimi-k2-thinking",
    name: "Kimi K2 Thinking",
    description: "Moonshot's reasoning-focused open-source model",
    category: "reasoning",
    provider: "openrouter",
    contextLength: 262144,
  },
];

export const VERCEL_AI_GATEWAY_MODELS: Model[] = [
  {
    id: "openai/gpt-latest",
    name: "OpenAI GPT Latest",
    description: "Vercel AI Gateway alias that redirects to the latest OpenAI GPT model",
    category: "smart",
    provider: "vercel-ai-gateway",
    contextLength: 1050000,
  },
  {
    id: "openai/gpt-5.5",
    name: "GPT 5.5",
    description: "OpenAI's latest flagship GPT model",
    category: "smart",
    provider: "vercel-ai-gateway",
    contextLength: 1050000,
  },
  {
    id: "anthropic/claude-sonnet-4.6",
    name: "Claude Sonnet 4.6",
    description: "Anthropic's latest Sonnet model",
    category: "smart",
    provider: "vercel-ai-gateway",
    contextLength: 1000000,
  },
  {
    id: "anthropic/claude-opus-4.7",
    name: "Claude Opus 4.7",
    description: "Anthropic's latest Opus model",
    category: "reasoning",
    provider: "vercel-ai-gateway",
    contextLength: 1000000,
  },
  {
    id: "openai/gpt-5.5-pro",
    name: "GPT 5.5 Pro",
    description: "OpenAI's latest high-capability reasoning model",
    category: "reasoning",
    provider: "vercel-ai-gateway",
    contextLength: 1050000,
  },
];

export const CLOUDFLARE_AI_GATEWAY_MODELS: Model[] = [
  {
    id: "openai/gpt-5.5",
    name: "GPT 5.5",
    description: "OpenAI's latest flagship GPT model through Cloudflare AI Gateway",
    category: "smart",
    provider: "cloudflare-ai-gateway",
    contextLength: 1050000,
  },
  {
    id: "anthropic/claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    description: "Anthropic's latest Sonnet model through Cloudflare AI Gateway",
    category: "smart",
    provider: "cloudflare-ai-gateway",
    contextLength: 1000000,
  },
  {
    id: "anthropic/claude-opus-4-7",
    name: "Claude Opus 4.7",
    description: "Anthropic's latest Opus model through Cloudflare AI Gateway",
    category: "reasoning",
    provider: "cloudflare-ai-gateway",
    contextLength: 1000000,
  },
  {
    id: "workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    name: "Workers AI Llama 3.3 70B Fast",
    description: "Cloudflare Workers AI fast Llama model routed through AI Gateway",
    category: "smart",
    provider: "cloudflare-ai-gateway",
    contextLength: 24000,
  },
];

export const WORKERS_AI_MODELS: Model[] = [
  {
    id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    name: "Llama 3.3 70B Fast",
    description: "Cloudflare Workers AI fast Llama instruct model",
    category: "smart",
    provider: "workers-ai",
    contextLength: 24000,
  },
  {
    id: "@cf/meta/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B Instruct",
    description: "Cloudflare Workers AI lightweight Llama instruct model",
    category: "fast",
    provider: "workers-ai",
    contextLength: 8000,
  },
  {
    id: "@cf/openai/gpt-oss-120b",
    name: "GPT OSS 120B",
    description: "OpenAI open-weight model hosted by Cloudflare Workers AI",
    category: "reasoning",
    provider: "workers-ai",
    contextLength: 32000,
  },
];

// OpenCode Zen models - model IDs match the API exactly (no prefix needed for API calls)
export const OPENCODE_ZEN_MODELS: Model[] = [
  // Free latest-generation models (great for trying out)
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
    id: "mimo-v2.5",
    name: "MiMo V2.5",
    description: "Xiaomi's latest long-context MiMo model",
    category: "fast",
    provider: "opencode-zen",
    contextLength: 1048576,
  },

  // Fast models
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
    id: "gpt-5.4-mini",
    name: "GPT 5.4 Mini",
    description: "OpenAI's latest fast GPT mini model",
    category: "fast",
    provider: "opencode-zen",
    contextLength: 400000,
  },
  {
    id: "gpt-5.4-nano",
    name: "GPT 5.4 Nano",
    description: "OpenAI's latest lightweight GPT model",
    category: "fast",
    provider: "opencode-zen",
    contextLength: 400000,
  },

  // Smart models
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    description: "Anthropic's latest Sonnet model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 1000000,
  },
  {
    id: "gemini-3.1-pro",
    name: "Gemini 3.1 Pro",
    description: "Google's high-end Gemini model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 200000,
  },
  {
    id: "gpt-5.5",
    name: "GPT 5.5",
    description: "OpenAI's latest flagship GPT model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 1050000,
  },
  {
    id: "gpt-5.5-pro",
    name: "GPT 5.5 Pro",
    description: "OpenAI's latest high-capability reasoning model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 1050000,
  },
  {
    id: "gpt-5.3-codex",
    name: "GPT 5.3 Codex",
    description: "OpenAI's latest coding-focused GPT model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 400000,
  },
  {
    id: "gpt-5.3-codex-spark",
    name: "GPT 5.3 Codex Spark",
    description: "OpenAI's latest fast coding-focused GPT model",
    category: "smart",
    provider: "opencode-zen",
    contextLength: 400000,
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
    id: "mimo-v2.5-pro",
    name: "MiMo V2.5 Pro",
    description: "Xiaomi's latest pro MiMo model for agentic coding",
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
    id: "claude-opus-4-7",
    name: "Claude Opus 4.7",
    description: "Anthropic's latest Opus model",
    category: "reasoning",
    provider: "opencode-zen",
    contextLength: 1000000,
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

export const ALL_MODELS = [
  ...OPENCODE_ZEN_MODELS,
  ...OPENROUTER_MODELS,
  ...VERCEL_AI_GATEWAY_MODELS,
  ...CLOUDFLARE_AI_GATEWAY_MODELS,
  ...WORKERS_AI_MODELS,
];

export function getProviderModels(provider: Provider): Model[] {
  switch (provider) {
    case "opencode-zen":
      return OPENCODE_ZEN_MODELS;
    case "openrouter":
      return OPENROUTER_MODELS;
    case "vercel-ai-gateway":
      return VERCEL_AI_GATEWAY_MODELS;
    case "cloudflare-ai-gateway":
      return CLOUDFLARE_AI_GATEWAY_MODELS;
    case "workers-ai":
      return WORKERS_AI_MODELS;
    case "custom":
      return [];
  }
}

export function getProviderDisplayName(provider: Provider): string {
  switch (provider) {
    case "opencode-zen":
      return "OpenCode Zen";
    case "openrouter":
      return "OpenRouter";
    case "vercel-ai-gateway":
      return "Vercel AI Gateway";
    case "cloudflare-ai-gateway":
      return "Cloudflare AI Gateway";
    case "workers-ai":
      return "Cloudflare Workers AI";
    case "custom":
      return "Custom";
  }
}

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
