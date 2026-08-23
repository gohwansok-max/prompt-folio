import { FileOutput, Pencil } from "lucide-react";
import { Link } from "wouter";
import type { AgentRecord } from "@/entities/agent/types";

export default function RecentAgentsList({ agents }: { agents: AgentRecord[] }) {
  return (
    <div className="editor-card p-6 md:p-7">
      <div className="section-kicker"><span className="counter">02</span> RECENT AGENTS</div>
      <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">최근 작업한 Agent</h2>
      {agents.length === 0 ? (
        <div className="mt-5 border border-dashed border-[#1C1D21]/15 bg-[#F0ECE4] px-4 py-8 text-center font-mono text-[10px] leading-5 text-[#77797C]">아직 만든 Agent가 없습니다.</div>
      ) : (
        <div className="mt-5 space-y-2">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between gap-3 border border-[#1C1D21]/10 bg-white/80 p-3">
              <div className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#292B30]">{agent.name}</span>
                  {agent.status === "draft" && <span className="border border-amber-400/50 bg-amber-50 px-1.5 py-0.5 font-mono text-[8px] font-semibold text-amber-700">초안 · 검토 필요</span>}
                </span>
                <span className="mt-1 block truncate text-[11px] text-[#6E7075]">{agent.role}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {agent.status === "confirmed" && <Link href={`/harness?agent=${agent.id}`} aria-label={`${agent.name}로 Harness 생성`} className="flex h-8 w-8 items-center justify-center border border-[#1C1D21]/10 text-[#606269] transition hover:border-[#2563EB] hover:text-[#2563EB]"><FileOutput size={13} /></Link>}
                <Link href="/agents" aria-label={`${agent.name} 편집`} className="flex h-8 w-8 items-center justify-center border border-[#1C1D21]/10 text-[#606269] transition hover:border-[#2563EB] hover:text-[#2563EB]"><Pencil size={13} /></Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
