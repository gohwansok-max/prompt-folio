import { X } from "lucide-react";
import type { ReactNode } from "react";

export default function SystemSettingsDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return <div className="system-overlay" role="dialog" aria-modal="true" aria-label="시스템 설정"><button className="system-backdrop" onClick={onClose} aria-label="설정 닫기" /><aside className="system-drawer"><div className="system-drawer-head"><div><div className="section-kicker"><span className="counter">SYSTEM</span> OPTIONAL TOOLS</div><h2>시스템 설정</h2><p>처음 사용에는 필요하지 않은 고급 기능을 모아 두었습니다.</p></div><button onClick={onClose} className="system-close" aria-label="설정 닫기"><X size={17} /></button></div><div className="system-drawer-body">{children}</div></aside></div>;
}
