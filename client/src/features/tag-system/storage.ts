import { CUSTOM_TAGS_KEY, TAG_EXCLUSION_SETTINGS_KEY, TAG_FEEDBACK_HISTORY_KEY, TAG_FEEDBACK_KEY, TAG_GROUPS_KEY, DEFAULT_EXCLUSION_SETTINGS } from "./constants";
import { normalizeTags } from "./lib";
import type { ExclusionSettings, FeedbackEvent, TagFeedback, TagGroup } from "./types";

export function readCustomTags() {
  if (typeof window === "undefined") return [];
  try { return normalizeTags(String(window.localStorage.getItem(CUSTOM_TAGS_KEY) || "")); } catch { return []; }
}

export function readTagGroups(): TagGroup[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(TAG_GROUPS_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is TagGroup => Boolean(item && typeof item.id === "string" && typeof item.name === "string" && Array.isArray(item.tags))).map((item) => ({ ...item, tags: normalizeTags(item.tags.filter((tag): tag is string => typeof tag === "string").join(",")) })).filter((item) => item.name.trim() && item.tags.length) : [];
  } catch { return []; }
}

export function readTagFeedback(): TagFeedback {
  if (typeof window === "undefined") return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(TAG_FEEDBACK_KEY) || "{}");
    return value && typeof value === "object" ? value as TagFeedback : {};
  } catch { return {}; }
}

export function readFeedbackHistory(): FeedbackEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(TAG_FEEDBACK_HISTORY_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is FeedbackEvent => Boolean(item && typeof item.tag === "string" && (item.verdict === "accepted" || item.verdict === "rejected") && typeof item.at === "string")).slice(-500) : [];
  } catch { return []; }
}

export function readExclusionSettings(): ExclusionSettings {
  if (typeof window === "undefined") return DEFAULT_EXCLUSION_SETTINGS;
  try {
    const value = JSON.parse(window.localStorage.getItem(TAG_EXCLUSION_SETTINGS_KEY) || "{}");
    return { minObservations: Math.max(1, Math.min(20, Number(value?.minObservations) || DEFAULT_EXCLUSION_SETTINGS.minObservations)), rejectionRate: Math.max(1, Math.min(100, Number(value?.rejectionRate) || DEFAULT_EXCLUSION_SETTINGS.rejectionRate)) };
  } catch { return DEFAULT_EXCLUSION_SETTINGS; }
}
