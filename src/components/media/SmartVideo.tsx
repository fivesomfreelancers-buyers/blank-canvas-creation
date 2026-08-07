import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Loader2, RotateCcw } from 'lucide-react';

interface SmartVideoProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  src: string;
  /** Optional fallback poster image shown until the first frame is ready */
  poster?: string;
  className?: string;
  /** Wait until the video scrolls into view before requesting bytes */
  lazy?: boolean;
  label?: string;
}

/**
 * Production-safe video player:
 * - shows a loading skeleton while buffering
 * - shows an error state with a retry action when the media fails
 * - never leaves an empty black box
 */
const SmartVideo = ({
  src,
  poster,
  className = '',
  lazy = true,
  label = 'video',
  autoPlay,
  ...rest
}: SmartVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [inView, setInView] = useState(!lazy);

  useEffect(() => {
    if (!lazy || inView || !wrapperRef.current) return;
    const el = wrapperRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lazy, inView]);

  useEffect(() => {
    setStatus('loading');
  }, [src, attempt]);

  const retry = () => {
    setAttempt((a) => a + 1);
    setStatus('loading');
    // Force the browser to drop its failed cache entry
    requestAnimationFrame(() => videoRef.current?.load());
  };

  return (
    <div ref={wrapperRef} className={`relative w-full h-full ${className}`}>
      {inView && (
        <video
          key={`${src}#${attempt}`}
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          playsInline
          preload="auto"
          className="w-full h-full object-contain"
          onLoadedMetadata={() => setStatus('ready')}
          onLoadedData={(e) => {
            setStatus('ready');
            if (autoPlay) e.currentTarget.play().catch(() => {});
          }}
          onCanPlay={() => setStatus('ready')}
          onError={(e) => {
            // Ignore aborted/interrupted loads (range-request restarts, remounts, tab switches).
            const err = e.currentTarget.error;
            if (!err || err.code === err.MEDIA_ERR_ABORTED) return;
            // One silent auto-retry for transient network/decode hiccups.
            if (attempt === 0) {
              setAttempt(1);
              setStatus('loading');
              return;
            }
            setStatus('error');
          }}
          {...rest}
        >
          Your browser does not support the video tag.
        </video>
      )}

      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/40 animate-pulse">
          {poster && (
            <img
              src={poster}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          )}
          <Loader2 className="w-8 h-8 text-primary animate-spin relative" />
          <span className="text-xs text-muted-foreground relative">Loading {label}…</span>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/60 p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <p className="text-sm text-foreground font-medium">This {label} could not be loaded.</p>
          <p className="text-xs text-muted-foreground">
            Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={retry}
            className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartVideo;
