import type { AgentDraftForm } from "../../lib";

export default function IdentityStep({ form, onChange }: { form: AgentDraftForm; onChange: (patch: Partial<AgentDraftForm>) => void }) {
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="field-label">이름</span>
        <input value={form.name} onChange={(event) => onChange({ name: event.target.value })} placeholder="예: FSSC22000 심사원 AI" className="field-input mt-2" />
      </label>
      <label className="block">
        <span className="field-label">역할 (한 줄 정체성)</span>
        <input value={form.role} onChange={(event) => onChange({ role: event.target.value })} placeholder="예: 식품안전 인증 전문가" className="field-input mt-2" />
      </label>
      <label className="block">
        <span className="field-label">목표</span>
        <textarea value={form.goal} onChange={(event) => onChange({ goal: event.target.value })} placeholder="예: FSSC22000 문서 검토 및 개선안 작성" className="field-input mt-2 min-h-[96px]" />
      </label>
      <label className="block">
        <span className="field-label">톤 (선택)</span>
        <input value={form.tone} onChange={(event) => onChange({ tone: event.target.value })} placeholder="예: 단정하고 근거 중심" className="field-input mt-2" />
      </label>
    </div>
  );
}
