/** Design: Editorial Command Desk — warm paper, cobalt ink, precise editorial hierarchy. */
import { useMemo, useState, type CSSProperties } from "react";
import { Check, ChevronRight, Clipboard, Download, FileDown, FileText, Layers3, Sparkles, WandSparkles } from "lucide-react";
import { toast } from "sonner";

type ProviderId = "claude" | "chatgpt" | "gemini" | "manus" | "perplexity";
type DetailLevel = "compact" | "balanced" | "detailed";
type Provider = { id: ProviderId; label: string; color: string; startFile: string; skillFile: string; focus: string };

const PROVIDERS: Provider[] = [
  { id: "claude", label: "Claude", color: "#D97757", startFile: "CLAUDE.md", skillFile: "SKILL.md", focus: "명확한 작업 원칙" },
  { id: "chatgpt", label: "ChatGPT", color: "#10A37F", startFile: "chatgpt-start.md", skillFile: "chatgpt-skill.md", focus: "재사용 가능한 대화 지침" },
  { id: "gemini", label: "Gemini", color: "#4285F4", startFile: "GEMINI.md", skillFile: "gemini-skill.md", focus: "목표와 산출물 우선" },
  { id: "manus", label: "Manus", color: "#2563EB", startFile: "MANUS.md", skillFile: "manus-skill.md", focus: "실행 가능한 작업 흐름" },
  { id: "perplexity", label: "Perplexity", color: "#20808D", startFile: "perplexity-start.md", skillFile: "perplexity-research-skill.md", focus: "근거 중심 조사" },
];

const EXAMPLE = `나는 식품 제조 기업부설연구소에서 HACCP·FSSC22000 문서, 미생물 검사 기록, 공정 데이터 분석을 담당한다.
AI에게는 업무 초안을 짧고 구조적으로 정리해 달라고 요청한다. 불확실한 내용은 사실처럼 쓰지 말고, 필요한 전제와 확인 항목을 분리해라.
결과는 바로 붙여 넣어 쓸 수 있는 표·체크리스트·보고서 문장으로 만들고, 설명은 한국어로 간결하게 작성해라.
투자나 법률 조언처럼 위험한 의사결정은 일반 정보와 확인 질문만 제공해라.`;

function normalizeLines(value: string) {
  return value.replace(/\r/g, "").split("\n").map((line) => line.replace(/^\s*[-•*]\s*/, "").trim()).filter(Boolean).filter((line, index, list) => list.indexOf(line) === index).slice(0, 14);
}

function inferRules(lines: string[]) {
  const joined = lines.join(" ");
  const rules: string[] = [];
  if (/간결|짧|압축|토큰|효율/.test(joined)) rules.push("불필요한 배경 설명·반복·면책 문구를 제거하고 핵심부터 쓴다.");
  if (/사실|근거|출처|불확실|확인/.test(joined)) rules.push("검증하지 못한 내용은 사실로 단정하지 않고, 가정·확인 항목을 분리한다.");
  if (/표|체크리스트|보고서|문서|마크다운/.test(joined)) rules.push("요청에 맞는 Markdown 표, 체크리스트, 또는 바로 쓸 수 있는 문서 초안을 우선한다.");
  if (/한국어|한글/.test(joined)) rules.push("기본 응답은 자연스럽고 간결한 한국어로 작성한다.");
  if (/투자|법률|의료|세금|안전|위험/.test(joined)) rules.push("고위험 의사결정은 일반 정보와 확인 질문으로 한정하고, 단정적 권고를 피한다.");
  return rules.length ? rules : ["결론을 먼저 제시하고, 필요한 근거와 다음 행동만 남긴다.", "모호한 요청은 최소한의 확인 질문으로 범위를 고정한 뒤 진행한다."];
}

function compactContext(lines: string[], detail: DetailLevel) {
  const max = detail === "compact" ? 4 : detail === "balanced" ? 7 : 11;
  return lines.slice(0, max).map((item) => item.replace(/[.。]+$/, "").trim());
}

