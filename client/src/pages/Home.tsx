/** Design: Editorial Command Desk — warm paper, cobalt ink, precise editorial hierarchy. */
/** Editorial Command Desk: a calm, paper-like beginner workflow from note to usable prompt. */
import { useDeferredValue, useMemo, useState, type CSSProperties } from "react";
import { Archive, BarChart3, BookmarkPlus, Check, ChevronRight, Clipboard, Cloud, DatabaseBackup, Download, FileDown, FileText, FileUp, FolderOpen, KeyRound, Layers3, Loader2, Moon, Plus, Search, Settings2, Sparkles, Sun, Tag, Target, ThumbsDown, ThumbsUp, Trash2, UserRound, WandSparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

type ProviderId = "claude" | "chatgpt" | "gemini" | "manus" | "perplexity";
type DetailLevel = "compact" | "balanced" | "detailed";
type Provider = { id: ProviderId; label: string; color: string; startFile: string; skillFile: string; focus: string };
type SavedEntry = { id: string; name: string; kind: "profile" | "prompt"; title: string; notes: string; detail: DetailLevel; selected: ProviderId[]; tags: string[]; savedAt: string };
type AiMode = "local" | "cheapai";
type AiModel = "gpt-5.6-sol" | "claude-sonnet-5";
type BackupPayload = { schema: 1; exportedAt: string; library: SavedEntry[]; customTags: string[] };
type TagFeedback = Record<string, { accepted: number; rejected: number }>;
type FeedbackEvent = { tag: string; verdict: "accepted" | "rejected"; at: string };
type ExclusionSettings = { minObservations: number; rejectionRate: number };
type TagGroup = { id: string; name: string; tags: string[] };
type OptimizationIntensity = "moderate" | "strong";
type OptimizationEvent = { at: string; rawTokens: number; optimizedTokens: number; savingsTokens: number; savingsKrw: number; intensity: OptimizationIntensity; tags: string[] };
type OptimizationResult = { text: string; protectedRules: number; mergedSentences: number; removedFillers: number };
type ConflictDecision = "keep-local" | "use-backup" | "merge-tags";
type BackupConflict = { key: string; local: SavedEntry; incoming: SavedEntry };
type BackupPreview = { fileName: string; library: SavedEntry[]; customTags: string[]; newCount: number; updateCount: number; sameCount: number; conflicts: BackupConflict[] };
type PromptTemplate = { id: string; category: string; title: string; summary: string; tags: string[]; notes: string };
type PromptSuggestion = { id: string; label: string; detail: string; addition: string };
type PromptReview = { score: number; checks: { label: string; ready: boolean; hint: string }[]; suggestions: PromptSuggestion[] };

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

const BEGINNER_TEMPLATES: PromptTemplate[] = [
  { id: "report", category: "업무", title: "보고서 초안 도우미", summary: "메모를 구조적인 보고서 초안으로 정리", tags: ["문서작성", "업무자동화"], notes: "당신은 실무 보고서 작성 도우미다. 아래 메모를 제목, 핵심 요약, 본문, 확인할 사항 순서의 간결한 보고서 초안으로 정리해라. 불확실한 내용은 사실처럼 쓰지 말고 [확인 필요]로 표시해라. 결과는 바로 붙여 넣어 쓸 수 있는 한국어 Markdown으로 작성해라." },
  { id: "analysis", category: "분석", title: "데이터 해석 도우미", summary: "숫자·표에서 핵심 변화와 확인 항목 찾기", tags: ["데이터분석", "보고서"], notes: "당신은 데이터 분석 보조자다. 제공한 숫자나 표를 보고 핵심 변화, 가능한 원인, 추가로 확인할 데이터, 다음 행동을 구분해 설명해라. 숫자 근거가 없는 추측은 추측이라고 밝혀라. 복잡한 용어보다 쉬운 한국어와 표·불릿을 우선 사용해라." },
  { id: "research", category: "조사", title: "자료 조사 정리", summary: "신뢰할 자료를 찾아 비교·요약", tags: ["조사", "근거"], notes: "당신은 신중한 자료 조사 도우미다. 질문의 핵심을 먼저 한 줄로 정리하고, 신뢰할 수 있는 출처를 중심으로 사실과 해석을 분리해 요약해라. 출처·발행일·불확실한 점을 함께 적고, 마지막에 추가 확인 질문을 3개 이내로 제안해라." },
  { id: "content", category: "콘텐츠", title: "쉽게 설명하는 콘텐츠 초안", summary: "복잡한 주제를 친절한 대본·글로 풀기", tags: ["콘텐츠", "프롬프트"], notes: "당신은 초보자 친화 콘텐츠 작가다. 제공한 주제를 일상적인 예시로 쉽게 설명해라. 제목, 한 줄 핵심, 3~5개 소제목, 바로 해 볼 행동 순으로 구성하고 과장·공포 조장·확인되지 않은 단정은 피하라. 따뜻하고 간결한 한국어로 작성해라." },
  { id: "meeting", category: "정리", title: "회의 메모 정리", summary: "흩어진 메모를 결정·할 일 중심으로 정리", tags: ["회의", "업무자동화"], notes: "당신은 회의록 정리 도우미다. 아래 메모에서 결정된 사항, 담당자별 할 일, 기한, 아직 정해지지 않은 질문을 분리해라. 담당자나 기한이 없으면 억지로 만들지 말고 [미정]으로 표시해라. 결과는 짧고 확인하기 쉬운 표와 체크리스트로 작성해라." },
];

const LIBRARY_KEY = "prompt-folio-library-v1";
const CUSTOM_TAGS_KEY = "prompt-folio-custom-tags-v1";
const CHEAPAI_KEY_STORAGE = "prompt-folio-cheapai-key-v1";
const CHEAPAI_BASE_URL = "https://api.cheapai.im/v1";
const TAG_FEEDBACK_KEY = "prompt-folio-tag-feedback-v1";
const TAG_FEEDBACK_HISTORY_KEY = "prompt-folio-tag-feedback-history-v1";
const TAG_EXCLUSION_SETTINGS_KEY = "prompt-folio-tag-exclusion-settings-v1";
const TAG_GROUPS_KEY = "prompt-folio-tag-groups-v1";
const OPTIMIZATION_INTENSITY_KEY = "prompt-folio-optimization-intensity-v1";
const OPTIMIZATION_HISTORY_KEY = "prompt-folio-optimization-history-v1";
const ONBOARDING_KEY = "prompt-folio-onboarding-v1";
const DEFAULT_EXCLUSION_SETTINGS: ExclusionSettings = { minObservations: 3, rejectionRate: 70 };
const MODEL_PRICING: Record<AiModel, { input: number; output: number }> = { "gpt-5.6-sol": { input: 7500, output: 45000 }, "claude-sonnet-5": { input: 4500, output: 22500 } };

const TAG_SIGNALS = [
  { tag: "품질관리", terms: ["품질", "qc", "검사", "관리"] }, { tag: "식품", terms: ["식품", "음료", "제조", "원재료"] },
  { tag: "HACCP", terms: ["haccp", "위해", "중요관리"] }, { tag: "FSSC22000", terms: ["fssc", "22000", "iso"] },
  { tag: "미생물", terms: ["미생물", "균", "배양", "실험"] }, { tag: "연구개발", terms: ["연구", "개발", "r&d", "신제품"] },
  { tag: "공정관리", terms: ["공정", "생산", "라인", "공장"] }, { tag: "데이터분석", terms: ["데이터", "분석", "통계", "지표"] },
  { tag: "문서작성", terms: ["문서", "보고서", "기록", "양식"] }, { tag: "업무자동화", terms: ["자동화", "반복", "엑셀", "workflow"] },
  { tag: "경제", terms: ["경제", "금리", "물가", "연금"] }, { tag: "투자", terms: ["투자", "etf", "isa", "irp"] },
  { tag: "콘텐츠", terms: ["콘텐츠", "유튜브", "영상", "대본"] }, { tag: "조사", terms: ["조사", "리서치", "출처", "근거"] },
  { tag: "프롬프트", terms: ["프롬프트", "ai", "llm", "지침"] }, { tag: "마크다운", terms: ["markdown", "마크다운"] },
];

function readLibrary(): SavedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(LIBRARY_KEY) || "[]");
    return Array.isArray(value) ? value.map((item) => ({ ...item, tags: Array.isArray(item.tags) ? item.tags.filter((tag: unknown) => typeof tag === "string") : [] })) : [];
  } catch { return []; }
}

function readCustomTags() {
  if (typeof window === "undefined") return [];
  try { return normalizeTags(String(window.localStorage.getItem(CUSTOM_TAGS_KEY) || "")); } catch { return []; }
}

function readTagGroups(): TagGroup[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(TAG_GROUPS_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is TagGroup => Boolean(item && typeof item.id === "string" && typeof item.name === "string" && Array.isArray(item.tags))).map((item) => ({ ...item, tags: normalizeTags(item.tags.filter((tag): tag is string => typeof tag === "string").join(",")) })).filter((item) => item.name.trim() && item.tags.length) : [];
  } catch { return []; }
}

function readOptimizationIntensity(): OptimizationIntensity {
  if (typeof window === "undefined") return "moderate";
  return window.localStorage.getItem(OPTIMIZATION_INTENSITY_KEY) === "strong" ? "strong" : "moderate";
}

function readOptimizationHistory(): OptimizationEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(OPTIMIZATION_HISTORY_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is OptimizationEvent => Boolean(item && typeof item.at === "string" && typeof item.rawTokens === "number" && typeof item.optimizedTokens === "number" && typeof item.savingsTokens === "number" && typeof item.savingsKrw === "number" && (item.intensity === "moderate" || item.intensity === "strong") && Array.isArray(item.tags))).slice(-300) : [];
  } catch { return []; }
}

function readCheapAiKey() {
  if (typeof window === "undefined") return "";
  try { return window.localStorage.getItem(CHEAPAI_KEY_STORAGE) || ""; } catch { return ""; }
}

function readTagFeedback(): TagFeedback {
  if (typeof window === "undefined") return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(TAG_FEEDBACK_KEY) || "{}");
    return value && typeof value === "object" ? value as TagFeedback : {};
  } catch { return {}; }
}

function readFeedbackHistory(): FeedbackEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(TAG_FEEDBACK_HISTORY_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is FeedbackEvent => Boolean(item && typeof item.tag === "string" && (item.verdict === "accepted" || item.verdict === "rejected") && typeof item.at === "string")).slice(-500) : [];
  } catch { return []; }
}

function readExclusionSettings(): ExclusionSettings {
  if (typeof window === "undefined") return DEFAULT_EXCLUSION_SETTINGS;
  try {
    const value = JSON.parse(window.localStorage.getItem(TAG_EXCLUSION_SETTINGS_KEY) || "{}");
    return { minObservations: Math.max(1, Math.min(20, Number(value?.minObservations) || DEFAULT_EXCLUSION_SETTINGS.minObservations)), rejectionRate: Math.max(1, Math.min(100, Number(value?.rejectionRate) || DEFAULT_EXCLUSION_SETTINGS.rejectionRate)) };
  } catch { return DEFAULT_EXCLUSION_SETTINGS; }
}

function normalizeTags(value: string) {
  return Array.from(new Set(value.split(",").map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean))).slice(0, 8);
}

function isDetailLevel(value: unknown): value is DetailLevel { return value === "compact" || value === "balanced" || value === "detailed"; }
function isProviderId(value: unknown): value is ProviderId { return typeof value === "string" && PROVIDERS.some((provider) => provider.id === value); }

function normalizeEntry(value: unknown): SavedEntry | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<SavedEntry>;
  if (typeof item.name !== "string" || typeof item.title !== "string" || typeof item.notes !== "string" || (item.kind !== "profile" && item.kind !== "prompt")) return null;
  return { id: typeof item.id === "string" ? item.id : `${Date.now()}-${Math.random()}`, name: item.name.trim(), kind: item.kind, title: item.title, notes: item.notes, detail: isDetailLevel(item.detail) ? item.detail : "compact", selected: Array.isArray(item.selected) ? item.selected.filter(isProviderId) : [], tags: Array.isArray(item.tags) ? normalizeTags(item.tags.filter((tag): tag is string => typeof tag === "string").join(",")) : [], savedAt: typeof item.savedAt === "string" ? item.savedAt : new Date().toISOString() };
}

function extractAiTags(content: string) {
  const match = content.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try { const parsed = JSON.parse(match[0]); return Array.isArray(parsed) ? normalizeTags(parsed.filter((tag): tag is string => typeof tag === "string").join(",")) : []; } catch { return []; }
}

function isTagExcluded(tag: string, feedback: TagFeedback, settings: ExclusionSettings) {
  const value = feedback[tag];
  const total = (value?.accepted || 0) + (value?.rejected || 0);
  return total >= settings.minObservations && total > 0 && (((value?.rejected || 0) / total) * 100) >= settings.rejectionRate;
}

