import type { ProviderId } from "@/features/harness-generator/types";
import { TAG_SIGNALS } from "./constants";
import type { ExclusionSettings, TagFeedback } from "./types";

export function normalizeTags(value: string) {
  return Array.from(new Set(value.split(",").map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean))).slice(0, 8);
}

export function extractAiTags(content: string) {
  // Try every flat (non-nested) bracket group in the response, not just the first --
  // a model that mentions "[예시]" before the real array would otherwise match the
  // wrong span, whether greedily (spans past the real array) or lazily (stops short of it).
  const candidates = content.match(/\[[^[\]]*\]/g) || [];
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed) && parsed.every((tag): tag is string => typeof tag === "string")) return normalizeTags(parsed.join(","));
    } catch {
      // not valid JSON -- try the next bracket group
    }
  }
  return [];
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
  // Require at least 3 characters before trusting a saved tag as a substring match --
  // short tags like "AI"/"QC" otherwise collide with unrelated text constantly.
  savedTags.forEach((tag) => { if (tag.length >= 3 && source.includes(tag.toLocaleLowerCase())) scores.set(tag, Math.max(scores.get(tag) || 0, 3)); });
  if (selected.length) scores.set("AI도구", Math.max(scores.get("AI도구") || 0, 1));
  scores.set(kind === "profile" ? "프로필" : "재사용", 1);
  return Array.from(scores.entries()).map(([tag, score]) => [tag, score + ((feedback[tag]?.accepted || 0) * 1.5) - ((feedback[tag]?.rejected || 0) * 2)] as const).filter(([tag, score]) => score > -1 && !isTagExcluded(tag, feedback, settings)).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko")).slice(0, 6).map(([tag]) => tag);
}
