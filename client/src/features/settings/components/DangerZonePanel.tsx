import { Trash2 } from "lucide-react";
import { clearAgents, clearContexts, clearHarnesses, clearRules, clearSkills } from "../lib";

const ITEMS = [
  { key: "agents", label: "Agent", action: clearAgents },
  { key: "skills", label: "Skill", action: clearSkills },
  { key: "rules", label: "Rule", action: clearRules },
  { key: "contexts", label: "Context", action: clearContexts },
  { key: "harnesses", label: "Harness 생성 기록", action: clearHarnesses },
] as const;

export default function DangerZonePanel({ counts, onCleared }: { counts: Record<string, number>; onCleared: () => void }) {
  function handleClear(item: (typeof ITEMS)[number]) {
    if (!window.confirm(`${item.label} ${counts[item.key] || 0}개를 모두 삭제할까요? 되돌릴 수 없습니다.`)) return;
    item.action();
    onCleared();
  }

  return (
    <div className="editor-card border-red-200 p-6 md:p-7">
      <div className="section-kicker text-red-600"><span className="counter border-red-300 text-red-600">03</span> DANGER ZONE</div>
      <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em] text-red-700">데이터 초기화</h2>
      <p className="mt-2 text-[12px] leading-5 text-[#66686C]">이 브라우저에 저장된 Harness Studio(v2) 데이터만 지웁니다. Prompt Folio 보관함(v1)은 영향을 받지 않습니다. 되돌릴 수 없으니 먼저 위에서 백업하는 것을 권장합니다.</p>
      <div className="mt-5 space-y-2">
        {ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3 border border-red-200 bg-red-50/40 p-3">
            <span className="text-[12px] text-[#4E5055]">{item.label} <span className="font-mono text-[10px] text-[#9A9C9E]">{counts[item.key] || 0}개</span></span>
            <button onClick={() => handleClear(item)} disabled={!counts[item.key]} className="inline-flex items-center gap-1.5 border border-red-300 bg-white px-3 py-1.5 font-mono text-[9px] font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={12} /> 전체 삭제</button>
          </div>
        ))}
      </div>
    </div>
  );
}
