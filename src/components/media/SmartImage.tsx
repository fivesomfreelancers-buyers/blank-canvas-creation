import React, { useEffect, useState } from 'react';
import { ImageOff, RotateCcw } from 'lucide-react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
  /** Optional replacement image tried once before showing the error state */
  fallbackSrc?: string;
  className?: string;
  /** Wrapper classes (skeleton/error share the same box) */
  wrapperClassName?: string;
  showRetry?: boolean;
}

/**
 * Production-safe image:
 * - native lazy loading + async decoding
 * - skeleton placeholder while loading
 * - graceful fallback (and optional retry) instead of a broken-image icon
 */
const SmartImage = ({
  src,
  alt,
  fallbackSrc,
  className = '',
  wrapperClassName = '',
  showRetry = false,
  loading = 'lazy',
  ...rest
}: SmartImageProps) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(src ? 'loading' : 'error');
  const [current, setCurrent] = useState(src || '');
  const [usedFallback, setUsedFallback] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setCurrent(src || '');
    setUsedFallback(false);
    setStatus(src ? 'loading' : 'error');
  }, [src]);

  const handleError = () => {
    if (fallbackSrc && !usedFallback) {
      setUsedFallback(true);
      setCurrent(fallbackSrc);
      setStatus('loading');
      return;
    }
    setStatus('error');
  };

  return (
    <div className={`relative overflow-hidden ${wrapperClassName || className}`}>
      {current && status !== 'error' && (
        <img
          key={`${current}#${attempt}`}
          src={current}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setStatus('ready')}
          onError={handleError}
          className={`${className} ${status === 'loading' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          {...rest}
        />
      )}

      {status === 'loading' && (
        <div className="absolute inset-0 bg-muted/50 animate-pulse" aria-hidden="true" />
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/50 text-muted-foreground p-3 text-center">
          <ImageOff className="w-6 h-6" />
          <span className="text-[11px] leading-tight">Image unavailable</span>
          {showRetry && (
            <button
              type="button"
              onClick={() => {
                setUsedFallback(false);
                setCurrent(src || '');
                setAttempt((a) => a + 1);
                setStatus('loading');
              }}
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              <RotateCcw className="w-3 h-3" /> Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartImage;
