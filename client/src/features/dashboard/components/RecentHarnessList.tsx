import { FileDown } from "lucide-react";
import { PRESET_PLATFORMS } from "@/entities/harness/constants";
import type { HarnessWithAgentName } from "../lib";

function platformLabel(id: string) {
  return PRESET_PLATFORMS.find((preset) => preset.id === id)?.label || id;
}

export default function RecentHarnessList({ harnesses }: { harnesses: HarnessWithAgentName[] }) {
  return (
    <div className="editor-card p-6 md:p-7">
      <div className="section-kicker"><span className="counter">03</span> RECENT EXPORTS</div>
      <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">최근 생성한 Harness 파일</h2>
      {harnesses.length === 0 ? (
        <div className="mt-5 border border-dashed border-[#1C1D21]/15 bg-[#F0ECE4] px-4 py-8 text-center font-mono text-[10px] leading-5 text-[#77797C]">아직 생성한 Harness 파일이 없습니다.</div>
      ) : (
        <div className="mt-5 space-y-2">
          {harnesses.map((record) => (
            <div key={record.id} className="flex items-center justify-between gap-3 border border-[#1C1D21]/10 bg-white/80 p-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <FileDown size={14} className="shrink-0 text-[#2563EB]" />
                <div className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-[#292B30]">{record.agentName}</span>
                  <span className="mt-0.5 block font-mono text-[9px] text-[#9A9C9E]">{platformLabel(record.platform)} · v{record.version} · 파일 {record.files.length}개 · {new Date(record.generatedAt).toLocaleString("ko-KR")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
