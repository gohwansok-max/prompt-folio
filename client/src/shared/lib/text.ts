export function normalizeLines(value: string) {
  return value.replace(/\r/g, "").split("\n").map((line) => line.replace(/^\s*[-•*]\s*/, "").trim()).filter(Boolean).filter((line, index, list) => list.indexOf(line) === index).slice(0, 14);
}
