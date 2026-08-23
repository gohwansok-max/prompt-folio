import { Pencil, Plus, Trash2 } from "lucide-react";
import type { ContextRecord } from "@/entities/context/types";

export default function ContextList({ contexts, onCreate, onEdit, onDelete }: {
  contexts: ContextRecord[];
  onCreate: () => void;
  onEdit: (context: ContextRecord) => void;
  onDelete: (context: ContextRecord) => void;
}) {
  return (
    <div className="editor-card p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="section-kicker"><span className="counter">01</span> MY CONTEXTS</div>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">Context 라이브러리</h2>
        </div>
        <button onClick={onCreate} className="inline-flex shrink-0 items-center gap-1.5 bg-[#1C1D21] px-4 py-2.5 font-mono text-[10px] font-semibold text-white transition hover:bg-[#2563EB] active:scale-[0.97]"><Plus size={13} /> 새 Context 만들기</button>
      </div>
      <p className="mt-2 text-[12px] leading-5 text-[#66686C]">반복해서 설명하기 귀찮은 배경 정보입니다. Agent Builder의 Context 단계에서 바로 골라 쓸 수 있습니다.</p>

      {contexts.length === 0 ? (
        <div className="mt-5 border border-dashed border-[#1C1D21]/15 bg-[#F0ECE4] px-4 py-8 text-center font-mono text-[10px] leading-5 text-[#77797C]">아직 만든 Context가 없습니다. 위 버튼으로 첫 Context를 만들어 보세요.</div>
      ) : (
        <div className="mt-5 space-y-2">
          {contexts.map((context) => (
            <div key={context.id} className="flex items-center justify-between gap-3 border border-[#1C1D21]/10 bg-white/80 p-3">
              <button onClick={() => onEdit(context)} className="min-w-0 flex-1 text-left">
                <span className="text-[13px] font-semibold text-[#292B30]">{context.name}</span>
                <span className="mt-1 block truncate text-[11px] text-[#6E7075]">{context.body}</span>
                {context.tags.length > 0 && (
                  <span className="mt-1 flex flex-wrap gap-1">
                    {context.tags.map((tag) => <span key={tag} className="border border-[#2563EB]/25 bg-[#EFF4FF] px-1.5 py-0.5 font-mono text-[8px] text-[#3265C5]">#{tag}</span>)}
                  </span>
                )}
              </button>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => onEdit(context)} aria-label={`${context.name} 편집`} className="flex h-8 w-8 items-center justify-center border border-[#1C1D21]/10 text-[#606269] transition hover:border-[#2563EB] hover:text-[#2563EB]"><Pencil size={13} /></button>
                <button onClick={() => onDelete(context)} aria-label={`${context.name} 삭제`} className="flex h-8 w-8 items-center justify-center border border-[#1C1D21]/10 text-[#85878A] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
