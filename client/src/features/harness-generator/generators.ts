import type { DetailLevel, Provider, ProviderId } from "./types";

export function inferRules(lines: string[]) {
  const joined = lines.join(" ");
  const rules: string[] = [];
  if (/간결|짧|압축|토큰|효율/.test(joined)) rules.push("불필요한 배경 설명·반복·면책 문구를 제거하고 핵심부터 쓴다.");
  if (/사실|근거|출처|불확실|확인/.test(joined)) rules.push("검증하지 못한 내용은 사실로 단정하지 않고, 가정·확인 항목을 분리한다.");
  if (/표|체크리스트|보고서|문서|마크다운/.test(joined)) rules.push("요청에 맞는 Markdown 표, 체크리스트, 또는 바로 쓸 수 있는 문서 초안을 우선한다.");
  if (/한국어|한글/.test(joined)) rules.push("기본 응답은 자연스럽고 간결한 한국어로 작성한다.");
  if (/투자|법률|의료|세금|안전|위험/.test(joined)) rules.push("고위험 의사결정은 일반 정보와 확인 질문으로 한정하고, 단정적 권고를 피한다.");
  return rules.length ? rules : ["결론을 먼저 제시하고, 필요한 근거와 다음 행동만 남긴다.", "모호한 요청은 최소한의 확인 질문으로 범위를 고정한 뒤 진행한다."];
}

export function compactContext(lines: string[], detail: DetailLevel) {
  const max = detail === "compact" ? 4 : detail === "balanced" ? 7 : 11;
  return lines.slice(0, max).map((item) => item.replace(/[.。]+$/, "").trim());
}

export function createStartDocument(provider: Provider, title: string, lines: string[], detail: DetailLevel) {
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

export function createSkillDocument(provider: Provider, title: string, lines: string[], detail: DetailLevel) {
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
