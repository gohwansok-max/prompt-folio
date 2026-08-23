import { WandSparkles } from "lucide-react";
import type { PromptReview } from "../types";

export default function PromptEnhanceAction({ review, enhance, canUndo, undo }: { review: PromptReview; enhance: () => void; canUndo: boolean; undo: () => void }) {
  if (!review.suggestions.length) return canUndo ? <div className="prompt-enhance-action is-complete"><div><span className="font-mono text-[9px] font-semibold tracking-[.08em] text-[#2563EB]">ONE-CLICK ENHANCE</span><strong>고도화가 적용됐습니다.</strong><p>5가지 핵심 요소를 채웠습니다. 원래 메모가 더 좋다면 바로 되돌릴 수 있습니다.</p></div><div className="prompt-enhance-actions"><button onClick={undo} className="enhance-undo">고도화 되돌리기</button></div></div> : null;
  const expected = Math.min(100, review.score + review.suggestions.length * 20);
  return <div className="prompt-enhance-action"><div><span className="font-mono text-[9px] font-semibold tracking-[.08em] text-[#2563EB]">ONE-CLICK ENHANCE</span><strong>누락한 {review.suggestions.length}가지를 한 번에 보완할까요?</strong><p>현재 메모는 유지하고, 부족한 문장만 맨 아래에 덧붙입니다.</p><span className="enhance-score">예상 점수 {review.score} → {expected}</span></div><div className="prompt-enhance-actions"><button onClick={enhance}><WandSparkles size={14} /> 한 번에 고도화</button>{canUndo && <button onClick={undo} className="enhance-undo">되돌리기</button>}</div></div>;
}
