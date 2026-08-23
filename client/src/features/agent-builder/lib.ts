import { readAgents, writeAgents } from "@/entities/agent/storage";
import type { AgentRecord } from "@/entities/agent/types";
import type { PlatformId } from "@/entities/harness/types";

export type AgentDraftForm = {
  name: string;
  role: string;
  goal: string;
  tone: string;
  skillIds: string[];
  ruleIds: string[];
  contextIds: string[];
  targetPlatforms: PlatformId[];
};

export function emptyDraft(): AgentDraftForm {
  return { name: "", role: "", goal: "", tone: "", skillIds: [], ruleIds: [], contextIds: [], targetPlatforms: [] };
}

export function agentToForm(agent: AgentRecord): AgentDraftForm {
  return { name: agent.name, role: agent.role, goal: agent.goal, tone: agent.tone || "", skillIds: agent.skillIds, ruleIds: agent.ruleIds, contextIds: agent.contextIds, targetPlatforms: agent.targetPlatforms };
}

export function isDraftComplete(form: AgentDraftForm) {
  return Boolean(form.name.trim() && form.role.trim() && form.goal.trim());
}

/** Builds the record to persist. Saving always sets status "confirmed" -- this is how a
 * migrated draft gets reviewed and promoted, and how a brand-new agent starts out. */
export function buildAgentRecord(form: AgentDraftForm, existing: AgentRecord | null): AgentRecord {
  const now = new Date().toISOString();
  const base = {
    name: form.name.trim(),
    role: form.role.trim(),
    goal: form.goal.trim(),
    tone: form.tone.trim() || undefined,
    skillIds: form.skillIds,
    ruleIds: form.ruleIds,
    contextIds: form.contextIds,
    targetPlatforms: form.targetPlatforms,
  };
  if (existing) return { ...existing, ...base, status: "confirmed" as const, updatedAt: now };
  return { id: `agent-${Date.now()}`, ...base, notes: [], tags: [], status: "confirmed" as const, schemaVersion: 2 as const, createdAt: now, updatedAt: now };
}

export function upsertAgent(record: AgentRecord) {
  const list = readAgents();
  const index = list.findIndex((item) => item.id === record.id);
  const next = index >= 0 ? list.map((item, i) => (i === index ? record : item)) : [record, ...list];
  writeAgents(next);
  return next;
}

export function deleteAgent(id: string) {
  writeAgents(readAgents().filter((item) => item.id !== id));
}
