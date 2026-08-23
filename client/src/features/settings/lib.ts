import { readAgents, writeAgents } from "@/entities/agent/storage";
import type { AgentRecord } from "@/entities/agent/types";
import { readContexts, writeContexts } from "@/entities/context/storage";
import type { ContextRecord } from "@/entities/context/types";
import { readHarnesses, writeHarnesses } from "@/entities/harness/storage";
import type { HarnessRecord } from "@/entities/harness/types";
import { readRules, writeRules } from "@/entities/rule/storage";
import type { RuleRecord } from "@/entities/rule/types";
import { readSkills, writeSkills } from "@/entities/skill/storage";
import type { SkillRecord } from "@/entities/skill/types";
import { downloadText } from "@/shared/lib/dom";

export type HarnessStudioBackup = {
  schema: 1;
  exportedAt: string;
  agents: AgentRecord[];
  skills: SkillRecord[];
  rules: RuleRecord[];
  contexts: ContextRecord[];
  harnesses: HarnessRecord[];
};

export function exportHarnessStudioBackup() {
  const payload: HarnessStudioBackup = {
    schema: 1,
    exportedAt: new Date().toISOString(),
    agents: readAgents(),
    skills: readSkills(),
    rules: readRules(),
    contexts: readContexts(),
    harnesses: readHarnesses(),
  };
  downloadText(`harness-studio-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2));
  return payload;
}

function isBackupShape(value: unknown): value is HarnessStudioBackup {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<HarnessStudioBackup>;
  return item.schema === 1 && Array.isArray(item.agents) && Array.isArray(item.skills) && Array.isArray(item.rules) && Array.isArray(item.contexts) && Array.isArray(item.harnesses);
}

export async function parseBackupFile(file: File): Promise<HarnessStudioBackup> {
  const payload = JSON.parse(await file.text());
  if (!isBackupShape(payload)) throw new Error("Harness Studio 백업 파일 형식이 아닙니다.");
  return payload;
}

function mergeById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const merged = new Map(existing.map((item) => [item.id, item]));
  incoming.forEach((item) => merged.set(item.id, item));
  return Array.from(merged.values());
}

export function applyBackup(payload: HarnessStudioBackup, mode: "merge" | "replace") {
  if (mode === "replace") {
    writeAgents(payload.agents);
    writeSkills(payload.skills);
    writeRules(payload.rules);
    writeContexts(payload.contexts);
    writeHarnesses(payload.harnesses);
    return;
  }
  writeAgents(mergeById(readAgents(), payload.agents));
  writeSkills(mergeById(readSkills(), payload.skills));
  writeRules(mergeById(readRules(), payload.rules));
  writeContexts(mergeById(readContexts(), payload.contexts));
  writeHarnesses(mergeById(readHarnesses(), payload.harnesses));
}

export function clearAgents() { writeAgents([]); }
export function clearSkills() { writeSkills([]); }
export function clearRules() { writeRules([]); }
export function clearContexts() { writeContexts([]); }
export function clearHarnesses() { writeHarnesses([]); }
