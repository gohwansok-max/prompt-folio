import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { readAgents } from "@/entities/agent/storage";
import { readContexts } from "@/entities/context/storage";
import { readHarnesses } from "@/entities/harness/storage";
import { readMigrationLog } from "@/entities/migration/storage";
import { readRules } from "@/entities/rule/storage";
import { readSkills } from "@/entities/skill/storage";
import BackupPanel from "@/features/settings/components/BackupPanel";
import DangerZonePanel from "@/features/settings/components/DangerZonePanel";
import MigrationStatusPanel from "@/features/settings/components/MigrationStatusPanel";

function readCounts() {
  return {
    agents: readAgents().length,
    skills: readSkills().length,
    rules: readRules().length,
    contexts: readContexts().length,
    harnesses: readHarnesses().length,
  };
}

export default function SettingsPage() {
  const [counts, setCounts] = useState(readCounts);
  const migrationLog = readMigrationLog();

  function refresh() {
    setCounts(readCounts());
  }

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#1C1D21]">
      <header className="sticky top-0 z-30 border-b border-[#1C1D21]/10 bg-[#F7F4ED]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1000px] items-center justify-between px-5 md:px-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold text-[#67696C] transition hover:text-[#2563EB]"><ArrowLeft size={14} /> Dashboard로 돌아가기</Link>
          <span className="font-mono text-[9px] font-medium tracking-[0.13em] text-[#6F706F]">HARNESS STUDIO · SETTINGS</span>
        </div>
      </header>
      <main className="mx-auto max-w-[1000px] px-5 pb-14 pt-8 md:px-8 md:pt-11">
        <div className="mb-7">
          <div className="section-kicker"><span className="counter">NEW</span> AI HARNESS STUDIO</div>
          <h1 className="mt-3 font-serif text-3xl font-bold tracking-[-0.04em] md:text-4xl">Settings</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#55575B]">Agent·Skill·Rule·Context·Harness(v2) 데이터의 마이그레이션 상태, 백업, 초기화를 관리합니다. Prompt Folio 보관함(v1)의 설정은 Home 화면의 "설정" 버튼에서 그대로 관리할 수 있습니다.</p>
        </div>

        <div className="space-y-5">
          <MigrationStatusPanel log={migrationLog} />
          <BackupPanel onImported={refresh} />
          <DangerZonePanel counts={counts} onCleared={refresh} />
        </div>
      </main>
    </div>
  );
}
