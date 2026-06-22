# Docs website fixes — plan
Scope: theme switcher, aside/blockquote readability, cramped provider tabs in `configuration.mdx`, and surfacing supported models & providers. Confirmed direction with Austin on 2026-06-22.
## 1. Theme switcher "does not work"
### Root cause
`website/src/styles/starlight-custom.css` declares Magic Shell's dark palette on the bare `:root` selector. That selector applies in **both** light and dark mode, so when the user toggles the Starlight switcher (which only flips `data-theme="dark"`/`"light"` on `<html>`), the visible colors barely change — the custom greys/bg overrides win in both modes. The `[data-theme="dark"]` block that _does_ exist adds only three background tweaks, so light mode ends up dark-text-on-dark-background territory.
### Fix
Restructure `starlight-custom.css` so every theme-dependent value lives under the correct selector:

- `:root` — only neutrals that are truly the same in both modes (font sizes, radius, families, accent hue). No background, text, or grey ramps here.
  
- `:root[data-theme="dark"]` — the existing "Terminal Alchemy" dark palette (what we have today).
  
- `:root[data-theme="light"]` — a new light palette tuned to the same warm-orange accent:
  
  - `--sl-color-bg`, `--sl-color-bg-nav`, `--sl-color-bg-sidebar` → warm off-white `#fbfaf8` / `#ffffff` / `#f5f3ef`
    
  - `--sl-color-gray-1..6` → light grey ramp `#2a2a2a` → `#e8e6e1` (kept in the same order Starlight uses)
    
  - `--sl-color-black`/`--sl-color-white` → inverted
    
  - `--sl-color-accent-low` → pale orange `#fef3e6`; `--sl-color-accent-high` → deep amber `#a86a3c`
    
  - `--sl-color-hairline*` → light hairlines `#e8e6e1` / `#d8d4cd`
    
  - Re-skin the components that hardcode hex (`header.header`, `.search-input`, `.expressive-code pre`, `:not(pre) > code`, scrollbars, `::-moz-selection`) to use CSS variables that change with theme. Any remaining hardcoded `#0a0a0a`-style on `:root` for these move into `[data-theme="dark"]`, with light counterparts in `[data-theme="light"]`.
    
### Blockquotes / asides ("hard to read")
Currently `.starlight-aside--*` sets a colored left border + accent text color, but no background tint. On long callouts the slender border is hard to scan and contrast against pure-black bg is weak. Add:

- A subtle tinted background per variant using `color-mix(in srgb, var(--sl-color-asides-text-accent) 12%, var(--sl-color-bg))` — automatically adapts to light/dark since it derives from `--sl-color-bg`.
  
- Bump the accent bar to `4px` and add the same color to the inline icon background.
  
- Keep the per-variant text accents but re-declare them under `[data-theme="light"]` with darker variants (e.g., green `#2f8a45`, orange `#b36a16`, red `#b12936`) so they meet WCAG AA against the light bg.
  
## 2. Cramped provider tabs in `configuration.mdx`
The "Get an API Key" `<Tabs>` block has 6 `<TabItem>`s; on any screen under ~1100px the tablist overflows and the labels collide. We keep the convenience of one section but rebuild the surface.
### New component `website/src/components/ProviderSetup.astro`
- Renders the six providers (`OpenCode Zen`, `OpenRouter`, `Vercel AI Gateway`, `Cloudflare AI Gateway`, `Cloudflare Workers AI`, `Custom`) as a **card grid** (`grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`).
  
- Each card has: provider name, one-line summary, and a "Get an API key" chevron toggle that expands an inline panel with the steps currently in each `<TabItem>` (using native `<details>`/`<summary>` for accessibility — works without JS, keyboard-operable, persists open state with no extra script).
  
- Replace the `<Tabs>…</Tabs>` block in `configuration.mdx` with `<ProviderSetup />`. Custom provider card links to `/features/providers/#custom-models` instead of duplicating the wizard walkthrough.
  

Pros over tabs: cards never overflow; multiple providers can be open at once for side-by-side comparison; survives narrow viewports and mobile.
## 3. Expose supported models & providers — generated catalog
Right now `features/providers.mdx` carries hand-maintained model lists that are already out of sync with `src/lib/models.ts` (e.g. providers.mdx lists 8 Zen models, source has 30+; several IDs in the equivalents table like `qwen3.7-max` differ from source `qwen/qwen3.7-max`). We make `models.ts` the single source of truth.
### Generation step
New script `website/scripts/generate-models-data.mjs` (Node ESM, since the website uses `npm`):

