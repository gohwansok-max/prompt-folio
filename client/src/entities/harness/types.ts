// V2 entity — introduced in Phase 2 (data layer migration). Not yet used by any screen.
export type PlatformId = "claude-code" | "codex" | "gemini-cli" | string;

export type HarnessFile = { filename: string; content: string };

export type HarnessRecord = {
  id: string;
  agentId: string;
  platform: PlatformId;
  files: HarnessFile[];
  generatedAt: string;
  version: number;
};
