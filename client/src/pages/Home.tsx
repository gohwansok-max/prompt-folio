/** Design: Editorial Command Desk — warm paper, cobalt ink, precise editorial hierarchy. */
/** Editorial Command Desk: a calm, paper-like beginner workflow from note to usable prompt. */
import { useDeferredValue, useEffect, useMemo, useState, type CSSProperties } from "react";
import { Archive, Check, ChevronRight, Clipboard, Cloud, Download, FileDown, FileText, FileUp, Layers3, Moon, Settings2, Sparkles, Sun, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

import { PROVIDERS, EXAMPLE } from "@/features/harness-generator/constants";
import { createSkillDocument, createStartDocument } from "@/features/harness-generator/generators";
import type { DetailLevel, ProviderId } from "@/features/harness-generator/types";

import BackupConflictPanel from "@/features/library/components/BackupConflictPanel";
import LibraryPanel from "@/features/library/components/LibraryPanel";
import { LIBRARY_KEY, normalizeEntry, readLibrary } from "@/features/library/storage";
import type { BackupPayload, BackupPreview, ConflictDecision, SavedEntry } from "@/features/library/types";

import FeedbackControlsPanel from "@/features/tag-system/components/FeedbackControlsPanel";
import TagAnalyticsPanel from "@/features/tag-system/components/TagAnalyticsPanel";
import TagGroupsPanel from "@/features/tag-system/components/TagGroupsPanel";
import TagWordCloudPanel from "@/features/tag-system/components/TagWordCloudPanel";
import { CUSTOM_TAGS_KEY, TAG_EXCLUSION_SETTINGS_KEY, TAG_FEEDBACK_HISTORY_KEY, TAG_FEEDBACK_KEY, TAG_GROUPS_KEY } from "@/features/tag-system/constants";
import { extractAiTags, isTagExcluded, normalizeTags, recommendTags } from "@/features/tag-system/lib";
import { readCustomTags, readExclusionSettings, readFeedbackHistory, readTagFeedback, readTagGroups } from "@/features/tag-system/storage";
import type { ExclusionSettings, FeedbackEvent, TagFeedback, TagGroup } from "@/features/tag-system/types";

import OptimizationIntensityPanel from "@/features/prompt-optimizer/components/OptimizationIntensityPanel";
import PromptOptimizerPanel from "@/features/prompt-optimizer/components/PromptOptimizerPanel";
import { CHEAPAI_BASE_URL, CHEAPAI_KEY_STORAGE, MODEL_PRICING, OPTIMIZATION_HISTORY_KEY, OPTIMIZATION_INTENSITY_KEY } from "@/features/prompt-optimizer/constants";
import { optimizeForCheapAi } from "@/features/prompt-optimizer/lib";
import { readCheapAiKey, readOptimizationHistory, readOptimizationIntensity } from "@/features/prompt-optimizer/storage";
import type { AiMode, AiModel, OptimizationEvent, OptimizationIntensity } from "@/features/prompt-optimizer/types";

import LivePromptQualityMeter from "@/features/prompt-coach/components/LivePromptQualityMeter";
import PromptCoachPanel from "@/features/prompt-coach/components/PromptCoachPanel";
import PromptEnhanceAction from "@/features/prompt-coach/components/PromptEnhanceAction";
import { reviewPrompt } from "@/features/prompt-coach/lib";
import type { PromptSuggestion } from "@/features/prompt-coach/types";

import WeeklySavingsReport from "@/features/reports/components/WeeklySavingsReport";

import BeginnerGuide from "@/features/onboarding/components/BeginnerGuide";
import GuideNudge from "@/features/onboarding/components/GuideNudge";
import HelpTip from "@/features/onboarding/components/HelpTip";
import OnboardingModal from "@/features/onboarding/components/OnboardingModal";
import TemplatePicker from "@/features/onboarding/components/TemplatePicker";
import { BEGINNER_TEMPLATES, ONBOARDING_KEY } from "@/features/onboarding/constants";
import type { PromptTemplate } from "@/features/onboarding/types";

import AssistantToolsPanel from "@/features/system-settings/components/AssistantToolsPanel";
import SystemSettingsDrawer from "@/features/system-settings/components/SystemSettingsDrawer";

import { downloadText, scrollToStep } from "@/shared/lib/dom";
import { normalizeLines } from "@/shared/lib/text";

import flowImage from "@/assets/prompt-folio-flow.webp";
import heroImage from "@/assets/prompt-folio-hero.webp";
import markImage from "@/assets/prompt-folio-mark.webp";

const ADVANCED_MODE_KEY = "prompt-folio-advanced-mode-v1";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [advancedMode, setAdvancedMode] = useState(() => typeof window !== "undefined" && window.localStorage.getItem(ADVANCED_MODE_KEY) === "on");
  const [showTemplates, setShowTemplates] = useState(false);
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
  const [guideFocus, setGuideFocus] = useState<string | null>(null);
  const [guideMessage, setGuideMessage] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(BEGINNER_TEMPLATES[0].id);
  const [previousNotes, setPreviousNotes] = useState<string | null>(null);
  const selectedProviders = PROVIDERS.filter((provider) => selected.includes(provider.id));
  const deferredNotes = useDeferredValue(notes);
  const promptReview = useMemo(() => reviewPrompt(title, deferredNotes), [title, deferredNotes]);
  const sourceLines = useMemo(() => normalizeLines(notes), [notes]);
  const selectedProvider = PROVIDERS.find((provider) => provider.id === activeProvider) ?? PROVIDERS[0];
  const source = sourceLines.length ? sourceLines : normalizeLines(EXAMPLE);
  const document = activeDocument === "start" ? createStartDocument(selectedProvider, title, source, detail) : createSkillDocument(selectedProvider, title, source, detail);
  const allTags = useMemo(() => Array.from(new Set([...library.flatMap((entry) => entry.tags), ...customTags])).sort((a, b) => a.localeCompare(b, "ko")), [library, customTags]);
  const localSuggestedTags = useMemo(() => recommendTags(title, notes, selected, allTags, saveKind, tagFeedback, exclusionSettings).filter((tag) => !normalizeTags(tagInput).includes(tag)), [title, notes, selected, allTags, saveKind, tagInput, tagFeedback, exclusionSettings]);
  const suggestedTags = (aiMode === "cheapai" && remoteSuggestedTags.length ? remoteSuggestedTags : localSuggestedTags).filter((tag) => !normalizeTags(tagInput).includes(tag) && !dismissedTags.includes(tag) && !isTagExcluded(tag, tagFeedback, exclusionSettings));
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

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => { if (event.key === "Escape" && onboardingOpen) finishOnboarding(); };
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [onboardingOpen]);

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

  function toggleAdvancedMode() {
    setAdvancedMode((current) => {
      const next = !current;
      window.localStorage.setItem(ADVANCED_MODE_KEY, next ? "on" : "off");
      return next;
    });
  }

  function revealTagsStep() {
    if (!advancedMode) { window.localStorage.setItem(ADVANCED_MODE_KEY, "on"); setAdvancedMode(true); }
    window.setTimeout(() => scrollToStep("step-tags"), 30);
  }

  function practiceOnboardingStep(target: string, message: string) {
    finishOnboarding(); setGuideFocus(target); setGuideMessage(message);
    if (target === "step-tags" && !advancedMode) { window.localStorage.setItem(ADVANCED_MODE_KEY, "on"); setAdvancedMode(true); }
    window.setTimeout(() => scrollToStep(target), 30);
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

  function enhancePrompt() {
    const additions = promptReview.suggestions.filter((suggestion) => !notes.includes(suggestion.addition));
    if (!additions.length) { toast.message("추가할 보완 문장이 없습니다."); return; }
    setPreviousNotes(notes);
    setNotes([notes.trim(), ...additions.map((suggestion) => suggestion.addition)].filter(Boolean).join("\n"));
    setHasGenerated(false);
    toast.success(`${additions.length}개 요소를 보완했습니다.`, { description: "원래 문장은 유지했고, 부족한 문장만 추가했습니다." });
  }

  function undoEnhancement() {
    if (previousNotes === null) return;
    setNotes(previousNotes); setPreviousNotes(null); setHasGenerated(false);
    toast.success("고도화 전 메모로 되돌렸습니다.");
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
      <a href="#top" className="flex items-center gap-3" aria-label="Prompt Folio 홈"><img src={markImage} alt="Prompt Folio 심볼" className="h-10 w-10 object-contain" /><div><div className="font-serif text-[19px] font-bold leading-none tracking-[-0.04em]">Prompt Folio</div><div className="mt-1 font-mono text-[9px] font-medium tracking-[0.13em] text-[#6F706F]">AI INSTRUCTION EDITOR</div></div></a>
      <div className="flex items-center gap-2 font-mono text-[11px] text-[#6F706F]"><div className="hidden items-center gap-3 sm:flex"><span>LOCAL ONLY</span><span className="h-1 w-1 rounded-full bg-[#B6D700]" /></div><button onClick={reopenOnboarding} className="guide-trigger" aria-label="처음 사용 안내 다시 보기"><span>?</span><span className="hidden sm:inline">가이드</span></button><button onClick={() => setSystemOpen(true)} className="system-trigger" aria-label="시스템 설정 열기"><Settings2 size={14} /><span className="hidden sm:inline">설정</span></button><button onClick={toggleTheme} aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"} className="theme-toggle">{theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}<span className="hidden sm:inline">{theme === "dark" ? "라이트" : "다크"}</span></button></div>
    </div></header>
    <main id="top" className="mx-auto max-w-[1540px] px-5 pb-14 pt-8 md:px-8 md:pt-11">
      <section className="hero-sheet relative overflow-hidden border border-[#1C1D21]/10 bg-[#EEE9DF] p-7 md:p-10"><div className="relative z-10 max-w-3xl"><div className="section-kicker"><span className="counter">01</span> NOTE → INSTRUCTION</div><h1 className="mt-5 font-serif text-4xl font-bold leading-[1.08] tracking-[-0.055em] text-[#1B1D25] md:text-6xl">막 적어도 됩니다.<br /><em className="font-serif font-normal text-[#2563EB]">필요한 지침만</em> 남깁니다.</h1><p className="mt-5 max-w-xl text-[15px] leading-7 text-[#53555A]">내가 쓰는 기능, 업무 습관, 하네스를 자연어로 적으면 서비스별 시작 지침과 재사용 스킬 Markdown으로 압축합니다.</p></div><img src={heroImage} alt="흩어진 메모가 정리된 문서로 변환되는 추상 일러스트" className="pointer-events-none absolute -right-12 -top-8 hidden h-full w-[57%] object-cover mix-blend-multiply opacity-80 lg:block" /><div className="relative z-10 mt-8 flex flex-wrap gap-2">{["Claude", "ChatGPT", "Gemini", "Manus", "Perplexity"].map((name) => <span key={name} className="border border-[#1C1D21]/15 bg-[#F7F4ED]/75 px-3 py-1.5 font-mono text-[10px] font-medium tracking-wide text-[#4E5055]">{name}</span>)}</div></section>
      <BeginnerGuide notesReady={Boolean(notes.trim())} tagsReady={Boolean(tagInput.trim())} generated={hasGenerated} loadExample={loadExample} makeDocument={generate} revealTagsStep={revealTagsStep} />
      <div className="advanced-nudge mt-5"><span><WandSparkles size={14} /> 처음에는 메모 → 문서 만들기만으로 충분해요. 템플릿이나 태그 그룹 같은 추가 도구는 필요할 때만 열어보세요.</span><div className="flex flex-wrap gap-2"><button onClick={() => setShowTemplates((current) => !current)}>{showTemplates ? "템플릿 접기" : "템플릿 보기"} <ChevronRight size={13} /></button><button onClick={toggleAdvancedMode}>{advancedMode ? "간단 모드로 보기" : "태그 그룹 열기"} <ChevronRight size={13} /></button></div></div>
      {showTemplates && <TemplatePicker selectedId={selectedTemplateId} setSelectedId={setSelectedTemplateId} applyTemplate={applyTemplate} />}
      <section className="mt-7 grid gap-7 xl:grid-cols-[minmax(360px,5fr)_minmax(560px,7fr)]"><div className="space-y-5">
        <div id="step-note" className={`editor-card scroll-mt-24 p-6 md:p-7 ${guideFocus === "step-note" ? "guide-focus" : ""}`}><div className="flex items-start justify-between gap-4"><div><div className="section-kicker"><span className="counter">02</span> RAW NOTES</div><h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">먼저, 원하는 일을 적어 주세요</h2></div><button onClick={loadExample} className="inline-flex shrink-0 items-center gap-1.5 border border-[#1C1D21]/15 bg-white px-3 py-2 font-mono text-[10px] font-semibold transition hover:border-[#2563EB] hover:text-[#2563EB] active:scale-[0.97]"><WandSparkles size={13} /> 쉬운 예시</button></div><p className="beginner-inline-tip">무엇을 만들지, 답변이 어떤 모양이면 좋은지, 꼭 지킬 기준만 적으세요. 문장이 완벽하지 않아도 됩니다.</p>
          <label className="mt-7 block"><span className="field-label">문서 이름 <HelpTip text="나중에 보관함에서 찾기 쉬운 이름입니다. 비워도 됩니다." /></span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="예: 연구소 업무 보조" className="field-input mt-2" /></label><label className="mt-5 block"><span className="field-label">기능 · 업무 · 말투 · 금지 사항 <HelpTip text="AI에게 시킬 일, 원하는 결과, 꼭 지킬 기준을 적어 주세요." /></span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} aria-describedby="live-quality-status" placeholder="예: 매일 작성하는 보고서, 원하는 답변 방식, 반드시 지킬 기준을 편하게 적어 주세요." className="field-input mt-2 min-h-[238px] resize-y py-3 leading-7" /></label><div className="mt-2 flex justify-between font-mono text-[10px] text-[#888A8C]"><span>문장·불릿 모두 가능</span><span>{notes.length.toLocaleString()} chars</span></div>
          <LivePromptQualityMeter review={promptReview} isUpdating={notes !== deferredNotes} />
          <PromptEnhanceAction review={promptReview} enhance={enhancePrompt} canUndo={previousNotes !== null} undo={undoEnhancement} />
          {advancedMode && <PromptCoachPanel review={promptReview} applySuggestion={applyPromptSuggestion} />}
        </div>
        <LibraryPanel saveName={saveName} setSaveName={setSaveName} saveKind={saveKind} setSaveKind={setSaveKind} tagInput={tagInput} setTagInput={setTagInput} libraryQuery={libraryQuery} setLibraryQuery={setLibraryQuery} kindFilter={kindFilter} setKindFilter={setKindFilter} tagFilter={tagFilter} setTagFilter={setTagFilter} allTags={allTags} suggestedTags={suggestedTags} applySuggestedTag={applySuggestedTag} rejectSuggestedTag={rejectSuggestedTag} filteredLibrary={filteredLibrary} libraryCount={library.length} saveToLibrary={saveToLibrary} loadFromLibrary={loadFromLibrary} deleteFromLibrary={deleteFromLibrary} guideFocus={guideFocus === "step-tags"} />
        {advancedMode && <TagGroupsPanel groups={tagGroups} name={tagGroupName} setName={setTagGroupName} tags={tagGroupInput} setTags={setTagGroupInput} saveGroup={saveTagGroup} applyGroup={applyTagGroup} deleteGroup={deleteTagGroup} />}
        <div className="advanced-nudge"><span><Settings2 size={14} /> 더 세밀하게 설정하고 싶나요?</span><button onClick={() => setSystemOpen(true)}>시스템 설정 열기 <ChevronRight size={13} /></button></div>
        <div id="step-create" className={`editor-card scroll-mt-24 p-6 md:p-7 ${guideFocus === "step-create" ? "guide-focus" : ""}`}><div className="section-kicker"><span className="counter">08</span> COMPILE OPTIONS</div><div className="mt-5 grid gap-6 sm:grid-cols-2"><div><span className="field-label">압축 강도</span><div className="mt-2 grid grid-cols-3 border border-[#1C1D21]/15 p-1">{(["compact", "balanced", "detailed"] as DetailLevel[]).map((item) => <button key={item} onClick={() => setDetail(item)} className={`px-2 py-2 font-mono text-[10px] transition ${detail === item ? "bg-[#1C1D21] text-white" : "text-[#67696C] hover:bg-[#EEE9DF]"}`}>{item === "compact" ? "짧게" : item === "balanced" ? "균형" : "자세히"}</button>)}</div></div><div><span className="field-label">선택 서비스</span><div className="mt-2 flex flex-wrap gap-1.5">{PROVIDERS.map((provider) => <button key={provider.id} onClick={() => toggleProvider(provider.id)} className={`provider-check ${selected.includes(provider.id) ? "is-active" : ""}`} style={{ "--provider": provider.color } as CSSProperties}><span className="check-dot">{selected.includes(provider.id) && <Check size={10} strokeWidth={3} />}</span>{provider.label}</button>)}</div></div></div><button onClick={generate} className="generate-button mt-7 w-full"><Sparkles size={17} /> {selected.length}개 서비스용 Markdown 만들기 <ChevronRight size={17} /></button></div>
      </div>
      <div id="step-result" className={`result-card scroll-mt-24 min-h-[680px] overflow-hidden ${guideFocus === "step-result" ? "guide-focus" : ""}`}><div className="result-topbar flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:px-7"><div><div className="section-kicker text-[#ABB7D5]"><span className="counter border-[#ABB7D5]/50 text-[#D7E2FF]">04</span> {hasGenerated ? "COMPILED OUTPUT" : "OUTPUT PREVIEW"}</div><h2 className="mt-2 font-serif text-2xl font-bold tracking-[-0.04em] text-white">{hasGenerated ? "복사하고 바로 사용하세요" : "정리된 문서가 이곳에 표시됩니다"} <HelpTip text="복사 버튼을 누른 뒤 선택한 AI 서비스의 새 대화 첫 메시지에 붙여넣으세요." /></h2></div><div className="flex gap-2"><button onClick={copyDocument} className="result-action"><Clipboard size={14} /> {copied ? "복사됨" : "복사"}</button><button onClick={() => downloadText(activeDocument === "start" ? selectedProvider.startFile : selectedProvider.skillFile, document)} className="result-action"><Download size={14} /> .md 저장</button></div></div>
        <div className="border-b border-white/10 bg-[#232A3C] px-5 pt-4 md:px-7"><div className="flex gap-1 overflow-x-auto pb-0">{selectedProviders.map((provider) => <button key={provider.id} onClick={() => setActiveProvider(provider.id)} className={`provider-tab ${activeProvider === provider.id ? "is-current" : ""}`}><span style={{ backgroundColor: provider.color }} />{provider.label}</button>)}</div></div>
        <div className="flex gap-1 border-b border-[#1C1D21]/10 bg-[#F0ECE4] px-5 pt-3 md:px-7"><button onClick={() => setActiveDocument("start")} className={`document-tab ${activeDocument === "start" ? "is-current" : ""}`}><FileText size={14} /> 시작 지침 <span>{selectedProvider.startFile}</span></button><button onClick={() => setActiveDocument("skill")} className={`document-tab ${activeDocument === "skill" ? "is-current" : ""}`}><Layers3 size={14} /> 스킬 <span>{selectedProvider.skillFile}</span></button></div>
        <div className="paper-preview relative"><div className="absolute right-0 top-0 h-9 w-9 border-b border-l border-[#1C1D21]/10 bg-[#E2DDD4] [clip-path:polygon(0_0,100%_100%,100%_0)]" /><div className="flex items-center justify-between border-b border-[#1C1D21]/10 pb-4"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#64666A]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedProvider.color }} /> {activeDocument === "start" ? selectedProvider.startFile : selectedProvider.skillFile}</div><span className="font-mono text-[10px] text-[#8C8E90]">{document.length.toLocaleString()} chars</span></div><pre className="markdown-output">{document}</pre></div>
        <div className="border-t border-[#1C1D21]/10 bg-[#F0ECE4] px-5 py-4 md:px-7"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><p className="max-w-lg font-mono text-[10px] leading-5 text-[#6A6C70]">권장 파일명입니다. 지원 여부와 관계없이 각 AI 대화의 첫 메시지로 붙여 넣어 사용할 수 있습니다.</p><button onClick={downloadAll} className="inline-flex items-center justify-center gap-2 bg-[#2563EB] px-4 py-2.5 font-mono text-[10px] font-semibold text-white transition hover:bg-[#1D4ED8] active:scale-[0.97]"><FileDown size={14} /> 전체 문서 저장</button></div><div className="mt-4 border-t border-[#1C1D21]/10 pt-3"><div className="font-mono text-[9px] font-semibold tracking-[0.08em] text-[#606269]">SAVE THIS PROMPT</div><div className="mt-2 flex flex-wrap gap-2"><button onClick={saveGeneratedPrompt} className="tool-button"><Archive size={13} /> 로컬 보관함</button><button onClick={() => { void copyAndOpenStorage("notion"); }} className="tool-button"><FileText size={13} /> Notion에 복사 후 열기</button><button onClick={() => { void copyAndOpenStorage("drive"); }} className="tool-button"><Cloud size={13} /> Google Drive에 복사 후 열기</button><button onClick={emailGeneratedPrompt} className="tool-button"><FileUp size={13} /> 이메일 작성</button></div></div></div>
      </div></section>
      <section className="mt-7 grid items-center gap-6 border-y border-[#1C1D21]/10 py-7 md:grid-cols-[1fr_auto]"><div><div className="section-kicker"><span className="counter">WHY THIS WORKS</span></div><p className="mt-3 max-w-2xl text-sm leading-7 text-[#55575B]">개인 메모를 그대로 저장하지 않습니다. 이 페이지 안에서 중복을 줄이고, 목적·원칙·출력 형식으로 분리해 모든 서비스에 맞는 짧은 작업 컨텍스트로 만듭니다.</p></div><img src={flowImage} alt="여러 메모를 한 문서로 정리하는 추상 종이 흐름" className="h-24 w-full object-cover mix-blend-multiply md:w-64" /></section>
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
    <OnboardingModal open={onboardingOpen} step={onboardingStep} setStep={setOnboardingStep} onFinish={finishOnboarding} onPractice={practiceOnboardingStep} />
    {guideFocus && <GuideNudge message={guideMessage} onClose={() => setGuideFocus(null)} />}
  </div>;
}
