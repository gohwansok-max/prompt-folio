import type { ContextRecord } from "./types";

export const CONTEXT_KEY = "harness-studio-contexts-v2";

export function readContexts(): ContextRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(CONTEXT_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is ContextRecord => Boolean(item && typeof item.id === "string" && typeof item.name === "string")) : [];
  } catch { return []; }
}

export function writeContexts(next: ContextRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONTEXT_KEY, JSON.stringify(next));
}
