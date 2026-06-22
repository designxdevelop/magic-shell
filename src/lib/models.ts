import type { Model, Provider } from "./types";

// OpenRouter models — curated June 2026
// 6-8 per provider: latest available versions spanning free / lower-cost / premium
// across fast / smart / reasoning categories.
export const OPENROUTER_MODELS: Model[] = [
  // Fast / free
  {
    id: "deepseek/deepseek-v4-flash:free",
    name: "DeepSeek V4 Flash (Free)",
    description: "DeepSeek's fast open-source model on OpenRouter's free tier (limited rate)",
    category: "fast",
    provider: "openrouter",
    contextLength: 1048576,
    free: true,
  },
  // Fast / lower-cost
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
  // Smart / lower-cost
  {
    id: "moonshotai/kimi-k2.7-code",
    name: "Kimi K2.7 Code",
    description: "Moonshot's latest open-weight coding model",
    category: "smart",
    provider: "openrouter",
    contextLength: 262144,
  },
  {
    id: "deepseek/deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    description: "DeepSeek's latest high-context open-source model",
    category: "smart",
    provider: "openrouter",
    contextLength: 1048576,
  },
  // Smart / premium
  {
    id: "anthropic/claude-sonnet-4.6",
    name: "Claude Sonnet 4.6",
    description: "Anthropic's latest Sonnet model",
    category: "smart",
    provider: "openrouter",
    contextLength: 1000000,
  },
  {
    id: "openai/gpt-5.5",
    name: "GPT 5.5",
    description: "OpenAI's latest flagship GPT model",
    category: "smart",
    provider: "openrouter",
    contextLength: 1050000,
  },
  // Reasoning / premium
  {
    id: "anthropic/claude-opus-4.8",
    name: "Claude Opus 4.8",
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
];

export const VERCEL_AI_GATEWAY_MODELS: Model[] = [
  // Smart / premium
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
  // Reasoning / premium
  {
    id: "openai/gpt-5.5-pro",
    name: "GPT 5.5 Pro",
    description: "OpenAI's latest high-capability reasoning model",
    category: "reasoning",
    provider: "vercel-ai-gateway",
    contextLength: 1050000,
  },
  {
    id: "anthropic/claude-opus-4.8",
    name: "Claude Opus 4.8",
    description: "Anthropic's latest Opus model",
    category: "reasoning",
    provider: "vercel-ai-gateway",
    contextLength: 1000000,
  },
];

export const CLOUDFLARE_AI_GATEWAY_MODELS: Model[] = [
  // Smart / premium
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
  // Reasoning / premium
  {
    id: "anthropic/claude-opus-4-8",
    name: "Claude Opus 4.8",
    description: "Anthropic's latest Opus model through Cloudflare AI Gateway",
    category: "reasoning",
    provider: "cloudflare-ai-gateway",
    contextLength: 1000000,
  },
  // Smart / lower-cost
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
  // Fast / lower-cost
  {
    id: "@cf/meta/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B Instruct",
    description: "Cloudflare Workers AI lightweight Llama instruct model",
    category: "fast",
    provider: "workers-ai",
    contextLength: 8000,
  },
  // Smart / lower-cost
  {
    id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    name: "Llama 3.3 70B Fast",
    description: "Cloudflare Workers AI fast Llama instruct model",
    category: "smart",
    provider: "workers-ai",
    contextLength: 24000,
  },
  // Reasoning / lower-cost
  {
    id: "@cf/openai/gpt-oss-120b",
    name: "GPT OSS 120B",
    description: "OpenAI open-weight model hosted by Cloudflare Workers AI",
    category: "reasoning",
    provider: "workers-ai",
    contextLength: 32000,
  },
];

// OpenCode Zen models — curated June 2026
// Model IDs match the API exactly (no prefix needed for API calls).
// 8 models spanning free / lower-cost / premium across fast / smart / reasoning.
export const OPENCODE_ZEN_MODELS: Model[] = [
  // Fast / free
  {
    id: "deepseek-v4-flash-free",
    name: "DeepSeek V4 Flash Free",
    description: "DeepSeek's free fast open-source model (limited time)",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 1048576,
    free: true,
  },
  {
    id: "gpt-5-nano",
    name: "GPT 5 Nano",
    description: "OpenAI's lightweight GPT model ($0.05/$0.40 per 1M tokens)",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "openai-responses",
    contextLength: 400000,
  },
  // Fast / lower-cost
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    description: "Anthropic's latest fast model",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "anthropic",
    contextLength: 200000,
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    description: "Google's latest fast Gemini model",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "google",
    contextLength: 1048576,
  },
  // Smart / premium
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    description: "Anthropic's latest Sonnet model",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "anthropic",
    contextLength: 1000000,
  },
  {
    id: "gpt-5.5",
    name: "GPT 5.5",
    description: "OpenAI's latest flagship GPT model",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "openai-responses",
    contextLength: 1050000,
  },
  // Reasoning / premium
  {
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    description: "Anthropic's latest Opus model",
    category: "reasoning",
    provider: "opencode-zen",
    zenApiType: "anthropic",
    contextLength: 1000000,
  },
  {
    id: "gpt-5.5-pro",
    name: "GPT 5.5 Pro",
    description: "OpenAI's latest high-capability reasoning model",
    category: "reasoning",
    provider: "opencode-zen",
    zenApiType: "openai-responses",
    contextLength: 1050000,
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