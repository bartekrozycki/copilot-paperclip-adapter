# copilot-paperclip-adapter

An external [Paperclip](https://github.com/paperclipai/paperclip) adapter that runs the **GitHub Copilot CLI** (`copilot`, npm `@github/copilot`) headless as a Paperclip agent. Adapter type: `copilot_local`.

It is a standalone, user-installable build of the in-tree adapter proposed upstream in [paperclipai/paperclip#15881](https://github.com/paperclipai/paperclip/pull/15881). Its structure derives from the Paperclip `kimi-local` adapter (MIT, (c) Paperclip AI).

## Requirements

- Paperclip with external adapter support (`/api/adapters/install`), Node >= 24.11
- GitHub Copilot CLI on the host: `npm i -g @github/copilot` (or `brew install copilot-cli`)
- A Copilot entitlement and a login: `copilot login`, or `COPILOT_GITHUB_TOKEN` (fine-grained PAT with "Copilot Requests") in the agent's env. `GH_TOKEN`/`GITHUB_TOKEN` are deliberately not promoted.

## Install

### Install from npm (recommended)

```sh
paperclipai adapter install --payload-json '{"packageName":"@bartekrozycki/copilot-paperclip-adapter"}'
```

Or in the UI: Settings -> Adapters -> install, enter `@bartekrozycki/copilot-paperclip-adapter` (leave the local path option off). To pin a version, add a `version` field (`'{"packageName":"@bartekrozycki/copilot-paperclip-adapter","version":"0.1.0"}'`) or enter `@bartekrozycki/copilot-paperclip-adapter@0.1.0`. Without `version` the latest release is installed.

The install route runs `npm install --no-save <packageName>[@<version>]` inside `$PAPERCLIP_HOME/adapter-plugins` and then loads the package by that name (verified in `server/src/routes/adapters.ts`). Installing requires an instance admin. To update, reinstall (or pin a newer `version`) and run `paperclipai adapter reload copilot_local`.

### Install from a local path (alternative)

The install route looks the package up by its exact name, so a git spec such as `github:bartekrozycki/copilot-paperclip-adapter` is **not** accepted by `POST /api/adapters/install`. Use the local-path route instead. `dist/` is committed, so no build is required on the target machine (`npm install` is still needed for the `@paperclipai/adapter-utils` dependency):

```sh
git clone https://github.com/bartekrozycki/copilot-paperclip-adapter.git
cd copilot-paperclip-adapter && npm install
paperclipai adapter install --payload-json '{"packageName":"/abs/path/to/copilot-paperclip-adapter","isLocalPath":true}'
```

Or in the UI: Settings -> Adapters -> install, enable the local path option and enter the absolute path. Or via HTTP:

```sh
curl -X POST http://localhost:3100/api/adapters/install -H 'content-type: application/json' \
  -d '{"packageName":"/abs/path/to/copilot-paperclip-adapter","isLocalPath":true}'
```

After rebuilding (`npm run build`) run `paperclipai adapter reload copilot_local`.

`npm install github:bartekrozycki/copilot-paperclip-adapter` also works in any directory (the `prepare` script builds it), which is handy for vendoring the package.

## Configuration keys

| Key | Description |
|-----|-------------|
| `command` | CLI executable, default `copilot` |
| `model` | Model id, default `auto` (any id can be typed) |
| `effort` / `reasoningEffort` | `none` ... `max`, forwarded as `--reasoning-effort` |
| `instructionsFilePath` | Markdown file prepended to the prompt |
| `allowAllPaths` | Pass `--allow-all-paths` |
| `disableBuiltinMcps` | Pass `--disable-builtin-mcps` |
| `extraArgs` | Extra CLI args (one per line in the UI, or a string array) |
| `timeoutSec`, `graceSec` | Run timeout / SIGTERM grace |
| `env` | Environment (e.g. `COPILOT_GITHUB_TOKEN`) |
| `cwd`, `promptTemplate` | Standard Paperclip fields |

Runs use `copilot -p <prompt> --output-format json --allow-all-tools --no-ask-user --no-color`. Sessions are pinned with `--session-id` and resumed with `--resume=<id>` when the cwd matches; a vanished session is retried once fresh.

## Billing

Copilot bills in premium requests (per-model multipliers). Copilot reports the count cumulatively per session; Paperclip records the per-run delta in `resultJson.premiumRequests` and does not price runs in USD.

## Known limitations of the external route

- Hardcoded built-in adapter lists in the host exclude external types: git-workspace validation, orphan-run recovery, conversation continuation, agent identity, AI connections, and the thinking-effort control in the agent form.
- Config UI is declarative only (text/select/toggle/number/textarea/combobox); no secret fields. Use `env` bindings for tokens.
- The transcript parser is sandboxed, synchronous, CJS-only; the first render shows raw lines.
- No CLI run-log formatter (the `process` formatter is used).
- If the package fails to load the host silently falls back to the `process` adapter.
- Host Stop works through `ctx.signal` / `onCancellationReady`; this adapter implements both, but it needs a host recent enough to pass them.
- Built against published `@paperclipai/adapter-utils@2026.1005.0`, which lacks a few helpers; local shims (`src/server/shims.ts`, session-management table in `src/index.ts`) replace them. Feedback-skill auto-selection from newer hosts is not replicated.

## Development

```sh
npm install && npm run typecheck && npm test && npm run build
```

`dist/` is committed; CI fails if it is stale. MIT licensed.
