import { readRules, writeRules } from "@/entities/rule/storage";
import type { RuleRecord } from "@/entities/rule/types";

export type RuleForm = { name: string; statement: string; category: RuleRecord["category"] };

export const RULE_CATEGORIES: { id: RuleRecord["category"]; label: string }[] = [
  { id: "safety", label: "안전" },
  { id: "tone", label: "톤" },
  { id: "format", label: "형식" },
  { id: "compliance", label: "규정 준수" },
  { id: "custom", label: "기타" },
];

export function emptyRuleForm(): RuleForm {
  return { name: "", statement: "", category: "custom" };
}

export function ruleToForm(rule: RuleRecord): RuleForm {
  return { name: rule.name, statement: rule.statement, category: rule.category };
}

export function isRuleFormComplete(form: RuleForm) {
  return Boolean(form.name.trim() && form.statement.trim());
}

/** New rules are always created global -- per-agent scoped rules aren't creatable from
 * any screen yet, so there is nothing meaningful to offer here beyond preserving an
 * existing record's scope when editing it. */
export function buildRuleRecord(form: RuleForm, existing: RuleRecord | null): RuleRecord {
  const base = { name: form.name.trim(), statement: form.statement.trim(), category: form.category };
  if (existing) return { ...existing, ...base };
  return { id: `rule-${Date.now()}`, ...base, scope: "global" as const, schemaVersion: 2 as const };
}

export function upsertRule(record: RuleRecord) {
  const list = readRules();
  const index = list.findIndex((item) => item.id === record.id);
  const next = index >= 0 ? list.map((item, i) => (i === index ? record : item)) : [record, ...list];
  writeRules(next);
  return next;
}

export function deleteRule(id: string) {
  writeRules(readRules().filter((item) => item.id !== id));
}
