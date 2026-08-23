import { Check } from "lucide-react";
import type { AgentRecord } from "@/entities/agent/types";

export default function AgentPicker({ agents, selectedId, onSelect }: { agents: AgentRecord[]; selectedId: string | null; onSelect: (id: string) => void }) {
  if (!agents.length) {
    return <div className="border border-dashed border-[#1C1D21]/15 bg-[#F0ECE4] px-4 py-8 text-center font-mono text-[10px] leading-5 text-[#77797C]">아직 만든 Agent가 없습니다. 먼저 Agent Builder에서 Agent를 만들어 보세요.</div>;
  }
  return (
    <div className="space-y-2">
      {agents.map((agent) => {
        const active = agent.id === selectedId;
        return (
          <button key={agent.id} type="button" onClick={() => onSelect(agent.id)} className={`flex w-full items-center justify-between gap-3 border px-3 py-2.5 text-left transition ${active ? "border-[#2563EB] bg-[#EFF4FF]" : "border-[#1C1D21]/10 bg-white/80 hover:border-[#2563EB]/40"}`}>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#292B30]">{agent.name}</span>
                {agent.status === "draft" && <span className="border border-amber-400/50 bg-amber-50 px-1.5 py-0.5 font-mono text-[8px] font-semibold text-amber-700">초안</span>}
              </span>
              <span className="mt-1 block truncate text-[11px] text-[#6E7075]">{agent.role}</span>
            </span>
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center border ${active ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-[#9A9C9E]"}`}>{active && <Check size={11} strokeWidth={3} />}</span>
          </button>
        );
      })}
    </div>
  );
}
