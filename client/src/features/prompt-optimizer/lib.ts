import type { OptimizationIntensity, OptimizationResult } from "./types";

export function tokenizeForSimilarity(value: string) {
  return new Set(value.toLocaleLowerCase().replace(/[^가-힣a-z0-9\s]/g, " ").split(/\s+/).filter((word) => word.length > 1 && !["그리고", "하지만", "대한", "위해", "있는", "하는", "에서", "으로", "합니다"].includes(word)));
}

export function optimizeForCheapAi(value: string, intensity: OptimizationIntensity): OptimizationResult {
  if (!value.trim()) return { text: "", protectedRules: 0, mergedSentences: 0, removedFillers: 0 };
  const criticalPattern = /(반드시|필수|금지|하지\s*마|하지\s*않|제한|주의|안전|위험|사실|근거|출처|HACCP|FSSC|ISO|개인정보|기한|마감|예산|숫자|\d+\s*(%|원|개월|일|주|년|시간|분|건|개|명|이내|이상|이하))/i;
  const filler = intensity === "strong" ? /(정말|매우|좀|가능하면|부탁드립니다|잘|충분히|자세하게|친절하게|기본적으로|일반적으로|가능한 한|되도록|최대한|다음과 같은)/g : /(정말|매우|좀|가능하면|부탁드립니다|잘|충분히|자세하게|친절하게)/g;
  const raw = value.replace(/\r/g, "").split(/[\n.!?]+/).map((line, index) => ({ source: line.replace(/^\s*[-•*]\s*/, "").trim(), index })).filter((item) => item.source);
  let removedFillers = 0;
  const candidates = raw.map(({ source, index }) => {
    const text = source.replace(filler, (match) => { removedFillers += 1; return ""; }).replace(/\s{2,}/g, " ").replace(/\s*([,·])\s*/g, "$1 ").trim();
    const protectedRule = criticalPattern.test(source);
    const priority = (protectedRule ? 100 : 0) + (/(목적|대상|산출물|형식|역할|결론|요약|표|체크리스트|단계|우선)/.test(text) ? 12 : 0) + Math.min(8, Math.ceil(text.length / 35));
    return { text, index, protectedRule, priority, tokens: tokenizeForSimilarity(text) };
  }).filter((item) => item.text);
  const similarity = (left: Set<string>, right: Set<string>) => {
    const shared = Array.from(left).filter((word) => right.has(word)).length;
    return shared / Math.max(1, Math.min(left.size, right.size));
  };
  const ranked = [...candidates].sort((a, b) => b.priority - a.priority || a.index - b.index);
  const selected: typeof candidates = [];
  let mergedSentences = 0;
  const max = intensity === "strong" ? 6 : 10;
  ranked.forEach((candidate) => {
    const exactDuplicate = selected.some((picked) => picked.text === candidate.text);
    const duplicate = exactDuplicate || selected.some((picked) => !candidate.protectedRule && similarity(candidate.tokens, picked.tokens) >= (intensity === "strong" ? 0.56 : 0.72));
    if (duplicate) { mergedSentences += 1; return; }
    // Protected sentences are ranked first (priority +100 above) so they still win the
    // available slots, but the max cap itself always holds -- otherwise a critical-heavy
    // input could blow past the "최대 N개 문장" the UI promises.
    if (selected.length < max) selected.push(candidate);
  });
  const text = selected.sort((a, b) => a.index - b.index).map((item) => item.text.replace(/[.。]+$/, "")).join(intensity === "strong" ? " · " : "\n");
  return { text, protectedRules: selected.filter((item) => item.protectedRule).length, mergedSentences, removedFillers };
}
