import type { LucideIcon } from "lucide-react";

export default function StatCard({ icon: Icon, label, value, sublabel }: { icon: LucideIcon; label: string; value: number; sublabel?: string }) {
  return (
    <div className="border border-[#1C1D21]/10 bg-white/80 p-4">
      <div className="flex items-center gap-2 font-mono text-[9px] font-semibold tracking-[0.08em] text-[#77797C]"><Icon size={12} className="text-[#2563EB]" /> {label}</div>
      <div className="mt-2 font-serif text-3xl font-bold tracking-[-0.03em] text-[#1C1D21]">{value.toLocaleString()}</div>
      {sublabel && <div className="mt-1 font-mono text-[9px] text-[#9A9C9E]">{sublabel}</div>}
    </div>
  );
}
