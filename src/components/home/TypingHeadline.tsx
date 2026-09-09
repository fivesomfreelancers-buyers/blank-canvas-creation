import { useEffect, useRef, useState } from 'react';

interface TypingHeadlineProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  holdDuration?: number;
  className?: string;
}

/**
 * Reusable typing animation for a headline fragment.
 * Types a phrase, holds it, deletes it, then moves to the next one in a loop.
 */
export default function TypingHeadline({
  phrases,
  typingSpeed = 55,
  deletingSpeed = 30,
  holdDuration = 2000,
  className = '',
}: TypingHeadlineProps) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>('typing');
  const reduceMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (!phrases.length) return;
    if (reduceMotion.current) {
      setText(phrases[0]);
      return;
    }

    const current = phrases[index % phrases.length];
    let timer: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (text.length < current.length) {
        timer = setTimeout(() => setText(current.slice(0, text.length + 1)), typingSpeed);
      } else {
        timer = setTimeout(() => setPhase('deleting'), holdDuration);
      }
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        timer = setTimeout(() => setText(current.slice(0, text.length - 1)), deletingSpeed);
      } else {
        setIndex((i) => (i + 1) % phrases.length);
        setPhase('typing');
      }
    }

    return () => clearTimeout(timer);
  }, [text, phase, index, phrases, typingSpeed, deletingSpeed, holdDuration]);

  const longest = phrases.reduce((a, b) => (b.length > a.length ? b : a), '');

  return (
    <span className={`inline-block align-top ${className}`}>
      {/* Reserve space with the longest phrase so layout never jumps */}
      <span className="sr-only">{longest}</span>
      <span aria-live="polite" aria-atomic="true">
        {text}
        <span
          aria-hidden="true"
          className="inline-block w-[0.08em] translate-y-[0.08em] self-stretch bg-primary animate-[pulse_1s_ease-in-out_infinite] ml-[0.06em]"
          style={{ height: '0.95em' }}
        />
      </span>
    </span>
  );
}
