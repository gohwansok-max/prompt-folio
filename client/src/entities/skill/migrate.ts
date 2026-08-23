import type { SavedEntry } from "@/features/library/types";
import type { SkillRecord } from "./types";

/**
 * Converts a v1 "prompt" SavedEntry into a draft SkillRecord. The saved prompt text maps
 * onto `process` (what the skill does); trigger/input/outputFormat are left blank for the
 * user to fill in when they review the draft.
 */
export function migrateLibraryEntryToSkill(entry: SavedEntry): SkillRecord {
  return {
    id: `skill-${entry.id}`,
    name: entry.name,
    description: entry.title || entry.name,
    trigger: "",
    input: "",
    process: entry.notes,
    knowledge: [],
    outputFormat: "",
    tags: entry.tags,
    status: "draft",
    legacySourceId: entry.id,
    schemaVersion: 2,
    createdAt: entry.savedAt,
    updatedAt: entry.savedAt,
  };
}
