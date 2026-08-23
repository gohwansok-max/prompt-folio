export type TagFeedback = Record<string, { accepted: number; rejected: number }>;
export type FeedbackEvent = { tag: string; verdict: "accepted" | "rejected"; at: string };
export type ExclusionSettings = { minObservations: number; rejectionRate: number };
export type TagGroup = { id: string; name: string; tags: string[] };
