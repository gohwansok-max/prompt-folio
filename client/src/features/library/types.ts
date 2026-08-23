import type { DetailLevel, ProviderId } from "@/features/harness-generator/types";

export type SavedEntry = { id: string; name: string; kind: "profile" | "prompt"; title: string; notes: string; detail: DetailLevel; selected: ProviderId[]; tags: string[]; savedAt: string };
export type BackupPayload = { schema: 1; exportedAt: string; library: SavedEntry[]; customTags: string[] };
export type ConflictDecision = "keep-local" | "use-backup" | "merge-tags";
export type BackupConflict = { key: string; local: SavedEntry; incoming: SavedEntry };
export type BackupPreview = { fileName: string; library: SavedEntry[]; customTags: string[]; newCount: number; updateCount: number; sameCount: number; conflicts: BackupConflict[] };
