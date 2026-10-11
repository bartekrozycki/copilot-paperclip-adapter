// src/index.ts
import { buildSandboxNpmInstallCommand as buildSandboxNpmInstallCommand2 } from "@paperclipai/adapter-utils";

// src/constants.ts
import { buildSandboxNpmInstallCommand } from "@paperclipai/adapter-utils";
var type = "copilot_local";
var label = "GitHub Copilot CLI";
var SANDBOX_INSTALL_COMMAND = buildSandboxNpmInstallCommand("@github/copilot");
var DEFAULT_COPILOT_LOCAL_MODEL = "auto";
var models = [
  { id: DEFAULT_COPILOT_LOCAL_MODEL, label: "Auto" },
  { id: "gpt-5.6-terra", label: "GPT-5.6 Terra" },
  { id: "gpt-5.6-luna", label: "GPT-5.6 Luna" },
  { id: "gpt-6-luna", label: "GPT-6 Luna" },
  { id: "gpt-5.5", label: "GPT-5.5" },
  { id: "gpt-5.4", label: "GPT-5.4" },
  { id: "gpt-5.4-mini", label: "GPT-5.4 mini" },
  { id: "gpt-5.3-codex", label: "GPT-5.3-Codex" },
  { id: "gpt-5-mini", label: "GPT-5 mini" },
  { id: "claude-opus-4.8", label: "Claude Opus 4.8" },
  { id: "claude-sonnet-5.5", label: "Claude Sonnet 5.5" },
  { id: "claude-sonnet-5", label: "Claude Sonnet 5" },
  { id: "claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
  { id: "claude-haiku-4.5", label: "Claude Haiku 4.5" },
  { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash" },
  { id: "gemini-3.7-flash", label: "Gemini 3.7 Flash" },
  { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash" },
  { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
  { id: "grok-4.7", label: "Grok 4.7" },
  { id: "grok-4.6", label: "Grok 4.6" },
  { id: "grok-4.5", label: "Grok 4.5" },
  { id: "kimi-k3", label: "Kimi K3" },
  { id: "kimi-k2.7-code", label: "Kimi K2.7 Code" },
  { id: "mai-code-1.1-flash", label: "MAI-Code-1.1-Flash" }
];
var COPILOT_REASONING_EFFORTS = [
  "none",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
];
function resolveCopilotReasoningEffort(effort) {
  if (typeof effort !== "string") return null;
  const normalized = effort.trim().toLowerCase();
  return COPILOT_REASONING_EFFORTS.includes(normalized) ? normalized : null;
}
var agentConfigurationDoc = `# copilot_local agent configuration

Adapter: copilot_local

Use when:
- You want Paperclip to run the GitHub Copilot CLI (copilot) locally on the host machine
- You want Copilot sessions resumed across heartbeats with --resume
- You want Paperclip skills made available to Copilot without polluting the agent workspace

Don't use when:
- You need webhook-style external invocation (use http or openclaw_gateway)
- You only need a one-shot script without an AI coding agent loop (use process)
- The GitHub Copilot CLI is not installed on the machine that runs Paperclip

Core fields:
- cwd (string, optional): default absolute working directory fallback for the agent process (created if missing when possible)
- instructionsFilePath (string, optional): absolute path to a markdown instructions file prepended to the run prompt. Its directory is made readable via --add-dir so sibling files (HEARTBEAT.md, SOUL.md, TOOLS.md) can be opened.
- promptTemplate (string, optional): run prompt template
- model (string, optional): Copilot model id (for example gpt-5.4, claude-sonnet-5.5). Defaults to "auto", which lets Copilot choose. Available models depend on your Copilot entitlement.
- effort (string, optional; alias reasoningEffort): reasoning effort (none | minimal | low | medium | high | xhigh | max), forwarded as --reasoning-effort. Support varies by model; omit to use the model default.
- command (string, optional): defaults to "copilot"
- extraArgs (string[], optional): additional CLI args appended before the prompt
- env (object, optional): KEY=VALUE environment variables. Use COPILOT_GITHUB_TOKEN for credentials.

Operational fields:
- timeoutSec (number, optional): run timeout in seconds
- graceSec (number, optional): SIGTERM grace period in seconds
- allowAllPaths (boolean, optional): pass --allow-all-paths so Copilot may touch files outside the working directory. Defaults to false.
- disableBuiltinMcps (boolean, optional): pass --disable-builtin-mcps to turn off the built-in GitHub MCP server. Defaults to false.

Notes:
- Runs use \`copilot -p <prompt> --output-format json --allow-all-tools --no-ask-user --no-color\`; the prompt is passed as an argument, not stdin, and tool use is auto-approved without setting COPILOT_ALLOW_ALL.
- The adapter forces CI=1, NO_COLOR=1 and COPILOT_ALLOW_ALL=false (plus GITHUB_COPILOT_PROMPT_MODE_REPO_HOOKS=false and GITHUB_COPILOT_PROMPT_MODE_WORKSPACE_MCP=false) so unattended runs never prompt, never download CLI updates, and never trust the cwd or load repo hooks/workspace MCP. These cannot be overridden via config.env. Do not set COPILOT_AUTO_UPDATE=false or pass --no-auto-update: they pin a stale bundled CLI that rejects newer flags (reported as copilot_cli_outdated).
- Prompts larger than 100 KB are sent on stdin instead of -p to stay under the OS argument-size limit.
- Fresh runs pin a generated UUID with --session-id; later heartbeats resume it with --resume=<id> when the stored session cwd matches the current cwd. If Copilot reports the session no longer exists, the run is retried once with a fresh session.
- Authentication: set COPILOT_GITHUB_TOKEN in the adapter env (fine-grained PAT or OAuth token with Copilot access), or run \`copilot login\` on the host to store an OAuth login in the keychain. GH_TOKEN / GITHUB_TOKEN are not promoted by Paperclip because Paperclip reserves them for git remote access.
- The token is hidden from Copilot output with --secret-env-vars=COPILOT_GITHUB_TOKEN.
- Usage is billed in GitHub premium requests, which Copilot reports cumulatively per session; Paperclip records the per-run delta in resultJson.premiumRequests and does not price runs in USD.
- Desired Paperclip skills are staged in a per-run directory and exposed to Copilot via COPILOT_SKILLS_DIRS (comma-separated; an existing value is kept after ours).
- Personal skills are read from $COPILOT_HOME/skills (default ~/.copilot/skills).
`;

// src/server/execute.ts
import { createProviderStoppedBoundary } from "@paperclipai/adapter-utils/provider-stopped-boundary";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  adapterExecutionTargetIsRemote,
  adapterExecutionTargetRemoteCwd,
  overrideAdapterExecutionTargetRemoteCwd,
  adapterExecutionTargetSessionIdentity,
  adapterExecutionTargetSessionMatches,
  adapterExecutionTargetUsesManagedHome,
  adapterExecutionTargetUsesPaperclipBridge,
  describeAdapterExecutionTarget,
  ensureAdapterExecutionTargetCommandResolvable,
  ensureAdapterExecutionTargetRuntimeCommandInstalled,
  prepareAdapterExecutionTargetRuntime,
  readAdapterExecutionTarget,
  resolveAdapterExecutionTargetTimeoutSec,
  resolveAdapterExecutionTargetCommandForLogs,
  runAdapterExecutionTargetProcess,
  startAdapterExecutionTargetPaperclipBridge
} from "@paperclipai/adapter-utils/execution-target";
import {
  asNumber,
  asString as asString2,
  asStringArray,
  buildPaperclipEnv,
  buildRuntimeToolsEnv,
  buildInvocationEnvForLogs,
  ensureAbsoluteDirectory,
  joinPromptSections,
  ensurePathInEnv,
  refreshPaperclipWorkspaceEnvForExecution,
  isPaperclipSkillSourceMissing,
  readPaperclipRuntimeSkillEntries,
  readPaperclipIssueWorkModeFromContext,
  resolveLegacyPaperclipDesiredSkillNames,
  parseObject as parseObject2,
  renderTemplate,
  selectPaperclipPromptSections,
  selectInitialCommunicationGuidance,
  isPaperclipRecoveryWakePayload,
  DEFAULT_PAPERCLIP_AGENT_PROMPT_TEMPLATE,
  DEFAULT_PAPERCLIP_CONVERSATION_PROMPT_TEMPLATE
} from "@paperclipai/adapter-utils/server-utils";

// src/server/parse.ts
import { asString, parseJson, parseObject } from "@paperclipai/adapter-utils/server-utils";
function toFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function stringifyContent(value) {
  if (typeof value === "string") return value;
  if (value === null || value === void 0) return "";
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}
var FATAL_WARNING_TYPES = /* @__PURE__ */ new Set(["policy_blocked", "compaction_static_context_blocked"]);
function readCopilotWarningType(data) {
  return asString(data.warningType, "").trim() || asString(data.type, "").trim() || asString(data.code, "").trim();
}
function computePremiumRequestsDelta(current, previous) {
  if (current === null) return null;
  if (previous === null || previous < 0 || current < previous) return roundPremium(current);
  return roundPremium(current - previous);
}
function roundPremium(value) {
  return Math.round(value * 1e6) / 1e6;
}
function buildCopilotRunSummary(messages) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    const text = message.content.trim();
    if (text && !message.hasToolRequests) return text;
  }
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const text = messages[i].content.trim();
    if (text) return text;
  }
  return "";
}
function parseCopilotJsonl(stdout) {
  let sessionId = null;
  let errorMessage = null;
  let errorType = null;
  let failed = false;
  let resultExitCode = null;
  let premiumRequests = null;
  let checkpointPremiumRequests = null;
  let codeChanges = null;
  let totalApiDurationMs = null;
  let model = null;
  const messages = [];
  const toolCalls = [];
  const toolResults = [];
  let eventCount = 0;
  let modelCallErrorMessage = null;
  const toolNamesById = /* @__PURE__ */ new Map();
  for (const rawLine of stdout.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const event = parseJson(line);
    if (!event) continue;
    eventCount += 1;
    const type2 = asString(event.type, "").trim();
    if (type2 === "result") {
      sessionId = asString(event.sessionId, "").trim() || sessionId;
      resultExitCode = toFiniteNumber(event.exitCode);
      const usage = parseObject(event.usage);
      premiumRequests = toFiniteNumber(usage.premiumRequests) ?? premiumRequests;
      totalApiDurationMs = toFiniteNumber(usage.totalApiDurationMs);
      if (typeof usage.codeChanges === "object" && usage.codeChanges !== null) {
        const changes = parseObject(usage.codeChanges);
        codeChanges = {
          linesAdded: toFiniteNumber(changes.linesAdded) ?? 0,
          linesRemoved: toFiniteNumber(changes.linesRemoved) ?? 0,
          filesModified: Array.isArray(changes.filesModified) ? changes.filesModified.filter((value) => typeof value === "string") : []
        };
      }
      continue;
    }
    if (event.ephemeral === true) continue;
    const data = parseObject(event.data);
    switch (type2) {
      case "assistant.message": {
        const requests = Array.isArray(data.toolRequests) ? data.toolRequests : [];
        messages.push({
          content: asString(data.content, ""),
          hasToolRequests: requests.length > 0
        });
        model = asString(data.model, "").trim() || model;
        break;
      }
      case "tool.execution_start": {
        const name = asString(data.toolName, "").trim();
        if (!name) break;
        const id = asString(data.toolCallId, "").trim() || null;
        if (id) toolNamesById.set(id, name);
        toolCalls.push({ id, name, arguments: data.arguments ?? {} });
        break;
      }
      case "tool.execution_complete": {
        const id = asString(data.toolCallId, "").trim() || null;
        const result = parseObject(data.result);
        const errorObj = parseObject(data.error);
        const content = stringifyContent(result.content) || asString(errorObj.message, "") || "";
        toolResults.push({
          toolCallId: id,
          toolName: id ? toolNamesById.get(id) ?? null : null,
          success: data.success !== false,
          content
        });
        break;
      }
      case "session.usage_checkpoint": {
        checkpointPremiumRequests = toFiniteNumber(data.totalPremiumRequests) ?? checkpointPremiumRequests;
        break;
      }
      case "session.error": {
        const kind = asString(data.errorType, "").trim();
        if (kind === "model_call") {
          modelCallErrorMessage = asString(data.message, "").trim() || modelCallErrorMessage;
          break;
        }
        failed = true;
        errorType = kind || errorType;
        errorMessage = asString(data.message, "").trim() || kind || "Copilot reported a session error";
        break;
      }
      case "session.warning": {
        const kind = readCopilotWarningType(data);
        if (!FATAL_WARNING_TYPES.has(kind)) break;
        failed = true;
        errorType = kind;
        errorMessage = asString(data.message, "").trim() || kind;
        break;
      }
      default:
        break;
    }
  }
  return {
    sessionId,
    summary: buildCopilotRunSummary(messages),
    toolCalls,
    toolResults,
    model,
    errorMessage,
    errorType,
    failed,
    resultExitCode,
    premiumRequestsCumulative: premiumRequests ?? checkpointPremiumRequests,
    codeChanges,
    totalApiDurationMs,
    eventCount,
    modelCallErrorMessage
  };
}
function extractCopilotRuntimeEvents(line) {
  const event = parseJson(line);
  if (!event || event.ephemeral === true) return [];
  const type2 = asString(event.type, "").trim();
  const data = parseObject(event.data);
  if (type2 === "assistant.message") {
    const content = asString(data.content, "").trim();
    return content ? [{ eventType: "assistant", message: content, payload: { content } }] : [];
  }
  if (type2 === "tool.execution_start") {
    const name = asString(data.toolName, "").trim();
    return name ? [{ eventType: "tool_call", payload: { toolName: name } }] : [];
  }
  return [];
}
function normalizedLines(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}
var SESSION_UNRECOVERABLE_RE = /No\s+session,\s+task,\s+or\s+name\s+matched|session\s+(?:\S+\s+)?not\s+found|cannot\s+resume|failed\s+to\s+resume/i;
function isCopilotSessionUnrecoverableError(stdout, stderr) {
  const parsed = parseCopilotJsonl(stdout);
  const haystack = [stderr, parsed.errorMessage ?? ""].join("\n");
  return normalizedLines(haystack).some((line) => SESSION_UNRECOVERABLE_RE.test(line));
}
function isCopilotTransientNetworkError(stdout, stderr) {
  const parsed = parseCopilotJsonl(stdout);
  return /ENOTFOUND|EAI_AGAIN|ECONNRESET|ECONNREFUSED|ETIMEDOUT|fetch\s+failed|socket\s+hang\s+up/i.test(
    [stderr, parsed.errorMessage ?? ""].join("\n")
  );
}
function describeCopilotFailure(input) {
  const detail = (typeof input.errorMessage === "string" ? input.errorMessage.trim() : "") || normalizedLines(input.stderr ?? "")[0] || "";
  if (!detail) return null;
  const clean = detail.replace(/\s+/g, " ").trim();
  const max = 240;
  return `Copilot run failed: ${clean.length > max ? `${clean.slice(0, max - 1)}\u2026` : clean}`;
}
var COPILOT_AUTH_REQUIRED_RE = /No\s+authentication\s+information\s+found|authentication\s+required|\bunauthorized\b|invalid\s+(?:github\s+)?token|not\s+(?:logged|signed)\s+in|copilot_github_token.*(?:missing|required|not\s+configured)|(?:missing|no)\s+(?:copilot\s+|github\s+)?(?:credential|token|authentication)|\bcopilot\s+login\b/i;
function detectCopilotAuthRequired(input) {
  const parsed = parseCopilotJsonl(input.stdout);
  const stderrLines = normalizedLines(input.stderr);
  const candidates = stderrLines.filter((line, index) => index === 0 || /^Error:/i.test(line));
  if (parsed.failed && parsed.errorMessage) candidates.push(parsed.errorMessage);
  for (const line of input.stdout ? normalizedLines(input.stdout) : []) {
    const event = parseJson(line);
    if (!event || asString(event.type, "") !== "session.error") continue;
    const data = parseObject(event.data);
    const remediation = asString(data.remediation, "").trim();
    if (remediation === "sign_in" || data.statusCode === 401) {
      return { requiresAuth: true };
    }
  }
  return { requiresAuth: candidates.some((line) => COPILOT_AUTH_REQUIRED_RE.test(line)) };
}
function parseCopilotUsageReport(text) {
  if (!text.trim()) return null;
  const root = parseJson(text);
  if (!root) return null;
  let input = 0;
  let output = 0;
  let cacheRead = 0;
  let cacheWrite = 0;
  let sawUsage = false;
  for (const metric of Object.values(parseObject(root.modelMetrics))) {
    const usage = parseObject(parseObject(metric).usage);
    const inTok = toFiniteNumber(usage.inputTokens);
    const outTok = toFiniteNumber(usage.outputTokens);
    if (inTok === null && outTok === null) continue;
    sawUsage = true;
    input += inTok ?? 0;
    output += outTok ?? 0;
    cacheRead += toFiniteNumber(usage.cacheReadTokens) ?? 0;
    cacheWrite += toFiniteNumber(usage.cacheWriteTokens) ?? 0;
  }
  const cost = toFiniteNumber(root.totalPremiumRequestCost);
  return {
    cumulative: sawUsage ? {
      inputTokens: input,
      outputTokens: output,
      cachedInputTokens: cacheRead,
      cacheWriteTokens: cacheWrite,
      totalPremiumRequestCost: cost
    } : null,
    totalPremiumRequestCost: cost,
    currentModel: asString(root.currentModel, "").trim() || null
  };
}
function readCopilotUsageCumulative(value) {
  const rec = parseObject(value);
  const inputTokens = toFiniteNumber(rec.inputTokens);
  const outputTokens = toFiniteNumber(rec.outputTokens);
  if (inputTokens === null || outputTokens === null) return null;
  return {
    inputTokens,
    outputTokens,
    cachedInputTokens: toFiniteNumber(rec.cachedInputTokens) ?? 0,
    cacheWriteTokens: toFiniteNumber(rec.cacheWriteTokens) ?? 0,
    totalPremiumRequestCost: toFiniteNumber(rec.totalPremiumRequestCost)
  };
}
function computeCopilotUsageDelta(current, previous) {
  const d = (cur, prev) => prev === void 0 || cur < prev ? cur : cur - prev;
  const input = d(current.inputTokens, previous?.inputTokens);
  const output = d(current.outputTokens, previous?.outputTokens);
  const cacheRead = d(current.cachedInputTokens, previous?.cachedInputTokens);
  const cacheWrite = d(current.cacheWriteTokens, previous?.cacheWriteTokens);
  const cost = current.totalPremiumRequestCost === null ? null : roundPremium(d(current.totalPremiumRequestCost, previous?.totalPremiumRequestCost ?? void 0));
  return {
    usage: {
      inputTokens: Math.max(0, input - cacheRead),
      outputTokens: output,
      cachedInputTokens: cacheRead,
      ...cacheWrite > 0 ? { cacheWriteTokens: cacheWrite } : {}
    },
    totalPremiumRequestCost: cost
  };
}
function detectCopilotOutdatedCli(stderr) {
  const match = stderr.match(/error:\s*unknown option\s+'?([^'\s]+)'?/i);
  return match ? { flag: match[1] ?? null } : null;
}

