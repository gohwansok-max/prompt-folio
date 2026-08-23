import { ArrowLeft, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { readAgents } from "@/entities/agent/storage";
import type { AgentRecord } from "@/entities/agent/types";
import { readContexts } from "@/entities/context/storage";
import type { HarnessFile, PlatformId } from "@/entities/harness/types";
import { readRules } from "@/entities/rule/storage";
import { readSkills } from "@/entities/skill/storage";
import { generateHarnessFiles } from "@/features/harness-generator/agentGenerator";
import AgentPicker from "@/features/harness-generator/components/AgentPicker";
import FilePreview from "@/features/harness-generator/components/FilePreview";
import QuickGeneratePanel from "@/features/harness-generator/components/QuickGeneratePanel";
import { saveHarnessRecord } from "@/features/harness-generator/harnessRecords";
import PlatformPicker from "@/shared/ui/PlatformPicker";

type GeneratedResult = { platform: PlatformId; files: HarnessFile[] };
type Mode = "agent" | "quick";

export default function HarnessGeneratorPage() {
  const [mode, setMode] = useState<Mode>("agent");
  const [agents] = useState<AgentRecord[]>(readAgents);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<PlatformId[]>([]);
  const [generated, setGenerated] = useState<{ at: string; results: GeneratedResult[] } | null>(null);

  useEffect(() => {
    const preselectId = new URLSearchParams(window.location.search).get("agent");
    const preselect = preselectId ? agents.find((agent) => agent.id === preselectId) : agents[0];
    if (preselect) {
      setSelectedAgentId(preselect.id);
      setPlatforms(preselect.targetPlatforms);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? null;

  function selectAgent(id: string) {
    setSelectedAgentId(id);
    setGenerated(null);
    if (!platforms.length) {
      const agent = agents.find((item) => item.id === id);
      if (agent?.targetPlatforms.length) setPlatforms(agent.targetPlatforms);
    }
  }

  function generate() {
    if (!selectedAgent || !platforms.length) return;
    const skills = readSkills();
    const rules = readRules();
    const contexts = readContexts();
    const results = platforms.map((platform) => {
      const files = generateHarnessFiles(selectedAgent, skills, rules, contexts, platform);
      const record = saveHarnessRecord(selectedAgent.id, platform, files);
      return { platform, files: record.files };
    });
    setGenerated({ at: new Date().toISOString(), results });
  }

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#1C1D21]">
      <header className="sticky top-0 z-30 border-b border-[#1C1D21]/10 bg-[#F7F4ED]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1000px] items-center justify-between px-5 md:px-8">
          <Link href="/agents" className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold text-[#67696C] transition hover:text-[#2563EB]"><ArrowLeft size={14} /> Agent Builder로 돌아가기</Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="font-mono text-[10px] font-semibold text-[#67696C] transition hover:text-[#2563EB]">Dashboard</Link>
            <Link href="/library" className="font-mono text-[10px] font-semibold text-[#67696C] transition hover:text-[#2563EB]">Rule · Context</Link>
            <span className="font-mono text-[9px] font-medium tracking-[0.13em] text-[#6F706F]">HARNESS GENERATOR · BETA</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1000px] px-5 pb-14 pt-8 md:px-8 md:pt-11">
        <div className="mb-7">
          <div className="section-kicker"><span className="counter">NEW</span> AI HARNESS STUDIO</div>
          <h1 className="mt-3 font-serif text-3xl font-bold tracking-[-0.04em] md:text-4xl">Harness Generator</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#55575B]">Agent 하나를 골라 원하는 개발 환경용 파일로 변환합니다. Claude Code는 CLAUDE.md와 Skill별 SKILL.md를, 다른 환경은 하나의 통합 문서를 만듭니다.</p>
          <div className="mt-5 flex gap-1.5 border-b border-[#1C1D21]/10">
            <button onClick={() => setMode("agent")} className={`border-b-2 px-3 py-2.5 font-mono text-[10px] font-semibold transition ${mode === "agent" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-[#818388] hover:text-[#4E5055]"}`}>Agent 기반 생성</button>
            <button onClick={() => setMode("quick")} className={`border-b-2 px-3 py-2.5 font-mono text-[10px] font-semibold transition ${mode === "quick" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-[#818388] hover:text-[#4E5055]"}`}>빠른 생성 (메모에서 바로)</button>
          </div>
          {mode === "quick" && <p className="mt-3 max-w-2xl text-[12px] leading-5 text-[#66686C]">Agent를 만들지 않고, 메모 한 번으로 바로 문서를 뽑습니다. Prompt Folio의 기존 방식과 동일합니다.</p>}
        </div>

        {mode === "quick" ? (
          <QuickGeneratePanel />
        ) : (
          <div className="space-y-5">
            <div className="editor-card p-6 md:p-7">
              <div className="section-kicker"><span className="counter">01</span> AGENT 선택</div>
              <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">어떤 Agent를 내보낼까요?</h2>
              <div className="mt-5">
                <AgentPicker agents={agents} selectedId={selectedAgentId} onSelect={selectAgent} />
              </div>
            </div>

            {selectedAgent && (
              <div className="editor-card p-6 md:p-7">
                <div className="section-kicker"><span className="counter">02</span> 대상 플랫폼</div>
                <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">어디에서 쓸 건가요?</h2>
                <p className="mt-2 text-[12px] leading-5 text-[#66686C]">Agent Builder에서 고른 플랫폼을 기본값으로 가져왔습니다. 필요하면 바꿔도 됩니다.</p>
                <div className="mt-4">
                  <PlatformPicker selected={platforms} onChange={setPlatforms} />
                </div>
                <button onClick={generate} disabled={!platforms.length} className="generate-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-40"><Sparkles size={17} /> {platforms.length || 0}개 플랫폼용 파일 생성</button>
              </div>
            )}

            {generated && <FilePreview key={generated.at} results={generated.results} />}
          </div>
        )}
      </main>
    </div>
  );
}
