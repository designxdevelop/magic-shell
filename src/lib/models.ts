import type { Config, CostTier, Model, Provider } from "./types"

// Curated August 2026. Keep this list compact: current free/open-weight options,
// plus the newest OpenAI and Anthropic families suited to command generation.
export const OPENROUTER_MODELS: Model[] = [
  {
    id: "inclusionai/ling-3.0-tiny:free",
    name: "Ling 3.0 Tiny (Free)",
    description: "Current fast open-weight model available on OpenRouter's free tier.",
    category: "fast",
    provider: "openrouter",
    contextLength: 262144,
    cost: "free",
  },
  {
    id: "cohere/north-mini-code:free",
    name: "North Mini Code (Free)",
    description: "Free open-weight model optimized for coding and terminal tasks.",
    category: "fast",
    provider: "openrouter",
    contextLength: 256000,
    cost: "free",
  },
  {
    id: "deepseek/deepseek-v4-flash-0731",
    name: "DeepSeek V4 Flash 0731",
    description: "Latest fast DeepSeek V4 checkpoint with a one-million-token context window.",
    category: "fast",
    provider: "openrouter",
    contextLength: 1048576,
    cost: "lower-cost",
  },
  {
    id: "minimax/minimax-m3",
    name: "MiniMax M3",
    description: "Current open-weight MiniMax model for efficient agentic tasks.",
    category: "smart",
    provider: "openrouter",
    contextLength: 1048576,
    cost: "lower-cost",
  },
  {
    id: "z-ai/glm-5.2",
    name: "GLM 5.2",
    description: "Open-weight GLM model for complex coding and tool-use workflows.",
    category: "smart",
    provider: "openrouter",
    contextLength: 1048576,
    cost: "lower-cost",
  },
  {
    id: "qwen/qwen3.6-27b",
    name: "Qwen 3.6 27B",
    description: "Apache-licensed dense Qwen model for coding and reasoning.",
    category: "smart",
    provider: "openrouter",
    contextLength: 262144,
    cost: "lower-cost",
  },
  {
    id: "moonshotai/kimi-k3",
    name: "Kimi K3",
    description: "Latest Kimi model for long-context coding and agentic work.",
    category: "reasoning",
    provider: "openrouter",
    contextLength: 1048576,
    cost: "premium",
  },
  {
    id: "openai/gpt-5.6-luna",
    name: "GPT 5.6 Luna",
    description: "Fast, economical model from OpenAI's latest GPT 5.6 family.",
    category: "fast",
    provider: "openrouter",
    contextLength: 1050000,
    cost: "lower-cost",
  },
  {
    id: "openai/gpt-5.6-terra",
    name: "GPT 5.6 Terra",
    description: "Balanced model from OpenAI's latest GPT 5.6 family.",
    category: "smart",
    provider: "openrouter",
    contextLength: 1050000,
    cost: "premium",
  },
  {
    id: "openai/gpt-5.6-sol",
    name: "GPT 5.6 Sol",
    description: "Most capable model in OpenAI's latest GPT 5.6 family.",
    category: "reasoning",
    provider: "openrouter",
    contextLength: 1050000,
    cost: "premium",
  },
  {
    id: "anthropic/claude-sonnet-5",
    name: "Claude Sonnet 5",
    description: "Latest balanced Claude model for harder coding tasks.",
    category: "smart",
    provider: "openrouter",
    contextLength: 1000000,
    cost: "premium",
  },
  {
    id: "anthropic/claude-opus-5",
    name: "Claude Opus 5",
    description: "Latest top-tier Claude model for complex reasoning.",
    category: "reasoning",
    provider: "openrouter",
    contextLength: 1000000,
    cost: "premium",
  },
  {
    id: "anthropic/claude-fable-5",
    name: "Claude Fable 5",
    description: "Anthropic's most capable widely available model for long-running agents.",
    category: "reasoning",
    provider: "openrouter",
    contextLength: 1000000,
    cost: "premium",
  },
]

export const VERCEL_AI_GATEWAY_MODELS: Model[] = [
  ...OPENROUTER_MODELS.filter((model) =>
    [
      "openai/gpt-5.6-luna",
      "openai/gpt-5.6-terra",
      "openai/gpt-5.6-sol",
      "anthropic/claude-sonnet-5",
      "anthropic/claude-opus-5",
      "anthropic/claude-fable-5",
    ].includes(model.id),
  ).map((model) => ({ ...model, provider: "vercel-ai-gateway" as const })),
]

export const CLOUDFLARE_AI_GATEWAY_MODELS: Model[] = [
  {
    id: "workers-ai/@cf/openai/gpt-oss-120b",
    name: "Workers AI GPT OSS 120B",
    description: "OpenAI's open-weight reasoning model routed through Cloudflare AI Gateway.",
    category: "reasoning",
    provider: "cloudflare-ai-gateway",
    contextLength: 32000,
    cost: "lower-cost",
  },
  ...VERCEL_AI_GATEWAY_MODELS.map((model) => ({
    ...model,
    id: model.id.startsWith("anthropic/") ? model.id.replaceAll(".", "-") : model.id,
    provider: "cloudflare-ai-gateway" as const,
  })),
]