// src/server/shims.ts
function buildAgentIdentityEnv(ctx) {
  const identity = ctx.agentIdentity;
  return identity ? {
    PAPERCLIP_AGENT_KEY_ID: identity.keyId,
    PAPERCLIP_AGENT_PUBLIC_KEY: identity.publicKeyPem,
    PAPERCLIP_AGENT_PRIVATE_KEY: identity.privateKeyPem
  } : {};
}
async function hydrateFreshSessionHandoff(ctx, options = {}) {
  const getter = ctx.getFreshSessionHandoff;
  if (options.resumedSession === true || !getter) return;
  const handoff = await getter();
  if (handoff) ctx.context.paperclipFreshSessionHandoffMarkdown = handoff;
  else delete ctx.context.paperclipFreshSessionHandoffMarkdown;
}

// src/server/utils.ts
function firstNonEmptyLine(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? "";
}

// src/server/headless.ts
function buildCopilotHeadlessEnv(env) {
  return {
    ...env,
    CI: "1",
    NO_COLOR: "1",
    COPILOT_ALLOW_ALL: "false",
    GITHUB_COPILOT_PROMPT_MODE_REPO_HOOKS: "false",
    GITHUB_COPILOT_PROMPT_MODE_WORKSPACE_MCP: "false"
  };
}
function buildCopilotBaseArgs(opts) {
  const args = [
    "--output-format",
    "json",
    "--allow-all-tools",
    "--no-ask-user",
    "--no-color",
    "--log-level",
    "warning",
    "--model",
    opts.model
  ];
  if (opts.reasoningEffort) args.push("--reasoning-effort", opts.reasoningEffort);
  if (opts.allowAllPaths) args.push("--allow-all-paths");
  if (opts.disableBuiltinMcps) args.push("--disable-builtin-mcps");
  args.push("--secret-env-vars=COPILOT_GITHUB_TOKEN");
  return args;
}

