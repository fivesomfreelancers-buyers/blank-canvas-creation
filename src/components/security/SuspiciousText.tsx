import { splitSuspicious } from '@/lib/contentSafety';

export default function SuspiciousText({ text, className }: { text: string; className?: string }) {
  const parts = splitSuspicious(text || '');
  if (!parts.some((p) => p.bad)) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      {parts.map((p, i) => p.bad
        ? <mark key={i} className="rounded bg-destructive/20 px-0.5 font-semibold text-destructive">{p.text}</mark>
        : <span key={i}>{p.text}</span>)}
    </span>
  );
}
