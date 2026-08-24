import { Check, ChevronRight } from "lucide-react";
import { scrollToStep } from "@/shared/lib/dom";

export default function BeginnerGuide({ notesReady, tagsReady, generated, loadExample, makeDocument, revealTagsStep }: { notesReady: boolean; tagsReady: boolean; generated: boolean; loadExample: () => void; makeDocument: () => void; revealTagsStep: () => void }) {
  const steps = [
    { number: "1", title: "메모 적기", description: "AI에게 시킬 일과 원하는 답변 모양을 말하듯 적으세요.", ready: notesReady, action: notesReady ? () => scrollToStep("step-note") : loadExample, actionLabel: notesReady ? "메모 확인" : "예시로 시작" },
    { number: "2", title: "태그 고르기 (선택)", description: "추천 태그를 수락하거나 자주 쓰는 태그 묶음을 적용하세요. 건너뛰어도 됩니다.", ready: tagsReady, action: revealTagsStep, actionLabel: "태그 정리" },
    { number: "3", title: "문서 만들기", description: "버튼 한 번으로 AI용 시작 지침을 만드세요.", ready: generated, action: makeDocument, actionLabel: "문서 만들기" },
    { number: "4", title: "복사·저장", description: "완성된 문서를 복사하거나 Markdown으로 저장해 바로 쓰세요.", ready: generated, action: () => scrollToStep("step-result"), actionLabel: "결과 보기" },
  ];
  const completed = steps.filter((step) => step.ready).length;
  return <section className="beginner-guide mt-7" aria-label="처음 사용하는 분을 위한 4단계 안내"><div className="beginner-guide-head"><div><div className="section-kicker"><span className="counter">START HERE</span> 4-STEP FLOW</div><h2>처음이라면 이 순서만 따라 하세요</h2><p>프롬프트·바이브코딩 용어를 몰라도 됩니다. 메모를 적고, 태그를 고르고, 문서를 만들면 끝입니다.</p></div><span className="guide-progress">{completed}/4 완료</span></div><div className="guide-steps">{steps.map((step) => <div key={step.number} className={`guide-step ${step.ready ? "is-ready" : ""}`}><span className="guide-number">{step.ready ? <Check size={14} strokeWidth={3} /> : step.number}</span><div className="min-w-0 flex-1"><strong>{step.title}</strong><p>{step.description}</p></div><button onClick={step.action}>{step.actionLabel}<ChevronRight size={13} /></button></div>)}</div><p className="guide-note">처음에는 <b>1 → 3 → 4</b>만 해도 충분합니다. 태그·압축·통계는 필요할 때만 사용하세요.</p></section>;
}
