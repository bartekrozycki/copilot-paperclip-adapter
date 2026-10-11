import { build } from "esbuild";
import { readFileSync } from "node:fs";

// Server entry: single ESM file so `paperclipai adapter reload` picks up changes.
await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node24",
  external: ["@paperclipai/adapter-utils", "@paperclipai/adapter-utils/*"],
  sourcemap: false,
  logLevel: "info",
});

// UI parser: CJS, zero imports, evaluated by the host with `new Function`.
await build({
  entryPoints: ["src/ui-parser.ts"],
  outfile: "dist/ui-parser.cjs",
  bundle: true,
  format: "cjs",
  platform: "neutral",
  target: "es2022",
  logLevel: "info",
});

const parser = readFileSync("dist/ui-parser.cjs", "utf8");
if (/\brequire\(/.test(parser)) throw new Error("dist/ui-parser.cjs must not import anything");
