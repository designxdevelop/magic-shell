import { expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawnSync } from "child_process";
import { ALL_MODELS, getProviderDefaultModel } from "./models";
import type { Config } from "./types";

// Use a separate home and process so tests never read or change user credentials.
function withConfig(saved: Record<string, unknown> | undefined, beforeLoad = "") {
  const home = mkdtempSync(join(tmpdir(), "magic-shell-config-"));
  const dir = join(home, ".magic-shell");
  const path = join(dir, "config.json");
  const original = saved === undefined ? undefined : JSON.stringify(saved);
  try {
    mkdirSync(dir);
    if (original !== undefined) writeFileSync(path, original);
    const result = spawnSync(process.execPath, ["--eval", `
      import { loadConfig } from ${JSON.stringify(import.meta.dir + "/config.ts")};
      import { getProviderModels } from ${JSON.stringify(import.meta.dir + "/models.ts")};
      ${beforeLoad}
      console.log(JSON.stringify(loadConfig()));
    `], {
      env: { ...process.env, HOME: home, USERPROFILE: home },
      encoding: "utf8",
    });
    expect(result.status).toBe(0);
    const config = JSON.parse(result.stdout) as Config;
    const persisted = saved === undefined ? undefined : readFileSync(path, "utf8");
    return { config, original, persisted };
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
}

test("removed Zen defaults migrate and preserve credentials and settings", () => {
  const saved = {
    provider: "opencode-zen",
    defaultModel: "laguna-s-2.1-free",
    opencodeZenApiKey: "fixture-config-fallback-key",
    safetyLevel: "strict",
    blockedCommands: ["fixture-blocked-command"],
    repoContext: false,
    futureSetting: "preserve-me",
  };
  const { config, persisted } = withConfig(saved);
  const expectedId = getProviderDefaultModel("opencode-zen")!.id;
  expect(config.defaultModel).toBe(expectedId);
  expect(JSON.parse(persisted!)).toEqual({ ...saved, defaultModel: expectedId });
  const again = withConfig(JSON.parse(persisted!));
  expect(again.config.defaultModel).toBe(expectedId);
  expect(again.persisted).toBe(again.original);
});

test("stale defaults stay within each built-in provider", () => {
  for (const provider of new Set(ALL_MODELS.map((model) => model.provider))) {
    const { config } = withConfig({ provider, defaultModel: "retired-model" });
    expect(config.provider).toBe(provider);
    expect(config.defaultModel).toBe(getProviderDefaultModel(provider)!.id);
  }
});

test("valid user selections are preserved without rewriting the config", () => {
  const model = ALL_MODELS.find((model) => model.provider === "opencode-zen" && model.cost === "premium")!;
  const { config, original, persisted } = withConfig({ provider: model.provider, defaultModel: model.id });
  expect(config.defaultModel).toBe(model.id);
  expect(persisted).toBe(original);
});

test("custom defaults including legacy configurations are preserved", () => {
  for (const provider of ["custom", "opencode-zen"]) {
    const { config, original, persisted } = withConfig({
      provider,
      defaultModel: "local-model",
      customModels: [{ id: "local-model", modelId: "local-llama", baseUrl: "http://localhost:1234/v1" }],
    });
    expect(config.defaultModel).toBe("local-model");
    expect(persisted).toBe(original);
  }
  const missing = withConfig({ provider: "custom", defaultModel: "removed-custom-model" });
  expect(missing.config.provider).toBe("custom");
  expect(missing.persisted).toBe(missing.original);
});

test("disabled defaults migrate to the next enabled model", () => {
  const first = getProviderDefaultModel("opencode-zen")!;
  const { config } = withConfig({ provider: first.provider, defaultModel: first.id }, `
    getProviderModels("opencode-zen")[0].disabled = true;
  `);
  expect(config.defaultModel).not.toBe(first.id);
  expect(ALL_MODELS.some((model) => model.provider === config.provider && model.id === config.defaultModel)).toBe(true);
});

test("fresh installations derive the default from the provider catalog", () => {
  const { config } = withConfig(undefined);
  expect(config.defaultModel).toBe(getProviderDefaultModel(config.provider)!.id);
});
