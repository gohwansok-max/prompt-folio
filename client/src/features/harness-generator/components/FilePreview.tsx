import { Check, Clipboard, Download, FileDown } from "lucide-react";
import { useState } from "react";
import { PRESET_PLATFORMS } from "@/entities/harness/constants";
import type { HarnessFile, PlatformId } from "@/entities/harness/types";
import { downloadText } from "@/shared/lib/dom";

function platformLabel(id: PlatformId) {
  return PRESET_PLATFORMS.find((preset) => preset.id === id)?.label || id;
}

export default function FilePreview({ results }: { results: { platform: PlatformId; files: HarnessFile[] }[] }) {
  const [activePlatform, setActivePlatform] = useState<PlatformId | undefined>(results[0]?.platform);
  const current = results.find((result) => result.platform === activePlatform) ?? results[0];
  const [activeFilename, setActiveFilename] = useState<string | undefined>(current?.files[0]?.filename);
  const activeFile = current?.files.find((file) => file.filename === activeFilename) ?? current?.files[0];
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!current || !activeFile) return null;

  function selectPlatform(platform: PlatformId) {
    setActivePlatform(platform);
    setActiveFilename(results.find((result) => result.platform === platform)?.files[0]?.filename);
  }

  async function copy(file: HarnessFile) {
    await navigator.clipboard.writeText(file.content);
    setCopiedFile(file.filename);
    window.setTimeout(() => setCopiedFile(null), 1600);
  }

  function downloadOne(file: HarnessFile) {
    const flatName = file.filename.split("/").pop() || file.filename;
    downloadText(flatName, file.content);
  }

  function downloadAll() {
    const bundle = results.flatMap((result) => result.files.map((file) => `\n\n<!-- ${platformLabel(result.platform)} :: ${file.filename} -->\n\n${file.content}`)).join("\n\n---\n");
    downloadText("harness-bundle.md", bundle.trim());
  }

  return (
    <div className="editor-card p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="section-kicker"><span className="counter">03</span> PREVIEW & EXPORT</div>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">생성된 파일</h2>
        </div>
        <button onClick={downloadAll} className="inline-flex shrink-0 items-center gap-1.5 bg-[#2563EB] px-4 py-2.5 font-mono text-[10px] font-semibold text-white transition hover:bg-[#1D4ED8] active:scale-[0.97]"><FileDown size={14} /> 전체 다운로드</button>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {results.map((result) => (
          <button key={result.platform} type="button" onClick={() => selectPlatform(result.platform)} className={`border px-3 py-1.5 font-mono text-[10px] font-semibold transition ${result.platform === activePlatform ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-[#1C1D21]/15 bg-white text-[#67696C]"}`}>{platformLabel(result.platform)} <span className="opacity-70">({result.files.length})</span></button>
        ))}
      </div>

      {current.files.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1 border-b border-[#1C1D21]/10">
          {current.files.map((file) => (
            <button key={file.filename} type="button" onClick={() => setActiveFilename(file.filename)} className={`border-b-2 px-2 py-1.5 font-mono text-[9px] transition ${file.filename === activeFile.filename ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-[#818388] hover:text-[#4E5055]"}`}>{file.filename}</button>
          ))}
        </div>
      )}

      <div className="mt-4 border border-[#1C1D21]/10 bg-white/80 p-4">
        <div className="flex items-center justify-between gap-3 border-b border-[#1C1D21]/10 pb-3">
          <span className="font-mono text-[10px] text-[#64666A]">{activeFile.filename}</span>
          <div className="flex gap-2">
            <button onClick={() => copy(activeFile)} className="inline-flex items-center gap-1.5 border border-[#1C1D21]/15 bg-white px-2.5 py-1.5 font-mono text-[9px] font-semibold text-[#67696C] transition hover:border-[#2563EB] hover:text-[#2563EB]">{copiedFile === activeFile.filename ? <Check size={12} /> : <Clipboard size={12} />} {copiedFile === activeFile.filename ? "복사됨" : "복사"}</button>
            <button onClick={() => downloadOne(activeFile)} className="inline-flex items-center gap-1.5 border border-[#1C1D21]/15 bg-white px-2.5 py-1.5 font-mono text-[9px] font-semibold text-[#67696C] transition hover:border-[#2563EB] hover:text-[#2563EB]"><Download size={12} /> 다운로드</button>
          </div>
        </div>
        <pre className="markdown-output mt-3 max-h-[420px] overflow-auto">{activeFile.content}</pre>
      </div>
      {activeFile.filename.includes("/") && <p className="mt-2 font-mono text-[9px] text-[#9A9C9E]">다운로드하면 파일명만 저장됩니다 — <code>{activeFile.filename}</code> 경로에 놓고 쓰세요.</p>}
    </div>
  );
}
