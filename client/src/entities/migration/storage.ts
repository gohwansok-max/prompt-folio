import { MIGRATION_STATUS_KEY } from "./constants";
import type { MigrationLog } from "./types";

export function readMigrationLog(): MigrationLog | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MIGRATION_STATUS_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    return value && typeof value.completedAt === "string" && typeof value.migratedAgents === "number" && typeof value.migratedSkills === "number" ? (value as MigrationLog) : null;
  } catch {
    return null;
  }
}
