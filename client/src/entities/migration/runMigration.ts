import { migrateLibraryEntryToAgent } from "@/entities/agent/migrate";
import { readAgents, writeAgents } from "@/entities/agent/storage";
import type { AgentRecord } from "@/entities/agent/types";
import { migrateLibraryEntryToSkill } from "@/entities/skill/migrate";
import { readSkills, writeSkills } from "@/entities/skill/storage";
import type { SkillRecord } from "@/entities/skill/types";
import { LIBRARY_KEY, readLibrary } from "@/features/library/storage";
import { ONBOARDING_KEY } from "@/features/onboarding/constants";
import { CHEAPAI_KEY_STORAGE, OPTIMIZATION_HISTORY_KEY, OPTIMIZATION_INTENSITY_KEY } from "@/features/prompt-optimizer/constants";
import { CUSTOM_TAGS_KEY, TAG_EXCLUSION_SETTINGS_KEY, TAG_FEEDBACK_HISTORY_KEY, TAG_FEEDBACK_KEY, TAG_GROUPS_KEY } from "@/features/tag-system/constants";
import { MIGRATION_STATUS_KEY, PRE_MIGRATION_BACKUP_KEY } from "./constants";
import type { MigrationLog } from "./types";

// All 10 v1 localStorage keys, none of which are renamed, moved, or deleted by this
// migration. They keep working exactly as before; this list exists only so the
// pre-migration snapshot can capture every one of them.
const LEGACY_KEYS = [
  LIBRARY_KEY,
  CUSTOM_TAGS_KEY,
  TAG_FEEDBACK_KEY,
  TAG_FEEDBACK_HISTORY_KEY,
  TAG_EXCLUSION_SETTINGS_KEY,
  TAG_GROUPS_KEY,
  CHEAPAI_KEY_STORAGE,
  OPTIMIZATION_INTENSITY_KEY,
  OPTIMIZATION_HISTORY_KEY,
  ONBOARDING_KEY,
];

function hasRun(): boolean {
  return window.localStorage.getItem(MIGRATION_STATUS_KEY) !== null;
}

function snapshotLegacyData() {
  const data: Record<string, string | null> = {};
  LEGACY_KEYS.forEach((key) => { data[key] = window.localStorage.getItem(key); });
  window.localStorage.setItem(PRE_MIGRATION_BACKUP_KEY, JSON.stringify({ takenAt: new Date().toISOString(), data }));
}

/**
 * One-time, idempotent v1 -> v2 migration. Only touches the new "harness-studio-*-v2"
 * keys — every v1 key (LEGACY_KEYS above) is read, never written or removed, so nothing
 * about the current app's behavior changes. Safe to call on every app load: it no-ops
 * once MIGRATION_STATUS_KEY is set.
 */
export function runMigration(): MigrationLog | null {
  if (typeof window === "undefined" || hasRun()) return null;

  snapshotLegacyData();

  const library = readLibrary();
  const existingAgents = readAgents();
  const existingSkills = readSkills();
  const migratedAgentSources = new Set(existingAgents.map((agent) => agent.legacySourceId).filter(Boolean));
  const migratedSkillSources = new Set(existingSkills.map((skill) => skill.legacySourceId).filter(Boolean));

  const newAgents: AgentRecord[] = [];
  const newSkills: SkillRecord[] = [];
  const failedEntries: string[] = [];

  library.forEach((entry) => {
    try {
      if (entry.kind === "profile") {
        if (migratedAgentSources.has(entry.id)) return;
        newAgents.push(migrateLibraryEntryToAgent(entry));
      } else {
        if (migratedSkillSources.has(entry.id)) return;
        newSkills.push(migrateLibraryEntryToSkill(entry));
      }
    } catch {
      failedEntries.push(entry.id);
    }
  });

  if (newAgents.length) writeAgents([...existingAgents, ...newAgents]);
  if (newSkills.length) writeSkills([...existingSkills, ...newSkills]);

  const log: MigrationLog = { completedAt: new Date().toISOString(), migratedAgents: newAgents.length, migratedSkills: newSkills.length, failedEntries };
  window.localStorage.setItem(MIGRATION_STATUS_KEY, JSON.stringify(log));
  return log;
}
