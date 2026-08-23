import { Tag } from "lucide-react";
import type { SavedEntry } from "@/features/library/types";
import type { TagFeedback } from "../types";

export default function TagWordCloudPanel({ library, customTags, feedback }: { library: SavedEntry[]; customTags: string[]; feedback: TagFeedback }) {
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
