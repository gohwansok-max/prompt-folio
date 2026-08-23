// V2 entity — introduced in Phase 2 (data layer migration). Not yet used by any screen.
export type SkillRecord = {
  id: string;
  name: string;
  description: string;
  trigger: string;
  input: string;
  process: string;
  knowledge: string[];
  outputFormat: string;
  tags: string[];
  /** "draft" = created by v1→v2 migration and not yet reviewed by the user. */
  status: "draft" | "confirmed";
  /** id of the prompt-folio-library-v1 SavedEntry this record was migrated from, if any. */
  legacySourceId?: string;
  schemaVersion: 2;
  createdAt: string;
  updatedAt: string;
};
