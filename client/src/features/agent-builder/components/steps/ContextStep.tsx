import { useState } from "react";
import { readContexts, writeContexts } from "@/entities/context/storage";
import type { ContextRecord } from "@/entities/context/types";
import EntityPicker from "../EntityPicker";

export default function ContextStep({ selectedIds, onChange }: { selectedIds: string[]; onChange: (ids: string[]) => void }) {
  const [contexts, setContexts] = useState<ContextRecord[]>(readContexts);

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  }

  function addContext(values: Record<string, string>) {
    const context: ContextRecord = { id: `context-${Date.now()}`, name: values.name.trim(), body: values.body.trim(), tags: [], schemaVersion: 2 };
    const next = [context, ...contexts];
    setContexts(next);
    writeContexts(next);
    onChange([...selectedIds, context.id]);
  }

  return (
    <div>
      <p className="text-[12px] leading-5 text-[#66686C]">반복해서 설명하기 귀찮은 배경 정보를 붙여 두세요. 예: 회사 소개, 팀 문서 규칙.</p>
      <div className="mt-4">
        <EntityPicker
          items={contexts.map((context) => ({ id: context.id, label: context.name, sublabel: context.body }))}
          selectedIds={selectedIds}
          onToggle={toggle}
          emptyHint="아직 등록된 Context가 없습니다. 아래에서 바로 만들어 보세요."
          quickAddFields={[{ key: "name", placeholder: "이름 · 예: 코엔에프 기업부설연구소 소개" }, { key: "body", placeholder: "내용", multiline: true }]}
          quickAddLabel="Context 추가"
          onQuickAdd={addContext}
        />
      </div>
    </div>
  );
}
