import { Check, Plus } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { PRESET_PLATFORMS } from "@/entities/harness/constants";
import type { PlatformId } from "@/entities/harness/types";

/** Shared by Agent Builder's platform step and Harness Generator's platform step --
 * both need the same "pick a preset dev harness or add a custom one" interaction. */
export default function PlatformPicker({ selected, onChange }: { selected: PlatformId[]; onChange: (next: PlatformId[]) => void }) {
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
      <div className="flex flex-wrap gap-1.5">
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
