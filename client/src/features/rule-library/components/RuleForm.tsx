import { Save } from "lucide-react";
import { useState } from "react";
import type { RuleRecord } from "@/entities/rule/types";
import { emptyRuleForm, isRuleFormComplete, RULE_CATEGORIES, ruleToForm, type RuleForm as RuleFormValue } from "../lib";

export default function RuleForm({ existing, onSave, onCancel }: { existing: RuleRecord | null; onSave: (form: RuleFormValue) => void; onCancel: () => void }) {
  const [form, setForm] = useState<RuleFormValue>(() => (existing ? ruleToForm(existing) : emptyRuleForm()));
  const ready = isRuleFormComplete(form);

  return (
    <div className="editor-card p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="section-kicker"><span className="counter">{existing ? "편집" : "신규"}</span> RULE</div>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">{existing ? `“${existing.name}” 편집` : "새 Rule 만들기"}</h2>
        </div>
        <button onClick={onCancel} className="shrink-0 border border-[#1C1D21]/15 bg-white px-3 py-2 font-mono text-[10px] font-semibold text-[#67696C] transition hover:border-red-300 hover:text-red-600">취소</button>
      </div>

      <label className="mt-6 block"><span className="field-label">이름</span><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="예: 사실 확인 우선" className="field-input mt-2" /></label>
      <label className="mt-5 block"><span className="field-label">규칙 내용</span><textarea value={form.statement} onChange={(event) => setForm((current) => ({ ...current, statement: event.target.value }))} placeholder="예: 확인하지 못한 내용은 사실로 단정하지 않는다" className="field-input mt-2 min-h-[120px] resize-y py-3 leading-7" /></label>

      <div className="mt-5">
        <span className="field-label">분류</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {RULE_CATEGORIES.map((category) => (
            <button key={category.id} type="button" onClick={() => setForm((current) => ({ ...current, category: category.id }))} className={`border px-3 py-1.5 font-mono text-[10px] font-semibold transition ${form.category === category.id ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-[#1C1D21]/15 bg-white text-[#67696C]"}`}>{category.label}</button>
          ))}
        </div>
      </div>

      <button onClick={() => onSave(form)} disabled={!ready} className="generate-button mt-7 w-full disabled:cursor-not-allowed disabled:opacity-40"><Save size={16} /> Rule 저장</button>
    </div>
  );
}
