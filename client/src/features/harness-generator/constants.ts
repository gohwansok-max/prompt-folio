import type { Provider } from "./types";

export const PROVIDERS: Provider[] = [
  { id: "claude", label: "Claude", color: "#D97757", startFile: "CLAUDE.md", skillFile: "SKILL.md", focus: "명확한 작업 원칙" },
  { id: "chatgpt", label: "ChatGPT", color: "#10A37F", startFile: "chatgpt-start.md", skillFile: "chatgpt-skill.md", focus: "재사용 가능한 대화 지침" },
  { id: "gemini", label: "Gemini", color: "#4285F4", startFile: "GEMINI.md", skillFile: "gemini-skill.md", focus: "목표와 산출물 우선" },
  { id: "manus", label: "Manus", color: "#2563EB", startFile: "MANUS.md", skillFile: "manus-skill.md", focus: "실행 가능한 작업 흐름" },
  { id: "perplexity", label: "Perplexity", color: "#20808D", startFile: "perplexity-start.md", skillFile: "perplexity-research-skill.md", focus: "근거 중심 조사" },
];

export const EXAMPLE = `나는 식품 제조 기업부설연구소에서 HACCP·FSSC22000 문서, 미생물 검사 기록, 공정 데이터 분석을 담당한다.
AI에게는 업무 초안을 짧고 구조적으로 정리해 달라고 요청한다. 불확실한 내용은 사실처럼 쓰지 말고, 필요한 전제와 확인 항목을 분리해라.
결과는 바로 붙여 넣어 쓸 수 있는 표·체크리스트·보고서 문장으로 만들고, 설명은 한국어로 간결하게 작성해라.
투자나 법률 조언처럼 위험한 의사결정은 일반 정보와 확인 질문만 제공해라.`;
