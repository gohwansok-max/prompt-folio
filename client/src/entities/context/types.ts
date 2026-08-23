// V2 entity — introduced in Phase 2 (data layer). Not yet populated by migration (no v1
// concept maps onto Context) or used by any screen; Agent Builder (Phase 3) is the first
// feature expected to read/write these records.
export type ContextRecord = {
  id: string;
  name: string;
  body: string;
  tags: string[];
  schemaVersion: 2;
};
