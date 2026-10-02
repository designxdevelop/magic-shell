import { expect, test } from "bun:test";
import { buildAiSdkProviderOptions, shouldOmitTemperature } from "./api";

test("Claude 5.5 models use effort without manual thinking budgets", () => {
  for (const level of ["off", "low", "medium", "high"] as const) {
    for (const family of ["opus", "sonnet"]) {
      expect(buildAiSdkProviderOptions(`claude-${family}-5-5`, level)).toEqual({
        anthropic: { effort: level === "off" ? "low" : level },
      });
      for (const id of [`claude-${family}-5-5`, `anthropic/claude-${family}-5.5`, `anthropic/claude-${family}-5-5`]) {
        expect(shouldOmitTemperature(id, level)).toBe(true);
      }
    }
  }
});

test("GPT 6 Luna and Sol retain reasoning and omit temperature", () => {
  for (const id of ["gpt-6-luna", "gpt-6-sol"]) {
    expect(buildAiSdkProviderOptions(id, "high")?.openai).toEqual({ reasoningEffort: "high" });
    expect(shouldOmitTemperature(id, "off")).toBe(true);
  }
});

test("GPT 5.6 Luna omits temperature even when thinking options are off", () => {
  for (const id of ["gpt-5.6-luna", "openai/gpt-5.6-luna"]) {
    for (const level of ["off", "low", "medium", "high"] as const) {
      expect(shouldOmitTemperature(id, level)).toBe(true);
    }
  }
  expect(buildAiSdkProviderOptions("gpt-5.6-luna", "off")).toBeUndefined();
  expect(shouldOmitTemperature("deepseek-v4-flash-free", "off")).toBe(false);
});
