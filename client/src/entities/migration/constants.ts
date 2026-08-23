/** Set once migration has run; presence alone (any value) means "already migrated". */
export const MIGRATION_STATUS_KEY = "harness-studio-migration-v1-to-v2";
/** One-time snapshot of every v1 key's raw value, taken immediately before the first migration run. */
export const PRE_MIGRATION_BACKUP_KEY = "harness-studio-pre-migration-backup";
