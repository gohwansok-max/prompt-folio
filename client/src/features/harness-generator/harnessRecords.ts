import { readHarnesses, writeHarnesses } from "@/entities/harness/storage";
import type { HarnessFile, HarnessRecord, PlatformId } from "@/entities/harness/types";

/** Saves a freshly generated file set as a new, versioned HarnessRecord for this
 * agent+platform pair. Older versions for the same pair are kept, not overwritten. */
export function saveHarnessRecord(agentId: string, platform: PlatformId, files: HarnessFile[]): HarnessRecord {
  const existing = readHarnesses();
  const priorVersion = existing
    .filter((record) => record.agentId === agentId && record.platform === platform)
    .reduce((max, record) => Math.max(max, record.version), 0);
  const record: HarnessRecord = { id: `harness-${agentId}-${platform}-${Date.now()}`, agentId, platform, files, generatedAt: new Date().toISOString(), version: priorVersion + 1 };
  writeHarnesses([record, ...existing]);
  return record;
}
