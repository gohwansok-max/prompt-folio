import { readContexts } from "@/entities/context/storage";
import { readRules } from "@/entities/rule/storage";
import { readSkills } from "@/entities/skill/storage";
import type { AgentDraftForm } from "../../lib";

function PreviewChips({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <span className="field-label">{title}</span>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.length ? items.map((item) => <span key={item} className="border border-[#1C1D21]/15 bg-white px-2 py-1 font-mono text-[9px] text-[#4E5055]">{item}</span>) : <span className="font-mono text-[9px] text-[#9A9C9E]">없음</span>}
      </div>
    </div>
  );
}

export default function PreviewStep({ form }: { form: AgentDraftForm }) {
  const skills = readSkills().filter((skill) => form.skillIds.includes(skill.id));
  const rules = readRules().filter((rule) => form.ruleIds.includes(rule.id));
  const contexts = readContexts().filter((context) => form.contextIds.includes(context.id));

  return (
    <div className="space-y-4">
      <div className="border border-[#1C1D21]/10 bg-white/80 p-4">
        <span className="field-label">정체성</span>
        <p className="mt-2 text-[13px] font-semibold text-[#23252A]">{form.name || "(이름 없음)"}</p>
        <p className="mt-1 text-[12px] text-[#55575B]">{form.role || "(역할 없음)"}</p>
        <p className="mt-2 text-[12px] leading-5 text-[#66686C]">{form.goal || "(목표 없음)"}</p>
        {form.tone && <p className="mt-1 font-mono text-[10px] text-[#797B80]">톤: {form.tone}</p>}
      </div>
      <PreviewChips title={`Skill ${skills.length}개`} items={skills.map((skill) => skill.name)} />
      <PreviewChips title={`Rule ${rules.length}개`} items={rules.map((rule) => rule.name)} />
      <PreviewChips title={`Context ${contexts.length}개`} items={contexts.map((context) => context.name)} />
      <PreviewChips title={`대상 플랫폼 ${form.targetPlatforms.length}개`} items={form.targetPlatforms} />
      <div className="border border-[#2563EB]/20 bg-[#EFF4FF]/60 px-4 py-3 text-[11px] leading-5 text-[#4264A6]">저장하면 이 정보가 Agent로 등록됩니다. 실제 CLAUDE.md 등 파일 생성은 다음 라운드에 만들 Harness Generator 화면에서 진행합니다.</div>
    </div>
  );
}
