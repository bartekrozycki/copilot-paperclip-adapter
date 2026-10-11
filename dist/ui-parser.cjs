"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/ui-parser.ts
var ui_parser_exports = {};
__export(ui_parser_exports, {
  parseCopilotStdoutLine: () => parseCopilotStdoutLine,
  parseStdoutLine: () => parseStdoutLine,
  summarizeCopilotResult: () => summarizeCopilotResult
});
module.exports = __toCommonJS(ui_parser_exports);
function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
function asRecord(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return value;
}
function asString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}
function asNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function stringifyUnknown(value) {
  if (typeof value === "string") return value;
  if (value === null || value === void 0) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
function formatPremiumRequests(value) {
  return String(Math.round(value * 100) / 100);
}
function summarizeCopilotResult(parsed) {
  const usage = asRecord(parsed.usage) ?? {};
  const parts = [];
  const premium = asNumber(usage.premiumRequests);
  if (premium !== null) parts.push(`${formatPremiumRequests(premium)} premium requests (session total)`);
  const changes = asRecord(usage.codeChanges);
  if (changes) {
    const added = asNumber(changes.linesAdded) ?? 0;
    const removed = asNumber(changes.linesRemoved) ?? 0;
    const files = Array.isArray(changes.filesModified) ? changes.filesModified.length : 0;
    parts.push(`+${added}/-${removed} lines in ${files} file${files === 1 ? "" : "s"}`);
  }
  return parts.length > 0 ? parts.join(", ") : "Copilot run finished";
}
function parseCopilotStdoutLine(line, ts) {
  const parsed = asRecord(safeJsonParse(line));
  if (!parsed) {
    return [{ kind: "stdout", ts, text: line }];
  }
  const type = asString(parsed.type).trim();
  if (type === "result") {
    const exitCode = asNumber(parsed.exitCode) ?? 0;
    const text = `result: ${summarizeCopilotResult(parsed)}`;
    return exitCode === 0 ? [{ kind: "system", ts, text }] : [{ kind: "stderr", ts, text: `${text} (exit code ${exitCode})` }];
  }
  if (parsed.ephemeral === true) return [];
  const data = asRecord(parsed.data) ?? {};
  switch (type) {
    case "assistant.message": {
      const entries = [];
      const reasoning = asString(data.reasoningText).trim();
      if (reasoning) entries.push({ kind: "thinking", ts, text: reasoning });
      const text = asString(data.content).trim();
      if (text) entries.push({ kind: "assistant", ts, text });
      return entries;
    }
    case "tool.execution_start": {
      const name = asString(data.toolName, "tool").trim() || "tool";
      return [{
        kind: "tool_call",
        ts,
        name,
        input: data.arguments ?? {},
        toolUseId: asString(data.toolCallId).trim() || void 0
      }];
    }
    case "tool.execution_complete": {
      const result = asRecord(data.result);
      const error = asRecord(data.error);
      const content = stringifyUnknown(result?.content) || asString(error?.message) || "";
      return [{
        kind: "tool_result",
        ts,
        toolUseId: asString(data.toolCallId).trim() || "tool_result",
        content,
        isError: data.success === false
      }];
    }
    case "session.error": {
      const text = asString(data.message).trim() || asString(data.errorType).trim() || "Copilot error";
      return [{ kind: "stderr", ts, text }];
    }
    case "session.warning": {
      const text = asString(data.message).trim();
      return text ? [{ kind: "system", ts, text: `warning: ${text}` }] : [];
    }
    default:
      return [];
  }
}
function parseStdoutLine(line, ts) {
  return parseCopilotStdoutLine(line, ts);
}
