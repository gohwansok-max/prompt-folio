export type AiMode = "local" | "cheapai";
export type AiModel = "gpt-5.6-sol" | "claude-sonnet-5";
export type OptimizationIntensity = "moderate" | "strong";
export type OptimizationEvent = { at: string; rawTokens: number; optimizedTokens: number; savingsTokens: number; savingsKrw: number; intensity: OptimizationIntensity; tags: string[] };
export type OptimizationResult = { text: string; protectedRules: number; mergedSentences: number; removedFillers: number };