function recommendTags(title: string, notes: string, selected: ProviderId[], savedTags: string[], kind: "profile" | "prompt", feedback: TagFeedback, settings: ExclusionSettings) {
  const source = `${title} ${notes}`.toLocaleLowerCase();
  const scores = new Map<string, number>();
  TAG_SIGNALS.forEach(({ tag, terms }) => {
    const score = terms.reduce((sum, term) => sum + (source.includes(term) ? 2 : 0), 0);
    if (score) scores.set(tag, score);
  });
  savedTags.forEach((tag) => { if (source.includes(tag.toLocaleLowerCase())) scores.set(tag, Math.max(scores.get(tag) || 0, 3)); });
  if (selected.length) scores.set("AI도구", Math.max(scores.get("AI도구") || 0, 1));
  scores.set(kind === "profile" ? "프로필" : "재사용", 1);
  return Array.from(scores.entries()).map(([tag, score]) => [tag, score + ((feedback[tag]?.accepted || 0) * 1.5) - ((feedback[tag]?.rejected || 0) * 2)] as const).filter(([tag, score]) => score > -1 && !isTagExcluded(tag, feedback, settings)).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko")).slice(0, 6).map(([tag]) => tag);
}

function normalizeLines(value: string) {
  return value.replace(/\r/g, "").split("\n").map((line) => line.replace(/^\s*[-•*]\s*/, "").trim()).filter(Boolean).filter((line, index, list) => list.indexOf(line) === index).slice(0, 14);
}

