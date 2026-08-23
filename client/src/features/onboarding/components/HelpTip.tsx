export default function HelpTip({ text }: { text: string }) {
  return <span className="help-tip" tabIndex={0} aria-label={`도움말: ${text}`}><span aria-hidden="true">?</span><span className="help-bubble">{text}</span></span>;
}
