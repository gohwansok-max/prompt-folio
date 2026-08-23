import type { ProviderId } from "@/features/harness-generator/types";
import { TAG_SIGNALS } from "./constants";
import type { ExclusionSettings, TagFeedback } from "./types";

export function normalizeTags(value: string) {
  return Array.from(new Set(value.split(",").map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean))).slice(0, 8);
}

export function extractAiTags(content: string) {
  const match = content.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try { const parsed = JSON.parse(match[0]); return Array.isArray(parsed) ? normalizeTags(parsed.filter((tag): tag is string => typeof tag === "string").join(",")) : []; } catch { return []; }
}

export function isTagExcluded(tag: string, feedback: TagFeedback, settings: ExclusionSettings) {
  const value = feedback[tag];
  const total = (value?.accepted || 0) + (value?.rejected || 0);
  return total >= settings.minObservations && total > 0 && (((value?.rejected || 0) / total) * 100) >= settings.rejectionRate;
}

export function recommendTags(title: string, notes: string, selected: ProviderId[], savedTags: string[], kind: "profile" | "prompt", feedback: TagFeedback, settings: ExclusionSettings) {
  const source = `${title} ${notes}`.toLocaleLowerCase();
  const scores = new Map<string, number>();
  TAG_SIGNALS.forEach(({ tag, terms }) => {
    const score = terms.reduce((sum, term) => sum + (source.includes(term) ? 2 : 0), 0);
    if (score) scores.set(tag, score);
  });
  savedTags.forEach((tag) => { if (source.includes(tag.toLocaleLowerCase())) scores.set(tag, Math.max(scores.get(tag) || 0, 3)); });
  if (selected.length) scores.set("AI도구", Math.max(scores.get("AI도구") || 0, 1));
  scores.set(kind === "profile" ? "프로필" : "재사용", 1);
  return Array.from(scores.entries()).map(([tag, score]) => [tag, score + ((feedback[tag]?.accepted || 0) * 1.5) - ((feedback[tag]?.rejected || 0) * 2)] as const).filter(([tag, score]) => score > -1 && !isTagExcluded(tag, feedback, settings)).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko")).slice(0, 6).map(([tag]) => tag);
}
