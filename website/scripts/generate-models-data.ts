/**
 * Generate website/src/data/models.json from src/lib/models.ts.
 *
 * Run via: `bun run website/scripts/generate-models-data.ts`
 *
 * This is the single source of truth for the docs model catalog — if you
 * update src/lib/models.ts, re-run this script (the website build runs it
 * automatically via the `models:generate` step).
 */
import { writeFileSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import {
  OPENCODE_ZEN_MODELS,
  OPENROUTER_MODELS,
  VERCEL_AI_GATEWAY_MODELS,
  CLOUDFLARE_AI_GATEWAY_MODELS,
  WORKERS_AI_MODELS,
  getProviderDisplayName,
} from "../../src/lib/models.ts"
import type { Model, Provider } from "../../src/lib/types.ts"

interface ProviderCatalog {
  id: CatalogProvider
  displayName: string
  models: Model[]
}

type CatalogProvider = Exclude<Provider, "custom">

const providerOrder: CatalogProvider[] = [
  "opencode-zen",
  "openrouter",
  "vercel-ai-gateway",
  "cloudflare-ai-gateway",
  "workers-ai",
]

const modelLists: Record<CatalogProvider, Model[]> = {
  "opencode-zen": OPENCODE_ZEN_MODELS,
  openrouter: OPENROUTER_MODELS,
  "vercel-ai-gateway": VERCEL_AI_GATEWAY_MODELS,
  "cloudflare-ai-gateway": CLOUDFLARE_AI_GATEWAY_MODELS,
  "workers-ai": WORKERS_AI_MODELS,
}

const providers: ProviderCatalog[] = providerOrder.map((id) => ({
  id,
  displayName: getProviderDisplayName(id),
  models: modelLists[id].map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    category: m.category,
    provider: m.provider,
    contextLength: m.contextLength,
    cost: m.cost,
    zenApiType: (m as Model).zenApiType,
    disabled: (m as Model).disabled ?? false,
    disabledReason: (m as Model).disabledReason,
  })),
}))

const total = providers.reduce((n, p) => n + p.models.length, 0)

const payload = {
  generatedAt: new Date().toISOString(),
  total,
  providers,
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = resolve(__dirname, "../src/data/models.json")
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n", "utf-8")

console.log(`Wrote ${outPath}`)
console.log(`  providers: ${providers.length}`)
console.log(`  models:    ${total}`)