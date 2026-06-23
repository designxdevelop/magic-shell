# Magic Shell

> Transform natural language into terminal commands with AI-powered translation, built-in safety, and a polished v1.0 terminal UI.

Magic Shell is an open-source CLI that turns plain English into shell commands. Use `msh` for fast one-shot translations or `mshell` for the interactive TUI with command palettes, slash commands, model switching, themes, safety controls, and command history.

## v1.0

Magic Shell 1.0 is focused on day-to-day terminal UX:

- Unified command palettes for commands, slash commands, models, providers, themes, safety, thinking level, onboarding, and API key setup.
- Slash commands now open the same picker actions as the command palette instead of submitting `/models` or `/providers` as plain text.
- `Esc` and `Ctrl+C` close active modals before exiting the app.
- Safety and thinking controls now open explicit pickers instead of blindly cycling values.
- Model and provider pickers use clearer descriptions and consistent category/cost labels.

## Install

```bash
bun add -g @austinthesing/magic-shell@latest
```

Other package managers:

```bash
npm install -g @austinthesing/magic-shell@latest
pnpm add -g @austinthesing/magic-shell@latest
yarn global add @austinthesing/magic-shell@latest
```

From source:

```bash
git clone https://github.com/austin-thesing/magic-shell.git
cd magic-shell
bun install
bun run build
bun link
```

## Quick Start

```bash
msh --setup
mshell
```

You can also provide API keys with environment variables:

```bash
export OPENCODE_ZEN_API_KEY="your-key-here"
export OPENROUTER_API_KEY="your-key-here"
```

## CLI Usage

```bash
msh "list all javascript files"
msh -x "show disk usage"
msh -n "delete all node_modules folders"
msh -r "run the dev server"
```

| Command | Description |
| --- | --- |
| `msh <query>` | Translate a natural-language query to a shell command |
| `msh -x <query>` | Translate and execute immediately |
| `msh -n <query>` | Dry run with safety analysis |
| `msh -r <query>` | Include project context for one query |
| `mshell` | Launch interactive TUI mode |
| `msh --setup` | Configure provider and API keys |
| `msh --models` | List available models |
| `msh --model <id>` | Set the default model |
| `msh --provider <name>` | Set the active provider |
| `msh --safety <level>` | Set safety level: `strict`, `moderate`, `relaxed` |
| `msh --thinking <level>` | Set thinking level: `off`, `low`, `medium`, `high` |
| `msh --themes` | List themes |
| `msh --theme <name>` | Set theme |
| `msh --repo-context` | Enable project context detection |
| `msh --add-model` | Add a custom OpenAI-compatible model |
| `msh --list-custom` | List custom models |
| `msh --remove-model <id>` | Remove a custom model |

## TUI Usage

Launch the interactive app:

```bash
mshell
```

Core shortcuts:

| Shortcut | Action |
| --- | --- |
| `Ctrl+P` | Open the command palette |
| `/` | Open slash commands from the prompt |
| `Ctrl+X M` | Open model picker |
| `Ctrl+X T` | Open theme picker |
| `Ctrl+Y` | Open safety level picker |
| `Ctrl+T` | Open thinking level picker |
| `Esc` | Close the active modal |
| `Ctrl+C` | Close the active modal, then exit when no modal is open |
| `Ctrl+D` | Exit |
| `Ctrl+X Q` | Exit |

Slash commands expose the same functionality as the command palette:

| Command | Action |
| --- | --- |
| `/models` | Select model |
| `/providers` | Switch provider |
| `/themes` | Select theme |
| `/safety` | Select safety level |
| `/thinking` | Select thinking level |
| `/dry` | Toggle dry-run mode |
| `/config` | Show config |
| `/history` | Show history |
| `/clear` | Clear chat |
| `/help` | Show help |
| `/exit` | Exit |

Legacy `!` commands still work for compatibility.

## Providers

Magic Shell supports:

- OpenCode Zen
- OpenRouter
- Vercel AI Gateway
- Cloudflare AI Gateway
- Cloudflare Workers AI
- Custom OpenAI-compatible endpoints like LM Studio and Ollama

OpenCode Zen is the recommended default and includes free models. Get an API key at [opencode.ai/auth](https://opencode.ai/auth).

## Development

```bash
bun install
bun run dev
bun run dev:tui
bun run typecheck
bun run build
```

No test framework is configured yet.

---

Built by [Austin Thesing](https://github.com/austin-thesing) · A [Design X Develop LLC](https://designxdevelop.com) project
