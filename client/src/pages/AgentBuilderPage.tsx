import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { readAgents } from "@/entities/agent/storage";
import type { AgentRecord } from "@/entities/agent/types";
import AgentList from "@/features/agent-builder/components/AgentList";
import AgentWizard from "@/features/agent-builder/components/AgentWizard";
import { deleteAgent } from "@/features/agent-builder/lib";

export default function AgentBuilderPage() {
  const [agents, setAgents] = useState<AgentRecord[]>(readAgents);
  const [editing, setEditing] = useState<AgentRecord | "new" | null>(null);

  function refresh() {
    setAgents(readAgents());
    setEditing(null);
  }

  function handleDelete(agent: AgentRecord) {
    if (!window.confirm(`“${agent.name}”을 삭제할까요?`)) return;
    deleteAgent(agent.id);
    setAgents(readAgents());
  }

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#1C1D21]">
      <header className="sticky top-0 z-30 border-b border-[#1C1D21]/10 bg-[#F7F4ED]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1000px] items-center justify-between px-5 md:px-8">
          <Link href="/" className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold text-[#67696C] transition hover:text-[#2563EB]"><ArrowLeft size={14} /> Prompt Folio로 돌아가기</Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="font-mono text-[10px] font-semibold text-[#67696C] transition hover:text-[#2563EB]">Dashboard</Link>
            <Link href="/library" className="font-mono text-[10px] font-semibold text-[#67696C] transition hover:text-[#2563EB]">Rule · Context</Link>
            <Link href="/harness" className="font-mono text-[10px] font-semibold text-[#67696C] transition hover:text-[#2563EB]">Harness Generator</Link>
            <Link href="/settings" className="font-mono text-[10px] font-semibold text-[#67696C] transition hover:text-[#2563EB]">Settings</Link>
            <span className="font-mono text-[9px] font-medium tracking-[0.13em] text-[#6F706F]">AGENT BUILDER · BETA</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1000px] px-5 pb-14 pt-8 md:px-8 md:pt-11">
        <div className="mb-7">
          <div className="section-kicker"><span className="counter">NEW</span> AI HARNESS STUDIO</div>
          <h1 className="mt-3 font-serif text-3xl font-bold tracking-[-0.04em] md:text-4xl">Agent Builder</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#55575B]">Skill·Rule·Context를 조합해 나만의 AI 전문가를 만듭니다. Prompt Folio 보관함에서 자동으로 옮겨온 초안이 있다면 목록에서 검토해 확정할 수 있습니다.</p>
        </div>
        {editing ? (
          <AgentWizard existing={editing === "new" ? null : editing} onSaved={refresh} onCancel={() => setEditing(null)} />
        ) : (
          <AgentList agents={agents} onCreate={() => setEditing("new")} onEdit={(agent) => setEditing(agent)} onDelete={handleDelete} />
        )}
      </main>
    </div>
  );
}
