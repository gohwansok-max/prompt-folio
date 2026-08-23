import { PROVIDERS } from "@/features/harness-generator/constants";
import type { DetailLevel, ProviderId } from "@/features/harness-generator/types";
import { normalizeTags } from "@/features/tag-system/lib";
import type { SavedEntry } from "./types";

export const LIBRARY_KEY = "prompt-folio-library-v1";

export function readLibrary(): SavedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(LIBRARY_KEY) || "[]");
    return Array.isArray(value) ? value.map((item) => ({ ...item, tags: Array.isArray(item.tags) ? item.tags.filter((tag: unknown) => typeof tag === "string") : [] })) : [];
  } catch { return []; }
}

export function isDetailLevel(value: unknown): value is DetailLevel { return value === "compact" || value === "balanced" || value === "detailed"; }
export function isProviderId(value: unknown): value is ProviderId { return typeof value === "string" && PROVIDERS.some((provider) => provider.id === value); }

export function normalizeEntry(value: unknown): SavedEntry | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<SavedEntry>;
  if (typeof item.name !== "string" || typeof item.title !== "string" || typeof item.notes !== "string" || (item.kind !== "profile" && item.kind !== "prompt")) return null;
  return { id: typeof item.id === "string" ? item.id : `${Date.now()}-${Math.random()}`, name: item.name.trim(), kind: item.kind, title: item.title, notes: item.notes, detail: isDetailLevel(item.detail) ? item.detail : "compact", selected: Array.isArray(item.selected) ? item.selected.filter(isProviderId) : [], tags: Array.isArray(item.tags) ? normalizeTags(item.tags.filter((tag): tag is string => typeof tag === "string").join(",")) : [], savedAt: typeof item.savedAt === "string" ? item.savedAt : new Date().toISOString() };
}