export const WORKERS_AI_MODELS: Model[] = [
  {
    id: "@cf/zai-org/glm-4.7-flash",
    name: "GLM 4.7 Flash",
    description: "Fast multilingual open-weight model optimized for tool calling.",
    category: "fast",
    provider: "workers-ai",
    contextLength: 131072,
    cost: "lower-cost",
  },
  {
    id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    name: "Llama 3.3 70B Fast",
    description: "Fast open-weight Llama model hosted by Workers AI.",
    category: "smart",
    provider: "workers-ai",
    contextLength: 24000,
    cost: "lower-cost",
  },
  {
    id: "@cf/moonshotai/kimi-k2.7-code",
    name: "Kimi K2.7 Code",
    description: "Open-weight coding model with tool calling and structured outputs.",
    category: "reasoning",
    provider: "workers-ai",
    contextLength: 262144,
    cost: "lower-cost",
  },
  {
    id: "@cf/meta/llama-4-scout-17b-16e-instruct",
    name: "Llama 4 Scout",
    description: "Open-weight mixture-of-experts model with function calling.",
    category: "smart",
    provider: "workers-ai",
    contextLength: 131072,
    cost: "lower-cost",
  },
  {
    id: "@cf/openai/gpt-oss-120b",
    name: "GPT OSS 120B",
    description: "OpenAI open-weight reasoning model hosted by Workers AI.",
    category: "reasoning",
    provider: "workers-ai",
    contextLength: 32000,
    cost: "lower-cost",
  },
]

export const OPENCODE_ZEN_MODELS: Model[] = [
  {
    id: "deepseek-v4-flash-free",
    name: "DeepSeek V4 Flash (Free)",
    description: "Free DeepSeek coding model with a one-million-token context window.",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 1048576,
    cost: "free",
  },
  {
    id: "ling-3.0-tiny-free",
    name: "Ling 3.0 Tiny (Free)",
    description: "Current free fast model on OpenCode Zen.",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 262144,
    cost: "free",
  },
  {
    id: "minimax-m3",
    name: "MiniMax M3",
    description: "Current open-weight MiniMax model for efficient agentic tasks.",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 1048576,
    cost: "lower-cost",
  },
  {
    id: "glm-5.2",
    name: "GLM 5.2",
    description: "Open-weight GLM model for complex coding and tool-use workflows.",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 1048576,
    cost: "lower-cost",
  },
  {
    id: "kimi-k3",
    name: "Kimi K3",
    description: "Latest Kimi model for long-context coding and agentic work.",
    category: "reasoning",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 1048576,
    cost: "premium",
  },
  ...[
    ["gpt-5.6-luna", "GPT 5.6 Luna", "fast", "lower-cost"],
    ["gpt-5.6-terra", "GPT 5.6 Terra", "smart", "premium"],
    ["gpt-5.6-sol", "GPT 5.6 Sol", "reasoning", "premium"],
  ].map(([id, name, category, cost]) => ({
    id,
    name,
    description: `${name} from OpenAI's latest GPT family.`,
    category: category as Model["category"],
    provider: "opencode-zen" as const,
    zenApiType: "openai-responses" as const,
    contextLength: 1050000,
    cost: cost as CostTier,
  })),
  {
    id: "claude-sonnet-5",
    name: "Claude Sonnet 5",
    description: "Latest balanced Claude model for harder coding tasks.",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "anthropic",
    contextLength: 1000000,
    cost: "premium",
  },
  {
    id: "claude-opus-5",
    name: "Claude Opus 5",
    description: "Latest top-tier Claude model for complex reasoning.",
    category: "reasoning",
    provider: "opencode-zen",
    zenApiType: "anthropic",
    contextLength: 1000000,
    cost: "premium",
  },
  {
    id: "claude-fable-5",
    name: "Claude Fable 5",
    description: "Anthropic's most capable widely available model for long-running agents.",
    category: "reasoning",
    provider: "opencode-zen",
    zenApiType: "anthropic",
    contextLength: 1000000,
    cost: "premium",
  },
]

export const ALL_MODELS = [
  ...OPENCODE_ZEN_MODELS,
  ...OPENROUTER_MODELS,
  ...VERCEL_AI_GATEWAY_MODELS,
  ...CLOUDFLARE_AI_GATEWAY_MODELS,
  ...WORKERS_AI_MODELS,
]

export function getProviderModels(provider: Provider): Model[] {
  switch (provider) {
    case "opencode-zen": return OPENCODE_ZEN_MODELS
    case "openrouter": return OPENROUTER_MODELS
    case "vercel-ai-gateway": return VERCEL_AI_GATEWAY_MODELS
    case "cloudflare-ai-gateway": return CLOUDFLARE_AI_GATEWAY_MODELS
    case "workers-ai": return WORKERS_AI_MODELS
    case "custom": return []
  }
}

export function getConfiguredModel(config: Pick<Config, "provider" | "defaultModel">): Model | undefined {
  return getProviderModels(config.provider).find((model) => model.id === config.defaultModel)
}

export function getProviderDisplayName(provider: Provider): string {
  switch (provider) {
    case "opencode-zen": return "OpenCode Zen"
    case "openrouter": return "OpenRouter"
    case "vercel-ai-gateway": return "Vercel AI Gateway"
    case "cloudflare-ai-gateway": return "Cloudflare AI Gateway"
    case "workers-ai": return "Cloudflare Workers AI"
    case "custom": return "Custom"
  }
}

const COST_TIER_ORDER: Record<CostTier, number> = { free: 0, "lower-cost": 1, premium: 2 }
const CATEGORY_ORDER: Record<Model["category"], number> = { fast: 0, smart: 1, reasoning: 2 }

export function sortModelsByCost<T extends Pick<Model, "name" | "category" | "cost">>(models: T[]): T[] {
  return [...models].sort((a, b) =>
    COST_TIER_ORDER[a.cost] - COST_TIER_ORDER[b.cost]
    || CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category]
    || a.name.localeCompare(b.name),
  )
}