function createStartDocument(provider: Provider, title: string, lines: string[], detail: DetailLevel) {
  const context = compactContext(lines, detail);
  const providerRule: Record<ProviderId, string> = {
    claude: "긴 답변보다 판단 기준과 최종 산출물을 분명히 하며, 단계별 실행 전에 계획을 짧게 확인한다.",
    chatgpt: "대화 맥락을 유지하되, 이미 받은 정보는 다시 묻지 않는다.",
    gemini: "목표·제약·출력 형식을 먼저 해석하고, 필요한 경우 선택지를 비교한다.",
    manus: "자료 조사·파일 생성·분석처럼 실행이 필요한 일은 결과물 중심으로 완료한다.",
    perplexity: "조사성 질문은 신뢰 가능한 원문을 우선하고, 핵심 주장에 출처 링크를 붙인다.",
  };
  return `# ${title || "나의 작업 환경"} · 시작 지침

> 이 문서는 **${provider.label}**와 대화를 시작할 때 먼저 제공하는 개인 작업 컨텍스트입니다. ${provider.focus}에 맞춰 압축했습니다.

## 목적
사용자의 자연어 요청을 빠르게 이해하고, 검토 가능한 실무 결과물로 정리한다.

## 작업 컨텍스트
${context.map((item) => `- ${item}`).join("\n")}

## 응답 원칙
${[...inferRules(lines), providerRule[provider.id]].map((item) => `- ${item}`).join("\n")}

## 기본 작업 순서
1. 요청의 **목적·대상·제약·산출물**을 한 줄로 재정의한다.
2. 누락된 핵심 정보가 있을 때만 짧게 확인한다.
3. 바로 사용할 수 있는 결과를 먼저 제공하고, 필요한 근거·주의점·다음 행동을 덧붙인다.

## 출력 형식
- 제목과 소제목으로 구조화한다.
- 표가 더 빠르게 이해되는 경우에만 Markdown 표를 사용한다.
- 길이가 길어지면 요약 → 본문 → 확인 항목 순서로 쓴다.
- 별도 요청이 없으면 한국어로 답한다.
`;
}

function createSkillDocument(provider: Provider, title: string, lines: string[], detail: DetailLevel) {
  const context = compactContext(lines, detail);
  const keywords = context.join(" ").split(/\s+/).filter((word) => word.length >= 2).slice(0, 8).join(", ");
  const skills: Record<ProviderId, string> = {
    claude: "복잡한 요청을 실행 가능한 지시문·체크리스트·문서 초안으로 바꾼다.",
    chatgpt: "반복되는 업무 요청을 짧은 규칙과 재사용 가능한 결과 형식으로 표준화한다.",
    gemini: "요청에서 요구사항을 추출해 산출물 구조와 검증 기준으로 정리한다.",
    manus: "업무 목표를 단계별 실행 계획과 공유 가능한 파일 산출물로 변환한다.",
    perplexity: "조사 주제를 검증 가능한 질문으로 분해하고 출처 기반의 간결한 답을 만든다.",
  };
  return `---
name: ${title || "custom-workflow"}
description: ${skills[provider.id]}
triggers: ${keywords || "업무 정리, 문서 작성, 분석"}
---

# ${title || "사용자 맞춤"} 스킬

## 역할
${skills[provider.id]}

## 입력 해석
다음 메모에서 역할, 대상, 목표, 제약, 산출물, 금지 사항을 추출한다. 중복 표현은 합치고, 결과에 직접 영향이 없는 수식어는 제외한다.

## 사용자 맥락
${context.map((item) => `- ${item}`).join("\n")}

## 실행 규칙
${inferRules(lines).map((item) => `- ${item}`).join("\n")}
- 결과에 영향을 주는 가정은 별도 **가정** 절에 표시한다.
- 요구가 충돌하면 임의로 해결하지 말고, 더 중요한 제약을 한 문장으로 확인한다.

## 완료 기준
1. 사용자가 바로 복사하거나 파일로 옮길 수 있는 형태다.
2. 핵심 결론·근거·확인 항목이 서로 섞이지 않는다.
3. 동일한 의미의 문장을 반복하지 않는다.

## 권장 출력 골격
\`\`\`markdown
# 결과 제목

## 요약
한 문단 또는 3개 이하의 핵심 항목

## 본문
실행 가능한 내용

## 확인 항목
- 전제 / 누락 정보 / 검토 사항
\`\`\`
`;
}

