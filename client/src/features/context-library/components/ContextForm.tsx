import { Save } from "lucide-react";
import { useState } from "react";
import type { ContextRecord } from "@/entities/context/types";
import { contextToForm, emptyContextForm, isContextFormComplete, type ContextForm as ContextFormValue } from "../lib";

export default function ContextForm({ existing, onSave, onCancel }: { existing: ContextRecord | null; onSave: (form: ContextFormValue) => void; onCancel: () => void }) {
  const [form, setForm] = useState<ContextFormValue>(() => (existing ? contextToForm(existing) : emptyContextForm()));
  const ready = isContextFormComplete(form);

  return (
    <div className="editor-card p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="section-kicker"><span className="counter">{existing ? "편집" : "신규"}</span> CONTEXT</div>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">{existing ? `“${existing.name}” 편집` : "새 Context 만들기"}</h2>
        </div>
        <button onClick={onCancel} className="shrink-0 border border-[#1C1D21]/15 bg-white px-3 py-2 font-mono text-[10px] font-semibold text-[#67696C] transition hover:border-red-300 hover:text-red-600">취소</button>
      </div>

      <label className="mt-6 block"><span className="field-label">이름</span><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="예: 코엔에프 기업부설연구소 소개" className="field-input mt-2" /></label>
      <label className="mt-5 block"><span className="field-label">내용</span><textarea value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} placeholder="반복해서 설명하기 귀찮은 배경 정보를 적으세요." className="field-input mt-2 min-h-[180px] resize-y py-3 leading-7" /></label>
      <label className="mt-5 block"><span className="field-label">태그 (선택)</span><input value={form.tagInput} onChange={(event) => setForm((current) => ({ ...current, tagInput: event.target.value }))} placeholder="쉼표로 구분 · 예: 회사소개, 문서규칙" className="field-input mt-2" /></label>

      <button onClick={() => onSave(form)} disabled={!ready} className="generate-button mt-7 w-full disabled:cursor-not-allowed disabled:opacity-40"><Save size={16} /> Context 저장</button>
    </div>
  );
}
