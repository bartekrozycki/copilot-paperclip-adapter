import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createServerAdapter } from "./index.js";

describe("createServerAdapter", () => {
  it("returns the full copilot_local module", async () => {
    const adapter = createServerAdapter();
    expect(adapter.type).toBe("copilot_local");
    expect(adapter.supportsLocalAgentJwt).toBe(true);
    expect(adapter.supportsInstructionsBundle).toBe(true);
    expect(adapter.instructionsPathKey).toBe("instructionsFilePath");
    expect(adapter.requiresMaterializedRuntimeSkills).toBe(true);
    expect(adapter.runtimeToolDelivery).toBe("environment");
    expect(adapter.sessionManagement?.supportsSessionResume).toBe(true);
    expect(adapter.getRuntimeCommandSpec?.({})).toMatchObject({ command: "copilot", detectCommand: "copilot" });
    expect(adapter.getRuntimeCommandSpec?.({ command: "/opt/copilot" })?.installCommand).toBeNull();
    const schema = await adapter.getConfigSchema!();
    expect(schema.fields.map((f) => f.key)).toEqual([
      "command", "model", "effort", "instructionsFilePath", "allowAllPaths",
      "disableBuiltinMcps", "extraArgs", "timeoutSec",
    ]);
  });
});

describe("dist/ui-parser.cjs", () => {
  it("is import-free CJS exporting parseStdoutLine", () => {
    const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist", "ui-parser.cjs");
    if (!fs.existsSync(file)) return; // built by `npm run build`
    const src = fs.readFileSync(file, "utf8");
    const module = { exports: {} as Record<string, unknown> };
    new Function("module", "exports", src)(module, module.exports);
    const parse = module.exports.parseStdoutLine as (l: string, ts: string) => Array<{ kind: string }>;
    const out = parse(JSON.stringify({ type: "assistant.message", data: { content: "hi" } }), "t");
    expect(out[0]?.kind).toBe("assistant");
  });
});
