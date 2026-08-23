import type { SkillRecord } from "./types";

export const SKILL_KEY = "harness-studio-skills-v2";

export function readSkills(): SkillRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(SKILL_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is SkillRecord => Boolean(item && typeof item.id === "string" && typeof item.name === "string")) : [];
  } catch { return []; }
}

export function writeSkills(next: SkillRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SKILL_KEY, JSON.stringify(next));
}
