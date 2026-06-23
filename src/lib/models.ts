import type { Model, Provider, CostTier } from "./types";

// Curated June 2026 — 6-8 per provider, latest available versions.
// cost tiers: "free" | "lower-cost" | "premium"
// categories: "fast" | "smart" | "reasoning"
// Thinking defaults to "low" via config; models that support it get
// reasoning controls automatically (see api.ts supportsThinkingControl).

export const OPENROUTER_MODELS: Model[] = [
  {
    id: "deepseek/deepseek-v4-flash:free",
    name: "DeepSeek V4 Flash (Free)",
    description: "Fast DeepSeek coding model on OpenRouter's free tier.",
    category: "fast",
    provider: "openrouter",
    contextLength: 1048576,
    cost: "free",
  },
  {
    id: "deepseek/deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    description: "Fast DeepSeek coding model with a large context window.",
    category: "fast",
    provider: "openrouter",
    contextLength: 1048576,
    cost: "lower-cost",
  },
  {
    id: "z-ai/glm-5.2",
    name: "GLM 5.2",
    description: "Fast GLM model for low-cost command generation.",
    category: "fast",
    provider: "openrouter",
    contextLength: 202752,
    cost: "lower-cost",
  },
  {
    id: "moonshotai/kimi-k2.7-code",
    name: "Kimi K2.7 Code",
    description: "Open-weight coding model for larger code tasks.",
    category: "smart",
    provider: "openrouter",
    contextLength: 262144,
    cost: "lower-cost",
  },
  {
    id: "deepseek/deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    description: "High-context DeepSeek model for larger code tasks.",
    category: "smart",
    provider: "openrouter",
    contextLength: 1048576,
    cost: "lower-cost",
  },
  {
    id: "anthropic/claude-sonnet-4.6",
    name: "Claude Sonnet 4.6",
    description: "Balanced Claude model for harder coding tasks.",
    category: "smart",
    provider: "openrouter",
    contextLength: 1000000,
    cost: "premium",
  },
  {
    id: "openai/gpt-5.5",
    name: "GPT 5.5",
    description: "Flagship GPT model for complex shell tasks.",
    category: "smart",
    provider: "openrouter",
    contextLength: 1050000,
    cost: "premium",
  },
  {
    id: "anthropic/claude-opus-4.8",
    name: "Claude Opus 4.8",
    description: "Top Claude reasoning model for complex tasks.",
    category: "reasoning",
    provider: "openrouter",
    contextLength: 1000000,
    cost: "premium",
  },
];

export const VERCEL_AI_GATEWAY_MODELS: Model[] = [
  {
    id: "openai/gpt-5.5",
    name: "GPT 5.5",
    description: "Flagship GPT model for complex shell tasks.",
    category: "smart",
    provider: "vercel-ai-gateway",
    contextLength: 1050000,
    cost: "premium",
  },
  {
    id: "anthropic/claude-sonnet-4.6",
    name: "Claude Sonnet 4.6",
    description: "Balanced Claude model for harder coding tasks.",
    category: "smart",
    provider: "vercel-ai-gateway",
    contextLength: 1000000,
    cost: "premium",
  },
  {
    id: "anthropic/claude-opus-4.8",
    name: "Claude Opus 4.8",
    description: "Top Claude reasoning model for complex tasks.",
    category: "reasoning",
    provider: "vercel-ai-gateway",
    contextLength: 1000000,
    cost: "premium",
  },
];

