import { ArrowLeft, Bot, BookMarked, ChevronRight, FileDown, FileText, LayoutGrid, Layers3 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import DraftReviewBanner from "@/features/dashboard/components/DraftReviewBanner";
import RecentAgentsList from "@/features/dashboard/components/RecentAgentsList";
import RecentHarnessList from "@/features/dashboard/components/RecentHarnessList";
import StatCard from "@/features/dashboard/components/StatCard";
import { readDashboardSummary } from "@/features/dashboard/lib";

const QUICK_LINKS = [
  { href: "/agents", icon: Bot, title: "Agent Builder", description: "Skill·Rule·Context를 조합해 나만의 AI 전문가를 만듭니다." },
  { href: "/harness", icon: FileDown, title: "Harness Generator", description: "Agent 또는 메모를 CLAUDE.md 등 개발 환경용 파일로 내보냅니다." },
  { href: "/library", icon: BookMarked, title: "Rule · Context 라이브러리", description: "재사용할 원칙과 배경 지식을 미리 정리해 둡니다." },
];

export default function DashboardPage() {
  const [summary] = useState(readDashboardSummary);

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#1C1D21]">
      <header className="sticky top-0 z-30 border-b border-[#1C1D21]/10 bg-[#F7F4ED]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1000px] items-center justify-between px-5 md:px-8">
          <Link href="/" className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold text-[#67696C] transition hover:text-[#2563EB]"><ArrowLeft size={14} /> Prompt Folio로 돌아가기</Link>
          <span className="font-mono text-[9px] font-medium tracking-[0.13em] text-[#6F706F]">AI HARNESS STUDIO · DASHBOARD</span>
        </div>
      </header>
      <main className="mx-auto max-w-[1000px] px-5 pb-14 pt-8 md:px-8 md:pt-11">
        <div className="mb-7">
          <div className="section-kicker"><span className="counter">01</span> OVERVIEW</div>
          <h1 className="mt-3 font-serif text-3xl font-bold tracking-[-0.04em] md:text-4xl">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#55575B]">지금까지 만든 Agent·Skill·Rule·Context와 내보낸 Harness 파일 현황을 한눈에 봅니다.</p>
        </div>

        <div className="space-y-5">
          <DraftReviewBanner draftAgents={summary.draftAgents} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard icon={Bot} label="AGENT" value={summary.agents.total} sublabel={`확정 ${summary.agents.confirmed} · 초안 ${summary.agents.draft}`} />
            <StatCard icon={LayoutGrid} label="SKILL" value={summary.skills.total} sublabel={`확정 ${summary.skills.confirmed} · 초안 ${summary.skills.draft}`} />
            <StatCard icon={FileText} label="RULE" value={summary.rules} />
            <StatCard icon={Layers3} label="CONTEXT" value={summary.contexts} />
            <StatCard icon={FileDown} label="EXPORT" value={summary.harness.generations} sublabel={`파일 ${summary.harness.files}개`} />
            <StatCard icon={BookMarked} label="PLATFORM" value={summary.harness.platforms} sublabel="내보낸 플랫폼 수" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="group flex flex-col gap-2 border border-[#1C1D21]/10 bg-white/80 p-4 transition hover:border-[#2563EB]/50">
                <link.icon size={17} className="text-[#2563EB]" />
                <span className="flex items-center gap-1 text-[13px] font-semibold text-[#292B30]">{link.title} <ChevronRight size={13} className="transition group-hover:translate-x-0.5" /></span>
                <span className="text-[11px] leading-5 text-[#6E7075]">{link.description}</span>
              </Link>
            ))}
          </div>

          <RecentAgentsList agents={summary.recentAgents} />
          <RecentHarnessList harnesses={summary.recentHarnesses} />
        </div>
      </main>
    </div>
  );
}
