import type { ServerAdapterModule } from "@paperclipai/adapter-utils";
import { buildSandboxNpmInstallCommand } from "@paperclipai/adapter-utils";
import {
  type,
  label,
  models,
  agentConfigurationDoc,
  COPILOT_REASONING_EFFORTS,
  DEFAULT_COPILOT_LOCAL_MODEL,
} from "./constants.js";
import {
  execute,
  listCopilotSkills,
  syncCopilotSkills,
  testEnvironment,
  sessionCodec,
} from "./server/index.js";

export * from "./constants.js";

function readConfiguredCommand(config: Record<string, unknown>, fallback: string): string {
  const raw = config.command;
  return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : fallback;
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

/** Local equivalent of the server's buildNpmRuntimeCommandSpec. */
function getRuntimeCommandSpec(config: Record<string, unknown>) {
  const fallbackCommand = "copilot";
  const command = readConfiguredCommand(config, fallbackCommand);
  const canSelfInstall = !/[\\/]/.test(command) && command === fallbackCommand;
  return {
    command,
    detectCommand: command,
    installCommand: canSelfInstall
      ? `if ! command -v ${shellQuote(command)} >/dev/null 2>&1; then ${buildSandboxNpmInstallCommand("@github/copilot")}; fi`
      : null,
  };
}

export function createServerAdapter(): ServerAdapterModule & { label: string; supportsToolRefreshOnResume?: boolean } {
  return {
    type,
    label,
    execute,
    testEnvironment,
    sessionCodec,
    // Shim: the published adapter-utils has no copilot_local entry in its
    // session-management table; mirror what newer builds produce.
    sessionManagement: {
      supportsSessionResume: true,
      nativeContextManagement: "unknown",
      defaultSessionCompaction: {
        enabled: true,
        maxSessionRuns: 200,
        maxRawInputTokens: 2_000_000,
        maxSessionAgeHours: 72,
      },
    },
    supportsToolRefreshOnResume: true,
    runtimeToolDelivery: "environment",
    models,
    listSkills: listCopilotSkills,
    syncSkills: syncCopilotSkills,
    supportsLocalAgentJwt: true,
    supportsInstructionsBundle: true,
    instructionsPathKey: "instructionsFilePath",
    requiresMaterializedRuntimeSkills: true,
    getRuntimeCommandSpec,
    agentConfigurationDoc,
    getConfigSchema: () => ({
      fields: [
        {
          key: "command",
          label: "Command",
          type: "text",
          default: "copilot",
          hint: "GitHub Copilot CLI executable (npm i -g @github/copilot).",
        },
        {
          key: "model",
          label: "Model",
          type: "combobox",
          default: DEFAULT_COPILOT_LOCAL_MODEL,
          options: models.map((m) => ({ value: m.id, label: m.label })),
          hint: "Copilot model id. 'auto' lets Copilot choose. Available models depend on your entitlement.",
        },
        {
          key: "effort",
          label: "Reasoning effort",
          type: "select",
          default: "",
          options: [
            { value: "", label: "Model default" },
            ...COPILOT_REASONING_EFFORTS.map((e) => ({ value: e, label: e })),
          ],
          hint: "Forwarded as --reasoning-effort. Support varies by model.",
        },
        {
          key: "instructionsFilePath",
          label: "Instructions file",
          type: "text",
          hint: "Absolute path to a markdown file prepended to the run prompt.",
        },
        {
          key: "allowAllPaths",
          label: "Allow all paths",
          type: "toggle",
          default: false,
          hint: "Pass --allow-all-paths so Copilot may touch files outside the working directory.",
        },
        {
          key: "disableBuiltinMcps",
          label: "Disable built-in MCPs",
          type: "toggle",
          default: false,
          hint: "Pass --disable-builtin-mcps to turn off the built-in GitHub MCP server.",
        },
        {
          key: "extraArgs",
          label: "Extra args",
          type: "textarea",
          hint: "Additional CLI arguments, one per line, appended before the prompt.",
        },
        {
          key: "timeoutSec",
          label: "Timeout (seconds)",
          type: "number",
          default: 0,
          hint: "0 = no timeout.",
        },
      ],
    }),
  };
}

export default createServerAdapter;
