import React, { useEffect, useRef, useState } from 'react';
import SmartImage from '@/components/media/SmartImage';
import SmartVideo from '@/components/media/SmartVideo';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

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

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      const idx = api.selectedScrollSnap();
      setCurrent(idx);
      // Pause every video that is no longer the active slide
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

  if (slides.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative group">
          <Carousel setApi={setApi} opts={{ loop: slides.length > 1 }}>
            <CarouselContent>
              {slides.map((slide, idx) => (
                <CarouselItem key={idx}>
                  <div className="w-full h-96 bg-black rounded-t-lg overflow-hidden flex items-center justify-center">
                    {slide.type === 'video' ? (
                      <SmartVideo
                        src={slide.url}
                        controls
                        poster={images[0] || undefined}
                        label="video"
                      />
                    ) : (
                      <SmartImage
                        src={slide.url}
                        alt={title}
                        wrapperClassName="w-full h-full"
                        className="w-full h-full object-cover"
                        showRetry
                      />
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
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => api?.scrollNext()}
                aria-label="Next"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
                className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                  idx === current ? 'border-primary' : 'border-transparent'
                }`}
              >
                {slide.type === 'video' ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    {images[0] ? (
                      <SmartImage src={images[0]} alt="Video thumbnail" wrapperClassName="w-full h-full" className="w-full h-full object-cover opacity-70" />
                    ) : null}
                    <Play className="w-5 h-5 text-white absolute" fill="currentColor" />
                  </div>
                ) : (
                  <SmartImage src={slide.url} alt={title} wrapperClassName="w-full h-full" className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedGallery;
