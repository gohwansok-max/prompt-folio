import type { PromptReview, PromptSuggestion } from "./types";

export function reviewPrompt(title: string, notes: string): PromptReview {
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
  return { score: checks.filter((check) => check.ready).length * 20, checks, suggestions };
}
