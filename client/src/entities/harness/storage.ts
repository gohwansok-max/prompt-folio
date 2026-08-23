import type { HarnessRecord } from "./types";

export const HARNESS_KEY = "harness-studio-harnesses-v2";

export function readHarnesses(): HarnessRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(HARNESS_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is HarnessRecord => Boolean(item && typeof item.id === "string" && typeof item.agentId === "string" && Array.isArray(item.files))) : [];
  } catch { return []; }
}

export function writeHarnesses(next: HarnessRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HARNESS_KEY, JSON.stringify(next));
}
