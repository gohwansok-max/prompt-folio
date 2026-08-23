export type ProviderId = "claude" | "chatgpt" | "gemini" | "manus" | "perplexity";
export type DetailLevel = "compact" | "balanced" | "detailed";
export type Provider = { id: ProviderId; label: string; color: string; startFile: string; skillFile: string; focus: string };
