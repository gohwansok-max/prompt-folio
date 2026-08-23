import type { ExclusionSettings } from "./types";

export const CUSTOM_TAGS_KEY = "prompt-folio-custom-tags-v1";
export const TAG_FEEDBACK_KEY = "prompt-folio-tag-feedback-v1";
export const TAG_FEEDBACK_HISTORY_KEY = "prompt-folio-tag-feedback-history-v1";
export const TAG_EXCLUSION_SETTINGS_KEY = "prompt-folio-tag-exclusion-settings-v1";
export const TAG_GROUPS_KEY = "prompt-folio-tag-groups-v1";
export const DEFAULT_EXCLUSION_SETTINGS: ExclusionSettings = { minObservations: 3, rejectionRate: 70 };

export const TAG_SIGNALS = [
  { tag: "품질관리", terms: ["품질", "qc", "검사", "관리"] }, { tag: "식품", terms: ["식품", "음료", "제조", "원재료"] },
  { tag: "HACCP", terms: ["haccp", "위해", "중요관리"] }, { tag: "FSSC22000", terms: ["fssc", "22000", "iso"] },
  { tag: "미생물", terms: ["미생물", "균", "배양", "실험"] }, { tag: "연구개발", terms: ["연구", "개발", "r&d", "신제품"] },
  { tag: "공정관리", terms: ["공정", "생산", "라인", "공장"] }, { tag: "데이터분석", terms: ["데이터", "분석", "통계", "지표"] },
  { tag: "문서작성", terms: ["문서", "보고서", "기록", "양식"] }, { tag: "업무자동화", terms: ["자동화", "반복", "엑셀", "workflow"] },
  { tag: "경제", terms: ["경제", "금리", "물가", "연금"] }, { tag: "투자", terms: ["투자", "etf", "isa", "irp"] },
  { tag: "콘텐츠", terms: ["콘텐츠", "유튜브", "영상", "대본"] }, { tag: "조사", terms: ["조사", "리서치", "출처", "근거"] },
  { tag: "프롬프트", terms: ["프롬프트", "ai", "llm", "지침"] }, { tag: "마크다운", terms: ["markdown", "마크다운"] },
];