function scrollToStep(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function tokenizeForSimilarity(value: string) {
  return new Set(value.toLocaleLowerCase().replace(/[^가-힣a-z0-9\s]/g, " ").split(/\s+/).filter((word) => word.length > 1 && !["그리고", "하지만", "대한", "위해", "있는", "하는", "에서", "으로", "합니다"].includes(word)));
}

function optimizeForCheapAi(value: string, intensity: OptimizationIntensity): OptimizationResult {
  if (!value.trim()) return { text: "", protectedRules: 0, mergedSentences: 0, removedFillers: 0 };
  const criticalPattern = /(반드시|필수|금지|하지\s*마|하지\s*않|제한|주의|안전|위험|사실|근거|출처|HACCP|FSSC|ISO|개인정보|기한|마감|예산|숫자|\d+)/i;
  const filler = intensity === "strong" ? /(정말|매우|좀|가능하면|부탁드립니다|잘|충분히|자세하게|친절하게|기본적으로|일반적으로|가능한 한|되도록|최대한|다음과 같은)/g : /(정말|매우|좀|가능하면|부탁드립니다|잘|충분히|자세하게|친절하게)/g;
  const raw = value.replace(/\r/g, "").split(/[\n.!?]+/).map((line, index) => ({ source: line.replace(/^\s*[-•*]\s*/, "").trim(), index })).filter((item) => item.source);
  let removedFillers = 0;
  const candidates = raw.map(({ source, index }) => {
    const text = source.replace(filler, (match) => { removedFillers += 1; return ""; }).replace(/\s{2,}/g, " ").replace(/\s*([,·])\s*/g, "$1 ").trim();
    const protectedRule = criticalPattern.test(source);
    const priority = (protectedRule ? 100 : 0) + (/(목적|대상|산출물|형식|역할|결론|요약|표|체크리스트|단계|우선)/.test(text) ? 12 : 0) + Math.min(8, Math.ceil(text.length / 35));
    return { text, index, protectedRule, priority, tokens: tokenizeForSimilarity(text) };
  }).filter((item) => item.text);
  const similarity = (left: Set<string>, right: Set<string>) => {
    const shared = Array.from(left).filter((word) => right.has(word)).length;
    return shared / Math.max(1, Math.min(left.size, right.size));
  };
  const ranked = [...candidates].sort((a, b) => b.priority - a.priority || a.index - b.index);
  const selected: typeof candidates = [];
  let mergedSentences = 0;
  const max = intensity === "strong" ? 6 : 10;
  ranked.forEach((candidate) => {
    const exactDuplicate = selected.some((picked) => picked.text === candidate.text);
    const duplicate = exactDuplicate || selected.some((picked) => !candidate.protectedRule && similarity(candidate.tokens, picked.tokens) >= (intensity === "strong" ? 0.56 : 0.72));
    if (duplicate) { mergedSentences += 1; return; }
    if (candidate.protectedRule || selected.length < max) selected.push(candidate);
  });
  const text = selected.sort((a, b) => a.index - b.index).map((item) => item.text.replace(/[.。]+$/, "")).join(intensity === "strong" ? " · " : "\n");
  return { text, protectedRules: selected.filter((item) => item.protectedRule).length, mergedSentences, removedFillers };
}

function reviewPrompt(title: string, notes: string): PromptReview {
  const source = `${title} ${notes}`.toLocaleLowerCase();
  const hasPurpose = notes.trim().length >= 35 && /(작성|정리|분석|조사|설명|만들|도우미|요약|계획|답변)/.test(source);
  const hasAudience = /(대상|독자|사용자|고객|초보|팀원|시청자|담당자)/.test(source);
  const hasFormat = /(표|체크리스트|markdown|마크다운|형식|제목|불릿|단계|순서|목록)/.test(source);
  const hasConstraint = /(반드시|금지|피하|확인|근거|불확실|사실|제한|주의)/.test(source);
  const hasCompletion = /(완성|기준|다음 행동|확인 항목|결론|요약)/.test(source);
  const checks = [
    { label: "무엇을 할지", ready: hasPurpose, hint: "AI에게 시킬 일을 한 문장으로 적어 보세요." },
    { label: "누구를 위한지", ready: hasAudience, hint: "초보자·팀원·고객처럼 대상 독자를 적어 보세요." },
    { label: "결과 모양", ready: hasFormat, hint: "표·체크리스트·3단계처럼 결과 형식을 정해 보세요." },
    { label: "꼭 지킬 기준", ready: hasConstraint, hint: "사실 확인·금지 표현·분량 기준을 적어 보세요." },
    { label: "완료 기준", ready: hasCompletion, hint: "좋은 결과의 기준이나 마지막 확인 항목을 정해 보세요." },
  ];
  const suggestions: PromptSuggestion[] = [];
  if (!hasPurpose) suggestions.push({ id: "purpose", label: "할 일을 더 분명하게", detail: "AI가 시작할 수 있도록 핵심 업무를 한 문장으로 정합니다.", addition: "목적: 아래 내용을 핵심만 빠짐없이 정리해 바로 사용할 수 있는 초안을 만들어라." });
  if (!hasAudience) suggestions.push({ id: "audience", label: "대상을 알려 주세요", detail: "누가 읽는지 알면 말투와 설명 수준이 맞아집니다.", addition: "대상: 이 결과를 처음 보는 초보자도 쉽게 이해할 수 있게 설명해라." });
  if (!hasFormat) suggestions.push({ id: "format", label: "결과 모양을 정해 주세요", detail: "원하는 형식을 미리 정하면 복사해서 쓰기 쉬워집니다.", addition: "출력 형식: 제목, 핵심 요약, 실행 항목 순서의 Markdown으로 작성해라." });
  if (!hasConstraint) suggestions.push({ id: "constraint", label: "지켜야 할 기준을 추가하세요", detail: "틀리면 안 되는 부분과 피할 표현을 알려 주세요.", addition: "기준: 확인하지 못한 내용은 사실처럼 단정하지 말고 [확인 필요]로 표시해라." });
  if (!hasCompletion) suggestions.push({ id: "completion", label: "마지막 확인 항목을 넣어 보세요", detail: "결과의 품질을 스스로 점검할 수 있습니다.", addition: "마지막에 누락 정보와 다음 행동을 3개 이내로 정리해라." });
  return { score: checks.filter((check) => check.ready).length * 20, checks, suggestions: suggestions.slice(0, 3) };
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

function BeginnerGuide({ notesReady, tagsReady, generated, loadExample, makeDocument }: { notesReady: boolean; tagsReady: boolean; generated: boolean; loadExample: () => void; makeDocument: () => void }) {
  const steps = [
    { number: "1", title: "메모 적기", description: "AI에게 시킬 일과 원하는 답변 모양을 말하듯 적으세요.", ready: notesReady, action: notesReady ? () => scrollToStep("step-note") : loadExample, actionLabel: notesReady ? "메모 확인" : "예시로 시작" },
    { number: "2", title: "태그 고르기", description: "추천 태그를 수락하거나 자주 쓰는 태그 묶음을 적용하세요.", ready: tagsReady, action: () => scrollToStep("step-tags"), actionLabel: "태그 정리" },
    { number: "3", title: "문서 만들기", description: "버튼 한 번으로 AI용 시작 지침을 만드세요.", ready: generated, action: makeDocument, actionLabel: "문서 만들기" },
    { number: "4", title: "복사·저장", description: "완성된 문서를 복사하거나 Markdown으로 저장해 바로 쓰세요.", ready: generated, action: () => scrollToStep("step-result"), actionLabel: "결과 보기" },
  ];
  const completed = steps.filter((step) => step.ready).length;
  return <section className="beginner-guide mt-7" aria-label="처음 사용하는 분을 위한 4단계 안내"><div className="beginner-guide-head"><div><div className="section-kicker"><span className="counter">START HERE</span> 4-STEP FLOW</div><h2>처음이라면 이 순서만 따라 하세요</h2><p>프롬프트·바이브코딩 용어를 몰라도 됩니다. 메모를 적고, 태그를 고르고, 문서를 만들면 끝입니다.</p></div><span className="guide-progress">{completed}/4 완료</span></div><div className="guide-steps">{steps.map((step) => <div key={step.number} className={`guide-step ${step.ready ? "is-ready" : ""}`}><span className="guide-number">{step.ready ? <Check size={14} strokeWidth={3} /> : step.number}</span><div className="min-w-0 flex-1"><strong>{step.title}</strong><p>{step.description}</p></div><button onClick={step.action}>{step.actionLabel}<ChevronRight size={13} /></button></div>)}</div><p className="guide-note">처음에는 <b>1 → 3 → 4</b>만 해도 충분합니다. 태그·압축·통계는 필요할 때만 사용하세요.</p></section>;
}

type LibraryPanelProps = {
  saveName: string; setSaveName: (value: string) => void; saveKind: "profile" | "prompt"; setSaveKind: (value: "profile" | "prompt") => void;
  tagInput: string; setTagInput: (value: string) => void; libraryQuery: string; setLibraryQuery: (value: string) => void;
  kindFilter: "all" | "profile" | "prompt"; setKindFilter: (value: "all" | "profile" | "prompt") => void; tagFilter: string; setTagFilter: (value: string) => void;
  allTags: string[]; suggestedTags: string[]; applySuggestedTag: (tag: string) => void; rejectSuggestedTag: (tag: string) => void; filteredLibrary: SavedEntry[]; libraryCount: number; saveToLibrary: () => void; loadFromLibrary: (entry: SavedEntry) => void; deleteFromLibrary: (entry: SavedEntry) => void;
};

function LibraryPanel(props: LibraryPanelProps) {
  const { saveName, setSaveName, saveKind, setSaveKind, tagInput, setTagInput, libraryQuery, setLibraryQuery, kindFilter, setKindFilter, tagFilter, setTagFilter, allTags, suggestedTags, applySuggestedTag, rejectSuggestedTag, filteredLibrary, libraryCount, saveToLibrary, loadFromLibrary, deleteFromLibrary } = props;
  return <div id="step-tags" className="editor-card scroll-mt-24 p-6 md:p-7">
    <div className="flex items-start justify-between gap-4"><div><div className="section-kicker"><span className="counter">03</span> LOCAL LIBRARY</div><h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">자주 쓰는 설정 보관함</h2></div><div className="flex h-8 w-8 items-center justify-center border border-[#1C1D21]/15 bg-white text-[#2563EB]"><Archive size={15} /></div></div>
    <p className="mt-2 text-[12px] leading-5 text-[#66686C]">이 브라우저에만 저장됩니다. 계정이나 서버로 전송하지 않습니다.</p>
    <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_170px_auto]"><input value={saveName} onChange={(event) => setSaveName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveToLibrary(); }} placeholder="예: 식품 QC 프로필" className="field-input" /><div className="grid grid-cols-2 border border-[#1C1D21]/15 p-1"><button onClick={() => setSaveKind("profile")} className={`flex items-center justify-center gap-1 px-2 py-2 font-mono text-[9px] transition ${saveKind === "profile" ? "bg-[#1C1D21] text-white" : "text-[#67696C]"}`}><UserRound size={11} /> 프로필</button><button onClick={() => setSaveKind("prompt")} className={`flex items-center justify-center gap-1 px-2 py-2 font-mono text-[9px] transition ${saveKind === "prompt" ? "bg-[#1C1D21] text-white" : "text-[#67696C]"}`}><FileText size={11} /> 설정</button></div><button onClick={saveToLibrary} className="inline-flex items-center justify-center gap-1.5 bg-[#1C1D21] px-4 py-2.5 font-mono text-[10px] font-semibold text-white transition hover:bg-[#2563EB] active:scale-[0.97]"><BookmarkPlus size={14} /> 저장</button></div>
    <div className="mt-2 flex items-center gap-2 border border-[#1C1D21]/10 bg-white/80 px-3"><Tag size={13} className="shrink-0 text-[#2563EB]" /><input value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveToLibrary(); }} placeholder="태그 입력: 품질관리, 보고서, 투자" className="h-9 min-w-0 flex-1 bg-transparent font-mono text-[10px] outline-none placeholder:text-[#999B9E]" /><span className="font-mono text-[9px] text-[#929497]">쉼표로 구분</span></div>
    <div className="mt-2 border border-[#2563EB]/20 bg-[#EFF4FF]/60 px-3 py-2.5"><div className="flex items-center gap-1.5 font-mono text-[9px] font-semibold tracking-[0.08em] text-[#3564B9]"><Sparkles size={12} /> AI TAG SUGGESTIONS <span className="font-normal tracking-normal text-[#6A7EA9]">수락·거절 이력 반영</span></div><div className="mt-2 flex flex-wrap gap-1.5">{suggestedTags.length ? suggestedTags.map((tag) => <span key={tag} className="inline-flex overflow-hidden border border-[#2563EB]/25 bg-white font-mono text-[9px] text-[#3564B9]"><button onClick={() => applySuggestedTag(tag)} className="px-2 py-1 hover:bg-[#2563EB] hover:text-white">수락 #{tag}</button><button onClick={() => rejectSuggestedTag(tag)} aria-label={`${tag} 거절`} className="border-l border-[#2563EB]/20 px-1.5 text-[#7E91B8] hover:bg-red-50 hover:text-red-600">×</button></span>) : <span className="font-mono text-[9px] text-[#77839B]">메모를 더 입력하면 추천 태그가 표시됩니다.</span>}</div></div>
    <div className="mt-5 border-t border-[#1C1D21]/10 pt-4"><div className="flex flex-col gap-2 sm:flex-row"><div className="flex min-w-0 flex-1 items-center gap-2 border border-[#1C1D21]/15 bg-white px-3"><Search size={14} className="shrink-0 text-[#63666B]" /><input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="이름·내용·태그 검색" className="h-9 min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#999B9E]" />{libraryQuery && <button onClick={() => setLibraryQuery("")} aria-label="검색어 지우기" className="text-[#818388] hover:text-[#1C1D21]"><X size={13} /></button>}</div><div className="grid grid-cols-3 border border-[#1C1D21]/15 p-1 sm:w-[190px]">{(["all", "profile", "prompt"] as const).map((kind) => <button key={kind} onClick={() => setKindFilter(kind)} className={`px-1 py-2 font-mono text-[9px] transition ${kindFilter === kind ? "bg-[#1C1D21] text-white" : "text-[#67696C]"}`}>{kind === "all" ? "전체" : kind === "profile" ? "프로필" : "설정"}</button>)}</div></div><div className="mt-3 flex flex-wrap items-center gap-1.5"><span className="mr-1 font-mono text-[9px] text-[#77797D]">태그</span><button onClick={() => setTagFilter("all")} className={`library-tag ${tagFilter === "all" ? "is-current" : ""}`}>전체</button>{allTags.map((tag) => <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? "all" : tag)} className={`library-tag ${tagFilter === tag ? "is-current" : ""}`}>#{tag}</button>)}</div><div className="mt-3 flex items-center justify-between font-mono text-[9px] text-[#7B7D81]"><span>{libraryCount ? `${filteredLibrary.length} / ${libraryCount}개 항목` : "저장된 항목 없음"}</span>{(libraryQuery || kindFilter !== "all" || tagFilter !== "all") && <button onClick={() => { setLibraryQuery(""); setKindFilter("all"); setTagFilter("all"); }} className="underline underline-offset-2 hover:text-[#2563EB]">필터 초기화</button>}</div>{libraryCount === 0 ? <div className="mt-3 flex items-center gap-2 bg-[#F0ECE4] px-3 py-3 font-mono text-[10px] text-[#77797C]"><FolderOpen size={14} /> 아직 저장된 항목이 없습니다.</div> : filteredLibrary.length === 0 ? <div className="mt-3 flex items-center gap-2 bg-[#F0ECE4] px-3 py-3 font-mono text-[10px] text-[#77797C]"><Search size={14} /> 현재 검색·필터 조건과 일치하는 항목이 없습니다.</div> : <div className="mt-3 space-y-2">{filteredLibrary.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-2 border border-[#1C1D21]/10 bg-white/80 p-2"><button onClick={() => loadFromLibrary(entry)} className="min-w-0 flex-1 text-left"><span className="flex items-center gap-1.5 font-mono text-[9px] text-[#6E7075]">{entry.kind === "profile" ? <UserRound size={11} className="text-[#2563EB]" /> : <FileText size={11} className="text-[#2563EB]" />}{entry.kind === "profile" ? "프로필" : "프롬프트 설정"}</span><span className="mt-1 block truncate text-[12px] font-semibold text-[#292B30]">{entry.name}</span>{entry.tags.length > 0 && <span className="mt-1 flex flex-wrap gap-1">{entry.tags.map((tag) => <span key={tag} className="border border-[#2563EB]/25 bg-[#EFF4FF] px-1.5 py-0.5 font-mono text-[8px] text-[#3265C5]">#{tag}</span>)}</span>}</button><button onClick={() => deleteFromLibrary(entry)} aria-label={`${entry.name} 삭제`} className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#1C1D21]/10 text-[#85878A] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button></div>)}</div>}</div>
  </div>;
}

type AssistantToolsProps = {
  aiMode: AiMode; setAiMode: (mode: AiMode) => void; aiModel: AiModel; setAiModel: (model: AiModel) => void;
  cheapAiKey: string; updateCheapAiKey: (value: string) => void; isSuggesting: boolean; requestAiTags: () => void;
  customTags: string[]; customTagInput: string; setCustomTagInput: (value: string) => void; addCustomTag: () => void; removeCustomTag: (tag: string) => void;
  exportBackup: () => void; prepareBackupImport: (file: File | undefined) => void; backupPreview: BackupPreview | null; backupMode: "merge" | "replace"; setBackupMode: (mode: "merge" | "replace") => void; backupSelected: string[]; setBackupSelected: (ids: string[]) => void; applyBackupImport: () => void;
  estimatedInputTokens: number; estimatedOutputTokens: number; estimatedKrw: number;
};

function AssistantToolsPanel(props: AssistantToolsProps) {
  const { aiMode, setAiMode, aiModel, setAiModel, cheapAiKey, updateCheapAiKey, isSuggesting, requestAiTags, customTags, customTagInput, setCustomTagInput, addCustomTag, removeCustomTag, exportBackup, prepareBackupImport, backupPreview, backupMode, setBackupMode, backupSelected, setBackupSelected, applyBackupImport, estimatedInputTokens, estimatedOutputTokens, estimatedKrw } = props;
  return <div className="editor-card p-6 md:p-7"><div className="flex items-start justify-between gap-4"><div><div className="section-kicker"><span className="counter">04</span> AI & DATA TOOLS</div><h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">추천 · 백업 · 태그 사전</h2></div><div className="flex h-8 w-8 items-center justify-center border border-[#1C1D21]/15 bg-white text-[#2563EB]"><Settings2 size={15} /></div></div>
    <div className="mt-5 border border-[#1C1D21]/10 bg-white/75 p-3"><div className="flex items-center gap-2"><Cloud size={14} className="text-[#2563EB]" /><span className="font-mono text-[10px] font-semibold tracking-[0.08em]">태그 추천 모드</span></div><div className="mt-3 grid grid-cols-2 border border-[#1C1D21]/15 p-1"><button onClick={() => setAiMode("local")} className={`px-2 py-2 font-mono text-[9px] transition ${aiMode === "local" ? "bg-[#1C1D21] text-white" : "text-[#67696C]"}`}>로컬 분석</button><button onClick={() => setAiMode("cheapai")} className={`px-2 py-2 font-mono text-[9px] transition ${aiMode === "cheapai" ? "bg-[#2563EB] text-white" : "text-[#67696C]"}`}>CheapAI 모델</button></div>{aiMode === "local" ? <p className="mt-3 font-mono text-[9px] leading-5 text-[#74767A]">입력을 브라우저 안에서 분석합니다. 외부 전송과 API 키가 필요 없습니다.</p> : <div className="mt-3 space-y-2"><select value={aiModel} onChange={(event) => setAiModel(event.target.value as AiModel)} className="field-input h-9 py-1.5 font-mono text-[10px]"><option value="gpt-5.6-sol">ChatGPT · GPT-5.6 Sol</option><option value="claude-sonnet-5">Claude · Sonnet 5</option></select><div className="grid grid-cols-3 gap-px border border-[#2563EB]/20 bg-[#2563EB]/20 font-mono text-[9px]"><span className="bg-[#EFF4FF] px-2 py-2 text-[#3564B9]">입력 약 {estimatedInputTokens} tok</span><span className="bg-[#EFF4FF] px-2 py-2 text-[#3564B9]">출력 최대 {estimatedOutputTokens} tok</span><span className="bg-[#EFF4FF] px-2 py-2 font-semibold text-[#1D4ED8]">예상 ₩{estimatedKrw.toFixed(2)} · {Math.ceil(estimatedKrw * 10)} cr</span></div><div className="flex items-center gap-2 border border-[#1C1D21]/15 bg-white px-3"><KeyRound size={13} className="shrink-0 text-[#2563EB]" /><input type="password" value={cheapAiKey} onChange={(event) => updateCheapAiKey(event.target.value)} placeholder="csk_... API 키 (이 브라우저에만 저장)" className="h-9 min-w-0 flex-1 bg-transparent font-mono text-[10px] outline-none placeholder:text-[#999B9E]" /></div><button onClick={requestAiTags} disabled={isSuggesting} className="flex w-full items-center justify-center gap-2 bg-[#2563EB] px-3 py-2.5 font-mono text-[10px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60">{isSuggesting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} {isSuggesting ? "AI가 태그 분석 중" : "AI로 태그 다시 추천"}</button><p className="font-mono text-[9px] leading-5 text-[#77797D]">예상 비용은 현재 입력과 최대 출력량 기준이며 실제 차감은 응답 usage 기준입니다.</p></div>}</div>
    <div className="mt-3 border border-[#1C1D21]/10 bg-white/75 p-3"><div className="flex items-center gap-2"><DatabaseBackup size={14} className="text-[#2563EB]" /><span className="font-mono text-[10px] font-semibold tracking-[0.08em]">JSON 백업 · 복원</span></div><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={exportBackup} className="tool-button"><Download size={13} /> 내보내기</button><label className="tool-button"><FileUp size={13} /> 비교 후 가져오기<input type="file" accept="application/json,.json" className="sr-only" onChange={(event) => { void prepareBackupImport(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label></div>{backupPreview ? <div className="mt-3 border border-[#2563EB]/20 bg-[#EFF4FF]/55 p-2.5"><p className="font-mono text-[9px] font-semibold text-[#3564B9]">{backupPreview.fileName} · 신규 {backupPreview.newCount} · 변경 {backupPreview.updateCount} · 동일 {backupPreview.sameCount}</p><div className="mt-2 grid grid-cols-2 border border-[#1C1D21]/15 p-1"><button onClick={() => setBackupMode("merge")} className={`px-2 py-1.5 font-mono text-[9px] ${backupMode === "merge" ? "bg-[#1C1D21] text-white" : "text-[#66686C]"}`}>기존과 병합</button><button onClick={() => setBackupMode("replace")} className={`px-2 py-1.5 font-mono text-[9px] ${backupMode === "replace" ? "bg-[#1C1D21] text-white" : "text-[#66686C]"}`}>선택 항목 교체</button></div><div className="mt-2 max-h-24 space-y-1 overflow-auto">{backupPreview.library.map((entry) => <label key={entry.id} className="flex items-center gap-2 font-mono text-[9px] text-[#55575B]"><input type="checkbox" checked={backupSelected.includes(entry.id)} onChange={() => setBackupSelected(backupSelected.includes(entry.id) ? backupSelected.filter((id) => id !== entry.id) : [...backupSelected, entry.id])} />{entry.kind === "profile" ? "프로필" : "설정"} · {entry.name}</label>)}</div><button onClick={applyBackupImport} className="mt-2 w-full bg-[#2563EB] px-2 py-2 font-mono text-[9px] font-semibold text-white">선택 {backupSelected.length}개 적용</button></div> : <p className="mt-2 font-mono text-[9px] leading-5 text-[#77797D]">파일을 선택하면 신규·변경·동일 항목을 비교하고 복원 방식을 고를 수 있습니다.</p>}</div>
    <div className="mt-3 border border-[#1C1D21]/10 bg-white/75 p-3"><div className="flex items-center gap-2"><Tag size={14} className="text-[#2563EB]" /><span className="font-mono text-[10px] font-semibold tracking-[0.08em]">사용자 정의 태그 사전</span></div><div className="mt-3 flex gap-2"><input value={customTagInput} onChange={(event) => setCustomTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addCustomTag(); }} placeholder="예: 월간보고, 신제품" className="field-input h-9 min-w-0 flex-1 py-1.5 text-[11px]" /><button onClick={addCustomTag} className="inline-flex h-9 items-center gap-1 bg-[#1C1D21] px-3 font-mono text-[10px] font-semibold text-white transition hover:bg-[#2563EB]"><Plus size={13} /> 등록</button></div><div className="mt-3 flex flex-wrap gap-1.5">{customTags.length ? customTags.map((tag) => <span key={tag} className="dictionary-tag">#{tag}<button onClick={() => removeCustomTag(tag)} aria-label={`${tag} 삭제`}><X size={10} /></button></span>) : <span className="font-mono text-[9px] text-[#838589]">등록한 태그는 검색·필터·추천에 함께 반영됩니다.</span>}</div></div>
  </div>;
}

function BackupConflictPanel({ preview, selected, decisions, setDecisions, applyImport }: { preview: BackupPreview | null; selected: string[]; decisions: Record<string, ConflictDecision>; setDecisions: (next: Record<string, ConflictDecision>) => void; applyImport: () => void }) {
  if (!preview) return null;
  return <section className="system-panel"><div className="system-panel-head"><div><div className="section-kicker"><span className="counter">SAFE RESTORE</span> CONFLICT REVIEW</div><h3>적용 전 충돌 확인</h3><p>같은 이름·유형의 항목이 다를 때는 기존 데이터를 기본으로 보호합니다.</p></div><span>{preview.conflicts.length}개 충돌</span></div>{preview.conflicts.length ? <div className="mt-4 space-y-3">{preview.conflicts.map((conflict) => { const active = decisions[conflict.key] || "keep-local"; return <div key={conflict.key} className="conflict-card"><div className="flex items-start justify-between gap-3"><div><strong>{conflict.local.name}</strong><p>{conflict.local.kind === "profile" ? "프로필" : "프롬프트 설정"} · 기존과 백업의 내용이 다릅니다.</p></div><span className="conflict-badge">충돌</span></div><div className="conflict-compare"><div><span>현재 데이터</span><p>{conflict.local.notes.slice(0, 70)}{conflict.local.notes.length > 70 ? "…" : ""}</p></div><div><span>백업 데이터</span><p>{conflict.incoming.notes.slice(0, 70)}{conflict.incoming.notes.length > 70 ? "…" : ""}</p></div></div><div className="mt-3 grid grid-cols-3 gap-1">{(["keep-local", "merge-tags", "use-backup"] as ConflictDecision[]).map((decision) => <button key={decision} onClick={() => setDecisions({ ...decisions, [conflict.key]: decision })} className={`conflict-choice ${active === decision ? "is-current" : ""}`}>{decision === "keep-local" ? "기존 유지" : decision === "merge-tags" ? "태그 병합" : "백업 사용"}</button>)}</div></div>; })}</div> : <div className="mt-4 safe-empty">변경 충돌이 없습니다. 신규 항목만 안전하게 더합니다.</div>}<div className="mt-4 flex flex-col gap-2 border-t border-[#1C1D21]/10 pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="font-mono text-[9px] leading-5 text-[#6F7175]">선택 {selected.length}개 · 신규 {preview.newCount} · 변경 {preview.updateCount} · 동일 {preview.sameCount}</p><button onClick={applyImport} className="safe-apply">선택 내용 안전하게 적용 <ChevronRight size={14} /></button></div></section>;
}

function SystemSettingsDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return <div className="system-overlay" role="dialog" aria-modal="true" aria-label="시스템 설정"><button className="system-backdrop" onClick={onClose} aria-label="설정 닫기" /><aside className="system-drawer"><div className="system-drawer-head"><div><div className="section-kicker"><span className="counter">SYSTEM</span> OPTIONAL TOOLS</div><h2>시스템 설정</h2><p>처음 사용에는 필요하지 않은 고급 기능을 모아 두었습니다.</p></div><button onClick={onClose} className="system-close" aria-label="설정 닫기"><X size={17} /></button></div><div className="system-drawer-body">{children}</div></aside></div>;
}

function HelpTip({ text }: { text: string }) {
  return <span className="help-tip" tabIndex={0} aria-label={`도움말: ${text}`}><span aria-hidden="true">?</span><span className="help-bubble">{text}</span></span>;
}

function OnboardingModal({ open, step, setStep, onFinish }: { open: boolean; step: number; setStep: (step: number) => void; onFinish: () => void }) {
  if (!open) return null;
  const slides = [
    { icon: <WandSparkles size={24} />, label: "1단계 · 메모", title: "완벽하게 쓰지 않아도 됩니다", body: "AI에게 시킬 일, 원하는 결과 모습, 꼭 지킬 기준을 평소 말하듯 적어 주세요. 짧은 메모나 불릿도 괜찮습니다.", note: "막막하면 ‘쉬운 예시’ 버튼을 눌러 내 업무에 맞게 단어만 바꾸세요." },
    { icon: <Tag size={24} />, label: "2단계 · 태그", title: "태그는 나중에 다시 찾기 위한 이름표입니다", body: "추천 태그를 수락하거나 자주 쓰는 태그 묶음을 한 번에 적용하세요. 지금 건너뛰어도 문서는 만들 수 있습니다.", note: "예: HACCP, 보고서, 유튜브, 데이터분석" },
    { icon: <FileText size={24} />, label: "3단계 · 문서 만들기", title: "AI 서비스를 고르고 문서를 만드세요", body: "Claude, ChatGPT 등 필요한 서비스를 선택한 뒤 ‘문서 만들기’를 누르면 시작 지침과 스킬 문서가 정리됩니다.", note: "기본 선택 그대로 만들어도 됩니다." },
    { icon: <Clipboard size={24} />, label: "4단계 · 복사·저장", title: "완성된 문서를 AI 대화 첫 메시지에 붙여넣으세요", body: "복사 버튼으로 바로 사용하거나 Markdown 파일로 저장하세요. 자주 쓰는 문서는 로컬 보관함에 저장할 수 있습니다.", note: "고급 기능은 오른쪽 위 설정에서 필요할 때만 열어 보세요." },
  ];
  const current = slides[step];
  return <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-label="Prompt Folio 처음 사용 안내"><div className="onboarding-card"><button className="onboarding-skip" onClick={onFinish}>건너뛰기</button><div className="onboarding-icon">{current.icon}</div><div className="onboarding-label">{current.label}</div><h2>{current.title}</h2><p>{current.body}</p><div className="onboarding-note">{current.note}</div><div className="onboarding-progress">{slides.map((_, index) => <span key={index} className={index === step ? "is-current" : index < step ? "is-done" : ""} />)}</div><div className="mt-6 flex items-center justify-between gap-3"><button className="onboarding-back" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>이전</button><button className="onboarding-next" onClick={() => step === slides.length - 1 ? onFinish() : setStep(step + 1)}>{step === slides.length - 1 ? "시작하기" : "다음"}<ChevronRight size={15} /></button></div></div></div>;
}

function TemplatePicker({ selectedId, setSelectedId, applyTemplate }: { selectedId: string; setSelectedId: (id: string) => void; applyTemplate: (template: PromptTemplate) => void }) {
  const selected = BEGINNER_TEMPLATES.find((template) => template.id === selectedId) ?? BEGINNER_TEMPLATES[0];
  return <section className="template-picker"><div className="template-picker-head"><div><div className="section-kicker"><span className="counter">START FAST</span> PROMPT STARTER</div><h2>어떤 도움을 받고 싶나요?</h2><p>목적을 고르면 초보자용 문장이 채워집니다. 내 상황에 맞게 한두 줄만 고치면 됩니다.</p></div><div className="template-wand"><WandSparkles size={17} /></div></div><div className="template-grid">{BEGINNER_TEMPLATES.map((template) => <button key={template.id} onClick={() => setSelectedId(template.id)} className={`template-card ${selected.id === template.id ? "is-selected" : ""}`}><span>{template.category}</span><strong>{template.title}</strong><small>{template.summary}</small></button>)}</div><div className="template-preview"><div><span className="font-mono text-[9px] font-semibold tracking-[.08em] text-[#2563EB]">선택한 시작 문구</span><p>{selected.notes}</p><div className="mt-3 flex flex-wrap gap-1.5">{selected.tags.map((tag) => <span key={tag} className="template-tag">#{tag}</span>)}</div></div><button onClick={() => applyTemplate(selected)} className="template-apply">이 템플릿으로 시작 <ChevronRight size={15} /></button></div></section>;
}

function PromptCoachPanel({ review, applySuggestion }: { review: PromptReview; applySuggestion: (suggestion: PromptSuggestion) => void }) {
  const status = review.score >= 80 ? "완성도 높음" : review.score >= 40 ? "조금만 보완" : "시작 문구 보완";
  return <section className="prompt-coach" aria-label="AI 프롬프트 코치"><div className="prompt-coach-head"><div><div className="section-kicker"><span className="counter">AI COACH</span> PROMPT REVIEW</div><h3>AI가 이해하기 쉬운지 점검했어요</h3><p>목적·대상·결과 모양·기준을 확인하고, 필요한 문장만 제안합니다.</p></div><div className="coach-score"><strong>{review.score}</strong><span>/ 100</span><em>{status}</em></div></div><div className="coach-checks">{review.checks.map((check) => <span key={check.label} className={check.ready ? "is-ready" : ""}>{check.ready ? <Check size={11} /> : <span className="coach-dot" />}{check.label}</span>)}</div>{review.suggestions.length ? <div className="mt-4 space-y-2">{review.suggestions.map((suggestion) => <div key={suggestion.id} className="coach-suggestion"><div><strong>{suggestion.label}</strong><p>{suggestion.detail}</p><code>{suggestion.addition}</code></div><button onClick={() => applySuggestion(suggestion)}>문장 추가 <Plus size={13} /></button></div>)}</div> : <div className="coach-success"><Check size={15} /> 필요한 핵심 요소가 담겼습니다. 이제 ‘문서 만들기’를 눌러도 좋습니다.</div>}</section>;
}

function TagGroupsPanel({ groups, name, setName, tags, setTags, saveGroup, applyGroup, deleteGroup }: { groups: TagGroup[]; name: string; setName: (value: string) => void; tags: string; setTags: (value: string) => void; saveGroup: () => void; applyGroup: (group: TagGroup) => void; deleteGroup: (id: string) => void }) {
  return <div className="editor-card p-6 md:p-7"><div className="flex items-start justify-between gap-4"><div><div className="section-kicker"><span className="counter">05</span> TAG GROUPS</div><h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">자주 쓰는 태그 묶음</h2></div><div className="flex h-8 w-8 items-center justify-center border border-[#1C1D21]/15 bg-white text-[#2563EB]"><Layers3 size={15} /></div></div><p className="mt-2 text-[12px] leading-5 text-[#66686C]">업무·프로젝트별 태그를 묶어 두면 현재 입력란에 한 번에 적용할 수 있습니다.</p><div className="mt-5 grid gap-2 sm:grid-cols-[.8fr_1.2fr_auto]"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="예: 식품 QC" className="field-input h-9 py-1.5 text-[11px]" /><input value={tags} onChange={(event) => setTags(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveGroup(); }} placeholder="품질관리, HACCP, 미생물" className="field-input h-9 py-1.5 text-[11px]" /><button onClick={saveGroup} className="inline-flex h-9 items-center justify-center gap-1 bg-[#1C1D21] px-3 font-mono text-[10px] font-semibold text-white transition hover:bg-[#2563EB]"><Plus size={13} /> 그룹 저장</button></div>{groups.length ? <div className="mt-4 space-y-2">{groups.map((group) => <div key={group.id} className="flex items-center justify-between gap-2 border border-[#1C1D21]/10 bg-white/75 p-2"><button onClick={() => applyGroup(group)} className="min-w-0 flex-1 text-left"><span className="block text-[12px] font-semibold text-[#292B30]">{group.name}</span><span className="mt-1 block truncate font-mono text-[9px] text-[#6D6F74]">{group.tags.map((tag) => `#${tag}`).join(" · ")}</span></button><button onClick={() => applyGroup(group)} className="tool-button shrink-0">적용</button><button onClick={() => deleteGroup(group.id)} aria-label={`${group.name} 그룹 삭제`} className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#1C1D21]/10 text-[#85878A] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button></div>)}</div> : <div className="mt-4 border border-dashed border-[#1C1D21]/15 bg-[#F0ECE4] px-3 py-4 font-mono text-[9px] text-[#77797C]">예: “식품 QC”에 품질관리, HACCP, 미생물을 묶어 저장해 보세요.</div>}</div>;
}

function PromptOptimizerPanel({ enabled, setEnabled, rawTokens, optimizedTokens, savingsTokens, savingsKrw, optimizedPreview, protectedRules, mergedSentences, removedFillers, applyOptimization }: { enabled: boolean; setEnabled: (value: boolean) => void; rawTokens: number; optimizedTokens: number; savingsTokens: number; savingsKrw: number; optimizedPreview: string; protectedRules: number; mergedSentences: number; removedFillers: number; applyOptimization: () => void }) {
  const savedRatio = rawTokens ? Math.round((savingsTokens / rawTokens) * 100) : 0;
  return <div id="step-optimize" className="editor-card mobile-deferred scroll-mt-24 p-6 md:p-7"><div className="flex items-start justify-between gap-4"><div><div className="section-kicker"><span className="counter">06</span> CHEAPAI OPTIMIZER</div><h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">전송 전 자동 압축</h2></div><div className="flex h-8 w-8 items-center justify-center border border-[#1C1D21]/15 bg-white text-[#2563EB]"><Sparkles size={15} /></div></div><p className="mt-2 text-[12px] leading-5 text-[#66686C]">핵심 제약은 보호하고, 비슷한 의미의 문장은 합치며, 불필요한 수식어만 줄입니다. 원문은 바꾸지 않습니다.</p><div className="mt-4 flex items-center justify-between border border-[#1C1D21]/10 bg-white/75 p-3"><div><span className="font-mono text-[10px] font-semibold tracking-[0.08em]">자동 최적화</span><p className="mt-1 font-mono text-[9px] text-[#77797C]">CheapAI 모델 모드에서만 API 전송 내용에 적용</p></div><button onClick={() => setEnabled(!enabled)} className={`optimizer-switch ${enabled ? "is-active" : ""}`} aria-label="자동 최적화 전환"><span /></button></div><div className="mt-3 grid grid-cols-3 gap-2"><div className="analytics-metric"><strong>{rawTokens}</strong><span>원문 토큰</span></div><div className="analytics-metric"><strong>{optimizedTokens}</strong><span>최적화 토큰</span></div><div className="analytics-metric"><strong>{savedRatio}%</strong><span>예상 절감률</span></div></div><div className="optimization-insights mt-3"><span>핵심 제약 {protectedRules}</span><span>의미 병합 {mergedSentences}</span><span>수식어 제거 {removedFillers}</span></div><div className="mt-3 flex items-center justify-between border border-[#2563EB]/20 bg-[#EFF4FF]/60 px-3 py-2 font-mono text-[10px] text-[#3564B9]"><span>예상 절감 {savingsTokens} tok · ₩{savingsKrw.toFixed(2)}</span><button onClick={applyOptimization} disabled={!optimizedPreview.trim() || optimizedPreview === ""} className="font-semibold underline underline-offset-2 hover:text-[#1D4ED8] disabled:opacity-40">편집기에 적용</button></div></div>;
}

function OptimizationIntensityPanel({ intensity, setIntensity }: { intensity: OptimizationIntensity; setIntensity: (value: OptimizationIntensity) => void }) {
  return <div className="editor-card p-6 md:p-7"><div className="section-kicker"><span className="counter">07</span> QUALITY CONTROL</div><h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">압축 강도 설정</h2><p className="mt-2 text-[12px] leading-5 text-[#66686C]">보통은 문장 구조를 최대한 보존하고, 강함은 중복·수식어를 더 줄여 CheapAI 입력 토큰을 낮춥니다.</p><div className="mt-5 grid grid-cols-2 border border-[#1C1D21]/15 p-1"><button onClick={() => setIntensity("moderate")} className={`px-3 py-3 text-left transition ${intensity === "moderate" ? "bg-[#1C1D21] text-white" : "text-[#67696C] hover:bg-[#F0ECE4]"}`}><span className="block font-mono text-[10px] font-semibold">보통</span><span className="mt-1 block font-mono text-[9px] leading-4 opacity-75">최대 10개 문장 보존</span></button><button onClick={() => setIntensity("strong")} className={`px-3 py-3 text-left transition ${intensity === "strong" ? "bg-[#2563EB] text-white" : "text-[#67696C] hover:bg-[#EFF4FF]"}`}><span className="block font-mono text-[10px] font-semibold">강함</span><span className="mt-1 block font-mono text-[9px] leading-4 opacity-75">핵심 6개 문장으로 압축</span></button></div><p className="mt-3 font-mono text-[9px] leading-5 text-[#77797C]">선택값은 이 브라우저에 저장되며 CheapAI 태그 추천 요청에 자동 적용됩니다.</p></div>;
}

function WeeklySavingsReport({ history, library }: { history: OptimizationEvent[]; library: SavedEntry[] }) {
  const report = useMemo(() => {
    const start = new Date(); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); return date.toISOString().slice(0, 10); });
    const dailyMap = new Map(days.map((day) => [day, { day, count: 0, tokens: 0, krw: 0 }]));
    const tagCounts = new Map<string, number>(); const recent: OptimizationEvent[] = []; let savingsTokens = 0; let savingsKrw = 0;
    history.forEach((item) => { if (new Date(item.at) < start) return; recent.push(item); savingsTokens += item.savingsTokens; savingsKrw += item.savingsKrw; item.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)); const bucket = dailyMap.get(item.at.slice(0, 10)); if (bucket) { bucket.count += 1; bucket.tokens += item.savingsTokens; bucket.krw += item.savingsKrw; } });
    library.forEach((item) => { if (new Date(item.savedAt) >= start) item.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)); });
    const topTags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko")).slice(0, 5);
    const daily = days.map((day) => dailyMap.get(day)!);
    return { recent, topTags, savingsTokens, savingsKrw, daily, maxDailyTokens: Math.max(1, ...daily.map((item) => item.tokens)), maxTagCount: Math.max(1, ...topTags.map(([, count]) => count)) };
  }, [history, library]);
  const { recent, topTags, savingsTokens, savingsKrw, daily, maxDailyTokens, maxTagCount } = report;
  return <div className="editor-card mobile-deferred p-6 md:p-7"><div className="flex items-start justify-between gap-4"><div><div className="section-kicker"><span className="counter">08</span> WEEKLY REPORT</div><h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">이번 주 태그·비용 절감</h2></div><div className="flex h-8 w-8 items-center justify-center border border-[#1C1D21]/15 bg-white text-[#2563EB]"><BarChart3 size={15} /></div></div><p className="mt-2 text-[12px] leading-5 text-[#66686C]">최근 7일의 저장 프롬프트와 성공한 CheapAI 추천 이력을 열 때마다 자동 집계합니다.</p>{recent.length || topTags.length ? <><div className="weekly-hero mt-5"><span className="font-mono text-[9px] tracking-[0.12em] opacity-75">THIS WEEK SAVED</span><strong>{savingsTokens.toLocaleString()}<em> tok</em></strong><div><span>예상 ₩{savingsKrw.toFixed(2)}</span><span>·</span><span>CheapAI {recent.length}회</span></div></div><div className="mt-3 grid grid-cols-2 gap-2"><div className="analytics-metric"><strong>{recent.length}</strong><span>CheapAI 분석</span></div><div className="analytics-metric"><strong>{topTags.length}</strong><span>활성 태그</span></div></div><div className="mt-4 border border-[#1C1D21]/10 bg-white/75 p-3"><div className="flex items-center justify-between"><span className="font-mono text-[10px] font-semibold tracking-[0.08em]">일별 절감 토큰</span><span className="font-mono text-[9px] text-[#2563EB]">최근 7일</span></div><div className="weekly-chart mt-3" role="img" aria-label="최근 7일 CheapAI 일별 절감 토큰 차트">{daily.map((item) => <div key={item.day} className="weekly-bar"><span className="weekly-bar-value">{item.tokens || "–"}</span><div className="weekly-bar-track"><span className="weekly-bar-fill" style={{ height: `${Math.max(item.tokens ? 12 : 0, (item.tokens / maxDailyTokens) * 100)}%` }} /></div><span className="weekly-bar-label">{item.day.slice(5).replace("-", "/")}</span></div>)}</div><p className="mt-2 font-mono text-[9px] text-[#77797C]">막대를 누적한 값입니다. AI 추천을 성공적으로 실행한 날만 반영됩니다.</p></div><div className="mt-3 border border-[#1C1D21]/10 bg-white/75 p-3"><div className="flex items-center justify-between"><span className="font-mono text-[10px] font-semibold tracking-[0.08em]">가장 많이 사용된 태그</span><span className="font-mono text-[9px] text-[#77797C]">저장·AI 이력 합산</span></div><div className="mt-3 space-y-2">{topTags.map(([tag, count]) => <div key={tag} className="flex items-center gap-2"><span className="w-20 truncate font-mono text-[9px] text-[#4E5055]">#{tag}</span><span className="h-2 flex-1 overflow-hidden bg-[#E7E2D9]"><span className="block h-full bg-[#2563EB]" style={{ width: `${(count / maxTagCount) * 100}%` }} /></span><span className="w-6 text-right font-mono text-[9px] text-[#77797C]">{count}</span></div>)}</div></div></> : <div className="mt-5 border border-dashed border-[#1C1D21]/15 bg-[#F0ECE4] px-4 py-5 font-mono text-[10px] leading-5 text-[#77797C]">CheapAI 추천을 실행하거나 태그를 붙여 프롬프트를 저장하면 이번 주 리포트가 자동으로 채워집니다.</div>}</div>;
}

function TagAnalyticsPanel({ feedback }: { feedback: TagFeedback }) {
  const rows = Object.entries(feedback).map(([tag, value]) => ({ tag, ...value, total: value.accepted + value.rejected })).filter((item) => item.total > 0).sort((a, b) => b.total - a.total || b.accepted - a.accepted).slice(0, 6);
  const accepted = rows.reduce((sum, item) => sum + item.accepted, 0);
  const rejected = rows.reduce((sum, item) => sum + item.rejected, 0);
  const total = accepted + rejected;
  const accuracy = total ? Math.round((accepted / total) * 100) : 0;
  return <div className="editor-card p-6 md:p-7"><div className="flex items-start justify-between gap-4"><div><div className="section-kicker"><span className="counter">05</span> FEEDBACK ANALYTICS</div><h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">태그 추천 정확도</h2></div><div className="flex h-8 w-8 items-center justify-center border border-[#1C1D21]/15 bg-white text-[#2563EB]"><BarChart3 size={15} /></div></div><p className="mt-2 text-[12px] leading-5 text-[#66686C]">수락·거절 기록은 이 브라우저 안에서만 집계되며, 다음 추천 순위에 반영됩니다.</p>{total === 0 ? <div className="mt-5 border border-dashed border-[#1C1D21]/15 bg-[#F0ECE4] px-4 py-5 font-mono text-[10px] leading-5 text-[#77797C]">추천 태그를 수락하거나 거절하면 정확도·선호 태그 통계가 쌓입니다.</div> : <><div className="mt-5 grid grid-cols-3 gap-2"><div className="analytics-metric"><Target size={13} /><strong>{accuracy}%</strong><span>수락률</span></div><div className="analytics-metric"><ThumbsUp size={13} /><strong>{accepted}</strong><span>수락</span></div><div className="analytics-metric"><ThumbsDown size={13} /><strong>{rejected}</strong><span>거절</span></div></div><div className="mt-4 space-y-3">{rows.map((item) => { const rate = Math.round((item.accepted / item.total) * 100); return <div key={item.tag}><div className="flex items-center justify-between font-mono text-[9px]"><span className="font-semibold text-[#4E5055]">#{item.tag}</span><span className="text-[#73757A]">수락 {item.accepted} · 거절 {item.rejected} · {rate}%</span></div><div className="mt-1 h-1.5 overflow-hidden bg-[#E7E2D9]"><div className="h-full bg-[#2563EB]" style={{ width: `${rate}%` }} /></div></div>; })}</div></>}</div>;
}

function FeedbackControlsPanel({ feedback, history, settings, updateSettings, exportAnalytics }: { feedback: TagFeedback; history: FeedbackEvent[]; settings: ExclusionSettings; updateSettings: (next: ExclusionSettings) => void; exportAnalytics: () => void }) {
  const ranked = Object.entries(feedback).map(([tag, value]) => ({ tag, ...value, total: value.accepted + value.rejected })).filter((item) => item.total > 0).sort((a, b) => b.total - a.total || b.rejected - a.rejected);
  const excluded = ranked.filter((item) => isTagExcluded(item.tag, feedback, settings));
  const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); return date.toISOString().slice(0, 10); });
  const trend = days.map((day) => ({ day, accepted: history.filter((event) => event.at.slice(0, 10) === day && event.verdict === "accepted").length, rejected: history.filter((event) => event.at.slice(0, 10) === day && event.verdict === "rejected").length }));
  const trendMax = Math.max(1, ...trend.flatMap((day) => [day.accepted, day.rejected]));
  return <div className="editor-card p-6 md:p-7"><div className="flex items-start justify-between gap-4"><div><div className="section-kicker"><span className="counter">06</span> RECOMMENDATION CONTROLS</div><h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">추천 제어 · 기간별 추이</h2></div><div className="flex h-8 w-8 items-center justify-center border border-[#1C1D21]/15 bg-white text-[#2563EB]"><Target size={15} /></div></div><div className="mt-5 border border-[#1C1D21]/10 bg-white/75 p-3"><div className="flex items-center justify-between gap-3"><div><span className="font-mono text-[10px] font-semibold tracking-[0.08em]">태그별 추천 제외 기준</span><p className="mt-1 font-mono text-[9px] leading-4 text-[#77797C]">관측 수와 거절률을 함께 충족한 태그는 새 추천에서 자동 제외합니다.</p></div><span className="shrink-0 font-mono text-[9px] text-[#2563EB]">{excluded.length}개 제외</span></div><div className="mt-3 grid grid-cols-2 gap-2"><label className="font-mono text-[9px] text-[#6F7175]">최소 관측 수<input type="number" min="1" max="20" value={settings.minObservations} onChange={(event) => updateSettings({ ...settings, minObservations: Math.max(1, Math.min(20, Number(event.target.value) || 1)) })} className="field-input mt-1 h-8 py-1.5 text-[10px]" /></label><label className="font-mono text-[9px] text-[#6F7175]">거절률 (%)<input type="number" min="1" max="100" value={settings.rejectionRate} onChange={(event) => updateSettings({ ...settings, rejectionRate: Math.max(1, Math.min(100, Number(event.target.value) || 1)) })} className="field-input mt-1 h-8 py-1.5 text-[10px]" /></label></div>{excluded.length ? <p className="mt-2 font-mono text-[9px] text-red-600">현재 제외: {excluded.map((item) => `#${item.tag}`).join(" · ")}</p> : <p className="mt-2 font-mono text-[9px] text-[#77797C]">현재 기준에서 자동 제외된 태그가 없습니다.</p>}</div><div className="mt-3 border border-[#1C1D21]/10 bg-white/75 p-3"><div className="flex items-center justify-between gap-3"><div><span className="font-mono text-[10px] font-semibold tracking-[0.08em]">통계 JSON</span><p className="mt-1 font-mono text-[9px] leading-4 text-[#77797C]">피드백·일자별 이력·제외 기준을 백업 파일로 저장합니다.</p></div><button onClick={exportAnalytics} className="tool-button shrink-0"><Download size={13} /> 내보내기</button></div></div><div className="mt-3 border border-[#1C1D21]/10 bg-white/75 p-3"><div className="flex items-center justify-between"><span className="font-mono text-[10px] font-semibold tracking-[0.08em]">최근 7일 피드백 추이</span><span className="font-mono text-[9px] text-[#77797C]">파랑 수락 · 주황 거절</span></div>{history.length ? <div className="mt-3 grid grid-cols-7 gap-1.5">{trend.map((day) => <div key={day.day} className="flex min-w-0 flex-col items-center"><div className="flex h-16 w-full items-end justify-center gap-1 bg-[#F4F1EA] px-1"><span className="w-2 bg-[#2563EB]" style={{ height: `${(day.accepted / trendMax) * 100}%` }} /><span className="w-2 bg-[#D97757]" style={{ height: `${(day.rejected / trendMax) * 100}%` }} /></div><span className="mt-1 font-mono text-[8px] text-[#77797C]">{day.day.slice(5).replace("-", "/")}</span></div>)}</div> : <div className="mt-3 border border-dashed border-[#1C1D21]/15 bg-[#F4F1EA] px-3 py-3 font-mono text-[9px] text-[#77797C]">오늘부터 수락·거절한 피드백의 일자별 변화가 막대 그래프로 표시됩니다.</div>}</div></div>;
}

function TagWordCloudPanel({ library, customTags, feedback }: { library: SavedEntry[]; customTags: string[]; feedback: TagFeedback }) {
  const usage = new Map<string, number>();
  library.flatMap((entry) => entry.tags).forEach((tag) => usage.set(tag, (usage.get(tag) || 0) + 1));
  const tags = Array.from(new Set([...customTags, ...Array.from(usage.keys()), ...Object.keys(feedback)])).map((tag) => {
    const value = feedback[tag];
    const total = (value?.accepted || 0) + (value?.rejected || 0);
    const acceptance = total ? value.accepted / total : null;
    return { tag, uses: usage.get(tag) || 0, acceptance, weight: Math.max(1, (usage.get(tag) || 0) + total) };
  }).sort((a, b) => b.weight - a.weight || a.tag.localeCompare(b.tag, "ko")).slice(0, 18);
  const maxWeight = Math.max(1, ...tags.map((item) => item.weight));
  return <div className="editor-card p-6 md:p-7"><div className="flex items-start justify-between gap-4"><div><div className="section-kicker"><span className="counter">05</span> TAG EFFICIENCY CLOUD</div><h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">태그 사용·효율 워드클라우드</h2></div><div className="flex h-8 w-8 items-center justify-center border border-[#1C1D21]/15 bg-white text-[#2563EB]"><Tag size={15} /></div></div><p className="mt-2 text-[12px] leading-5 text-[#66686C]">글자 크기는 저장·피드백 사용 빈도, 색상은 수락률을 의미합니다. 회색은 아직 수락·거절 데이터가 없는 태그입니다.</p>{tags.length ? <div className="tag-cloud mt-5">{tags.map((item) => { const size = 12 + Math.round((item.weight / maxWeight) * 14); const tone = item.acceptance === null ? "neutral" : item.acceptance >= .7 ? "good" : item.acceptance >= .4 ? "mid" : "low"; const label = `#${item.tag} · 사용 ${item.uses}회${item.acceptance === null ? " · 피드백 없음" : ` · 수락률 ${Math.round(item.acceptance * 100)}%`}`; return <span key={item.tag} title={label} className={`tag-word ${tone}`} style={{ fontSize: `${size}px` }}>{`#${item.tag}`}</span>; })}</div> : <div className="mt-5 border border-dashed border-[#1C1D21]/15 bg-[#F0ECE4] px-4 py-5 font-mono text-[10px] leading-5 text-[#77797C]">태그 사전에 추가하거나 프롬프트를 저장하면 워드클라우드가 채워집니다.</div>}</div>;
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [title, setTitle] = useState("연구소 업무 보조");
  const [notes, setNotes] = useState("");
  const [detail, setDetail] = useState<DetailLevel>("compact");
  const [selected, setSelected] = useState<ProviderId[]>(PROVIDERS.map((provider) => provider.id));
  const [activeProvider, setActiveProvider] = useState<ProviderId>("claude");
  const [activeDocument, setActiveDocument] = useState<"start" | "skill">("start");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [library, setLibrary] = useState<SavedEntry[]>(readLibrary);
  const [saveName, setSaveName] = useState("");
  const [saveKind, setSaveKind] = useState<"profile" | "prompt">("profile");
  const [tagInput, setTagInput] = useState("");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "profile" | "prompt">("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [customTags, setCustomTags] = useState<string[]>(readCustomTags);
  const [customTagInput, setCustomTagInput] = useState("");
  const [tagGroups, setTagGroups] = useState<TagGroup[]>(readTagGroups);
  const [tagGroupName, setTagGroupName] = useState("");
  const [tagGroupInput, setTagGroupInput] = useState("");
  const [aiMode, setAiMode] = useState<AiMode>("local");
  const [aiModel, setAiModel] = useState<AiModel>("gpt-5.6-sol");
  const [optimizeBeforeSend, setOptimizeBeforeSend] = useState(true);
  const [optimizationIntensity, setOptimizationIntensity] = useState<OptimizationIntensity>(readOptimizationIntensity);
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationEvent[]>(readOptimizationHistory);
  const [cheapAiKey, setCheapAiKey] = useState(readCheapAiKey);
  const [remoteSuggestedTags, setRemoteSuggestedTags] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [tagFeedback, setTagFeedback] = useState<TagFeedback>(readTagFeedback);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackEvent[]>(readFeedbackHistory);
  const [exclusionSettings, setExclusionSettings] = useState<ExclusionSettings>(readExclusionSettings);
  const [dismissedTags, setDismissedTags] = useState<string[]>([]);
  const [backupPreview, setBackupPreview] = useState<BackupPreview | null>(null);
  const [backupMode, setBackupMode] = useState<"merge" | "replace">("merge");
  const [backupSelected, setBackupSelected] = useState<string[]>([]);
  const [backupConflictDecisions, setBackupConflictDecisions] = useState<Record<string, ConflictDecision>>({});
  const [systemOpen, setSystemOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(() => typeof window !== "undefined" && window.localStorage.getItem(ONBOARDING_KEY) !== "done");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState(BEGINNER_TEMPLATES[0].id);
  const selectedProviders = PROVIDERS.filter((provider) => selected.includes(provider.id));
  const promptReview = useMemo(() => reviewPrompt(title, notes), [title, notes]);
  const sourceLines = useMemo(() => normalizeLines(notes), [notes]);
  const selectedProvider = PROVIDERS.find((provider) => provider.id === activeProvider) ?? PROVIDERS[0];
  const source = sourceLines.length ? sourceLines : normalizeLines(EXAMPLE);
  const document = activeDocument === "start" ? createStartDocument(selectedProvider, title, source, detail) : createSkillDocument(selectedProvider, title, source, detail);
  const allTags = useMemo(() => Array.from(new Set([...library.flatMap((entry) => entry.tags), ...customTags])).sort((a, b) => a.localeCompare(b, "ko")), [library, customTags]);
  const localSuggestedTags = useMemo(() => recommendTags(title, notes, selected, allTags, saveKind, tagFeedback, exclusionSettings).filter((tag) => !normalizeTags(tagInput).includes(tag)), [title, notes, selected, allTags, saveKind, tagInput, tagFeedback, exclusionSettings]);
  const suggestedTags = (aiMode === "cheapai" && remoteSuggestedTags.length ? remoteSuggestedTags : localSuggestedTags).filter((tag) => !normalizeTags(tagInput).includes(tag) && !dismissedTags.includes(tag) && !isTagExcluded(tag, tagFeedback, exclusionSettings));
  const deferredNotes = useDeferredValue(notes);
  const optimizationResult = useMemo(() => optimizeForCheapAi(deferredNotes, optimizationIntensity), [deferredNotes, optimizationIntensity]);
  const optimizedNotes = optimizationResult.text;
  const rawInputTokens = Math.max(110, Math.ceil((title.length + notes.length + allTags.join(",").length + 420) / 2.5));
  const estimatedInputTokens = Math.max(110, Math.ceil((title.length + (optimizeBeforeSend ? optimizedNotes : notes).length + allTags.join(",").length + 420) / 2.5));
  const estimatedOutputTokens = 160;
  const estimatedKrw = ((estimatedInputTokens * MODEL_PRICING[aiModel].input) + (estimatedOutputTokens * MODEL_PRICING[aiModel].output)) / 1_000_000;
  const estimatedSavingsTokens = Math.max(0, rawInputTokens - estimatedInputTokens);
  const estimatedSavingsKrw = (estimatedSavingsTokens * MODEL_PRICING[aiModel].input) / 1_000_000;
  const filteredLibrary = useMemo(() => {
    const keyword = libraryQuery.trim().toLocaleLowerCase();
    return library.filter((entry) => {
      const searchTarget = [entry.name, entry.title, entry.notes, ...entry.tags].join(" ").toLocaleLowerCase();
      return (kindFilter === "all" || entry.kind === kindFilter) && (tagFilter === "all" || entry.tags.includes(tagFilter)) && (!keyword || searchTarget.includes(keyword));
    });
  }, [library, libraryQuery, kindFilter, tagFilter]);

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

  function loadExample() {
    setNotes(EXAMPLE);
    toast.success("예시를 불러왔습니다.", { description: "내 업무에 맞게 단어만 바꿔도 됩니다." });
    window.setTimeout(() => scrollToStep("top"), 0);
  }

  function finishOnboarding() {
    window.localStorage.setItem(ONBOARDING_KEY, "done");
    setOnboardingOpen(false); setOnboardingStep(0);
  }

  function reopenOnboarding() {
    setOnboardingStep(0); setOnboardingOpen(true);
  }

  function applyTemplate(template: PromptTemplate) {
    setTitle(template.title); setNotes(template.notes); setTagInput(normalizeTags([...normalizeTags(tagInput), ...template.tags].join(",")).join(", "));
    setHasGenerated(false); window.setTimeout(() => scrollToStep("step-note"), 0);
    toast.success(`“${template.title}” 템플릿을 불러왔습니다.`, { description: "메모에서 내 상황에 맞게 한두 줄만 고쳐 보세요." });
  }

  function applyPromptSuggestion(suggestion: PromptSuggestion) {
    if (notes.includes(suggestion.addition)) { toast.message("이 문장은 이미 메모에 들어 있습니다."); return; }
    setNotes([notes.trim(), suggestion.addition].filter(Boolean).join("\n"));
    setHasGenerated(false); toast.success("수정 제안을 메모에 추가했습니다.");
  }

  async function copyDocument() { await navigator.clipboard.writeText(document); setCopied(true); toast.success("Markdown을 복사했습니다."); window.setTimeout(() => setCopied(false), 1600); }
  function downloadAll() {
    const bundle = selectedProviders.flatMap((provider) => [`\n\n<!-- ${provider.startFile} -->\n\n${createStartDocument(provider, title, source, detail)}`, `\n\n<!-- ${provider.skillFile} -->\n\n${createSkillDocument(provider, title, source, detail)}`]).join("\n\n---\n");
    downloadText(`${title.replace(/\s+/g, "-") || "prompt-folio"}-bundle.md`, bundle.trim()); toast.success("통합 Markdown 파일을 저장했습니다.");
  }

  function saveGeneratedPrompt() {
    const entry: SavedEntry = { id: `${Date.now()}`, name: `${title || "새 프롬프트"} · ${selectedProvider.label}`, kind: "prompt", title, notes: document, detail, selected: [selectedProvider.id], tags: normalizeTags(tagInput), savedAt: new Date().toISOString() };
    updateLibrary([entry, ...library]); toast.success("생성 문서를 로컬 보관함에 저장했습니다.");
  }

  async function copyAndOpenStorage(target: "notion" | "drive") {
    await navigator.clipboard.writeText(document);
    window.open(target === "notion" ? "https://www.notion.so/new" : "https://drive.google.com/drive/my-drive", "_blank", "noopener,noreferrer");
    toast.success(`${target === "notion" ? "Notion" : "Google Drive"}를 열고 문서를 복사했습니다. 연결 권한이 없는 정적 사이트에서는 붙여넣기만 직접 진행해 주세요.`);
  }

  function emailGeneratedPrompt() {
    window.location.href = `mailto:?subject=${encodeURIComponent(`${title || "Prompt Folio"} 프롬프트`)}&body=${encodeURIComponent(document)}`;
  }

function updateLibrary(next: SavedEntry[]) {
  setLibrary(next);
  window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
}

function updateCustomTags(next: string[]) {
  const normalized = normalizeTags(next.join(","));
  setCustomTags(normalized);
  window.localStorage.setItem(CUSTOM_TAGS_KEY, normalized.join(","));
}

function updateTagGroups(next: TagGroup[]) {
  setTagGroups(next);
  window.localStorage.setItem(TAG_GROUPS_KEY, JSON.stringify(next));
}

function updateCheapAiKey(value: string) {
  setCheapAiKey(value);
  if (value.trim()) window.localStorage.setItem(CHEAPAI_KEY_STORAGE, value.trim()); else window.localStorage.removeItem(CHEAPAI_KEY_STORAGE);
}

function updateExclusionSettings(next: ExclusionSettings) {
  setExclusionSettings(next);
  window.localStorage.setItem(TAG_EXCLUSION_SETTINGS_KEY, JSON.stringify(next));
}

function updateOptimizationIntensity(next: OptimizationIntensity) {
  setOptimizationIntensity(next);
  window.localStorage.setItem(OPTIMIZATION_INTENSITY_KEY, next);
}

function recordOptimizationEvent() {
  const event: OptimizationEvent = { at: new Date().toISOString(), rawTokens: rawInputTokens, optimizedTokens: estimatedInputTokens, savingsTokens: estimatedSavingsTokens, savingsKrw: estimatedSavingsKrw, intensity: optimizationIntensity, tags: normalizeTags(tagInput) };
  const next = [...optimizationHistory, event].slice(-300);
  setOptimizationHistory(next); window.localStorage.setItem(OPTIMIZATION_HISTORY_KEY, JSON.stringify(next));
}

function applyPromptOptimization() {
  if (!optimizedNotes.trim()) { toast.message("최적화할 메모를 먼저 적어 주세요."); return; }
  if (optimizedNotes === notes) { toast.message("현재 메모는 더 줄일 중복 표현이 없습니다."); return; }
  setNotes(optimizedNotes); toast.success("압축한 메모를 편집기에 적용했습니다.");
}

  function saveToLibrary() {
    const name = saveName.trim();
    if (!name) { toast.message("저장할 항목의 이름을 적어 주세요."); return; }
    if (!notes.trim()) { toast.message("저장할 메모를 먼저 적어 주세요."); return; }
    const entry: SavedEntry = { id: `${Date.now()}`, name, kind: saveKind, title, notes, detail, selected, tags: normalizeTags(tagInput), savedAt: new Date().toISOString() };
    const existing = library.findIndex((item) => item.name === name && item.kind === saveKind);
    const next = existing >= 0 ? library.map((item, index) => index === existing ? entry : item) : [entry, ...library];
    updateLibrary(next); setSaveName(""); setTagInput(""); toast.success(`${saveKind === "profile" ? "프로필" : "프롬프트 설정"}을 저장했습니다.`);
  }

function applySuggestedTag(tag: string) {
  const next = normalizeTags([tagInput, tag].filter(Boolean).join(", "));
  setTagInput(next.join(", "));
  recordTagFeedback(tag, "accepted");
}

function recordTagFeedback(tag: string, verdict: "accepted" | "rejected") {
  const next = { ...tagFeedback, [tag]: { accepted: tagFeedback[tag]?.accepted || 0, rejected: tagFeedback[tag]?.rejected || 0 } };
  next[tag][verdict] += 1;
  const event: FeedbackEvent = { tag, verdict, at: new Date().toISOString() };
  const history = [...feedbackHistory, event].slice(-500);
  setTagFeedback(next); setFeedbackHistory(history); window.localStorage.setItem(TAG_FEEDBACK_KEY, JSON.stringify(next)); window.localStorage.setItem(TAG_FEEDBACK_HISTORY_KEY, JSON.stringify(history));
}

function rejectSuggestedTag(tag: string) {
  recordTagFeedback(tag, "rejected");
  setDismissedTags((current) => [...current, tag]);
}

function addCustomTag() {
  const next = normalizeTags(customTagInput);
  if (!next.length) { toast.message("등록할 태그를 입력해 주세요."); return; }
  updateCustomTags([...customTags, ...next]); setCustomTagInput(""); toast.success("태그 사전에 추가했습니다.");
}

function removeCustomTag(tag: string) {
  updateCustomTags(customTags.filter((item) => item !== tag));
}

function saveTagGroup() {
  const name = tagGroupName.trim();
  const tags = normalizeTags(tagGroupInput);
  if (!name || !tags.length) { toast.message("그룹 이름과 태그를 모두 입력해 주세요."); return; }
  const group: TagGroup = { id: `${Date.now()}`, name, tags };
  const existing = tagGroups.findIndex((item) => item.name === name);
  updateTagGroups(existing >= 0 ? tagGroups.map((item, index) => index === existing ? group : item) : [group, ...tagGroups]);
  updateCustomTags([...customTags, ...tags]); setTagGroupName(""); setTagGroupInput(""); toast.success(`“${name}” 그룹을 저장했습니다.`);
}

function applyTagGroup(group: TagGroup) {
  const next = normalizeTags([tagInput, ...group.tags].filter(Boolean).join(","));
  setTagInput(next.join(", ")); toast.success(`“${group.name}” 태그 ${group.tags.length}개를 적용했습니다.`);
}

function deleteTagGroup(id: string) {
  updateTagGroups(tagGroups.filter((group) => group.id !== id));
}

async function requestAiTags() {
  if (!notes.trim()) { toast.message("추천할 메모를 먼저 적어 주세요."); return; }
  if (!cheapAiKey.trim()) { toast.message("CheapAI API 키를 입력해 주세요."); return; }
  setIsSuggesting(true);
  try {
    const feedbackText = Object.entries(tagFeedback).map(([tag, value]) => `${tag}: 수락 ${value.accepted}, 거절 ${value.rejected}`).join(" | ");
    const promptNotes = optimizeBeforeSend ? optimizedNotes : notes;
    const prompt = `다음 입력을 분석해 저장용 한국어 태그 3~6개를 추천해라. 태그는 짧고 구체적으로, 중복 없이 작성한다. 사용자가 자주 거절한 태그는 피하고 자주 수락한 태그를 우선한다. 설명·코드블록 없이 JSON 문자열 배열만 반환한다.\n\n문서 이름: ${title}\n저장 유형: ${saveKind === "profile" ? "사용자 프로필" : "프롬프트 설정"}\n선택 서비스: ${selected.join(", ")}\n기존 태그: ${allTags.join(", ")}\n태그 피드백: ${feedbackText || "없음"}\n입력 메모:\n${promptNotes}`;
    const response = await fetch(`${CHEAPAI_BASE_URL}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${cheapAiKey.trim()}` }, body: JSON.stringify({ model: aiModel, messages: [{ role: "system", content: "You return only a JSON array of concise Korean tags." }, { role: "user", content: prompt }], temperature: 0.2, max_tokens: 160 }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof data?.error?.message === "string" ? data.error.message : `API 오류 (${response.status})`);
    const tags = extractAiTags(String(data?.choices?.[0]?.message?.content || ""));
    if (!tags.length) throw new Error("태그 배열을 읽지 못했습니다.");
    setRemoteSuggestedTags(tags); recordOptimizationEvent(); toast.success(`${aiModel.startsWith("claude") ? "Claude" : "ChatGPT"}가 ${tags.length}개 태그를 추천했습니다.`);
  } catch (error) { toast.error(error instanceof Error ? error.message : "AI 추천에 실패했습니다.", { description: "브라우저 CORS 또는 API 키·크레딧 상태를 확인해 주세요." }); }
  finally { setIsSuggesting(false); }
}

function exportBackup() {
  const payload: BackupPayload = { schema: 1, exportedAt: new Date().toISOString(), library, customTags };
  downloadText(`prompt-folio-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2));
  toast.success("보관함과 태그 사전을 JSON 파일로 내보냈습니다.");
}

function exportAnalytics() {
  const payload = { schema: 1, exportedAt: new Date().toISOString(), feedback: tagFeedback, feedbackHistory, exclusionSettings };
  downloadText(`prompt-folio-feedback-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2));
  toast.success("태그 추천 통계를 JSON 파일로 내보냈습니다.");
}

async function prepareBackupImport(file: File | undefined) {
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text()) as Partial<BackupPayload>;
    if (payload.schema !== 1 || !Array.isArray(payload.library) || !Array.isArray(payload.customTags)) throw new Error("Prompt Folio 백업 파일 형식이 아닙니다.");
    const importedLibrary = payload.library.map(normalizeEntry).filter((entry): entry is SavedEntry => Boolean(entry));
    const importedTags = normalizeTags(payload.customTags.filter((tag): tag is string => typeof tag === "string").join(","));
    const existing = new Map(library.map((entry) => [`${entry.kind}:${entry.name}`, entry]));
    const newCount = importedLibrary.filter((entry) => !existing.has(`${entry.kind}:${entry.name}`)).length;
    const conflicts = importedLibrary.flatMap((entry) => { const key = `${entry.kind}:${entry.name}`; const current = existing.get(key); return current && JSON.stringify(current) !== JSON.stringify(entry) ? [{ key, local: current, incoming: entry }] : []; });
    const updateCount = conflicts.length;
    const sameCount = importedLibrary.length - newCount - updateCount;
    setBackupPreview({ fileName: file.name, library: importedLibrary, customTags: importedTags, newCount, updateCount, sameCount, conflicts }); setBackupSelected(importedLibrary.map((entry) => entry.id)); setBackupMode("merge"); setBackupConflictDecisions(Object.fromEntries(conflicts.map((conflict) => [conflict.key, "keep-local" as ConflictDecision])));
  } catch (error) { toast.error(error instanceof Error ? error.message : "백업 파일을 읽지 못했습니다."); }
}

function applyBackupImport() {
  if (!backupPreview) return;
  const selectedEntries = backupPreview.library.filter((entry) => backupSelected.includes(entry.id));
  if (backupMode === "replace") { updateLibrary(selectedEntries); updateCustomTags(backupPreview.customTags); }
  else {
    const merged = new Map(library.map((entry) => [`${entry.kind}:${entry.name}`, entry]));
    selectedEntries.forEach((entry) => {
      const key = `${entry.kind}:${entry.name}`; const current = merged.get(key); const decision = backupConflictDecisions[key] || "keep-local";
      if (!current) { merged.set(key, entry); return; }
      if (decision === "use-backup") { merged.set(key, entry); return; }
      if (decision === "merge-tags") merged.set(key, { ...current, tags: normalizeTags([...current.tags, ...entry.tags].join(",")), selected: Array.from(new Set([...current.selected, ...entry.selected])), savedAt: current.savedAt > entry.savedAt ? current.savedAt : entry.savedAt });
    });
    updateLibrary(Array.from(merged.values())); updateCustomTags([...customTags, ...backupPreview.customTags]);
  }
  setBackupPreview(null); setBackupSelected([]); setBackupConflictDecisions({}); setTagFilter("all"); toast.success(`${selectedEntries.length}개 항목을 ${backupMode === "replace" ? "교체" : "안전 병합"}했습니다.`);
}

  function loadFromLibrary(entry: SavedEntry) {
    setTitle(entry.title); setNotes(entry.notes); setDetail(entry.detail); setSelected(entry.selected); setActiveProvider(entry.selected[0] ?? "claude"); setHasGenerated(false);
    toast.success(`“${entry.name}”을 불러왔습니다.`);
  }

  function deleteFromLibrary(entry: SavedEntry) {
    updateLibrary(library.filter((item) => item.id !== entry.id));
    toast.success(`“${entry.name}”을 삭제했습니다.`);
  }

  return <div className="min-h-screen bg-[#F7F4ED] text-[#1C1D21]">
    <header className="sticky top-0 z-30 border-b border-[#1C1D21]/10 bg-[#F7F4ED]/90 backdrop-blur-xl"><div className="mx-auto flex h-[70px] max-w-[1540px] items-center justify-between px-5 md:px-8">
      <a href="#top" className="flex items-center gap-3" aria-label="Prompt Folio 홈"><img src="/manus-storage/prompt-folio-mark_0a786c13.png" alt="Prompt Folio 심볼" className="h-10 w-10 object-contain" /><div><div className="font-serif text-[19px] font-bold leading-none tracking-[-0.04em]">Prompt Folio</div><div className="mt-1 font-mono text-[9px] font-medium tracking-[0.13em] text-[#6F706F]">AI INSTRUCTION EDITOR</div></div></a>
      <div className="flex items-center gap-2 font-mono text-[11px] text-[#6F706F]"><div className="hidden items-center gap-3 sm:flex"><span>LOCAL ONLY</span><span className="h-1 w-1 rounded-full bg-[#B6D700]" /></div><button onClick={reopenOnboarding} className="guide-trigger" aria-label="처음 사용 안내 다시 보기"><span>?</span><span className="hidden sm:inline">가이드</span></button><button onClick={() => setSystemOpen(true)} className="system-trigger" aria-label="시스템 설정 열기"><Settings2 size={14} /><span className="hidden sm:inline">설정</span></button><button onClick={toggleTheme} aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"} className="theme-toggle">{theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}<span className="hidden sm:inline">{theme === "dark" ? "라이트" : "다크"}</span></button></div>
    </div></header>
    <main id="top" className="mx-auto max-w-[1540px] px-5 pb-14 pt-8 md:px-8 md:pt-11">
      <section className="hero-sheet relative overflow-hidden border border-[#1C1D21]/10 bg-[#EEE9DF] p-7 md:p-10"><div className="relative z-10 max-w-3xl"><div className="section-kicker"><span className="counter">01</span> NOTE → INSTRUCTION</div><h1 className="mt-5 font-serif text-4xl font-bold leading-[1.08] tracking-[-0.055em] text-[#1B1D25] md:text-6xl">막 적어도 됩니다.<br /><em className="font-serif font-normal text-[#2563EB]">필요한 지침만</em> 남깁니다.</h1><p className="mt-5 max-w-xl text-[15px] leading-7 text-[#53555A]">내가 쓰는 기능, 업무 습관, 하네스를 자연어로 적으면 서비스별 시작 지침과 재사용 스킬 Markdown으로 압축합니다.</p></div><img src="/manus-storage/prompt-folio-hero_704a7a50.png" alt="흩어진 메모가 정리된 문서로 변환되는 추상 일러스트" className="pointer-events-none absolute -right-12 -top-8 hidden h-full w-[57%] object-cover mix-blend-multiply opacity-80 lg:block" /><div className="relative z-10 mt-8 flex flex-wrap gap-2">{["Claude", "ChatGPT", "Gemini", "Manus", "Perplexity"].map((name) => <span key={name} className="border border-[#1C1D21]/15 bg-[#F7F4ED]/75 px-3 py-1.5 font-mono text-[10px] font-medium tracking-wide text-[#4E5055]">{name}</span>)}</div></section>
      <BeginnerGuide notesReady={Boolean(notes.trim())} tagsReady={Boolean(tagInput.trim())} generated={hasGenerated} loadExample={loadExample} makeDocument={generate} />
      <TemplatePicker selectedId={selectedTemplateId} setSelectedId={setSelectedTemplateId} applyTemplate={applyTemplate} />
      <section className="mt-7 grid gap-7 xl:grid-cols-[minmax(360px,5fr)_minmax(560px,7fr)]"><div className="space-y-5">
        <div id="step-note" className="editor-card scroll-mt-24 p-6 md:p-7"><div className="flex items-start justify-between gap-4"><div><div className="section-kicker"><span className="counter">02</span> RAW NOTES</div><h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">먼저, 원하는 일을 적어 주세요</h2></div><button onClick={loadExample} className="inline-flex shrink-0 items-center gap-1.5 border border-[#1C1D21]/15 bg-white px-3 py-2 font-mono text-[10px] font-semibold transition hover:border-[#2563EB] hover:text-[#2563EB] active:scale-[0.97]"><WandSparkles size={13} /> 쉬운 예시</button></div><p className="beginner-inline-tip">무엇을 만들지, 답변이 어떤 모양이면 좋은지, 꼭 지킬 기준만 적으세요. 문장이 완벽하지 않아도 됩니다.</p>
          <label className="mt-7 block"><span className="field-label">문서 이름 <HelpTip text="나중에 보관함에서 찾기 쉬운 이름입니다. 비워도 됩니다." /></span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="예: 연구소 업무 보조" className="field-input mt-2" /></label><label className="mt-5 block"><span className="field-label">기능 · 업무 · 말투 · 금지 사항 <HelpTip text="AI에게 시킬 일, 원하는 결과, 꼭 지킬 기준을 적어 주세요." /></span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="예: 매일 작성하는 보고서, 원하는 답변 방식, 반드시 지킬 기준을 편하게 적어 주세요." className="field-input mt-2 min-h-[238px] resize-y py-3 leading-7" /></label><div className="mt-2 flex justify-between font-mono text-[10px] text-[#888A8C]"><span>문장·불릿 모두 가능</span><span>{notes.length.toLocaleString()} chars</span></div>
          <PromptCoachPanel review={promptReview} applySuggestion={applyPromptSuggestion} />
        </div>
        <LibraryPanel saveName={saveName} setSaveName={setSaveName} saveKind={saveKind} setSaveKind={setSaveKind} tagInput={tagInput} setTagInput={setTagInput} libraryQuery={libraryQuery} setLibraryQuery={setLibraryQuery} kindFilter={kindFilter} setKindFilter={setKindFilter} tagFilter={tagFilter} setTagFilter={setTagFilter} allTags={allTags} suggestedTags={suggestedTags} applySuggestedTag={applySuggestedTag} rejectSuggestedTag={rejectSuggestedTag} filteredLibrary={filteredLibrary} libraryCount={library.length} saveToLibrary={saveToLibrary} loadFromLibrary={loadFromLibrary} deleteFromLibrary={deleteFromLibrary} />
        <TagGroupsPanel groups={tagGroups} name={tagGroupName} setName={setTagGroupName} tags={tagGroupInput} setTags={setTagGroupInput} saveGroup={saveTagGroup} applyGroup={applyTagGroup} deleteGroup={deleteTagGroup} />
        <div className="advanced-nudge"><span><Settings2 size={14} /> 더 세밀하게 설정하고 싶나요?</span><button onClick={() => setSystemOpen(true)}>시스템 설정 열기 <ChevronRight size={13} /></button></div>
        <div className="editor-card p-6 md:p-7"><div className="section-kicker"><span className="counter">08</span> COMPILE OPTIONS</div><div className="mt-5 grid gap-6 sm:grid-cols-2"><div><span className="field-label">압축 강도</span><div className="mt-2 grid grid-cols-3 border border-[#1C1D21]/15 p-1">{(["compact", "balanced", "detailed"] as DetailLevel[]).map((item) => <button key={item} onClick={() => setDetail(item)} className={`px-2 py-2 font-mono text-[10px] transition ${detail === item ? "bg-[#1C1D21] text-white" : "text-[#67696C] hover:bg-[#EEE9DF]"}`}>{item === "compact" ? "짧게" : item === "balanced" ? "균형" : "자세히"}</button>)}</div></div><div><span className="field-label">선택 서비스</span><div className="mt-2 flex flex-wrap gap-1.5">{PROVIDERS.map((provider) => <button key={provider.id} onClick={() => toggleProvider(provider.id)} className={`provider-check ${selected.includes(provider.id) ? "is-active" : ""}`} style={{ "--provider": provider.color } as CSSProperties}><span className="check-dot">{selected.includes(provider.id) && <Check size={10} strokeWidth={3} />}</span>{provider.label}</button>)}</div></div></div><button onClick={generate} className="generate-button mt-7 w-full"><Sparkles size={17} /> {selected.length}개 서비스용 Markdown 만들기 <ChevronRight size={17} /></button></div>
      </div>
      <div id="step-result" className="result-card scroll-mt-24 min-h-[680px] overflow-hidden"><div className="result-topbar flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:px-7"><div><div className="section-kicker text-[#ABB7D5]"><span className="counter border-[#ABB7D5]/50 text-[#D7E2FF]">04</span> {hasGenerated ? "COMPILED OUTPUT" : "OUTPUT PREVIEW"}</div><h2 className="mt-2 font-serif text-2xl font-bold tracking-[-0.04em] text-white">{hasGenerated ? "복사하고 바로 사용하세요" : "정리된 문서가 이곳에 표시됩니다"} <HelpTip text="복사 버튼을 누른 뒤 선택한 AI 서비스의 새 대화 첫 메시지에 붙여넣으세요." /></h2></div><div className="flex gap-2"><button onClick={copyDocument} className="result-action"><Clipboard size={14} /> {copied ? "복사됨" : "복사"}</button><button onClick={() => downloadText(activeDocument === "start" ? selectedProvider.startFile : selectedProvider.skillFile, document)} className="result-action"><Download size={14} /> .md 저장</button></div></div>
        <div className="border-b border-white/10 bg-[#232A3C] px-5 pt-4 md:px-7"><div className="flex gap-1 overflow-x-auto pb-0">{selectedProviders.map((provider) => <button key={provider.id} onClick={() => setActiveProvider(provider.id)} className={`provider-tab ${activeProvider === provider.id ? "is-current" : ""}`}><span style={{ backgroundColor: provider.color }} />{provider.label}</button>)}</div></div>
        <div className="flex gap-1 border-b border-[#1C1D21]/10 bg-[#F0ECE4] px-5 pt-3 md:px-7"><button onClick={() => setActiveDocument("start")} className={`document-tab ${activeDocument === "start" ? "is-current" : ""}`}><FileText size={14} /> 시작 지침 <span>{selectedProvider.startFile}</span></button><button onClick={() => setActiveDocument("skill")} className={`document-tab ${activeDocument === "skill" ? "is-current" : ""}`}><Layers3 size={14} /> 스킬 <span>{selectedProvider.skillFile}</span></button></div>
        <div className="paper-preview relative"><div className="absolute right-0 top-0 h-9 w-9 border-b border-l border-[#1C1D21]/10 bg-[#E2DDD4] [clip-path:polygon(0_0,100%_100%,100%_0)]" /><div className="flex items-center justify-between border-b border-[#1C1D21]/10 pb-4"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#64666A]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedProvider.color }} /> {activeDocument === "start" ? selectedProvider.startFile : selectedProvider.skillFile}</div><span className="font-mono text-[10px] text-[#8C8E90]">{document.length.toLocaleString()} chars</span></div><pre className="markdown-output">{document}</pre></div>
        <div className="border-t border-[#1C1D21]/10 bg-[#F0ECE4] px-5 py-4 md:px-7"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><p className="max-w-lg font-mono text-[10px] leading-5 text-[#6A6C70]">권장 파일명입니다. 지원 여부와 관계없이 각 AI 대화의 첫 메시지로 붙여 넣어 사용할 수 있습니다.</p><button onClick={downloadAll} className="inline-flex items-center justify-center gap-2 bg-[#2563EB] px-4 py-2.5 font-mono text-[10px] font-semibold text-white transition hover:bg-[#1D4ED8] active:scale-[0.97]"><FileDown size={14} /> 전체 문서 저장</button></div><div className="mt-4 border-t border-[#1C1D21]/10 pt-3"><div className="font-mono text-[9px] font-semibold tracking-[0.08em] text-[#606269]">SAVE THIS PROMPT</div><div className="mt-2 flex flex-wrap gap-2"><button onClick={saveGeneratedPrompt} className="tool-button"><Archive size={13} /> 로컬 보관함</button><button onClick={() => { void copyAndOpenStorage("notion"); }} className="tool-button"><FileText size={13} /> Notion에 복사 후 열기</button><button onClick={() => { void copyAndOpenStorage("drive"); }} className="tool-button"><Cloud size={13} /> Google Drive에 복사 후 열기</button><button onClick={emailGeneratedPrompt} className="tool-button"><FileUp size={13} /> 이메일 작성</button></div></div></div>
      </div></section>
      <section className="mt-7 grid items-center gap-6 border-y border-[#1C1D21]/10 py-7 md:grid-cols-[1fr_auto]"><div><div className="section-kicker"><span className="counter">WHY THIS WORKS</span></div><p className="mt-3 max-w-2xl text-sm leading-7 text-[#55575B]">개인 메모를 그대로 저장하지 않습니다. 이 페이지 안에서 중복을 줄이고, 목적·원칙·출력 형식으로 분리해 모든 서비스에 맞는 짧은 작업 컨텍스트로 만듭니다.</p></div><img src="/manus-storage/prompt-folio-flow_b36f7674.png" alt="여러 메모를 한 문서로 정리하는 추상 종이 흐름" className="h-24 w-full object-cover mix-blend-multiply md:w-64" /></section>
    </main><footer className="border-t border-[#1C1D21]/10 px-5 py-7 md:px-8"><div className="mx-auto flex max-w-[1540px] flex-col justify-between gap-2 font-mono text-[10px] text-[#77797C] sm:flex-row"><span>Prompt Folio · Client-side Markdown compiler</span><span>INPUT STAYS IN YOUR BROWSER</span></div></footer>
    <SystemSettingsDrawer open={systemOpen} onClose={() => setSystemOpen(false)}>
      <p className="system-intro">기본 흐름을 끝낸 뒤 필요한 기능만 열어 보세요. 이 설정은 모두 현재 브라우저 안에만 저장됩니다.</p>
      <AssistantToolsPanel aiMode={aiMode} setAiMode={setAiMode} aiModel={aiModel} setAiModel={setAiModel} cheapAiKey={cheapAiKey} updateCheapAiKey={updateCheapAiKey} isSuggesting={isSuggesting} requestAiTags={requestAiTags} customTags={customTags} customTagInput={customTagInput} setCustomTagInput={setCustomTagInput} addCustomTag={addCustomTag} removeCustomTag={removeCustomTag} exportBackup={exportBackup} prepareBackupImport={prepareBackupImport} backupPreview={backupPreview} backupMode={backupMode} setBackupMode={setBackupMode} backupSelected={backupSelected} setBackupSelected={setBackupSelected} applyBackupImport={applyBackupImport} estimatedInputTokens={estimatedInputTokens} estimatedOutputTokens={estimatedOutputTokens} estimatedKrw={estimatedKrw} />
      <BackupConflictPanel preview={backupPreview} selected={backupSelected} decisions={backupConflictDecisions} setDecisions={setBackupConflictDecisions} applyImport={applyBackupImport} />
      <PromptOptimizerPanel enabled={optimizeBeforeSend} setEnabled={setOptimizeBeforeSend} rawTokens={rawInputTokens} optimizedTokens={estimatedInputTokens} savingsTokens={estimatedSavingsTokens} savingsKrw={estimatedSavingsKrw} optimizedPreview={optimizedNotes} protectedRules={optimizationResult.protectedRules} mergedSentences={optimizationResult.mergedSentences} removedFillers={optimizationResult.removedFillers} applyOptimization={applyPromptOptimization} />
      <OptimizationIntensityPanel intensity={optimizationIntensity} setIntensity={updateOptimizationIntensity} />
      <WeeklySavingsReport history={optimizationHistory} library={library} />
      <TagWordCloudPanel library={library} customTags={customTags} feedback={tagFeedback} />
      <TagAnalyticsPanel feedback={tagFeedback} />
      <FeedbackControlsPanel feedback={tagFeedback} history={feedbackHistory} settings={exclusionSettings} updateSettings={updateExclusionSettings} exportAnalytics={exportAnalytics} />
    </SystemSettingsDrawer>
    <OnboardingModal open={onboardingOpen} step={onboardingStep} setStep={setOnboardingStep} onFinish={finishOnboarding} />
  </div>;
}
