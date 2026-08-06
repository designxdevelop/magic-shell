import { expect, test } from "bun:test"

import { formatExecutedCommand } from "./lib/format"
import {
  ALL_MODELS,
  OPENCODE_ZEN_MODELS,
  getConfiguredModel,
  getProviderModels,
} from "./lib/models"

test("formats executed command before command output", () => {
  const output = formatExecutedCommand("bun upgrade --stable", { dim: "", reset: "" })

  expect(output).toContain("Command:")
  expect(output).toContain("bun upgrade --stable")
})

test("built-in model metadata is complete and unique within each provider", () => {
  const keys = new Set<string>()

  for (const model of ALL_MODELS) {
    const key = `${model.provider}:${model.id}`
    expect(keys.has(key)).toBe(false)
    keys.add(key)
    expect(model.contextLength).toBeGreaterThan(0)
    expect(model.name.length).toBeGreaterThan(0)
    expect(model.description.length).toBeGreaterThan(0)

    if (model.provider === "opencode-zen") {
      expect(model.zenApiType).toBeDefined()
    }
  }
})

test("the default Zen model remains available and free", () => {
  expect(OPENCODE_ZEN_MODELS[0]?.id).toBe("deepseek-v4-flash-free")
  expect(OPENCODE_ZEN_MODELS[0]?.cost).toBe("free")
})

test("configured models resolve only within their provider", () => {
  const sharedId = "openai/gpt-5.6-terra"
  const openRouterModel = getConfiguredModel({ provider: "openrouter", defaultModel: sharedId })
  const vercelModel = getConfiguredModel({ provider: "vercel-ai-gateway", defaultModel: sharedId })

  expect(openRouterModel?.provider).toBe("openrouter")
  expect(vercelModel?.provider).toBe("vercel-ai-gateway")
  expect(getProviderModels("workers-ai").some((model) => model.id === sharedId)).toBe(false)
})
