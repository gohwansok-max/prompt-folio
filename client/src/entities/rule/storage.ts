import type { RuleRecord } from "./types";

export const RULE_KEY = "harness-studio-rules-v2";

export function readRules(): RuleRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(RULE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is RuleRecord => Boolean(item && typeof item.id === "string" && typeof item.name === "string")) : [];
  } catch { return []; }
}

export function writeRules(next: RuleRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RULE_KEY, JSON.stringify(next));
}
