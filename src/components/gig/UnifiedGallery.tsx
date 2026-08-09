import React, { useCallback, useEffect, useRef, useState } from 'react';
import SmartImage from '@/components/media/SmartImage';
import SmartVideo from '@/components/media/SmartVideo';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Play, X, ZoomIn, ZoomOut } from 'lucide-react';

interface UnifiedGalleryProps {
  videoUrl: string | null;
  images: string[];
  title: string;
}

type Slide = { type: 'video'; url: string } | { type: 'image'; url: string };

const UnifiedGallery: React.FC<UnifiedGalleryProps> = ({ videoUrl, images, title }) => {
  const slides: Slide[] = [
    ...(videoUrl ? [{ type: 'video' as const, url: videoUrl }] : []),
    ...images.map((url) => ({ type: 'image' as const, url })),
  ];

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  const imageSlideIndexes = slides.reduce<number[]>((acc, s, i) => {
    if (s.type === 'image') acc.push(i);
    return acc;
  }, []);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      const idx = api.selectedScrollSnap();
      setCurrent(idx);
      Object.entries(videoRefs.current).forEach(([key, el]) => {
        if (el && Number(key) !== idx) el.pause();
      });
    };
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const stepLightbox = useCallback(
    (dir: 1 | -1) => {
      setZoom(1);
      setLightboxIndex((prev) => {
        if (prev === null || imageSlideIndexes.length === 0) return prev;
        const pos = imageSlideIndexes.indexOf(prev);
        const nextPos = (pos + dir + imageSlideIndexes.length) % imageSlideIndexes.length;
        return imageSlideIndexes[nextPos];
      });
    },
    [imageSlideIndexes]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') stepLightbox(1);
      if (e.key === 'ArrowLeft') stepLightbox(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, stepLightbox]);

  if (slides.length === 0) return null;

  const activeLightboxUrl =
    lightboxIndex !== null && slides[lightboxIndex]?.type === 'image' ? slides[lightboxIndex].url : null;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative group">
          <Carousel setApi={setApi} opts={{ loop: slides.length > 1 }}>
            <CarouselContent>
              {slides.map((slide, idx) => (
                <CarouselItem key={idx}>
                  {/* Responsive container: the image is contained, never cropped */}
                  <div className="w-full aspect-[4/3] sm:aspect-[16/10] max-h-[75vh] bg-muted rounded-t-lg overflow-hidden flex items-center justify-center">
                    {slide.type === 'video' ? (
                      <SmartVideo
                        src={slide.url}
                        controls
                        poster={images[0] || undefined}
                        label="video"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setZoom(1); setLightboxIndex(idx); }}
                        aria-label="Open full-size image"
                        className="w-full h-full flex items-center justify-center cursor-zoom-in"
                      >
                        <SmartImage
                          src={slide.url}
                          alt={title}
                          wrapperClassName="w-full h-full flex items-center justify-center"
                          className="max-w-full max-h-full w-auto h-auto object-contain"
                          showRetry
                        />
                      </button>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => api?.scrollPrev()}
                aria-label="Previous"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => api?.scrollNext()}
                aria-label="Next"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => api?.scrollTo(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      idx === current ? 'bg-primary' : 'bg-background/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {slides.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {slides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => api?.scrollTo(idx)}
                className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 bg-muted transition-colors ${
                  idx === current ? 'border-primary' : 'border-transparent'
                }`}
              >
                {slide.type === 'video' ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    {images[0] ? (
                      <SmartImage src={images[0]} alt="Video thumbnail" wrapperClassName="w-full h-full flex items-center justify-center" className="max-w-full max-h-full object-contain opacity-70" />
                    ) : null}
                    <Play className="w-5 h-5 text-white absolute" fill="currentColor" />
                  </div>
                ) : (
                  <SmartImage
                    src={slide.url}
                    alt={title}
                    wrapperClassName="w-full h-full flex items-center justify-center"
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </CardContent>

      {/* Full-size viewer */}
      <Dialog
        open={lightboxIndex !== null}
        onOpenChange={(open) => { if (!open) { setLightboxIndex(null); setZoom(1); } }}
      >
        <DialogContent className="max-w-[96vw] sm:max-w-5xl p-0 bg-background/95 border-border [&>button]:hidden">
          <div className="relative w-full h-[85vh] flex items-center justify-center overflow-auto">
            {activeLightboxUrl && (
              <img
                src={activeLightboxUrl}
                alt={title}
                style={{ transform: `scale(${zoom})` }}
                className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-200 origin-center"
              />
            )}

            <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
              <button
                type="button"
                aria-label="Zoom out"
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
                className="bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Zoom in"
                onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                className="bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Close viewer"
                onClick={() => { setLightboxIndex(null); setZoom(1); }}
                className="bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {imageSlideIndexes.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => stepLightbox(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow z-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => stepLightbox(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow z-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UnifiedGallery;
