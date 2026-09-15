import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/Logo';

/**
 * Fiverr-style "It needs a human touch" gate.
 *
 * Shows a full-screen challenge (content aligned to the LEFT) whenever the
 * visitor opens the browser inspector / devtools, or tries the usual inspect
 * shortcuts. The visitor must press & hold the button for a moment to get back
 * to the site. This is a deterrent only — real authorization always lives in
 * the database.
 */
const HOLD_MS = 1600;
const SIZE_THRESHOLD = 180;

const randomCode = () =>
  'PXCR' + Math.floor(10000000 + Math.random() * 89999999).toString();
const randomTrace = () =>
  Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');

const DevToolsGuard: React.FC = () => {
  const [blocked, setBlocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [code] = useState(randomCode);
  const [trace] = useState(randomTrace);
  const holdRef = useRef<number | undefined>(undefined);
  const clearedAt = useRef(0);

  const trigger = useCallback(() => {
    // Don't re-trigger straight after a successful hold.
    if (Date.now() - clearedAt.current < 4000) return;
    setBlocked(true);
  }, []);

  useEffect(() => {
    const checkSize = () => {
      const widthGap = window.outerWidth - window.innerWidth;
      const heightGap = window.outerHeight - window.innerHeight;
      if (widthGap > SIZE_THRESHOLD || heightGap > SIZE_THRESHOLD) trigger();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key?.toLowerCase();
      const isF12 = e.key === 'F12';
      const inspect = (e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(k);
      const viewSource = (e.ctrlKey || e.metaKey) && k === 'u';
      if (isF12 || inspect || viewSource) {
        e.preventDefault();
        trigger();
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      trigger();
    };

    const interval = window.setInterval(checkSize, 1000);
    checkSize();
    window.addEventListener('resize', checkSize);
    window.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('contextmenu', onContextMenu);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('resize', checkSize);
      window.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('contextmenu', onContextMenu);
    };
  }, [trigger]);

  useEffect(() => {
    if (blocked) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [blocked]);

  const startHold = () => {
    const started = Date.now();
    window.clearInterval(holdRef.current);
    holdRef.current = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - started) / HOLD_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        window.clearInterval(holdRef.current);
        clearedAt.current = Date.now();
        setProgress(0);
        setBlocked(false);
      }
    }, 40);
  };

  const endHold = () => {
    window.clearInterval(holdRef.current);
    setProgress(0);
  };

  if (!blocked) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-background overflow-y-auto">
      <div className="min-h-full w-full flex items-start">
        {/* Left-aligned challenge panel, Fiverr style */}
        <div className="w-full max-w-xl px-6 py-10 sm:px-12 sm:py-14 text-left">
          <Logo className="!h-9" linkTo="" />

          <h1 className="mt-14 text-2xl font-bold text-foreground">It needs a human touch</h1>
          <p className="mt-2 text-muted-foreground">
            Complete the task and we'll get you right back into Fivesom.
          </p>

          <button
            type="button"
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            onContextMenu={(e) => e.preventDefault()}
            className="relative mt-8 w-full max-w-sm overflow-hidden rounded-full border-2 border-primary py-5 text-center text-sm font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-primary/10 select-none"
          >
            <span
              className="absolute inset-y-0 left-0 bg-primary/25 transition-[width] duration-75"
              style={{ width: `${progress}%` }}
              aria-hidden
            />
            <span className="relative">Press &amp; Hold</span>
          </button>

          <fieldset className="mt-10 rounded-md border border-border p-4">
            <legend className="px-2 text-xs text-muted-foreground">Quick fixes</legend>
            <ul className="list-disc space-y-3 pl-5 text-sm text-muted-foreground">
              <li>Close the browser developer tools / inspector and reload the page.</li>
              <li>Disable any browser extensions, privacy add-ons or VPNs that modify web traffic.</li>
              <li>Clear your browser's cache and cookies, then make sure JavaScript is enabled.</li>
            </ul>
          </fieldset>

          <p className="mt-10 text-center text-xs tracking-widest text-muted-foreground">
            ERRCODE {code}
          </p>

          <div className="mt-8 space-y-1 text-xs text-muted-foreground">
            <p>Request details:</p>
            <p className="break-all">traceId: {trace}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevToolsGuard;
