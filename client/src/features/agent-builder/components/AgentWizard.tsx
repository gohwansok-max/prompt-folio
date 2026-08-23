import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { useState } from "react";
import type { AgentRecord } from "@/entities/agent/types";
import { agentToForm, buildAgentRecord, emptyDraft, isDraftComplete, upsertAgent, type AgentDraftForm } from "../lib";
import ContextStep from "./steps/ContextStep";
import IdentityStep from "./steps/IdentityStep";
import PlatformStep from "./steps/PlatformStep";
import PreviewStep from "./steps/PreviewStep";
import RuleStep from "./steps/RuleStep";
import SkillStep from "./steps/SkillStep";

const STEPS = [
  { title: "정체성" },
  { title: "Skill" },
  { title: "Rule" },
  { title: "Context" },
  { title: "플랫폼" },
  { title: "확인" },
];

export default function AgentWizard({ existing, onSaved, onCancel }: { existing: AgentRecord | null; onSaved: () => void; onCancel: () => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AgentDraftForm>(() => (existing ? agentToForm(existing) : emptyDraft()));

  function patch(next: Partial<AgentDraftForm>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function save() {
    if (!isDraftComplete(form)) return;
    upsertAgent(buildAgentRecord(form, existing));
    onSaved();
  }

  const identityReady = isDraftComplete(form);
  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="editor-card p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="section-kicker"><span className="counter">{existing ? "편집" : "신규"}</span> AGENT BUILDER</div>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">{existing ? `“${existing.name}” 검토·수정` : "새 Agent 만들기"}</h2>
          {existing?.status === "draft" && <p className="mt-2 max-w-md text-[11px] leading-5 text-amber-700">Prompt Folio 보관함에서 자동으로 옮겨온 초안입니다. 내용을 확인하고 저장하면 정식 Agent로 확정됩니다.</p>}
        </div>
        <button onClick={onCancel} className="shrink-0 border border-[#1C1D21]/15 bg-white px-3 py-2 font-mono text-[10px] font-semibold text-[#67696C] transition hover:border-red-300 hover:text-red-600">취소</button>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {STEPS.map((item, index) => (
          <button key={item.title} type="button" onClick={() => setStep(index)} className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[9px] font-semibold transition ${index === step ? "border-[#2563EB] bg-[#2563EB] text-white" : index < step ? "border-[#2563EB]/40 bg-[#EFF4FF] text-[#3564B9]" : "border-[#1C1D21]/15 bg-white text-[#818388]"}`}>
            <span>{index + 1}</span>{item.title}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {step === 0 && <IdentityStep form={form} onChange={patch} />}
        {step === 1 && <SkillStep selectedIds={form.skillIds} onChange={(ids) => patch({ skillIds: ids })} />}
        {step === 2 && <RuleStep selectedIds={form.ruleIds} onChange={(ids) => patch({ ruleIds: ids })} />}
        {step === 3 && <ContextStep selectedIds={form.contextIds} onChange={(ids) => patch({ contextIds: ids })} />}
        {step === 4 && <PlatformStep selected={form.targetPlatforms} onChange={(next) => patch({ targetPlatforms: next })} />}
        {step === 5 && <PreviewStep form={form} />}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-[#1C1D21]/10 pt-4">
        <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-[#67696C] disabled:opacity-30"><ChevronLeft size={14} /> 이전</button>
        {isLastStep ? (
          <button type="button" onClick={save} disabled={!identityReady} className="generate-button px-4 py-2.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-40"><Save size={14} /> Agent 저장</button>
        ) : (
          <button type="button" onClick={() => setStep((current) => Math.min(STEPS.length - 1, current + 1))} disabled={step === 0 && !identityReady} className="generate-button px-4 py-2.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-40">다음 <ChevronRight size={14} /></button>
        )}
      </div>
    </div>
  );
}
