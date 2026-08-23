import { Check, Plus } from "lucide-react";
import { useState } from "react";

export type PickerItem = { id: string; label: string; sublabel?: string };
export type QuickAddField = { key: string; placeholder: string; multiline?: boolean };

export default function EntityPicker({ items, selectedIds, onToggle, emptyHint, quickAddFields, quickAddLabel, onQuickAdd }: {
  items: PickerItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  emptyHint: string;
  quickAddFields: QuickAddField[];
  quickAddLabel: string;
  onQuickAdd: (values: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const canSubmit = quickAddFields.every((field) => (values[field.key] || "").trim());

  function submit() {
    if (!canSubmit) return;
    onQuickAdd(values);
    setValues({});
  }

  return (
    <div>
      {items.length ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => {
            const active = selectedIds.includes(item.id);
            return (
              <button key={item.id} type="button" onClick={() => onToggle(item.id)} className={`flex max-w-[260px] items-start gap-2 border px-3 py-2 text-left transition ${active ? "border-[#2563EB] bg-[#EFF4FF]" : "border-[#1C1D21]/15 bg-white hover:border-[#2563EB]/50"}`}>
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border ${active ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-[#9A9C9E]"}`}>{active && <Check size={10} strokeWidth={3} />}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-semibold text-[#292B30]">{item.label}</span>
                  {item.sublabel && <span className="mt-0.5 block truncate text-[10px] text-[#797B80]">{item.sublabel}</span>}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-[#1C1D21]/15 bg-[#F0ECE4] px-3 py-4 font-mono text-[10px] text-[#77797C]">{emptyHint}</div>
      )}

      <div className="mt-4 border-t border-[#1C1D21]/10 pt-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {quickAddFields.map((field) => field.multiline ? (
            <textarea key={field.key} value={values[field.key] || ""} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={field.placeholder} className="field-input min-h-[72px] sm:col-span-2" />
          ) : (
            <input key={field.key} value={values[field.key] || ""} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={field.placeholder} className="field-input" />
          ))}
        </div>
        <button type="button" onClick={submit} disabled={!canSubmit} className="mt-2 inline-flex items-center gap-1.5 bg-[#1C1D21] px-3 py-2 font-mono text-[10px] font-semibold text-white transition hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"><Plus size={13} /> {quickAddLabel}</button>
      </div>
    </div>
  );
}
