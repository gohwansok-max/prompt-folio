export default function GuideNudge({ message, onClose }: { message: string; onClose: () => void }) {
  return <div className="guide-nudge" role="status"><div><span className="guide-nudge-dot" /> <strong>지금 해 볼 차례</strong><p>{message}</p></div><button onClick={onClose}>알겠어요</button></div>;
}
