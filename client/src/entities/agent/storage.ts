import type { AgentRecord } from "./types";

export const AGENT_KEY = "harness-studio-agents-v2";

export function readAgents(): AgentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(AGENT_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is AgentRecord => Boolean(item && typeof item.id === "string" && typeof item.name === "string" && Array.isArray(item.skillIds))) : [];
  } catch { return []; }
}

export function writeAgents(next: AgentRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AGENT_KEY, JSON.stringify(next));
}
