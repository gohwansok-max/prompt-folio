import { useState } from "react";
import { readRules, writeRules } from "@/entities/rule/storage";
import type { RuleRecord } from "@/entities/rule/types";
import EntityPicker from "../EntityPicker";

export default function RuleStep({ selectedIds, onChange }: { selectedIds: string[]; onChange: (ids: string[]) => void }) {
  const [rules, setRules] = useState<RuleRecord[]>(readRules);

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  }

  function addRule(values: Record<string, string>) {
    const rule: RuleRecord = { id: `rule-${Date.now()}`, name: values.name.trim(), statement: values.statement.trim(), scope: "global", category: "custom", schemaVersion: 2 };
    const next = [rule, ...rules];
    setRules(next);
    writeRules(next);
    onChange([...selectedIds, rule.id]);
  }

  return (
    <div>
      <p className="text-[12px] leading-5 text-[#66686C]">이 Agent가 지켜야 할 원칙을 고르세요. 여기서 만든 Rule은 다른 Agent에서도 재사용할 수 있습니다.</p>
      <div className="mt-4">
        <EntityPicker
          items={rules.map((rule) => ({ id: rule.id, label: rule.name, sublabel: rule.statement }))}
          selectedIds={selectedIds}
          onToggle={toggle}
          emptyHint="아직 등록된 Rule이 없습니다. 아래에서 바로 만들어 보세요."
          quickAddFields={[{ key: "name", placeholder: "이름 · 예: 사실 확인 우선" }, { key: "statement", placeholder: "규칙 내용 · 예: 확인하지 못한 내용은 단정하지 않는다", multiline: true }]}
          quickAddLabel="Rule 추가"
          onQuickAdd={addRule}
        />
      </div>
    </div>
  );
}
