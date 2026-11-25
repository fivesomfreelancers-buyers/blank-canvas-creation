import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import SuspiciousText from '@/components/security/SuspiciousText';

/** Renders chat text; ```fenced``` parts become copyable code blocks. */
const CodeBlock: React.FC<{ code: string; lang?: string }> = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-1.5 overflow-hidden rounded-xl border border-border bg-foreground/95 text-background">
      <div className="flex items-center justify-between px-3 py-1.5 text-[11px] opacity-80">
        <span className="font-mono uppercase">{lang || 'code'}</span>
        <button
          type="button"
          className="inline-flex items-center gap-1 hover:opacity-100"
          onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="max-h-80 overflow-auto px-3 pb-3 text-xs leading-relaxed"><code className="font-mono">{code}</code></pre>
    </div>
  );
};

const MessageText: React.FC<{ text: string }> = ({ text }) => {
  if (!text || !text.includes('```')) return <p className="chat-text"><SuspiciousText text={text} /></p>;
  const parts = text.split('```');
  return (
    <div className="chat-text min-w-0">
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const nl = part.indexOf('\n');
          const first = nl === -1 ? '' : part.slice(0, nl).trim();
          const isLang = /^[a-z0-9+#.-]{1,15}$/i.test(first);
          return <CodeBlock key={i} lang={isLang ? first : undefined} code={(isLang ? part.slice(nl + 1) : part).replace(/\n$/, '')} />;
        }
        return part.trim() ? <p key={i}><SuspiciousText text={part.trim()} /></p> : null;
      })}
    </div>
  );
};

export default MessageText;
