import type { PlatformId } from "@/entities/harness/types";

export const PRESET_PLATFORMS: { id: PlatformId; label: string; file: string }[] = [
  { id: "claude-code", label: "Claude Code", file: "CLAUDE.md" },
  { id: "codex", label: "Codex", file: "AGENTS.md" },
  { id: "gemini-cli", label: "Gemini CLI", file: "GEMINI.md" },
];
