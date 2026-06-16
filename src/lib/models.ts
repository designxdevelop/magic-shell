import type { Model, Provider } from "./types";

// OpenRouter models - updated June 2026
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
    id: "minimax/minimax-m3",
    name: "MiniMax M3",
    description: "MiniMax's latest open-weight multimodal model for agentic coding",
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
    id: "moonshotai/kimi-k2.7-code",
    name: "Kimi K2.7 Code",
    description: "Moonshot's latest open-weight coding model",
    category: "smart",
    provider: "openrouter",
    contextLength: 262144,
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
    id: "z-ai/glm-5.2",
    name: "GLM 5.2",
    description: "Z.ai's latest open-weight long-context GLM model",
    category: "smart",
    provider: "openrouter",
    contextLength: 1048576,
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
    id: "qwen/qwen3.7-plus",
    name: "Qwen3.7 Plus",
    description: "Qwen's latest long-context open-weight plus model",
    category: "smart",
    provider: "openrouter",
    contextLength: 1000000,
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
  {
    id: "qwen/qwen3.7-max",
    name: "Qwen3.7 Max",
    description: "Qwen's latest high-capability open-weight model",
    category: "reasoning",
    provider: "openrouter",
    contextLength: 1000000,
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
    id: "anthropic/claude-opus-4.8",
    name: "Claude Opus 4.8",
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
    id: "anthropic/claude-opus-4-8",
    name: "Claude Opus 4.8",
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
    id: "mimo-v2.5-free",
    name: "MiMo V2.5 Free",
    description: "Xiaomi's free long-context MiMo model (limited time)",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 1048576,
    free: true,
  },
  {
    id: "north-mini-code-free",
    name: "North Mini Code Free",
    description: "North's free coding model (limited time)",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 200000,
    free: true,
  },
  {
    id: "nemotron-3-ultra-free",
    name: "Nemotron 3 Ultra Free",
    description: "NVIDIA Nemotron free trial model (limited time)",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 131072,
    free: true,
  },
  {
    id: "big-pickle",
    name: "Big Pickle",
    description: "OpenCode stealth model (free, limited time)",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 131072,
    free: true,
  },
  {
    id: "gpt-5-nano",
    name: "GPT 5 Nano",
    description: "OpenAI's free lightweight GPT model",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "openai-responses",
    contextLength: 400000,
    free: true,
  },
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
  {
    id: "gemini-3-flash",
    name: "Gemini 3 Flash",
    description: "Google's fast Gemini model",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "google",
    contextLength: 200000,
  },
  {
    id: "mimo-v2.5",
    name: "MiMo V2.5",
    description: "Xiaomi's latest long-context MiMo model",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 1048576,
  },
  {
    id: "gpt-5.4-mini",
    name: "GPT 5.4 Mini",
    description: "OpenAI's latest fast GPT mini model",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "openai-responses",
    contextLength: 400000,
  },
  {
    id: "gpt-5.4-nano",
    name: "GPT 5.4 Nano",
    description: "OpenAI's latest lightweight GPT model",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "openai-responses",
    contextLength: 400000,
  },

  // Smart models
  {
    id: "claude-fable-5",
    name: "Claude Fable 5",
    description: "Anthropic's latest Fable model",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "anthropic",
    contextLength: 1000000,
  },
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
    id: "gemini-3.1-pro",
    name: "Gemini 3.1 Pro",
    description: "Google's high-end Gemini model",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "google",
    contextLength: 200000,
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
  {
    id: "gpt-5.5-pro",
    name: "GPT 5.5 Pro",
    description: "OpenAI's latest high-capability reasoning model",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "openai-responses",
    contextLength: 1050000,
  },
  {
    id: "gpt-5.3-codex",
    name: "GPT 5.3 Codex",
    description: "OpenAI's latest coding-focused GPT model",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "openai-responses",
    contextLength: 400000,
  },
  {
    id: "gpt-5.3-codex-spark",
    name: "GPT 5.3 Codex Spark",
    description: "OpenAI's latest fast coding-focused GPT model",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "openai-responses",
    contextLength: 400000,
  },
  {
    id: "qwen3.7-plus",
    name: "Qwen3.7 Plus",
    description: "Qwen's latest long-context open-weight plus model",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "anthropic",
    contextLength: 1000000,
  },
  {
    id: "qwen3.7-max",
    name: "Qwen3.7 Max",
    description: "Qwen's latest high-capability open-weight model",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "anthropic",
    contextLength: 1000000,
  },
  {
    id: "minimax-m2.7",
    name: "MiniMax M2.7",
    description: "MiniMax's latest model",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 196608,
  },
  {
    id: "kimi-k2.6",
    name: "Kimi K2.6",
    description: "Moonshot's latest model",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 262144,
  },
  {
    id: "glm-5.2",
    name: "GLM 5.2",
    description: "Z.ai's latest open-weight long-context GLM model",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 1048576,
  },
  {
    id: "deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    description: "DeepSeek's latest high-context open-source model",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 1048576,
  },
  {
    id: "mimo-v2.5-pro",
    name: "MiMo V2.5 Pro",
    description: "Xiaomi's latest pro MiMo model for agentic coding",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 1048576,
  },
  {
    id: "glm-5.1",
    name: "GLM 5.1",
    description: "Z.ai's latest GLM model",
    category: "smart",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 202752,
  },
  {
    id: "deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    description: "DeepSeek's latest fast open-source model",
    category: "fast",
    provider: "opencode-zen",
    zenApiType: "openai-compatible",
    contextLength: 1048576,
  },

  // Reasoning models
  {
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    description: "Anthropic's latest Opus model",
    category: "reasoning",
    provider: "opencode-zen",
    zenApiType: "anthropic",
    contextLength: 1000000,
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
