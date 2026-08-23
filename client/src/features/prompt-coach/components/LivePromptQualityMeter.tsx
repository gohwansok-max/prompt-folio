import { Check } from "lucide-react";
import type { PromptReview } from "../types";

export default function LivePromptQualityMeter({ review, isUpdating }: { review: PromptReview; isUpdating: boolean }) {
  const completed = review.checks.filter((check) => check.ready).length;
  const next = review.suggestions[0];
  const tone = review.score >= 80 ? "ready" : review.score >= 40 ? "building" : "start";
  const label = review.score >= 80 ? "거의 준비됐어요" : review.score >= 40 ? "좋아지고 있어요" : "첫 문장부터 시작해요";
  return <section id="live-quality-status" className={`live-quality ${tone}`} aria-live="polite"><div className="live-quality-head"><div><span className="section-kicker"><span className="counter">LIVE</span> AI QUALITY CHECK</span><h3>실시간 프롬프트 평가</h3><p>{isUpdating ? "입력 내용을 점검하는 중…" : `5가지 기준 중 ${completed}개를 채웠습니다.`}</p></div><div className="live-quality-score"><strong>{review.score}</strong><span>/ 100</span></div></div><div className="live-quality-track" aria-label={`프롬프트 품질 ${review.score}점`}><span style={{ width: `${review.score}%` }} /></div><div className="live-quality-criteria">{review.checks.map((check) => <span key={check.label} className={check.ready ? "is-ready" : ""}>{check.ready ? <Check size={10} strokeWidth={3} /> : <i className="quality-dot" />}{check.label}</span>)}</div><div className="live-quality-next"><span>다음 한 가지</span><strong>{next ? next.label : "이제 문서를 만들어 보세요"}</strong><p>{next ? next.detail : "필요한 내용을 모두 갖췄습니다. 아래 버튼으로 문서를 만들면 됩니다."}</p><em>{label}</em></div></section>;
}
