export type PromptSuggestion = { id: string; label: string; detail: string; addition: string };
export type PromptReview = { score: number; checks: { label: string; ready: boolean; hint: string }[]; suggestions: PromptSuggestion[] };
