import type { SavedEntry } from "@/features/library/types";
import type { AgentNote, AgentRecord } from "./types";

/**
 * Converts a v1 "profile" SavedEntry into a draft AgentRecord.
 * ProviderId (chat assistants: claude/chatgpt/gemini/...) has no clean mapping onto
 * PlatformId (dev harnesses: claude-code/codex/gemini-cli), so targetPlatforms is left
 * empty for the user to choose when they review the draft.
 */
export function migrateLibraryEntryToAgent(entry: SavedEntry): AgentRecord {
  const note: AgentNote = { id: `${entry.id}-note`, text: entry.notes, updatedAt: entry.savedAt };
  return {
    id: `agent-${entry.id}`,
    name: entry.name,
    role: entry.title || entry.name,
    goal: "",
    skillIds: [],
    ruleIds: [],
    contextIds: [],
    targetPlatforms: [],
    notes: entry.notes.trim() ? [note] : [],
    tags: entry.tags,
    status: "draft",
    legacySourceId: entry.id,
    schemaVersion: 2,
    createdAt: entry.savedAt,
    updatedAt: entry.savedAt,
  };
}
