# Changelog

## 0.1.0 (Unreleased, first npm publish)

- Initial release of the `copilot_local` external adapter for Paperclip, ported from the in-tree adapter (upstream PR paperclipai/paperclip#15881).
- Single-file ESM server bundle (`dist/index.js`) and import-free CJS transcript parser (`dist/ui-parser.cjs`).
- Declarative config schema (`getConfigSchema`) for the schema-driven agent form.
- Host Stop support: honours `ctx.signal` and calls `ctx.onCancellationReady()`.
- Local shims for helpers missing from the published `@paperclipai/adapter-utils@2026.1005.0`.