function downloadText(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
}

export default function Home() {
  const [title, setTitle] = useState("연구소 업무 보조");
  const [notes, setNotes] = useState("");
  const [detail, setDetail] = useState<DetailLevel>("compact");
  const [selected, setSelected] = useState<ProviderId[]>(PROVIDERS.map((provider) => provider.id));
  const [activeProvider, setActiveProvider] = useState<ProviderId>("claude");
  const [activeDocument, setActiveDocument] = useState<"start" | "skill">("start");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const selectedProviders = PROVIDERS.filter((provider) => selected.includes(provider.id));
  const sourceLines = useMemo(() => normalizeLines(notes), [notes]);
  const selectedProvider = PROVIDERS.find((provider) => provider.id === activeProvider) ?? PROVIDERS[0];
  const source = sourceLines.length ? sourceLines : normalizeLines(EXAMPLE);
  const document = activeDocument === "start" ? createStartDocument(selectedProvider, title, source, detail) : createSkillDocument(selectedProvider, title, source, detail);

  function toggleProvider(id: ProviderId) {
    setSelected((current) => {
      if (current.includes(id)) { const next = current.filter((item) => item !== id); return next.length ? next : current; }
      return [...current, id];
    });
    setActiveProvider(id);
  }

  function generate() {
    if (!notes.trim()) { toast.message("먼저 메모를 적어 주세요.", { description: "예시 불러오기를 눌러 시작할 수도 있습니다." }); return; }
    setHasGenerated(true); setActiveProvider(selected[0]); setActiveDocument("start"); toast.success(`${selected.length}개 서비스용 문서를 정리했습니다.`);
  }

  async function copyDocument() { await navigator.clipboard.writeText(document); setCopied(true); toast.success("Markdown을 복사했습니다."); window.setTimeout(() => setCopied(false), 1600); }
  function downloadAll() {
    const bundle = selectedProviders.flatMap((provider) => [`\n\n<!-- ${provider.startFile} -->\n\n${createStartDocument(provider, title, source, detail)}`, `\n\n<!-- ${provider.skillFile} -->\n\n${createSkillDocument(provider, title, source, detail)}`]).join("\n\n---\n");
    downloadText(`${title.replace(/\s+/g, "-") || "prompt-folio"}-bundle.md`, bundle.trim()); toast.success("통합 Markdown 파일을 저장했습니다.");
  }

  return <div className="min-h-screen bg-[#F7F4ED] text-[#1C1D21]">
    <header className="sticky top-0 z-30 border-b border-[#1C1D21]/10 bg-[#F7F4ED]/90 backdrop-blur-xl"><div className="mx-auto flex h-[70px] max-w-[1540px] items-center justify-between px-5 md:px-8">
      <a href="#top" className="flex items-center gap-3" aria-label="Prompt Folio 홈"><img src="/manus-storage/prompt-folio-mark_0a786c13.png" alt="Prompt Folio 심볼" className="h-10 w-10 object-contain" /><div><div className="font-serif text-[19px] font-bold leading-none tracking-[-0.04em]">Prompt Folio</div><div className="mt-1 font-mono text-[9px] font-medium tracking-[0.13em] text-[#6F706F]">AI INSTRUCTION EDITOR</div></div></a>
      <div className="hidden items-center gap-5 font-mono text-[11px] text-[#6F706F] sm:flex"><span>LOCAL ONLY</span><span className="h-1 w-1 rounded-full bg-[#B6D700]" /><span>NO API KEY</span></div>
    </div></header>
    <main id="top" className="mx-auto max-w-[1540px] px-5 pb-14 pt-8 md:px-8 md:pt-11">
      <section className="hero-sheet relative overflow-hidden border border-[#1C1D21]/10 bg-[#EEE9DF] p-7 md:p-10"><div className="relative z-10 max-w-3xl"><div className="section-kicker"><span className="counter">01</span> NOTE → INSTRUCTION</div><h1 className="mt-5 font-serif text-4xl font-bold leading-[1.08] tracking-[-0.055em] text-[#1B1D25] md:text-6xl">막 적어도 됩니다.<br /><em className="font-serif font-normal text-[#2563EB]">필요한 지침만</em> 남깁니다.</h1><p className="mt-5 max-w-xl text-[15px] leading-7 text-[#53555A]">내가 쓰는 기능, 업무 습관, 하네스를 자연어로 적으면 서비스별 시작 지침과 재사용 스킬 Markdown으로 압축합니다.</p></div><img src="/manus-storage/prompt-folio-hero_704a7a50.png" alt="흩어진 메모가 정리된 문서로 변환되는 추상 일러스트" className="pointer-events-none absolute -right-12 -top-8 hidden h-full w-[57%] object-cover mix-blend-multiply opacity-80 lg:block" /><div className="relative z-10 mt-8 flex flex-wrap gap-2">{["Claude", "ChatGPT", "Gemini", "Manus", "Perplexity"].map((name) => <span key={name} className="border border-[#1C1D21]/15 bg-[#F7F4ED]/75 px-3 py-1.5 font-mono text-[10px] font-medium tracking-wide text-[#4E5055]">{name}</span>)}</div></section>
      <section className="mt-7 grid gap-7 xl:grid-cols-[minmax(360px,5fr)_minmax(560px,7fr)]"><div className="space-y-5">
        <div className="editor-card p-6 md:p-7"><div className="flex items-start justify-between gap-4"><div><div className="section-kicker"><span className="counter">02</span> RAW NOTES</div><h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">작업 재료를 적어 주세요</h2></div><button onClick={() => { setNotes(EXAMPLE); toast.success("예시를 불러왔습니다."); }} className="inline-flex shrink-0 items-center gap-1.5 border border-[#1C1D21]/15 bg-white px-3 py-2 font-mono text-[10px] font-semibold transition hover:border-[#2563EB] hover:text-[#2563EB] active:scale-[0.97]"><WandSparkles size={13} /> 예시</button></div>
          <label className="mt-7 block"><span className="field-label">문서 이름</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="예: 연구소 업무 보조" className="field-input mt-2" /></label><label className="mt-5 block"><span className="field-label">기능 · 업무 · 말투 · 금지 사항</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="예: 매일 작성하는 보고서, 원하는 답변 방식, 반드시 지킬 기준을 편하게 적어 주세요." className="field-input mt-2 min-h-[238px] resize-y py-3 leading-7" /></label><div className="mt-2 flex justify-between font-mono text-[10px] text-[#888A8C]"><span>문장·불릿 모두 가능</span><span>{notes.length.toLocaleString()} chars</span></div>
        </div>
        <div className="editor-card p-6 md:p-7"><div className="section-kicker"><span className="counter">03</span> COMPILE OPTIONS</div><div className="mt-5 grid gap-6 sm:grid-cols-2"><div><span className="field-label">압축 강도</span><div className="mt-2 grid grid-cols-3 border border-[#1C1D21]/15 p-1">{(["compact", "balanced", "detailed"] as DetailLevel[]).map((item) => <button key={item} onClick={() => setDetail(item)} className={`px-2 py-2 font-mono text-[10px] transition ${detail === item ? "bg-[#1C1D21] text-white" : "text-[#67696C] hover:bg-[#EEE9DF]"}`}>{item === "compact" ? "짧게" : item === "balanced" ? "균형" : "자세히"}</button>)}</div></div><div><span className="field-label">선택 서비스</span><div className="mt-2 flex flex-wrap gap-1.5">{PROVIDERS.map((provider) => <button key={provider.id} onClick={() => toggleProvider(provider.id)} className={`provider-check ${selected.includes(provider.id) ? "is-active" : ""}`} style={{ "--provider": provider.color } as CSSProperties}><span className="check-dot">{selected.includes(provider.id) && <Check size={10} strokeWidth={3} />}</span>{provider.label}</button>)}</div></div></div><button onClick={generate} className="generate-button mt-7 w-full"><Sparkles size={17} /> {selected.length}개 서비스용 Markdown 만들기 <ChevronRight size={17} /></button></div>
      </div>
      <div className="result-card min-h-[680px] overflow-hidden"><div className="result-topbar flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:px-7"><div><div className="section-kicker text-[#ABB7D5]"><span className="counter border-[#ABB7D5]/50 text-[#D7E2FF]">04</span> {hasGenerated ? "COMPILED OUTPUT" : "OUTPUT PREVIEW"}</div><h2 className="mt-2 font-serif text-2xl font-bold tracking-[-0.04em] text-white">{hasGenerated ? "복사하고 바로 사용하세요" : "정리된 문서가 이곳에 표시됩니다"}</h2></div><div className="flex gap-2"><button onClick={copyDocument} className="result-action"><Clipboard size={14} /> {copied ? "복사됨" : "복사"}</button><button onClick={() => downloadText(activeDocument === "start" ? selectedProvider.startFile : selectedProvider.skillFile, document)} className="result-action"><Download size={14} /> .md 저장</button></div></div>
        <div className="border-b border-white/10 bg-[#232A3C] px-5 pt-4 md:px-7"><div className="flex gap-1 overflow-x-auto pb-0">{selectedProviders.map((provider) => <button key={provider.id} onClick={() => setActiveProvider(provider.id)} className={`provider-tab ${activeProvider === provider.id ? "is-current" : ""}`}><span style={{ backgroundColor: provider.color }} />{provider.label}</button>)}</div></div>
        <div className="flex gap-1 border-b border-[#1C1D21]/10 bg-[#F0ECE4] px-5 pt-3 md:px-7"><button onClick={() => setActiveDocument("start")} className={`document-tab ${activeDocument === "start" ? "is-current" : ""}`}><FileText size={14} /> 시작 지침 <span>{selectedProvider.startFile}</span></button><button onClick={() => setActiveDocument("skill")} className={`document-tab ${activeDocument === "skill" ? "is-current" : ""}`}><Layers3 size={14} /> 스킬 <span>{selectedProvider.skillFile}</span></button></div>
        <div className="paper-preview relative"><div className="absolute right-0 top-0 h-9 w-9 border-b border-l border-[#1C1D21]/10 bg-[#E2DDD4] [clip-path:polygon(0_0,100%_100%,100%_0)]" /><div className="flex items-center justify-between border-b border-[#1C1D21]/10 pb-4"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#64666A]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedProvider.color }} /> {activeDocument === "start" ? selectedProvider.startFile : selectedProvider.skillFile}</div><span className="font-mono text-[10px] text-[#8C8E90]">{document.length.toLocaleString()} chars</span></div><pre className="markdown-output">{document}</pre></div>
        <div className="flex flex-col justify-between gap-4 border-t border-[#1C1D21]/10 bg-[#F0ECE4] px-5 py-4 md:flex-row md:items-center md:px-7"><p className="max-w-lg font-mono text-[10px] leading-5 text-[#6A6C70]">권장 파일명입니다. 지원 여부와 관계없이 각 AI 대화의 첫 메시지로 붙여 넣어 사용할 수 있습니다.</p><button onClick={downloadAll} className="inline-flex items-center justify-center gap-2 bg-[#2563EB] px-4 py-2.5 font-mono text-[10px] font-semibold text-white transition hover:bg-[#1D4ED8] active:scale-[0.97]"><FileDown size={14} /> 전체 문서 저장</button></div>
      </div></section>
      <section className="mt-7 grid items-center gap-6 border-y border-[#1C1D21]/10 py-7 md:grid-cols-[1fr_auto]"><div><div className="section-kicker"><span className="counter">WHY THIS WORKS</span></div><p className="mt-3 max-w-2xl text-sm leading-7 text-[#55575B]">개인 메모를 그대로 저장하지 않습니다. 이 페이지 안에서 중복을 줄이고, 목적·원칙·출력 형식으로 분리해 모든 서비스에 맞는 짧은 작업 컨텍스트로 만듭니다.</p></div><img src="/manus-storage/prompt-folio-flow_b36f7674.png" alt="여러 메모를 한 문서로 정리하는 추상 종이 흐름" className="h-24 w-full object-cover mix-blend-multiply md:w-64" /></section>
    </main><footer className="border-t border-[#1C1D21]/10 px-5 py-7 md:px-8"><div className="mx-auto flex max-w-[1540px] flex-col justify-between gap-2 font-mono text-[10px] text-[#77797C] sm:flex-row"><span>Prompt Folio · Client-side Markdown compiler</span><span>INPUT STAYS IN YOUR BROWSER</span></div></footer>
  </div>;
}
