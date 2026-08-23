import type { AiModel } from "./types";

export const CHEAPAI_KEY_STORAGE = "prompt-folio-cheapai-key-v1";
export const CHEAPAI_BASE_URL = "https://api.cheapai.im/v1";
export const OPTIMIZATION_INTENSITY_KEY = "prompt-folio-optimization-intensity-v1";
export const OPTIMIZATION_HISTORY_KEY = "prompt-folio-optimization-history-v1";
export const MODEL_PRICING: Record<AiModel, { input: number; output: number }> = { "gpt-5.6-sol": { input: 7500, output: 45000 }, "claude-sonnet-5": { input: 4500, output: 22500 } };
