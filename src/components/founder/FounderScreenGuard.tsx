import React, { useEffect, useState } from 'react';
import { EyeOff, ShieldAlert } from 'lucide-react';

/**
 * Anti screenshot / screen-recording deterrent for the Founder console.
 *
 * Browsers cannot truly block an OS-level screen capture, so this layer does
 * everything the web platform allows:
 * - Blanks the whole console (blur + opaque shield) whenever the page loses
 *   focus or becomes hidden, which is exactly when most capture tools,
 *   snipping tools and screen recorders take over.
 * - Blanks it on PrintScreen / Cmd+Shift+3/4/5 / Win+Shift+S key combos and
 *   wipes the clipboard afterwards.
 * - Disables right-click, text selection, drag and copy inside the console.
 * - Warns when the browser tab is being shared/captured (Screen Capture API).
 */
const BLANK_MS = 1200;

const FounderScreenGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shielded, setShielded] = useState(false);
  const [reason, setReason] = useState<'blur' | 'capture'>('blur');

  useEffect(() => {
    let timer: number | undefined;

    const shield = (why: 'blur' | 'capture', auto = false) => {
      setReason(why);
      setShielded(true);
      if (auto) {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setShielded(false), BLANK_MS);
      }
    };

    const wipeClipboard = () => {
      try {
        navigator.clipboard?.writeText('Fivesom Founder console — capture blocked.');
      } catch { /* ignore */ }
    };

    const onBlur = () => shield('blur');
    const onFocus = () => setShielded(false);
    const onVisibility = () => {
      if (document.hidden) shield('blur');
      else setShielded(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key;
      const isPrint = k === 'PrintScreen' || k === 'Snapshot';
      const macShot = e.metaKey && e.shiftKey && ['3', '4', '5', '6'].includes(k);
      const winSnip = e.shiftKey && (e.metaKey || e.getModifierState?.('Meta')) && k.toLowerCase() === 's';
      if (isPrint || macShot || winSnip) {
        e.preventDefault();
        shield('blur', true);
        wipeClipboard();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.key === 'Snapshot') {
        shield('blur', true);
        wipeClipboard();
      }
    };

    const block = (e: Event) => e.preventDefault();

    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    document.addEventListener('contextmenu', block);
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('dragstart', block);

    // Detect "this tab is being shared" (Chrome/Edge Screen Capture API).
    let stopCaptureWatch: (() => void) | undefined;
    try {
      const anyNav = navigator as any;
      const orig = anyNav.mediaDevices?.getDisplayMedia?.bind(anyNav.mediaDevices);
      if (orig) {
        anyNav.mediaDevices.getDisplayMedia = async (...args: any[]) => {
          shield('capture');
          throw new DOMException('Screen capture is disabled on the Founder console.', 'NotAllowedError');
        };
        stopCaptureWatch = () => { anyNav.mediaDevices.getDisplayMedia = orig; };
      }
    } catch { /* ignore */ }

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('dragstart', block);
      stopCaptureWatch?.();
    };
  }, []);

  return (
    <div className="relative select-none" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
      <div
        aria-hidden={shielded}
        style={shielded ? { filter: 'blur(22px)', pointerEvents: 'none' } : undefined}
      >
        {children}
      </div>

      {shielded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl p-6 text-center">
          <div className="max-w-sm space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
              {reason === 'capture' ? (
                <ShieldAlert className="h-7 w-7 text-destructive" />
              ) : (
                <EyeOff className="h-7 w-7 text-destructive" />
              )}
            </div>
            <h2 className="text-lg font-bold">Content protected</h2>
            <p className="text-sm text-muted-foreground">
              {reason === 'capture'
                ? 'Screen sharing and recording are not allowed on the Fivesom Founder console.'
                : 'Screenshots and screen recording are disabled here. Return focus to this window to continue.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderScreenGuard;
