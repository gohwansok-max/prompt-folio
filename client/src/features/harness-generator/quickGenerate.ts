import type { HarnessFile } from "@/entities/harness/types";
import { createSkillDocument, createStartDocument } from "@/features/harness-generator/generators";
import type { DetailLevel, Provider } from "@/features/harness-generator/types";

/**
 * The original Prompt Folio flow (memo -> start doc + skill doc, no Agent required).
 * Reuses the same generator functions Home.tsx's legacy flow calls, so output is
 * byte-for-byte identical to what that screen has always produced.
 */
export function generateQuickFiles(provider: Provider, title: string, lines: string[], detail: DetailLevel): HarnessFile[] {
  return [
    { filename: provider.startFile, content: createStartDocument(provider, title, lines, detail) },
    { filename: provider.skillFile, content: createSkillDocument(provider, title, lines, detail) },
  ];
}
