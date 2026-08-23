import { ChevronRight, WandSparkles } from "lucide-react";
import { BEGINNER_TEMPLATES } from "../constants";
import type { PromptTemplate } from "../types";

export default function TemplatePicker({ selectedId, setSelectedId, applyTemplate }: { selectedId: string; setSelectedId: (id: string) => void; applyTemplate: (template: PromptTemplate) => void }) {
  const selected = BEGINNER_TEMPLATES.find((template) => template.id === selectedId) ?? BEGINNER_TEMPLATES[0];
  return <section className="template-picker"><div className="template-picker-head"><div><div className="section-kicker"><span className="counter">START FAST</span> PROMPT STARTER</div><h2>어떤 도움을 받고 싶나요?</h2><p>목적을 고르면 초보자용 문장이 채워집니다. 내 상황에 맞게 한두 줄만 고치면 됩니다.</p></div><div className="template-wand"><WandSparkles size={17} /></div></div><div className="template-grid">{BEGINNER_TEMPLATES.map((template) => <button key={template.id} onClick={() => setSelectedId(template.id)} className={`template-card ${selected.id === template.id ? "is-selected" : ""}`}><span>{template.category}</span><strong>{template.title}</strong><small>{template.summary}</small></button>)}</div><div className="template-preview"><div><span className="font-mono text-[9px] font-semibold tracking-[.08em] text-[#2563EB]">선택한 시작 문구</span><p>{selected.notes}</p><div className="mt-3 flex flex-wrap gap-1.5">{selected.tags.map((tag) => <span key={tag} className="template-tag">#{tag}</span>)}</div></div><button onClick={() => applyTemplate(selected)} className="template-apply">이 템플릿으로 시작 <ChevronRight size={15} /></button></div></section>;
}
