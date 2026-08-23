// V2 entity — introduced in Phase 2 (data layer). Not yet populated by migration (no v1
// concept maps onto Rule) or used by any screen; Agent Builder (Phase 3) is the first
// feature expected to read/write these records.
export type RuleScope = "global" | { agentId: string };

export type RuleRecord = {
  id: string;
  name: string;
  statement: string;
  scope: RuleScope;
  category: "safety" | "tone" | "format" | "compliance" | "custom";
  schemaVersion: 2;
};
