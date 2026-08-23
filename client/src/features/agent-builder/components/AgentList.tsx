import { Pencil, Plus, Trash2 } from "lucide-react";
import type { AgentRecord } from "@/entities/agent/types";

export default function AgentList({ agents, onCreate, onEdit, onDelete }: {
  agents: AgentRecord[];
  onCreate: () => void;
  onEdit: (agent: AgentRecord) => void;
  onDelete: (agent: AgentRecord) => void;
}) {
  return (
    <div className="editor-card p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="section-kicker"><span className="counter">01</span> MY AGENTS</div>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">내 Agent</h2>
        </div>
        <button onClick={onCreate} className="inline-flex shrink-0 items-center gap-1.5 bg-[#1C1D21] px-4 py-2.5 font-mono text-[10px] font-semibold text-white transition hover:bg-[#2563EB] active:scale-[0.97]"><Plus size={13} /> 새 Agent 만들기</button>
      </div>
      <p className="mt-2 text-[12px] leading-5 text-[#66686C]">Skill·Rule·Context를 조합해 만든 나만의 AI 전문가입니다. 이 브라우저에만 저장됩니다.</p>

      {agents.length === 0 ? (
        <div className="mt-5 border border-dashed border-[#1C1D21]/15 bg-[#F0ECE4] px-4 py-8 text-center font-mono text-[10px] leading-5 text-[#77797C]">아직 만든 Agent가 없습니다. 위 버튼으로 첫 Agent를 만들어 보세요.</div>
      ) : (
        <div className="mt-5 space-y-2">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between gap-3 border border-[#1C1D21]/10 bg-white/80 p-3">
              <button onClick={() => onEdit(agent)} className="min-w-0 flex-1 text-left">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#292B30]">{agent.name}</span>
                  {agent.status === "draft" && <span className="border border-amber-400/50 bg-amber-50 px-1.5 py-0.5 font-mono text-[8px] font-semibold text-amber-700">초안 · 검토 필요</span>}
                </span>
                <span className="mt-1 block truncate text-[11px] text-[#6E7075]">{agent.role}</span>
                <span className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-[9px] text-[#9A9C9E]">
                  <span>Skill {agent.skillIds.length}</span><span>·</span><span>Rule {agent.ruleIds.length}</span><span>·</span><span>Context {agent.contextIds.length}</span><span>·</span><span>플랫폼 {agent.targetPlatforms.length}</span>
                </span>
              </button>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => onEdit(agent)} aria-label={`${agent.name} 편집`} className="flex h-8 w-8 items-center justify-center border border-[#1C1D21]/10 text-[#606269] transition hover:border-[#2563EB] hover:text-[#2563EB]"><Pencil size={13} /></button>
                <button onClick={() => onDelete(agent)} aria-label={`${agent.name} 삭제`} className="flex h-8 w-8 items-center justify-center border border-[#1C1D21]/10 text-[#85878A] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