// src/server/execute.ts
var MAX_PROMPT_ARG_BYTES = 1e5;
var __moduleDir = path.dirname(fileURLToPath(import.meta.url));
function createCopilotEventForwardingLog(onLog, onEvent) {
  if (!onEvent) return { log: onLog, flush: async () => {
  } };
  let buffer = "";
  const emitLine = async (raw) => {
    const line = raw.trim();
    if (!line) return;
    for (const event of extractCopilotRuntimeEvents(line)) {
      await onEvent({ eventType: event.eventType, stream: "stdout", message: event.message, payload: event.payload });
    }
  };
  return {
    log: async (stream, chunk) => {
      await onLog(stream, chunk);
      if (stream !== "stdout") return;
      buffer += chunk;
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        await emitLine(line);
      }
    },
    flush: async () => {
      const remaining = buffer;
      buffer = "";
      await emitLine(remaining);
    }
  };
}
function hasNonEmptyEnvValue(env, key) {
  const raw = env[key];
  return typeof raw === "string" && raw.trim().length > 0;
}
function buildCopilotRuntimeEnv(env) {
  return Object.fromEntries(
    Object.entries(ensurePathInEnv({ ...process.env, ...buildCopilotHeadlessEnv(env) })).filter(
      (entry) => typeof entry[1] === "string"
    )
  );
}
function asBoolean(value) {
  return value === true || value === "true";
}
function renderPaperclipEnvNote(env) {
  const paperclipKeys = Object.keys(env).filter((key) => key.startsWith("PAPERCLIP_")).sort();
  if (paperclipKeys.length === 0) return "";
  return [
    "Paperclip runtime note:",
    `The following PAPERCLIP_* environment variables are available in this run: ${paperclipKeys.join(", ")}`,
    "Do not assume these variables are missing without checking your shell environment.",
    "",
    ""
  ].join("\n");
}
function renderApiAccessNote(env) {
  if (!hasNonEmptyEnvValue(env, "PAPERCLIP_API_URL") || !hasNonEmptyEnvValue(env, "PAPERCLIP_API_KEY")) return "";
  return [
    "Paperclip API access note:",
    "Use shell commands with curl to make Paperclip API requests when needed.",
    "Include X-Paperclip-Run-Id on mutating requests.",
    "",
    ""
  ].join("\n");
}
async function buildCopilotSkillsDir(config) {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "paperclip-copilot-skills-"));
  const target = path.join(tmp, "skills");
  await fs.mkdir(target, { recursive: true });
  const availableEntries = await readPaperclipRuntimeSkillEntries(config, __moduleDir);
  const desiredNames = new Set(resolveLegacyPaperclipDesiredSkillNames(config, availableEntries));
  for (const entry of availableEntries) {
    if (!desiredNames.has(entry.key)) continue;
    if (isPaperclipSkillSourceMissing(entry)) continue;
    await fs.symlink(entry.source, path.join(target, entry.runtimeName));
  }
  return target;
}
function resolveManagedRemoteInstructions(input) {
  const explicitRoot = asString2(input.instructionCopy.executionRoot, "").trim().replace(/\/+$/, "");
  const explicitEntry = asString2(input.instructionCopy.entryFile, "").trim();
  if (explicitRoot && explicitEntry) {
    return { dir: explicitRoot, filePath: path.posix.join(explicitRoot, explicitEntry) };
  }
  const file = input.localInstructionsFilePath.split(path.sep).join("/");
  if (!file) return null;
  const legacy = /\/\.paperclip-runtime\/(instruction-edits-[^/]+)\/instructions\/(.+)$/.exec(file);
  if (legacy && input.remoteCwd) {
    const dir = path.posix.join(input.remoteCwd, ".paperclip-runtime", legacy[1], "instructions");
    return { dir, filePath: path.posix.join(dir, legacy[2]) };
  }
  const directory = /\/file-sync\/runs\/[^/]+\/live\/(.+)$/.exec(file);
  if (directory && input.agentHome) {
    const dir = input.agentHome.replace(/\/+$/, "");
    return { dir, filePath: path.posix.join(dir, directory[1]) };
  }
  return null;
}
async function execute(ctx) {
  const providerStop = createProviderStoppedBoundary(ctx.onProviderStopped);
  const { runId, agent, runtime, config, context, onLog, onMeta, onEvent, authToken } = ctx;
  const hostOnSpawn = ctx.onSpawn;
  const executionTarget = readAdapterExecutionTarget({
    executionTarget: ctx.executionTarget,
    legacyRemoteExecution: ctx.executionTransport?.remoteExecution
  });
  const executionTargetIsRemote = adapterExecutionTargetIsRemote(executionTarget);
  const promptTemplate = asString2(
    config.promptTemplate,
    context.conversationMode === true ? DEFAULT_PAPERCLIP_CONVERSATION_PROMPT_TEMPLATE : DEFAULT_PAPERCLIP_AGENT_PROMPT_TEMPLATE
  );
  const command = asString2(config.command, "copilot");
  const model = asString2(config.model, "").trim() || DEFAULT_COPILOT_LOCAL_MODEL;
  const workspaceContext = parseObject2(context.paperclipWorkspace);
  const workspaceCwd = asString2(workspaceContext.cwd, "");
  const workspaceSource = asString2(workspaceContext.source, "");
  const workspaceId = asString2(workspaceContext.workspaceId, "");
  const workspaceRepoUrl = asString2(workspaceContext.repoUrl, "");
  const workspaceRepoRef = asString2(workspaceContext.repoRef, "");
  const agentHome = asString2(workspaceContext.agentHome, "");
  const workspaceHints = Array.isArray(context.paperclipWorkspaces) ? context.paperclipWorkspaces.filter(
    (value) => typeof value === "object" && value !== null
  ) : [];
  const configuredCwd = asString2(config.cwd, "");
  const useConfiguredInsteadOfAgentHome = workspaceSource === "agent_home" && configuredCwd.length > 0;
  const effectiveWorkspaceCwd = useConfiguredInsteadOfAgentHome ? "" : workspaceCwd;
  const cwd = effectiveWorkspaceCwd || configuredCwd || process.cwd();
  let effectiveExecutionCwd = adapterExecutionTargetRemoteCwd(executionTarget, cwd);
  await ensureAbsoluteDirectory(cwd, { createIfMissing: true });
  const copilotSkillEntries = await readPaperclipRuntimeSkillEntries(config, __moduleDir);
  const desiredCopilotSkillNames = resolveLegacyPaperclipDesiredSkillNames(config, copilotSkillEntries);
  const envConfig = parseObject2(config.env);
  const hasExplicitApiKey = typeof envConfig.PAPERCLIP_API_KEY === "string" && envConfig.PAPERCLIP_API_KEY.trim().length > 0;
  const env = {
    ...buildPaperclipEnv(agent),
    ...buildAgentIdentityEnv(ctx),
    ...buildRuntimeToolsEnv(ctx.runtimeTools)
  };
  env.PAPERCLIP_RUN_ID = runId;
  const wakeTaskId = typeof context.taskId === "string" && context.taskId.trim().length > 0 && context.taskId.trim() || typeof context.issueId === "string" && context.issueId.trim().length > 0 && context.issueId.trim() || null;
  const wakeReason = typeof context.wakeReason === "string" && context.wakeReason.trim().length > 0 ? context.wakeReason.trim() : null;
  const wakeCommentId = typeof context.wakeCommentId === "string" && context.wakeCommentId.trim().length > 0 && context.wakeCommentId.trim() || typeof context.commentId === "string" && context.commentId.trim().length > 0 && context.commentId.trim() || null;
  const approvalId = typeof context.approvalId === "string" && context.approvalId.trim().length > 0 ? context.approvalId.trim() : null;
  const approvalStatus = typeof context.approvalStatus === "string" && context.approvalStatus.trim().length > 0 ? context.approvalStatus.trim() : null;
  const linkedIssueIds = Array.isArray(context.issueIds) ? context.issueIds.filter((value) => typeof value === "string" && value.trim().length > 0) : [];
  const issueWorkMode = readPaperclipIssueWorkModeFromContext(context);
  if (wakeTaskId) env.PAPERCLIP_TASK_ID = wakeTaskId;
  if (issueWorkMode) env.PAPERCLIP_ISSUE_WORK_MODE = issueWorkMode;
  if (wakeReason) env.PAPERCLIP_WAKE_REASON = wakeReason;
  if (wakeCommentId) env.PAPERCLIP_WAKE_COMMENT_ID = wakeCommentId;
  if (approvalId) env.PAPERCLIP_APPROVAL_ID = approvalId;
  if (approvalStatus) env.PAPERCLIP_APPROVAL_STATUS = approvalStatus;
  if (linkedIssueIds.length > 0) env.PAPERCLIP_LINKED_ISSUE_IDS = linkedIssueIds.join(",");
  refreshPaperclipWorkspaceEnvForExecution({
    env,
    envConfig,
    workspaceCwd: effectiveWorkspaceCwd,
    workspaceSource,
    workspaceId,
    workspaceRepoUrl,
    workspaceRepoRef,
    workspaceHints,
    agentHome,
    executionTargetIsRemote,
    executionCwd: effectiveExecutionCwd
  });
  if (!hasExplicitApiKey && authToken) {
    env.PAPERCLIP_API_KEY = authToken;
  }
  const reasoningEffort = resolveCopilotReasoningEffort(config.effort ?? config.reasoningEffort);
  const allowAllPaths = asBoolean(config.allowAllPaths);
  const disableBuiltinMcps = asBoolean(config.disableBuiltinMcps);
  const runtimeEnv = buildCopilotRuntimeEnv(env);
  const timeoutSec = resolveAdapterExecutionTargetTimeoutSec(
    executionTarget,
    asNumber(config.timeoutSec, 0)
  );
  const graceSec = asNumber(config.graceSec, 20);
  const childRef = { pid: null, pgid: null };
  const killChild = (sig) => {
    try {
      if (childRef.pgid && childRef.pgid > 1) process.kill(-childRef.pgid, sig);
      else if (childRef.pid) process.kill(childRef.pid, sig);
    } catch {
    }
  };
  let abortKillTimer = null;
  const onAbort = () => {
    killChild("SIGTERM");
    if (!abortKillTimer) {
      abortKillTimer = setTimeout(() => killChild("SIGKILL"), Math.max(1, graceSec) * 1e3);
      abortKillTimer.unref?.();
    }
  };
  const onSpawn = async (meta) => {
    childRef.pid = meta.pid;
    childRef.pgid = meta.processGroupId;
    if (ctx.signal?.aborted) onAbort();
    await hostOnSpawn?.(meta);
  };
  ctx.signal?.addEventListener("abort", onAbort, { once: true });
  await ctx.onCancellationReady?.();
  await ensureAdapterExecutionTargetRuntimeCommandInstalled({
    runId,
    target: executionTarget,
    installCommand: ctx.runtimeCommandSpec?.installCommand,
    detectCommand: ctx.runtimeCommandSpec?.detectCommand,
    cwd,
    env: runtimeEnv,
    timeoutSec,
    graceSec,
    onLog
  });
  await ensureAdapterExecutionTargetCommandResolvable(command, executionTarget, cwd, runtimeEnv, {
    installCommand: SANDBOX_INSTALL_COMMAND,
    timeoutSec
  });
  const resolvedCommand = await resolveAdapterExecutionTargetCommandForLogs(command, executionTarget, cwd, runtimeEnv);
  const extraArgs = (() => {
    const fromExtraArgs = typeof config.extraArgs === "string" ? config.extraArgs.split(/\r?\n/).map((v) => v.trim()).filter(Boolean) : asStringArray(config.extraArgs);
    if (fromExtraArgs.length > 0) return fromExtraArgs;
    return asStringArray(config.args);
  })();
  let restoreRemoteWorkspace = null;
  let localSkillsDir = null;
  let remoteSkillsDir = null;
  let remoteInstructionsDir = null;
  const usageFiles = [];
  let remoteRuntimeRootDir = null;
  let paperclipBridge = null;
  const localInstructionsFilePath = asString2(config.instructionsFilePath, "").trim();
  const managedRemoteInstructions = executionTargetIsRemote ? resolveManagedRemoteInstructions({
    localInstructionsFilePath,
    remoteCwd: effectiveExecutionCwd,
    agentHome: asString2(parseObject2(context.paperclipWorkspace).agentHome, ""),
    instructionCopy: parseObject2(context.paperclipInstructionCopy)
  }) : null;
  if (executionTargetIsRemote) {
    try {
      localSkillsDir = await buildCopilotSkillsDir(config);
      await onLog(
        "stdout",
        `[paperclip] Syncing workspace and Copilot runtime assets to ${describeAdapterExecutionTarget(executionTarget)}.
`
      );
      const preparedExecutionTargetRuntime = await prepareAdapterExecutionTargetRuntime({
        runId,
        target: executionTarget,
        adapterKey: "copilot",
        timeoutSec,
        workspaceLocalDir: cwd,
        installCommand: SANDBOX_INSTALL_COMMAND,
        detectCommand: command,
        onProgress: (line) => onLog("stdout", line),
        onRuntimeProgress: ctx.onRuntimeProgress,
        assets: [{
          key: "skills",
          localDir: localSkillsDir,
          followSymlinks: true
        }, ...localInstructionsFilePath && !managedRemoteInstructions ? [{ key: "instructions", localDir: path.dirname(localInstructionsFilePath) }] : []]
      });
      restoreRemoteWorkspace = () => preparedExecutionTargetRuntime.restoreWorkspace((line) => onLog("stdout", line));
      effectiveExecutionCwd = preparedExecutionTargetRuntime.workspaceRemoteDir ?? effectiveExecutionCwd;
      refreshPaperclipWorkspaceEnvForExecution({
        env,
        envConfig,
        workspaceCwd: effectiveWorkspaceCwd,
        workspaceSource,
        workspaceId,
        workspaceRepoUrl,
        workspaceRepoRef,
        workspaceHints,
        agentHome,
        executionTargetIsRemote,
        executionCwd: effectiveExecutionCwd
      });
      remoteRuntimeRootDir = preparedExecutionTargetRuntime.runtimeRootDir;
      const managedHome = adapterExecutionTargetUsesManagedHome(executionTarget);
      const managedRemoteHomeDir = managedHome && preparedExecutionTargetRuntime.runtimeRootDir ? preparedExecutionTargetRuntime.runtimeRootDir : null;
      if (managedRemoteHomeDir) {
        env.HOME = managedRemoteHomeDir;
      }
      if (desiredCopilotSkillNames.length > 0 && preparedExecutionTargetRuntime.assetDirs.skills) {
        remoteSkillsDir = preparedExecutionTargetRuntime.assetDirs.skills;
      }
      if (localInstructionsFilePath && !managedRemoteInstructions && preparedExecutionTargetRuntime.assetDirs.instructions) {
        remoteInstructionsDir = preparedExecutionTargetRuntime.assetDirs.instructions;
      }
    } catch (error) {
      await Promise.allSettled([
        restoreRemoteWorkspace?.(),
        localSkillsDir ? fs.rm(path.dirname(localSkillsDir), { recursive: true, force: true }).catch(() => void 0) : Promise.resolve()
      ]);
      throw error;
    }
  }
  try {
    const runtimeExecutionTarget = overrideAdapterExecutionTargetRemoteCwd(executionTarget, effectiveExecutionCwd);
    if (executionTargetIsRemote && adapterExecutionTargetUsesPaperclipBridge(executionTarget)) {
      paperclipBridge = await startAdapterExecutionTargetPaperclipBridge({
        runId,
        target: runtimeExecutionTarget,
        runtimeRootDir: remoteRuntimeRootDir,
        adapterKey: "copilot",
        timeoutSec,
        hostApiToken: env.PAPERCLIP_API_KEY,
        onLog
      });
      if (paperclipBridge) {
        Object.assign(env, paperclipBridge.env);
      }
    }
    if (!executionTargetIsRemote && desiredCopilotSkillNames.length > 0) {
      localSkillsDir = await buildCopilotSkillsDir(config);
      await onLog(
        "stderr",
        `[paperclip] Prepared ${desiredCopilotSkillNames.length} Copilot skill(s) for COPILOT_SKILLS_DIRS delivery.
`
      );
    }
    const runtimeSessionParams = parseObject2(runtime.sessionParams);
    const runtimeSessionId = asString2(runtimeSessionParams.sessionId, runtime.sessionId ?? "");
    const runtimeSessionCwd = asString2(runtimeSessionParams.cwd, "");
    const runtimeRemoteExecution = parseObject2(runtimeSessionParams.remoteExecution);
    const canResumeSession = runtimeSessionId.length > 0 && (runtimeSessionCwd.length === 0 || path.resolve(runtimeSessionCwd) === path.resolve(effectiveExecutionCwd)) && adapterExecutionTargetSessionMatches(runtimeRemoteExecution, runtimeExecutionTarget);
    const sessionId = canResumeSession ? runtimeSessionId : null;
    if (executionTargetIsRemote && runtimeSessionId && !canResumeSession) {
      await onLog(
        "stdout",
        `[paperclip] Copilot session "${runtimeSessionId}" does not match the current remote execution identity and will not be resumed in "${effectiveExecutionCwd}". Starting a fresh remote session.
`
      );
    } else if (runtimeSessionId && !canResumeSession) {
      await onLog(
        "stdout",
        `[paperclip] Copilot session "${runtimeSessionId}" was saved for cwd "${runtimeSessionCwd}" and will not be resumed in "${effectiveExecutionCwd}".
`
      );
    }
    const instructionsFilePath = localInstructionsFilePath;
    const effectiveInstructionsFilePath = !instructionsFilePath ? null : !executionTargetIsRemote ? instructionsFilePath : managedRemoteInstructions ? managedRemoteInstructions.filePath : remoteInstructionsDir ? path.posix.join(remoteInstructionsDir.replace(/\/+$/, ""), path.basename(instructionsFilePath)) : null;
    const effectiveInstructionsDirPath = !instructionsFilePath ? null : !executionTargetIsRemote ? path.dirname(instructionsFilePath) : managedRemoteInstructions ? managedRemoteInstructions.dir : remoteInstructionsDir?.replace(/\/+$/, "") || null;
    const instructionsDir = effectiveInstructionsDirPath ? `${effectiveInstructionsDirPath}/` : "";
    let instructionsPrefix = "";
    if (instructionsFilePath) {
      try {
        const instructionsContents = await fs.readFile(instructionsFilePath, "utf8");
        instructionsPrefix = effectiveInstructionsFilePath ? `${instructionsContents}

The above agent instructions were loaded from ${effectiveInstructionsFilePath}. Resolve any relative file references from ${instructionsDir}. This base directory is authoritative for sibling instruction files such as ./HEARTBEAT.md, ./SOUL.md, and ./TOOLS.md; do not resolve those from the parent agent directory.

` : `${instructionsContents}

`;
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        await onLog(
          "stdout",
          `[paperclip] Warning: could not read agent instructions file "${instructionsFilePath}": ${reason}
`
        );
      }
    }
    const commandNotes = (() => {
      const notes = ["Prompt is passed to Copilot via -p for non-interactive execution."];
      notes.push("Added --output-format json --allow-all-tools --no-ask-user for structured, unattended output.");
      notes.push("Set headless env (CI=1, NO_COLOR=1) so unattended runs skip prompts and never download CLI updates.");
      if (reasoningEffort) notes.push(`Added --reasoning-effort ${reasoningEffort}.`);
      const effectiveSkillsDir = executionTargetIsRemote ? remoteSkillsDir : localSkillsDir;
      if (effectiveSkillsDir) {
        notes.push(`Exposing ${desiredCopilotSkillNames.length} desired skill(s) via COPILOT_SKILLS_DIRS=${effectiveSkillsDir}.`);
      }
      if (effectiveInstructionsDirPath) {
        notes.push(`Added --add-dir ${effectiveInstructionsDirPath} so sibling instruction files are readable.`);
      }
      if (!instructionsFilePath) return notes;
      if (instructionsPrefix.length > 0) {
        notes.push(`Loaded agent instructions from ${instructionsFilePath}`);
        if (effectiveInstructionsDirPath) {
          notes.push(`Prepended instructions + path directive to prompt (relative references from ${instructionsDir}).`);
        } else {
          notes.push("Instructions directory was not staged on the remote target; prepended instructions content without path directive.");
        }
        return notes;
      }
      notes.push(
        `Configured instructionsFilePath ${instructionsFilePath}, but file could not be read; continuing without injected instructions.`
      );
      return notes;
    })();
    const bootstrapPromptTemplate = asString2(config.bootstrapPromptTemplate, "");
    const templateData = {
      agentId: agent.id,
      companyId: agent.companyId,
      runId,
      company: { id: agent.companyId },
      agent,
      run: { id: runId, source: "on_demand" },
      context
    };
    const sessionHandoffNote = asString2(context.paperclipSessionHandoffMarkdown, "").trim();
    const paperclipEnvNote = renderPaperclipEnvNote(env);
    const apiAccessNote = renderApiAccessNote(env);
    const buildArgs = (resumeSessionId, freshSessionId, usageFile, prompt) => {
      const args = buildCopilotBaseArgs({ model, reasoningEffort, allowAllPaths, disableBuiltinMcps });
      if (effectiveInstructionsDirPath) {
        args.push("--add-dir", effectiveInstructionsDirPath);
      }
      if (usageFile) args.push("--usage-output-file", usageFile);
      if (resumeSessionId) args.push(`--resume=${resumeSessionId}`);
      else args.push("--session-id", freshSessionId);
      if (extraArgs.length > 0) args.push(...extraArgs);
      if (prompt !== null) args.push("-p", prompt);
      return args;
    };
    const runAttempt = async (resumeSessionId) => {
      const freshSessionId = randomUUID();
      await hydrateFreshSessionHandoff(ctx, { resumedSession: Boolean(resumeSessionId) });
      const attemptSections = selectPaperclipPromptSections(context, {
        resumedSession: Boolean(resumeSessionId),
        includeCommunicationGuidance: false
      });
      const attemptBootstrapPrompt = !resumeSessionId && bootstrapPromptTemplate.trim().length > 0 ? renderTemplate(bootstrapPromptTemplate, templateData).trim() : "";
      const attemptWakePrompt = attemptSections.wakePrompt;
      const attemptRenderedPrompt = Boolean(resumeSessionId) && attemptWakePrompt.length > 0 || isPaperclipRecoveryWakePayload(context.paperclipWake) ? "" : renderTemplate(promptTemplate, templateData);
      const attemptBasePrompt = joinPromptSections([
        instructionsPrefix,
        attemptBootstrapPrompt,
        attemptWakePrompt,
        attemptSections.taskContextNote,
        sessionHandoffNote,
        paperclipEnvNote,
        apiAccessNote,
        attemptRenderedPrompt
      ]);
      const prompt = joinPromptSections([
        selectInitialCommunicationGuidance(context, { resumedSession: Boolean(resumeSessionId) }),
        attemptBasePrompt
      ]);
      const promptMetrics = {
        promptChars: prompt.length,
        instructionsChars: instructionsPrefix.length,
        bootstrapPromptChars: attemptBootstrapPrompt.length,
        wakePromptChars: attemptWakePrompt.length,
        taskContextChars: attemptSections.taskContextNote.length,
        sessionHandoffChars: sessionHandoffNote.length,
        runtimeNoteChars: paperclipEnvNote.length + apiAccessNote.length,
        heartbeatPromptChars: attemptRenderedPrompt.length
      };
      const usageFile = executionTargetIsRemote ? null : path.join(os.tmpdir(), `paperclip-copilot-usage-${randomUUID()}.json`);
      if (usageFile) usageFiles.push(usageFile);
      const promptViaStdin = Buffer.byteLength(prompt, "utf8") > MAX_PROMPT_ARG_BYTES;
      const args = buildArgs(resumeSessionId, freshSessionId, usageFile, promptViaStdin ? null : prompt);
      const invocationEnv = buildCopilotHeadlessEnv(env);
      const skillsDirForRun = executionTargetIsRemote ? remoteSkillsDir : localSkillsDir;
      if (skillsDirForRun) {
        const inherited = (executionTargetIsRemote ? env.COPILOT_SKILLS_DIRS ?? "" : env.COPILOT_SKILLS_DIRS ?? process.env.COPILOT_SKILLS_DIRS ?? "").trim();
        invocationEnv.COPILOT_SKILLS_DIRS = inherited ? `${skillsDirForRun},${inherited}` : skillsDirForRun;
      }
      const invocationRuntimeEnv = buildCopilotRuntimeEnv(env);
      const loggedEnv = buildInvocationEnvForLogs(invocationEnv, {
        runtimeEnv: invocationRuntimeEnv,
        includeRuntimeKeys: ["HOME"],
        resolvedCommand
      });
      if (onMeta) {
        await onMeta({
          adapterType: "copilot_local",
          command: resolvedCommand,
          cwd: effectiveExecutionCwd,
          commandNotes,
          commandArgs: promptViaStdin ? [...args, `<prompt ${prompt.length} chars via stdin>`] : args.map((value, index) => index === args.length - 1 ? `<prompt ${prompt.length} chars>` : value),
          env: loggedEnv,
          prompt,
          promptMetrics: { ...promptMetrics, promptChars: prompt.length },
          context
        });
      }
      const eventForwarder = createCopilotEventForwardingLog(onLog, onEvent);
      const proc = await runAdapterExecutionTargetProcess(runId, runtimeExecutionTarget, command, args, {
        onProcessStopped: providerStop.beginInvocation(),
        cwd,
        env: invocationEnv,
        ...promptViaStdin ? { stdin: prompt } : {},
        timeoutSec,
        graceSec,
        onSpawn,
        onRuntimeProgress: ctx.onRuntimeProgress,
        onLog: eventForwarder.log,
        runLogTail: paperclipBridge?.runLogTail,
        settleRunDisposition: paperclipBridge?.settleRunDisposition
      });
      await eventForwarder.flush();
      const usageReport = usageFile ? parseCopilotUsageReport(await fs.readFile(usageFile, "utf8").catch(() => "")) : null;
      return {
        proc,
        usageReport,
        parsed: parseCopilotJsonl(proc.stdout),
        resumed: Boolean(resumeSessionId),
        freshSessionId
      };
    };
    const previousPremiumRequests = (() => {
      const raw = runtimeSessionParams.premiumRequestsCumulative;
      return typeof raw === "number" && Number.isFinite(raw) && raw >= 0 ? raw : null;
    })();
    const previousUsageCumulative = readCopilotUsageCumulative(runtimeSessionParams.usageCumulative);
    const toResult = (attempt, clearSessionOnMissingSession = false) => {
      const authMeta = detectCopilotAuthRequired({
        stdout: attempt.proc.stdout,
        stderr: attempt.proc.stderr
      });
      const networkUnavailable = isCopilotTransientNetworkError(attempt.proc.stdout, attempt.proc.stderr);
      const currentCumulative = attempt.usageReport?.cumulative ?? null;
      const previousCumulative = attempt.resumed ? previousUsageCumulative : null;
      const usageDelta = currentCumulative ? computeCopilotUsageDelta(currentCumulative, previousCumulative) : null;
      const billing = {
        // Copilot bills GitHub premium requests, not dollars: leave USD unpriced.
        // Only complete when final usage evidence exists: the usage file was
        // read or the stream carried its trailing `result` line.
        usageComplete: attempt.usageReport !== null || attempt.parsed.resultExitCode !== null,
        costStatus: "unpriced",
        usageBasis: "per_run",
        provider: "github",
        biller: "github",
        model: attempt.usageReport?.currentModel ?? attempt.parsed.model ?? model,
        ...usageDelta ? { usage: usageDelta.usage } : {},
        billingType: "credits",
        costUsd: null
      };
      const timedOut = attempt.proc.timedOut;
      const failed = timedOut || attempt.proc.exitCode === null || attempt.proc.exitCode !== 0 || attempt.parsed.failed || (attempt.parsed.resultExitCode ?? 0) !== 0;
      const resolvedSessionId = attempt.parsed.sessionId ?? (attempt.resumed ? sessionId ?? null : !failed || attempt.parsed.eventCount > 0 ? attempt.freshSessionId : null);
      const previousForAttempt = attempt.resumed ? previousPremiumRequests : null;
      const premiumRequestsCumulative = attempt.parsed.premiumRequestsCumulative;
      const premiumRequests = computePremiumRequestsDelta(premiumRequestsCumulative, previousForAttempt);
      const storedCumulative = premiumRequestsCumulative ?? previousForAttempt;
      const resolvedSessionParams = resolvedSessionId ? {
        sessionId: resolvedSessionId,
        cwd: effectiveExecutionCwd,
        ...workspaceId ? { workspaceId } : {},
        ...workspaceRepoUrl ? { repoUrl: workspaceRepoUrl } : {},
        ...workspaceRepoRef ? { repoRef: workspaceRepoRef } : {},
        ...executionTargetIsRemote ? {
          remoteExecution: adapterExecutionTargetSessionIdentity(runtimeExecutionTarget)
        } : {},
        ...storedCumulative !== null ? { premiumRequestsCumulative: storedCumulative } : {},
        ...currentCumulative ?? previousCumulative ? { usageCumulative: currentCumulative ?? previousCumulative } : {}
      } : null;
      if (timedOut) {
        return {
          exitCode: attempt.proc.exitCode,
          signal: attempt.proc.signal,
          timedOut: true,
          ...billing,
          errorMessage: `Timed out after ${timeoutSec}s`,
          errorCode: authMeta.requiresAuth ? "copilot_auth_required" : networkUnavailable ? "copilot_network_unavailable" : null,
          // Keep the session and its updated cumulative counters so the next
          // resume does not subtract a stale baseline and double count.
          sessionId: resolvedSessionId,
          sessionParams: resolvedSessionParams,
          sessionDisplayId: resolvedSessionId,
          clearSession: Boolean(clearSessionOnMissingSession && !resolvedSessionId)
        };
      }
      const outdatedCli = detectCopilotOutdatedCli(attempt.proc.stderr);
      const parsedError = typeof attempt.parsed.errorMessage === "string" ? attempt.parsed.errorMessage.trim() : "";
      const stderrLine = firstNonEmptyLine(attempt.proc.stderr);
      const structuredFailure = describeCopilotFailure({
        errorMessage: attempt.parsed.errorMessage,
        stderr: attempt.proc.stderr
      });
      const fallbackErrorMessage = parsedError || attempt.parsed.modelCallErrorMessage || structuredFailure || stderrLine || (attempt.proc.signal ? `Copilot was terminated by signal ${attempt.proc.signal}` : `Copilot exited with code ${attempt.proc.exitCode ?? -1}`);
      const errorMessage = outdatedCli ? `Copilot CLI rejected ${outdatedCli.flag ? `option ${outdatedCli.flag}` : "an option"} as unknown: the installed build is older than this adapter expects. This usually happens when COPILOT_AUTO_UPDATE=false or --no-auto-update pins the stale bundled version; remove them (the adapter relies on CI=1 instead) or update the CLI.` : fallbackErrorMessage;
      const resultJson = {
        premiumRequests,
        premiumRequestsCumulative,
        // Per-run delta of the session-cumulative cost; the raw cumulative is alongside.
        ...usageDelta?.totalPremiumRequestCost != null ? {
          totalPremiumRequestCost: usageDelta.totalPremiumRequestCost,
          totalPremiumRequestCostCumulative: currentCumulative?.totalPremiumRequestCost ?? null
        } : {},
        codeChanges: attempt.parsed.codeChanges,
        totalApiDurationMs: attempt.parsed.totalApiDurationMs,
        toolCalls: attempt.parsed.toolCalls,
        toolResults: attempt.parsed.toolResults,
        ...failed ? { stderr: attempt.proc.stderr } : {}
      };
      return {
        exitCode: attempt.proc.exitCode,
        signal: attempt.proc.signal,
        timedOut: false,
        ...billing,
        errorMessage: failed ? errorMessage : null,
        // Forward the transport-level error code from the run-disposition seam
        // first (e.g. `duplex_channel_lost`), then classify auth/network.
        errorCode: attempt.proc.errorCode ? attempt.proc.errorCode : failed && outdatedCli ? "copilot_cli_outdated" : failed && authMeta.requiresAuth ? "copilot_auth_required" : failed && networkUnavailable ? "copilot_network_unavailable" : null,
        sessionId: resolvedSessionId,
        sessionParams: resolvedSessionParams,
        sessionDisplayId: resolvedSessionId,
        resultJson,
        summary: attempt.parsed.summary,
        clearSession: Boolean(clearSessionOnMissingSession && !resolvedSessionId)
      };
    };
    const initial = await runAttempt(sessionId);
    if (sessionId && !initial.proc.timedOut && (initial.proc.exitCode ?? 0) !== 0 && !ctx.signal?.aborted && isCopilotSessionUnrecoverableError(initial.proc.stdout, initial.proc.stderr)) {
      await onLog(
        "stdout",
        `[paperclip] Copilot resume session "${sessionId}" is unavailable; retrying with a fresh session.
`
      );
      const retry = await runAttempt(null);
      return toResult(retry, true);
    }
    return toResult(initial);
  } finally {
    ctx.signal?.removeEventListener("abort", onAbort);
    if (abortKillTimer) clearTimeout(abortKillTimer);
    try {
      await providerStop.collectBeforeRestore();
    } finally {
      await Promise.all([
        ...usageFiles.map((file) => fs.rm(file, { force: true }).catch(() => void 0)),
        paperclipBridge?.stop(),
        restoreRemoteWorkspace?.(),
        localSkillsDir ? fs.rm(path.dirname(localSkillsDir), { recursive: true, force: true }).catch(() => void 0) : Promise.resolve()
      ]);
    }
  }
}