export const CLOUDFLARE_AI_GATEWAY_MODELS: Model[] = [
  {
    id: "workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    name: "Workers AI Llama 3.3 70B Fast",
    description: "Cloudflare Workers AI fast Llama model routed through AI Gateway",
    category: "smart",
    provider: "cloudflare-ai-gateway",
    contextLength: 24000,
    cost: "lower-cost",
  },
  {
    id: "openai/gpt-5.5",
    name: "GPT 5.5",
    description: "Flagship GPT model for complex shell tasks. through Cloudflare AI Gateway",
    category: "smart",
    provider: "cloudflare-ai-gateway",
    contextLength: 1050000,
    cost: "premium",
  },
  {
    id: "anthropic/claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    description: "Balanced Claude model for harder coding tasks. through Cloudflare AI Gateway",
    category: "smart",
    provider: "cloudflare-ai-gateway",
    contextLength: 1000000,
    cost: "premium",
  },
  {
    id: "anthropic/claude-opus-4-8",
    name: "Claude Opus 4.8",
    description: "Top Claude reasoning model for complex tasks. through Cloudflare AI Gateway",
    category: "reasoning",
    provider: "cloudflare-ai-gateway",
    contextLength: 1000000,
    cost: "premium",
  },
];

export const WORKERS_AI_MODELS: Model[] = [
  {
    id: "@cf/meta/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B Instruct",
    description: "Cloudflare Workers AI lightweight Llama instruct model",
    category: "fast",
    provider: "workers-ai",
    contextLength: 8000,
    cost: "lower-cost",
  },
  {
    id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    name: "Llama 3.3 70B Fast",
    description: "Cloudflare Workers AI fast Llama instruct model",
    category: "smart",
    provider: "workers-ai",
    contextLength: 24000,
    cost: "lower-cost",
  },
  {
    id: "@cf/openai/gpt-oss-120b",
    name: "GPT OSS 120B",
    description: "OpenAI open-weight model hosted by Cloudflare Workers AI",
    category: "reasoning",
    provider: "workers-ai",
    contextLength: 32000,
    cost: "lower-cost",
  },
];

// OpenCode Zen models — IDs match the API exactly (no prefix needed).
export const OPENCODE_ZEN_MODELS: Model[] = [
  {
    id: "deepseek-v4-flash-free",
    name: "DeepSeek V4 Flash Free",
    description: "Free DeepSeek coding model with a large context window.",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 1048576,
    cost: "free",
  },
  {
    id: "gpt-5-nano",
    name: "GPT 5 Nano",
    description: "Lowest-cost GPT for quick edits and simple commands.",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "openai-responses",
    contextLength: 400000,
    cost: "lower-cost",
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    description: "Fast Claude model for quick command generation.",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "anthropic",
    contextLength: 200000,
    cost: "lower-cost",
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    description: "Fast Gemini model with a large context window.",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "google",
    contextLength: 1048576,
    cost: "lower-cost",
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    description: "Balanced Claude model for harder coding tasks.",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "anthropic",
    contextLength: 1000000,
    cost: "premium",
  },
  {
    id: "gpt-5.5",
    name: "GPT 5.5",
    description: "Flagship GPT model for complex shell tasks.",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "openai-responses",
    contextLength: 1050000,
    cost: "premium",
  },
  {
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    description: "Top Claude reasoning model for complex tasks.",
    category: "reasoning",
    provider: "opencode-zen",
    zenApiType: "anthropic",
    contextLength: 1000000,
    cost: "premium",
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
    default: {
      const exhaustiveProvider: never = provider;
      return exhaustiveProvider;
    }
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
    default: {
      const exhaustiveProvider: never = provider;
      return exhaustiveProvider;
    }
  }
}

const COST_TIER_ORDER: Record<CostTier, number> = {
  free: 0,
  "lower-cost": 1,
  premium: 2,
};

const CATEGORY_ORDER: Record<Model["category"], number> = {
  fast: 0,
  smart: 1,
  reasoning: 2,
};

/**
 * Sort models by cost tier (free → lower-cost → premium),
 * then by category (fast → smart → reasoning), then alphabetically.
 */
export function sortModelsByCost<T extends Pick<Model, "name" | "category" | "cost">>(models: T[]): T[] {
  return [...models].sort((a, b) => {
    const costDiff = COST_TIER_ORDER[a.cost] - COST_TIER_ORDER[b.cost];
    if (costDiff !== 0) return costDiff;
    const catDiff = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
    if (catDiff !== 0) return catDiff;
    return a.name.localeCompare(b.name);
  });
}
