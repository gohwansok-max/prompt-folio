import { CheckCircle2, CircleAlert, History } from "lucide-react";
import type { MigrationLog } from "@/entities/migration/types";

export default function MigrationStatusPanel({ log }: { log: MigrationLog | null }) {
  return (
    <div className="editor-card p-6 md:p-7">
      <div className="flex items-center gap-2 section-kicker"><History size={12} /> <span className="counter">01</span> MIGRATION</div>
      <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">v1 → v2 마이그레이션 상태</h2>
      <p className="mt-2 text-[12px] leading-5 text-[#66686C]">Prompt Folio 보관함(v1)을 Agent·Skill 초안(v2)으로 옮기는 1회성 작업입니다. 앱을 열 때 자동으로 실행되며, v1 데이터는 절대 수정·삭제하지 않습니다.</p>

      {log ? (
        <div className="mt-5 flex items-start gap-2.5 border border-emerald-400/40 bg-emerald-50 px-4 py-3">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
          <div className="text-[12px] leading-6 text-emerald-900">
            <p>{new Date(log.completedAt).toLocaleString("ko-KR")}에 완료됨</p>
            <p className="mt-0.5 font-mono text-[10px] text-emerald-700">Agent 초안 {log.migratedAgents}개 · Skill 초안 {log.migratedSkills}개 생성</p>
            {log.failedEntries.length > 0 && <p className="mt-1 font-mono text-[10px] text-amber-700">변환 실패 {log.failedEntries.length}건 (원본은 v1 보관함에 그대로 남아 있습니다)</p>}
          </div>
        </div>
      ) : (
        <div className="mt-5 flex items-start gap-2.5 border border-[#1C1D21]/15 bg-[#F0ECE4] px-4 py-3">
          <CircleAlert size={16} className="mt-0.5 shrink-0 text-[#77797C]" />
          <p className="text-[12px] leading-6 text-[#66686C]">아직 실행되지 않았습니다. Home 화면을 한 번 열면 자동으로 실행됩니다.</p>
        </div>
      )}
    </div>
  );
}
