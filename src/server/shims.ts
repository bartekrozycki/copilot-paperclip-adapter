/**
 * Local shims for helpers that exist in newer Paperclip builds of
 * @paperclipai/adapter-utils but are missing from the published
 * 2026.1005.0 release this package depends on.
 */
import type { AdapterExecutionContext } from "@paperclipai/adapter-utils";

type AgentRuntimeIdentity = { keyId: string; publicKeyPem: string; privateKeyPem: string };

type NewerContext = AdapterExecutionContext & {
  agentIdentity?: AgentRuntimeIdentity;
  getFreshSessionHandoff?: () => Promise<string | null | undefined> | string | null | undefined;
};

/** Newer hosts pass server-owned agent credentials as `ctx.agentIdentity`. */
export function buildAgentIdentityEnv(ctx: AdapterExecutionContext): Record<string, string> {
  const identity = (ctx as NewerContext).agentIdentity;
  return identity
    ? {
        PAPERCLIP_AGENT_KEY_ID: identity.keyId,
        PAPERCLIP_AGENT_PUBLIC_KEY: identity.publicKeyPem,
        PAPERCLIP_AGENT_PRIVATE_KEY: identity.privateKeyPem,
      }
    : {};
}

/** Copy of adapter-utils `hydrateFreshSessionHandoff` (no-op on older hosts). */
export async function hydrateFreshSessionHandoff(
  ctx: AdapterExecutionContext,
  options: { resumedSession?: boolean } = {},
): Promise<void> {
  const getter = (ctx as NewerContext).getFreshSessionHandoff;
  if (options.resumedSession === true || !getter) return;
  const handoff = await getter();
  if (handoff) ctx.context.paperclipFreshSessionHandoffMarkdown = handoff;
  else delete ctx.context.paperclipFreshSessionHandoffMarkdown;
}
