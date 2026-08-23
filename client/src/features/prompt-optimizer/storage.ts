import { CHEAPAI_KEY_STORAGE, OPTIMIZATION_HISTORY_KEY, OPTIMIZATION_INTENSITY_KEY } from "./constants";
import type { OptimizationEvent, OptimizationIntensity } from "./types";

export function readOptimizationIntensity(): OptimizationIntensity {
  if (typeof window === "undefined") return "moderate";
  return window.localStorage.getItem(OPTIMIZATION_INTENSITY_KEY) === "strong" ? "strong" : "moderate";
}

export function readOptimizationHistory(): OptimizationEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(OPTIMIZATION_HISTORY_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is OptimizationEvent => Boolean(item && typeof item.at === "string" && typeof item.rawTokens === "number" && typeof item.optimizedTokens === "number" && typeof item.savingsTokens === "number" && typeof item.savingsKrw === "number" && (item.intensity === "moderate" || item.intensity === "strong") && Array.isArray(item.tags))).slice(-300) : [];
  } catch { return []; }
}

export function readCheapAiKey() {
  if (typeof window === "undefined") return "";
  try { return window.localStorage.getItem(CHEAPAI_KEY_STORAGE) || ""; } catch { return ""; }
}