- Imports `../../src/lib/models.ts` via a lightweight dynamic `import()` after stripping/ignoring the `import type` line — or, simpler and more portable, runs the file through `bun` if available, falling back to a regex/AST extraction is fragile. Cleaner: **format-shift only** — read the file as text, evaluate just the model array literals with `Function` after replacing the `import` lines. Concretely, the script:
  
  1. Reads `src/lib/models.ts`.
    
  2. Removes the `import type { Model, Provider } from "./types"` line and the trailing `getProviderModels`/`getProviderDisplayName` functions (everything from the first `export function` onward is dropped).
    
  3. Prepends `const Model = null; const Provider = null;` so the type annotations don't break evaluated JS (TS types are erased syntax-wise but `Provider` is used as a value… actually it's only used in type position). Verify after first run.
    
  4. Uses `new Function(src)()` to get the module scope; re-export the consts.
    
  5. Writes `website/src/data/models.json` with shape `{ providers: [{ id, displayName, models: [...] }], generatedAt }`.
    
- Wired into `package.json` scripts as `prebuild` (and an explicit `models:generate`). Build pipeline becomes `npm run models:generate && astro build`.
  

Even simpler alternative if the `Function` dance proves flaky **on implementation**: have the script shell out to `bun run` against a tiny loader module that re-exports the arrays. We'll decide at implementation time; both are documented here.
### Astro component `website/src/components/ModelCatalog.astro`
- Reads `website/src/data/models.json` (generated).
  
- Renders:
  
  - A **filter row**: chips for each provider + a category filter (Fast / Smart / Reasoning / Free-only toggle). Pure-CSS using radio inputs + `:has()` where supported; gracefully degrades to show-all if `:has()` is unsupported.
    
  - A **catalog table per provider** (or one big grouped table) with columns: Model name · `id` (mono) · Category · Cost (computed from the `free` flag + `category`, matching the legend already in providers.mdx) · Context length (humanized: "1M", "8K") · Zen API type where present.
    
  - Cost indicator reuses the existing Free / Lower-cost / Premium legend from providers.mdx so we don't introduce a new vocabulary.
    
- Styled using existing starlight-custom CSS variables only — no new theme tokens.
  
### New page `website/src/content/docs/reference/models.mdx`
- Frontmatter `title: Models`, imports `ModelCatalog`.
  
- Short intro paragraph explaining the cost legend, then `<ModelCatalog />`.
  
- Linked in the sidebar under **Reference** between "Config File" and "Keyboard Shortcuts" (see astro.config.mjs change).
  
### `features/providers.mdx` cleanup
- Keep the prose (provider descriptions, env vars, custom-models walkthrough) — it's useful narrative.
  
- Replace the per-provider hand-maintained model tables with a single "See the full catalog →" link to `/reference/models/`, and keep only the **Model Equivalents Across Providers** table (which is a curated cross-provider map, not a per-provider list — different intent). Audit that table against `models.ts` while we're there and fix the `qwen3.7-max` vs `qwen/qwen3.7-max` style mismatches. Maintain the equivalent table by hand since it represents a _curation_ decision, not the full set.
  
### `astro.config.mjs`
Add to the Reference sidebar group:

```
{ label: "Models", slug: "reference/models" },
```

placed after "Config File".
## 4. Verification
- `cd website && npm run typecheck && npm run build` — must pass clean (catches broken imports, MDX errors).
  
- `npm run dev` manual pass: toggle light/dark on `configuration`, `features/providers`, `features/safety-levels`, and the new `reference/models` page; confirm asides are readable in both modes; confirm provider cards expand/collapse and keyboard-operate; confirm the model catalog filters.
  
- Spot-check the generated `models.json` count matches `ALL_MODELS.length` from source.
  
## Out of scope (intentionally)
- Marketing landing page `src/pages/index.astro` — its `Landing.astro`/`global.css` are dark-only by design (no switcher there). Not touched.
  
- The `getProviderModels`/`getProviderDisplayName` helper duplication between source and website — the website's `features/providers.mdx` prose still names providers in English; we don't auto-generate those sentences.
  
- Cost data we can't derive (real $/Mtok) — sticking to the existing Free / Lower-cost / Premium legend.
