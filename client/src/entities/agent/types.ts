import type { PlatformId } from "@/entities/harness/types";

// V2 entity — introduced in Phase 2 (data layer migration). Not yet used by any screen;
// Agent Builder (Phase 3) is the first feature that will read/write these records.
export type AgentNote = { id: string; text: string; updatedAt: string };

export type AgentRecord = {
  id: string;
  name: string;
  role: string;
  goal: string;
  tone?: string;
  skillIds: string[];
  ruleIds: string[];
  contextIds: string[];
  targetPlatforms: PlatformId[];
  notes: AgentNote[];
  tags: string[];
  /** "draft" = created by v1→v2 migration and not yet reviewed by the user. */
  status: "draft" | "confirmed";
  /** id of the prompt-folio-library-v1 SavedEntry this record was migrated from, if any. */
  legacySourceId?: string;
  schemaVersion: 2;
  createdAt: string;
  updatedAt: string;
};
