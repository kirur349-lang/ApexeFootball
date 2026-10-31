import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { SlideItem, TabType } from '../types';
import { PromotionalArtwork } from './PromotionalArtwork';

interface CarouselProps {
  slides: SlideItem[];
  onNavigateTab: (tab: TabType) => void;
  onReadArticle: (articleId: string) => void;
}

export const PromotionalCarousel: React.FC<CarouselProps> = ({
  slides,
  onNavigateTab,
  onReadArticle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // 3-second auto-rotation interval
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsPaused(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setTouchStart(clientX);
    setTouchDelta(0);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStart === null) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setTouchDelta(clientX - touchStart);
  };

  const handleTouchEnd = () => {
    if (touchStart !== null) {
      if (touchDelta < -45) {
        // Swiped left -> Next
        nextSlide();
      } else if (touchDelta > 45) {
        // Swiped right -> Prev
        prevSlide();
      }
    }
    setTouchStart(null);
    setTouchDelta(0);
    setTimeout(() => setIsPaused(false), 800);
  };

  const handleSlideAction = (slide: SlideItem) => {
    if (slide.targetTab === 'coins') {
      onNavigateTab('coins');
    } else if (slide.targetTab === 'tournaments') {
      onNavigateTab('tournaments');
    } else {
      // Slide 3: Read More -> opens Update 4.2.0 article
      onReadArticle('news-1');
    }
  };

  return (
    <section className="w-full pt-4 pb-2">
      <div className="max-w-2xl mx-auto px-4">
        {/* Carousel Container */}
        <div
          className="relative group rounded-2xl overflow-hidden shadow-[0_12px_36px_rgba(8,123,255,0.12)] border border-white/70 bg-[#071738]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
        >
          {/* Top subtle specular reflection line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent z-30 pointer-events-none" />

          {/* Slides Track */}
          <div
            className="flex transition-transform duration-500 ease-out will-change-transform"
            style={{
              transform: `translateX(calc(-${currentIndex * 100}% + ${touchDelta}px))`,
            }}
          >
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="w-full shrink-0 relative min-h-[190px] sm:min-h-[210px] flex items-center p-4 sm:p-6"
              >
                {/* Visual Background Artwork for this slide (Kept crisp & sharp) */}
                <PromotionalArtwork slideId={slide.id} />

                {/* Subtle Apple-style Glass Panel Behind Text for Layered Depth */}
                <div className="relative z-20 max-w-[66%] sm:max-w-[60%] text-left flex flex-col justify-center bg-black/25 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.25)]">
                  {/* Category Kicker */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider text-[#00E5FF] uppercase drop-shadow-xs">
                      {slide.category}
                    </span>
                  </div>

                  {/* Headline */}
                  <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight leading-tight drop-shadow-xs">
                    {slide.headline}
                  </h2>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-100 font-normal mt-1 leading-snug line-clamp-2">
                    {slide.description}
                  </p>

                  {/* Glass-bordered Primary Action Button */}
                  <div className="mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSlideAction(slide);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#087BFF] to-[#1F8DFF] hover:from-[#076ee5] hover:to-[#087BFF] text-white text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(8,123,255,0.45)] border border-white/30 active:scale-95 transition-all focus:outline-none"
                    >
                      <span>{slide.buttonText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Frosted Translucent Previous Arrow Control */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous Slide"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/25 hover:bg-white/45 backdrop-blur-md border border-white/40 text-white flex items-center justify-center opacity-85 hover:opacity-100 shadow-[0_2px_10px_rgba(0,0,0,0.2)] transition-all active:scale-90 focus:outline-none"
          >
            <ChevronLeft className="w-4 h-4 drop-shadow-xs" />
          </button>

          {/* Frosted Translucent Next Arrow Control */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next Slide"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/25 hover:bg-white/45 backdrop-blur-md border border-white/40 text-white flex items-center justify-center opacity-85 hover:opacity-100 shadow-[0_2px_10px_rgba(0,0,0,0.2)] transition-all active:scale-90 focus:outline-none"
          >
            <ChevronRight className="w-4 h-4 drop-shadow-xs" />
          </button>
        </div>

        {/* Frosted Glass Pagination Capsule Underneath */}
        <div className="flex items-center justify-center pt-3 pb-1">
          <div className="glass-pill px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-[0_2px_10px_rgba(8,123,255,0.06)]">
            {slides.map((slide, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`transition-all duration-300 rounded-full h-1.5 focus:outline-none ${
                    isActive
                      ? 'w-6 bg-[#087BFF] shadow-[0_0_8px_#087BFF]'
                      : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