// src/server/skills.ts
import fs2 from "node:fs/promises";
import os2 from "node:os";
import path2 from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
import {
  buildPersistentSkillSnapshot,
  ensurePaperclipSkillSymlink,
  readPaperclipRuntimeSkillEntries as readPaperclipRuntimeSkillEntries2,
  readInstalledSkillTargets,
  resolveLegacyPaperclipDesiredSkillNames as resolveLegacyPaperclipDesiredSkillNames2
} from "@paperclipai/adapter-utils/server-utils";
var __moduleDir2 = path2.dirname(fileURLToPath2(import.meta.url));
function asString3(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function resolveCopilotSkillsHome(config) {
  const env = typeof config.env === "object" && config.env !== null && !Array.isArray(config.env) ? config.env : {};
  const copilotHome = asString3(env.COPILOT_HOME) ?? asString3(process.env.COPILOT_HOME);
  if (copilotHome) return path2.join(path2.resolve(copilotHome), "skills");
  const configuredHome = asString3(env.HOME);
  const home = configuredHome ? path2.resolve(configuredHome) : os2.homedir();
  return path2.join(home, ".copilot", "skills");
}
async function buildCopilotSkillSnapshot(config) {
  const availableEntries = await readPaperclipRuntimeSkillEntries2(config, __moduleDir2);
  const desiredSkills = resolveLegacyPaperclipDesiredSkillNames2(config, availableEntries);
  const skillsHome = resolveCopilotSkillsHome(config);
  const installed = await readInstalledSkillTargets(skillsHome);
  return buildPersistentSkillSnapshot({
    adapterType: "copilot_local",
    availableEntries,
    desiredSkills,
    installed,
    skillsHome,
    locationLabel: "~/.copilot/skills",
    missingDetail: "Configured but not currently linked into the Copilot skills home.",
    externalConflictDetail: "Skill name is occupied by an external installation.",
    externalDetail: "Installed outside Paperclip management."
  });
}
async function listCopilotSkills(ctx) {
  return buildCopilotSkillSnapshot(ctx.config);
}
async function syncCopilotSkills(ctx, desiredSkills) {
  const availableEntries = await readPaperclipRuntimeSkillEntries2(ctx.config, __moduleDir2);
  const desiredSet = /* @__PURE__ */ new Set([
    ...resolveLegacyPaperclipDesiredSkillNames2({}, availableEntries),
    ...desiredSkills
  ]);
  const skillsHome = resolveCopilotSkillsHome(ctx.config);
  await fs2.mkdir(skillsHome, { recursive: true });
  const installed = await readInstalledSkillTargets(skillsHome);
  const availableByRuntimeName = new Map(availableEntries.map((entry) => [entry.runtimeName, entry]));
  for (const available of availableEntries) {
    if (!desiredSet.has(available.key)) continue;
    const target = path2.join(skillsHome, available.runtimeName);
    await ensurePaperclipSkillSymlink(available.source, target);
  }
  for (const [name, installedEntry] of installed.entries()) {
    const available = availableByRuntimeName.get(name);
    if (!available) continue;
    if (desiredSet.has(available.key)) continue;
    if (installedEntry.targetPath !== available.source) continue;
    await fs2.unlink(path2.join(skillsHome, name)).catch(() => {
    });
  }
  return buildCopilotSkillSnapshot(ctx.config);
}

// src/server/test.ts
import fs3 from "node:fs/promises";
import os3 from "node:os";
import path3 from "node:path";
import {
  asNumber as asNumber2,
  asString as asString4,
  asStringArray as asStringArray2,
  ensurePathInEnv as ensurePathInEnv2,
  parseObject as parseObject3
} from "@paperclipai/adapter-utils/server-utils";
import {
  ensureAdapterExecutionTargetCommandResolvable as ensureAdapterExecutionTargetCommandResolvable2,
  maybeRunSandboxInstallCommand,
  ensureAdapterExecutionTargetDirectory,
  runAdapterExecutionTargetProcess as runAdapterExecutionTargetProcess2,
  describeAdapterExecutionTarget as describeAdapterExecutionTarget2,
  resolveAdapterExecutionTargetCwd
} from "@paperclipai/adapter-utils/execution-target";
function summarizeStatus(checks) {
  if (checks.some((check) => check.level === "error")) return "fail";
  if (checks.some((check) => check.level === "warn")) return "warn";
  return "pass";
}
function isNonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function commandLooksLike(command, expected) {
  const base = path3.basename(command).toLowerCase();
  return base === expected || base === `${expected}.cmd` || base === `${expected}.exe`;
}
function summarizeProbeDetail(stdout, stderr, parsedError) {
  const raw = parsedError?.trim() || firstNonEmptyLine(stderr) || firstNonEmptyLine(stdout);
  if (!raw) return null;
  const clean = raw.replace(/\s+/g, " ").trim();
  const max = 240;
  return clean.length > max ? `${clean.slice(0, max - 1)}\u2026` : clean;
}
var CREDENTIAL_ENV_KEYS = ["COPILOT_GITHUB_TOKEN", "GH_TOKEN", "GITHUB_TOKEN"];
function stripJsonComments(text) {
  let out = "";
  let inString = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inString) {
      out += ch;
      if (ch === "\\") {
        out += next ?? "";
        i += 1;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
    } else if (ch === "/" && next === "/") {
      while (i < text.length && text[i] !== "\n") i += 1;
      out += "\n";
    } else if (ch === "/" && next === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i += 1;
      i += 1;
    } else {
      out += ch;
    }
  }
  return out;
}
function copilotConfigHasLoggedInUser(contents) {
  try {
    const parsed = JSON.parse(stripJsonComments(contents));
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return false;
    const user = parsed.lastLoggedInUser;
    if (typeof user === "string") return user.trim().length > 0;
    return typeof user === "object" && user !== null && Object.keys(user).length > 0;
  } catch {
    return false;
  }
}
async function detectLocalCopilotAuth(env) {
  for (const key of CREDENTIAL_ENV_KEYS) {
    if (isNonEmpty(env[key])) return `${key} adapter environment`;
  }
  for (const key of CREDENTIAL_ENV_KEYS) {
    if (isNonEmpty(process.env[key])) return `${key} server environment`;
  }
  const copilotHome = isNonEmpty(env.COPILOT_HOME) && env.COPILOT_HOME.trim() || isNonEmpty(process.env.COPILOT_HOME) && process.env.COPILOT_HOME.trim() || path3.join(os3.homedir(), ".copilot");
  const configPath = path3.join(copilotHome, "config.json");
  try {
    const contents = await fs3.readFile(configPath, "utf8");
    if (copilotConfigHasLoggedInUser(contents)) return `${configPath} (copilot login)`;
  } catch {
  }
  return null;
}
async function testEnvironment(ctx) {
  const checks = [];
  const config = parseObject3(ctx.config);
  const command = asString4(config.command, "copilot");
  const target = ctx.executionTarget ?? null;
  const targetIsRemote = target?.kind === "remote";
  const cwd = resolveAdapterExecutionTargetCwd(target, asString4(config.cwd, ""), process.cwd());
  const targetLabel = targetIsRemote ? ctx.environmentName ?? describeAdapterExecutionTarget2(target) : null;
  const runId = `copilot-envtest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  if (targetLabel) {
    checks.push({
      code: "copilot_environment_target",
      level: "info",
      message: `Probing inside environment: ${targetLabel}`
    });
  }
  try {
    await ensureAdapterExecutionTargetDirectory(runId, target, cwd, {
      cwd,
      env: {},
      createIfMissing: true
    });
    checks.push({
      code: "copilot_cwd_valid",
      level: "info",
      message: `Working directory is valid: ${cwd}`
    });
  } catch (err) {
    checks.push({
      code: "copilot_cwd_invalid",
      level: "error",
      message: err instanceof Error ? err.message : "Invalid working directory",
      detail: cwd
    });
  }
  const envConfig = parseObject3(config.env);
  const env = {};
  for (const [key, value] of Object.entries(envConfig)) {
    if (typeof value === "string") env[key] = value;
  }
  const probeEnv = buildCopilotHeadlessEnv(env);
  const runtimeEnv = ensurePathInEnv2({ ...process.env, ...probeEnv });
  const installCheck = await maybeRunSandboxInstallCommand({
    runId,
    target,
    adapterKey: "copilot",
    installCommand: SANDBOX_INSTALL_COMMAND,
    detectCommand: command,
    env
  });
  if (installCheck) checks.push(installCheck);
  try {
    await ensureAdapterExecutionTargetCommandResolvable2(command, target, cwd, runtimeEnv);
    checks.push({
      code: "copilot_command_resolvable",
      level: "info",
      message: `Command is executable: ${command}`
    });
  } catch (err) {
    checks.push({
      code: "copilot_command_unresolvable",
      level: "error",
      message: err instanceof Error ? err.message : "Command is not executable",
      detail: command
    });
  }
  const canRunProbe = checks.every((check) => check.code !== "copilot_cwd_invalid" && check.code !== "copilot_command_unresolvable");
  if (canRunProbe && commandLooksLike(command, "copilot")) {
    const versionProbe = await runAdapterExecutionTargetProcess2(
      runId,
      target,
      command,
      ["--version"],
      {
        cwd,
        env: probeEnv,
        timeoutSec: 15,
        graceSec: 5,
        onLog: async () => {
        }
      }
    );
    const versionLine = firstNonEmptyLine(versionProbe.stdout) || firstNonEmptyLine(versionProbe.stderr);
    const copilotVersion = versionLine.match(/\d+\.\d+\.\d+[\w.+-]*/)?.[0] ?? null;
    if (!versionProbe.timedOut && (versionProbe.exitCode ?? 1) === 0) {
      checks.push({
        code: "copilot_version_detected",
        level: "info",
        message: `Copilot CLI detected${copilotVersion ? `: ${copilotVersion}` : "."}`,
        ...versionLine ? { detail: versionLine.replace(/\s+/g, " ").trim().slice(0, 120) } : {}
      });
    } else {
      checks.push({
        code: "copilot_version_probe_failed",
        level: "warn",
        message: versionProbe.timedOut ? "`copilot --version` timed out." : "`copilot --version` did not exit cleanly.",
        ...versionLine ? { detail: versionLine } : {}
      });
    }
  }
  const remoteTokenKey = CREDENTIAL_ENV_KEYS.find((key) => isNonEmpty(env[key]));
  const authSource = targetIsRemote ? remoteTokenKey ? `${remoteTokenKey} adapter environment` : null : await detectLocalCopilotAuth(env);
  if (authSource) {
    checks.push({
      code: "copilot_auth_detected",
      level: "info",
      message: "Copilot authentication material detected.",
      detail: `Source: ${authSource}.`
    });
  } else {
    checks.push({
      code: "copilot_auth_missing",
      level: "warn",
      message: "No Copilot authentication detected.",
      hint: "Run `copilot login` on the target host, or set COPILOT_GITHUB_TOKEN in the adapter env."
    });
  }
  if (canRunProbe) {
    if (!commandLooksLike(command, "copilot")) {
      checks.push({
        code: "copilot_hello_probe_skipped_custom_command",
        level: "info",
        message: "Skipped hello probe because command is not `copilot`.",
        detail: command,
        hint: "Use the `copilot` CLI command to run the automatic installation and auth probe."
      });
    } else {
      const model = asString4(config.model, "").trim() || DEFAULT_COPILOT_LOCAL_MODEL;
      const helloProbeTimeoutSec = Math.max(1, asNumber2(config.helloProbeTimeoutSec, 60));
      const extraArgs = (() => {
        const fromExtraArgs = asStringArray2(config.extraArgs);
        if (fromExtraArgs.length > 0) return fromExtraArgs;
        return asStringArray2(config.args);
      })();
      const args = [
        "-p",
        "Reply with OK",
        ...buildCopilotBaseArgs({
          model,
          reasoningEffort: resolveCopilotReasoningEffort(config.effort ?? config.reasoningEffort),
          allowAllPaths: config.allowAllPaths === true || config.allowAllPaths === "true",
          disableBuiltinMcps: config.disableBuiltinMcps === true || config.disableBuiltinMcps === "true"
        })
      ];
      if (extraArgs.length > 0) args.push(...extraArgs);
      const probe = await runAdapterExecutionTargetProcess2(
        runId,
        target,
        command,
        args,
        {
          cwd,
          env: probeEnv,
          timeoutSec: helloProbeTimeoutSec,
          graceSec: 5,
          onLog: async () => {
          }
        }
      );
      const parsed = parseCopilotJsonl(probe.stdout);
      const detail = summarizeProbeDetail(probe.stdout, probe.stderr, parsed.errorMessage);
      const authMeta = detectCopilotAuthRequired({
        stdout: probe.stdout,
        stderr: probe.stderr
      });
      if (probe.timedOut) {
        checks.push({
          code: "copilot_hello_probe_timed_out",
          level: "warn",
          message: "Copilot hello probe timed out.",
          hint: 'Retry the probe. If this persists, verify Copilot can run `copilot -p "Reply with OK" --allow-all-tools` from this directory manually.'
        });
      } else if ((probe.exitCode ?? 1) === 0) {
        const summary = parsed.summary.trim();
        const gotReply = summary.length > 0 && !parsed.failed;
        checks.push({
          code: gotReply ? "copilot_hello_probe_passed" : "copilot_hello_probe_unexpected_output",
          level: gotReply ? "info" : "warn",
          message: gotReply ? "Copilot hello probe succeeded." : "Copilot probe exited cleanly but returned no assistant message.",
          ...summary ? { detail: summary.replace(/\s+/g, " ").trim().slice(0, 240) } : {},
          ...gotReply ? {} : {
            hint: 'Try `copilot -p "Reply with OK" --output-format json --allow-all-tools --no-ask-user` manually to inspect full output.'
          }
        });
      } else if (authMeta.requiresAuth) {
        checks.push({
          code: "copilot_hello_probe_auth_required",
          level: "warn",
          message: "Copilot CLI is installed, but authentication is not ready.",
          ...detail ? { detail } : {},
          hint: "Run `copilot login` or set COPILOT_GITHUB_TOKEN in the adapter env, then retry the probe."
        });
      } else {
        checks.push({
          code: "copilot_hello_probe_failed",
          level: "error",
          message: "Copilot hello probe failed.",
          ...detail ? { detail } : {},
          hint: 'Run `copilot -p "Reply with OK" --output-format json --allow-all-tools --no-ask-user` manually in this working directory to debug.'
        });
      }
    }
  }
  return {
    adapterType: ctx.adapterType,
    status: summarizeStatus(checks),
    checks,
    testedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// src/server/index.ts
function readNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function readFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}
function readRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : null;
}
function normalize(record) {
  const sessionId = readNonEmptyString(record.sessionId) ?? readNonEmptyString(record.session_id) ?? readNonEmptyString(record.sessionID);
  if (!sessionId) return null;
  const cwd = readNonEmptyString(record.cwd) ?? readNonEmptyString(record.workdir) ?? readNonEmptyString(record.folder);
  const workspaceId = readNonEmptyString(record.workspaceId) ?? readNonEmptyString(record.workspace_id);
  const repoUrl = readNonEmptyString(record.repoUrl) ?? readNonEmptyString(record.repo_url);
  const repoRef = readNonEmptyString(record.repoRef) ?? readNonEmptyString(record.repo_ref);
  const remoteExecution = readRecord(record.remoteExecution);
  const premiumRequestsCumulative = readFiniteNumber(record.premiumRequestsCumulative);
  const usageCumulative = readRecord(record.usageCumulative);
  return {
    sessionId,
    ...cwd ? { cwd } : {},
    ...workspaceId ? { workspaceId } : {},
    ...repoUrl ? { repoUrl } : {},
    ...repoRef ? { repoRef } : {},
    ...remoteExecution ? { remoteExecution } : {},
    ...premiumRequestsCumulative !== null ? { premiumRequestsCumulative } : {},
    ...usageCumulative ? { usageCumulative } : {}
  };
}
var sessionCodec = {
  deserialize(raw) {
    const record = readRecord(raw);
    return record ? normalize(record) : null;
  },
  serialize(params) {
    return params ? normalize(params) : null;
  },
  getDisplayId(params) {
    if (!params) return null;
    return readNonEmptyString(params.sessionId) ?? readNonEmptyString(params.session_id) ?? readNonEmptyString(params.sessionID) ?? null;
  }
};

// src/index.ts
function readConfiguredCommand(config, fallback) {
  const raw = config.command;
  return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : fallback;
}
function shellQuote(value) {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}
function getRuntimeCommandSpec(config) {
  const fallbackCommand = "copilot";
  const command = readConfiguredCommand(config, fallbackCommand);
  const canSelfInstall = !/[\\/]/.test(command) && command === fallbackCommand;
  return {
    command,
    detectCommand: command,
    installCommand: canSelfInstall ? `if ! command -v ${shellQuote(command)} >/dev/null 2>&1; then ${buildSandboxNpmInstallCommand2("@github/copilot")}; fi` : null
  };
}
function createServerAdapter() {
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
        maxRawInputTokens: 2e6,
        maxSessionAgeHours: 72
      }
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
          hint: "GitHub Copilot CLI executable (npm i -g @github/copilot)."
        },
        {
          key: "model",
          label: "Model",
          type: "combobox",
          default: DEFAULT_COPILOT_LOCAL_MODEL,
          options: models.map((m) => ({ value: m.id, label: m.label })),
          hint: "Copilot model id. 'auto' lets Copilot choose. Available models depend on your entitlement."
        },
        {
          key: "effort",
          label: "Reasoning effort",
          type: "select",
          default: "",
          options: [
            { value: "", label: "Model default" },
            ...COPILOT_REASONING_EFFORTS.map((e) => ({ value: e, label: e }))
          ],
          hint: "Forwarded as --reasoning-effort. Support varies by model."
        },
        {
          key: "instructionsFilePath",
          label: "Instructions file",
          type: "text",
          hint: "Absolute path to a markdown file prepended to the run prompt."
        },
        {
          key: "allowAllPaths",
          label: "Allow all paths",
          type: "toggle",
          default: false,
          hint: "Pass --allow-all-paths so Copilot may touch files outside the working directory."
        },
        {
          key: "disableBuiltinMcps",
          label: "Disable built-in MCPs",
          type: "toggle",
          default: false,
          hint: "Pass --disable-builtin-mcps to turn off the built-in GitHub MCP server."
        },
        {
          key: "extraArgs",
          label: "Extra args",
          type: "textarea",
          hint: "Additional CLI arguments, one per line, appended before the prompt."
        },
        {
          key: "timeoutSec",
          label: "Timeout (seconds)",
          type: "number",
          default: 0,
          hint: "0 = no timeout."
        }
      ]
    })
  };
}
var index_default = createServerAdapter;
export {
  COPILOT_REASONING_EFFORTS,
  DEFAULT_COPILOT_LOCAL_MODEL,
  SANDBOX_INSTALL_COMMAND,
  agentConfigurationDoc,
  createServerAdapter,
  index_default as default,
  label,
  models,
  resolveCopilotReasoningEffort,
  type
};
