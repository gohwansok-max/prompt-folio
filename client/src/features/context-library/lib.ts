import { readContexts, writeContexts } from "@/entities/context/storage";
import type { ContextRecord } from "@/entities/context/types";
import { normalizeTags } from "@/features/tag-system/lib";

export type ContextForm = { name: string; body: string; tagInput: string };

export function emptyContextForm(): ContextForm {
  return { name: "", body: "", tagInput: "" };
}

export function contextToForm(context: ContextRecord): ContextForm {
  return { name: context.name, body: context.body, tagInput: context.tags.join(", ") };
}

export function isContextFormComplete(form: ContextForm) {
  return Boolean(form.name.trim() && form.body.trim());
}

export function buildContextRecord(form: ContextForm, existing: ContextRecord | null): ContextRecord {
  const base = { name: form.name.trim(), body: form.body.trim(), tags: normalizeTags(form.tagInput) };
  if (existing) return { ...existing, ...base };
  return { id: `context-${Date.now()}`, ...base, schemaVersion: 2 as const };
}

export function upsertContext(record: ContextRecord) {
  const list = readContexts();
  const index = list.findIndex((item) => item.id === record.id);
  const next = index >= 0 ? list.map((item, i) => (i === index ? record : item)) : [record, ...list];
  writeContexts(next);
  return next;
}

export function deleteContext(id: string) {
  writeContexts(readContexts().filter((item) => item.id !== id));
}
