import { useEffect } from 'react';

/**
 * Keeps the field a person is typing in visible above the phone keyboard.
 *
 * On phones the on-screen keyboard shrinks the visual viewport instead of the
 * layout viewport, so a focused input can end up hidden behind it. We listen
 * for focus and for visual-viewport changes and scroll the active field into
 * the middle of the remaining space. Desktop is untouched.
 */
const isTypingField = (el: Element | null): el is HTMLElement => {
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    (el as HTMLElement).isContentEditable === true
  );
};

const MobileFormAssist = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let frame = 0;
    const revealActive = (delay = 0) => {
      const el = document.activeElement;
      if (!isTypingField(el)) return;
      window.clearTimeout(frame);
      frame = window.setTimeout(() => {
        const vv = window.visualViewport;
        const rect = el.getBoundingClientRect();
        const visibleBottom = vv ? vv.height + vv.offsetTop : window.innerHeight;
        const visibleTop = vv ? vv.offsetTop : 0;
        const margin = 24;
        if (rect.bottom > visibleBottom - margin || rect.top < visibleTop + margin) {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }, delay);
    };

    const onFocusIn = () => revealActive(250);
    const onViewportChange = () => revealActive(80);

    document.addEventListener('focusin', onFocusIn);
    window.visualViewport?.addEventListener('resize', onViewportChange);
    window.visualViewport?.addEventListener('scroll', onViewportChange);

    return () => {
      window.clearTimeout(frame);
      document.removeEventListener('focusin', onFocusIn);
      window.visualViewport?.removeEventListener('resize', onViewportChange);
      window.visualViewport?.removeEventListener('scroll', onViewportChange);
    };
  }, []);

  return null;
};

export default MobileFormAssist;
