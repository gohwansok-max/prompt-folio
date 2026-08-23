import { Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { applyBackup, exportHarnessStudioBackup, parseBackupFile, type HarnessStudioBackup } from "../lib";

export default function BackupPanel({ onImported }: { onImported: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [pending, setPending] = useState<HarnessStudioBackup | null>(null);

  function exportBackup() {
    exportHarnessStudioBackup();
    toast.success("Harness Studio 데이터를 JSON 파일로 내보냈습니다.");
  }

  async function pickFile(file: File | undefined) {
    if (!file) return;
    try {
      setPending(await parseBackupFile(file));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "백업 파일을 읽지 못했습니다.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function confirmImport() {
    if (!pending) return;
    applyBackup(pending, mode);
    toast.success(`${mode === "replace" ? "전체 교체" : "안전 병합"} 방식으로 데이터를 가져왔습니다.`);
    setPending(null);
    onImported();
  }

  return (
    <div className="editor-card p-6 md:p-7">
      <div className="section-kicker"><span className="counter">02</span> BACKUP</div>
      <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.04em]">백업 · 내보내기 / 가져오기</h2>
      <p className="mt-2 text-[12px] leading-5 text-[#66686C]">Agent·Skill·Rule·Context·Harness 생성 기록을 JSON 파일 하나로 내보내거나, 다른 브라우저에서 내보낸 파일을 가져올 수 있습니다. 이 브라우저 안에서만 동작하며 서버로 전송되지 않습니다.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={exportBackup} className="tool-button"><Download size={13} /> 전체 내보내기 (JSON)</button>
        <label className="tool-button cursor-pointer">
          <Upload size={13} /> 백업 파일 가져오기
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(event) => { void pickFile(event.target.files?.[0]); }} />
        </label>
      </div>

      {pending && (
        <div className="mt-4 border border-[#2563EB]/25 bg-[#EFF4FF]/60 p-4">
          <p className="font-mono text-[10px] font-semibold text-[#3564B9]">가져올 데이터: Agent {pending.agents.length} · Skill {pending.skills.length} · Rule {pending.rules.length} · Context {pending.contexts.length} · Harness {pending.harnesses.length}</p>
          <div className="mt-3 grid grid-cols-2 border border-[#1C1D21]/15 p-1 sm:w-[220px]">
            <button onClick={() => setMode("merge")} className={`px-2 py-2 font-mono text-[9px] transition ${mode === "merge" ? "bg-[#1C1D21] text-white" : "text-[#67696C]"}`}>안전 병합</button>
            <button onClick={() => setMode("replace")} className={`px-2 py-2 font-mono text-[9px] transition ${mode === "replace" ? "bg-[#1C1D21] text-white" : "text-[#67696C]"}`}>전체 교체</button>
          </div>
          <p className="mt-2 font-mono text-[9px] text-[#7B7D81]">{mode === "merge" ? "같은 id는 가져온 값으로 덮어쓰고, 나머지는 그대로 둡니다." : "현재 데이터를 모두 지우고 가져온 파일로 바꿉니다."}</p>
          <div className="mt-3 flex gap-2">
            <button onClick={confirmImport} className="inline-flex items-center gap-1.5 bg-[#1C1D21] px-3 py-2 font-mono text-[10px] font-semibold text-white transition hover:bg-[#2563EB]">가져오기 적용</button>
            <button onClick={() => setPending(null)} className="border border-[#1C1D21]/15 bg-white px-3 py-2 font-mono text-[10px] font-semibold text-[#67696C] transition hover:border-red-300 hover:text-red-600">취소</button>
          </div>
        </div>
      )}
    </div>
  );
}
