import { Archive, Check, ChevronRight, Sparkles, WandSparkles } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { toast } from "sonner";
import type { HarnessFile, PlatformId } from "@/entities/harness/types";
import { EXAMPLE, PROVIDERS } from "@/features/harness-generator/constants";
import type { DetailLevel, ProviderId } from "@/features/harness-generator/types";
import { generateQuickFiles } from "@/features/harness-generator/quickGenerate";
import FilePreview from "@/features/harness-generator/components/FilePreview";
import { LIBRARY_KEY, readLibrary } from "@/features/library/storage";
import type { SavedEntry } from "@/features/library/types";
import { normalizeTags } from "@/features/tag-system/lib";
import { normalizeLines } from "@/shared/lib/text";

type GeneratedResult = { platform: PlatformId; files: HarnessFile[] };

/**
 * The pre-Agent Prompt Folio flow, folded into Harness Generator: write a memo,
 * pick services, get a start doc + skill doc straight away -- no Agent/Skill/Rule
 * records required. Kept as its own mode (not a replacement) so agent-based
 * generation and this quick path both stay available from one screen.
 */
export default function QuickGeneratePanel() {
  const [title, setTitle] = useState("연구소 업무 보조");
  const [notes, setNotes] = useState("");
  const [detail, setDetail] = useState<DetailLevel>("compact");
  const [selected, setSelected] = useState<ProviderId[]>(PROVIDERS.map((provider) => provider.id));
  const [tagInput, setTagInput] = useState("");
  const [generated, setGenerated] = useState<{ at: string; results: GeneratedResult[] } | null>(null);

  function toggleProvider(id: ProviderId) {
    setSelected((current) => {
      if (current.includes(id)) { const next = current.filter((item) => item !== id); return next.length ? next : current; }
      return [...current, id];
    });
  }

  function loadExample() {
    setNotes(EXAMPLE);
    toast.success("예시를 불러왔습니다.", { description: "내 업무에 맞게 단어만 바꿔도 됩니다." });
  }

  function generate() {
    if (!notes.trim()) { toast.message("먼저 메모를 적어 주세요.", { description: "예시 불러오기를 눌러 시작할 수도 있습니다." }); return; }
    const lines = normalizeLines(notes);
    const source = lines.length ? lines : normalizeLines(EXAMPLE);
    const results = PROVIDERS.filter((provider) => selected.includes(provider.id)).map((provider) => ({ platform: provider.id as PlatformId, files: generateQuickFiles(provider, title, source, detail) }));
    setGenerated({ at: new Date().toISOString(), results });
    toast.success(`${results.length}개 서비스용 문서를 정리했습니다.`);
  }

  function saveToLibrary() {
    if (!notes.trim()) { toast.message("저장할 메모를 먼저 적어 주세요."); return; }
    const library = readLibrary();
    const entry: SavedEntry = { id: `${Date.now()}`, name: title.trim() || "새 메모", kind: "prompt", title, notes, detail, selected, tags: normalizeTags(tagInput), savedAt: new Date().toISOString() };
    const existing = library.findIndex((item) => item.name === entry.name && item.kind === "prompt");
    const next = existing >= 0 ? library.map((item, index) => (index === existing ? entry : item)) : [entry, ...library];
    window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
    toast.success("메모를 로컬 보관함에 저장했습니다.", { description: "Home 화면의 보관함에서도 바로 불러올 수 있습니다." });
  }

  return (
    <div className="space-y-5">
      <div className="editor-card p-6 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="section-kicker"><span className="counter">01</span> RAW NOTES</div>
            <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">먼저, 원하는 일을 적어 주세요</h2>
          </div>
          <button onClick={loadExample} className="inline-flex shrink-0 items-center gap-1.5 border border-[#1C1D21]/15 bg-white px-3 py-2 font-mono text-[10px] font-semibold transition hover:border-[#2563EB] hover:text-[#2563EB] active:scale-[0.97]"><WandSparkles size={13} /> 쉬운 예시</button>
        </div>
        <label className="mt-6 block"><span className="field-label">문서 이름</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="예: 연구소 업무 보조" className="field-input mt-2" /></label>
        <label className="mt-5 block"><span className="field-label">기능 · 업무 · 말투 · 금지 사항</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="예: 매일 작성하는 보고서, 원하는 답변 방식, 반드시 지킬 기준을 편하게 적어 주세요." className="field-input mt-2 min-h-[180px] resize-y py-3 leading-7" /></label>
        <div className="mt-2 flex justify-between font-mono text-[10px] text-[#888A8C]"><span>문장·불릿 모두 가능</span><span>{notes.length.toLocaleString()} chars</span></div>
        <label className="mt-5 block"><span className="field-label">태그 (선택)</span><input value={tagInput} onChange={(event) => setTagInput(event.target.value)} placeholder="쉼표로 구분 · 예: HACCP, 품질관리" className="field-input mt-2" /></label>
        <button onClick={saveToLibrary} className="tool-button mt-4"><Archive size={13} /> 메모를 로컬 보관함에 저장</button>
      </div>

      <div className="editor-card p-6 md:p-7">
        <div className="section-kicker"><span className="counter">02</span> COMPILE OPTIONS</div>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <span className="field-label">압축 강도</span>
            <div className="mt-2 grid grid-cols-3 border border-[#1C1D21]/15 p-1">
              {(["compact", "balanced", "detailed"] as DetailLevel[]).map((item) => (
                <button key={item} onClick={() => setDetail(item)} className={`px-2 py-2 font-mono text-[10px] transition ${detail === item ? "bg-[#1C1D21] text-white" : "text-[#67696C] hover:bg-[#EEE9DF]"}`}>{item === "compact" ? "짧게" : item === "balanced" ? "균형" : "자세히"}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="field-label">선택 서비스</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PROVIDERS.map((provider) => (
                <button key={provider.id} onClick={() => toggleProvider(provider.id)} className={`provider-check ${selected.includes(provider.id) ? "is-active" : ""}`} style={{ "--provider": provider.color } as CSSProperties}>
                  <span className="check-dot">{selected.includes(provider.id) && <Check size={10} strokeWidth={3} />}</span>{provider.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={generate} className="generate-button mt-7 w-full"><Sparkles size={17} /> {selected.length}개 서비스용 Markdown 만들기 <ChevronRight size={17} /></button>
      </div>

      {generated && <FilePreview key={generated.at} results={generated.results} />}
    </div>
  );
}
