import { Check, Plus } from "lucide-react";
import { useState, type CSSProperties } from "react";
import type { PlatformId } from "@/entities/harness/types";
import { PRESET_PLATFORMS } from "../../constants";

export default function PlatformStep({ selected, onChange }: { selected: PlatformId[]; onChange: (next: PlatformId[]) => void }) {
  const [customInput, setCustomInput] = useState("");

  function toggle(id: PlatformId) {
    onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  }

  function addCustom() {
    const value = customInput.trim();
    if (!value || selected.includes(value)) return;
    onChange([...selected, value]);
    setCustomInput("");
  }

  const customSelected = selected.filter((id) => !PRESET_PLATFORMS.some((preset) => preset.id === id));

  return (
    <div>
      <p className="text-[12px] leading-5 text-[#66686C]">이 Agent를 어떤 개발 환경에서 쓸지 고르세요. Harness Generator가 만들어질 다음 라운드에서 이 목록을 그대로 씁니다.</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {PRESET_PLATFORMS.map((preset) => {
          const active = selected.includes(preset.id);
          return (
            <button key={preset.id} type="button" onClick={() => toggle(preset.id)} className={`provider-check ${active ? "is-active" : ""}`} style={{ "--provider": "#2563EB" } as CSSProperties}>
              <span className="check-dot">{active && <Check size={10} strokeWidth={3} />}</span>{preset.label} <span className="opacity-60">· {preset.file}</span>
            </button>
          );
        })}
        {customSelected.map((id) => (
          <span key={id} className="provider-check is-active" style={{ "--provider": "#2563EB" } as CSSProperties}>
            <span className="check-dot"><Check size={10} strokeWidth={3} /></span>{id}
          </span>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input value={customInput} onChange={(event) => setCustomInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustom(); } }} placeholder="다른 플랫폼 이름 직접 추가" className="field-input" />
        <button type="button" onClick={addCustom} className="inline-flex shrink-0 items-center gap-1.5 bg-[#1C1D21] px-3 font-mono text-[10px] font-semibold text-white transition hover:bg-[#2563EB]"><Plus size={13} /> 추가</button>
      </div>
    </div>
  );
}
