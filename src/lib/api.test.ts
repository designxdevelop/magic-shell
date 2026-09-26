import { expect, test } from "bun:test";
import { buildAiSdkProviderOptions, shouldOmitTemperature } from "./api";

test("Opus 5.5 uses effort without manual thinking budgets", () => {
  for (const level of ["off", "low", "medium", "high"] as const) {
    expect(buildAiSdkProviderOptions("claude-opus-5-5", level)).toEqual({
      anthropic: { effort: level === "off" ? "low" : level },
    });
    for (const id of ["claude-opus-5-5", "anthropic/claude-opus-5.5", "anthropic/claude-opus-5-5"]) {
      expect(shouldOmitTemperature(id, level)).toBe(true);
    }
  }
});

test("GPT 6 Luna and Sol retain reasoning and omit temperature", () => {
  for (const id of ["gpt-6-luna", "gpt-6-sol"]) {
    expect(buildAiSdkProviderOptions(id, "high")?.openai).toEqual({ reasoningEffort: "high" });
    expect(shouldOmitTemperature(id, "off")).toBe(true);
  }
});
