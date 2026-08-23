import { Pencil, Plus, Trash2 } from "lucide-react";
import type { RuleRecord } from "@/entities/rule/types";
import { RULE_CATEGORIES } from "../lib";

function categoryLabel(id: RuleRecord["category"]) {
  return RULE_CATEGORIES.find((category) => category.id === id)?.label || id;
}

export default function RuleList({ rules, onCreate, onEdit, onDelete }: {
  rules: RuleRecord[];
  onCreate: () => void;
  onEdit: (rule: RuleRecord) => void;
  onDelete: (rule: RuleRecord) => void;
}) {
  return (
    <div className="editor-card p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="section-kicker"><span className="counter">01</span> MY RULES</div>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">Rule 라이브러리</h2>
        </div>
        <button onClick={onCreate} className="inline-flex shrink-0 items-center gap-1.5 bg-[#1C1D21] px-4 py-2.5 font-mono text-[10px] font-semibold text-white transition hover:bg-[#2563EB] active:scale-[0.97]"><Plus size={13} /> 새 Rule 만들기</button>
      </div>
      <p className="mt-2 text-[12px] leading-5 text-[#66686C]">Agent가 지켜야 할 원칙입니다. 여기서 만든 Rule은 Agent Builder의 Rule 단계에서 바로 골라 쓸 수 있습니다.</p>

      {rules.length === 0 ? (
        <div className="mt-5 border border-dashed border-[#1C1D21]/15 bg-[#F0ECE4] px-4 py-8 text-center font-mono text-[10px] leading-5 text-[#77797C]">아직 만든 Rule이 없습니다. 위 버튼으로 첫 Rule을 만들어 보세요.</div>
      ) : (
        <div className="mt-5 space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between gap-3 border border-[#1C1D21]/10 bg-white/80 p-3">
              <button onClick={() => onEdit(rule)} className="min-w-0 flex-1 text-left">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#292B30]">{rule.name}</span>
                  <span className="border border-[#2563EB]/25 bg-[#EFF4FF] px-1.5 py-0.5 font-mono text-[8px] font-semibold text-[#3265C5]">{categoryLabel(rule.category)}</span>
                  {rule.scope !== "global" && <span className="border border-[#1C1D21]/15 bg-[#F0ECE4] px-1.5 py-0.5 font-mono text-[8px] font-semibold text-[#67696C]">Agent 전용</span>}
                </span>
                <span className="mt-1 block truncate text-[11px] text-[#6E7075]">{rule.statement}</span>
              </button>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => onEdit(rule)} aria-label={`${rule.name} 편집`} className="flex h-8 w-8 items-center justify-center border border-[#1C1D21]/10 text-[#606269] transition hover:border-[#2563EB] hover:text-[#2563EB]"><Pencil size={13} /></button>
                <button onClick={() => onDelete(rule)} aria-label={`${rule.name} 삭제`} className="flex h-8 w-8 items-center justify-center border border-[#1C1D21]/10 text-[#85878A] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
