import { AlertTriangle, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import type { AgentRecord } from "@/entities/agent/types";

export default function DraftReviewBanner({ draftAgents }: { draftAgents: AgentRecord[] }) {
  if (!draftAgents.length) return null;
  return (
    <div className="flex flex-col gap-3 border border-amber-400/50 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="text-[13px] font-semibold text-amber-900">검토가 필요한 초안 Agent가 {draftAgents.length}개 있습니다.</p>
          <p className="mt-1 text-[11px] leading-5 text-amber-700">Prompt Folio 보관함에서 자동으로 옮겨온 항목입니다: {draftAgents.slice(0, 3).map((agent) => agent.name).join(", ")}{draftAgents.length > 3 ? ` 외 ${draftAgents.length - 3}개` : ""}</p>
        </div>
      </div>
      <Link href="/agents" className="inline-flex shrink-0 items-center gap-1 self-start bg-amber-600 px-3 py-2 font-mono text-[10px] font-semibold text-white transition hover:bg-amber-700 sm:self-auto">검토하러 가기 <ChevronRight size={13} /></Link>
    </div>
  );
}
