# Magic Shell

Bun/TypeScript CLI that translates natural language into terminal commands. It has interactive and TUI entry points, multiple providers, and command-safety analysis.

## Commands

- `bun run dev` runs the CLI.
- `bun run dev:tui` runs the interactive TUI.
- `bun run build` creates `dist/`.
- `bun run typecheck` runs TypeScript checks.
- `bun test` runs the Bun test suite.

## Ownership and constraints

- Provider definitions and model catalog live in `src/lib/models.ts`; shared provider/config types live in `src/lib/types.ts` and `src/lib/config.ts`. Do not hard-code a partial provider list in documentation or code paths.
- Preserve command-safety behavior in `src/lib/safety.ts`, including the confirmation flow for dangerous commands.
- Keep API keys out of logs and error messages; preserve the existing keychain, environment, and compatible config fallback handling.
- Preserve cross-platform shell and credential behavior in `src/lib/shell.ts` and `src/lib/keychain.ts`.

Follow the formatter and local conventions in touched files.
