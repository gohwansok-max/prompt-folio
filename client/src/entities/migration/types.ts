export type MigrationLog = {
  completedAt: string;
  migratedAgents: number;
  migratedSkills: number;
  failedEntries: string[];
};
