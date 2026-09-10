import React, { useState, useRef, useEffect } from 'react';
import logo from '../logo/logo.png';

/**
 * ServiceImageCarousel
 * Interactive image scroller for service cards & listings with touch swipe, mouse drag/wheel, 
 * pagination indicators, and next/prev arrows with event isolation.
 */
function ServiceImageCarousel({
  images = [],
  alt = 'Service image',
  className = 'h-48 w-full',
  imageClassName = 'w-full h-full object-cover',
  aspectRatioClass = '',
  badge = null,
  showDots = true,
  showArrows = true,
  showCountBadge = true,
  onImageClick = null,
}) {
  const safeImages = Array.isArray(images) && images.length > 0 ? images : [logo];
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const isDragging = useRef(false);
  const mouseStartX = useRef(0);

  // Reset index if image list changes or shrinks
  useEffect(() => {
    if (currentIndex >= safeImages.length) {
      setCurrentIndex(0);
    }
  }, [safeImages.length, currentIndex]);

  const hasMultiple = safeImages.length > 1;

  const handlePrev = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex(prev => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex(prev => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!hasMultiple || touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      handleNext(e);
    } else if (isRightSwipe) {
      handlePrev(e);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleMouseDown = (e) => {
    if (!hasMultiple) return;
    isDragging.current = true;
    mouseStartX.current = e.clientX;
  };

  const handleMouseUp = (e) => {
    if (!hasMultiple || !isDragging.current) return;
    const distance = mouseStartX.current - e.clientX;
    if (Math.abs(distance) > 45) {
      e.preventDefault();
      e.stopPropagation();
      if (distance > 0) {
        handleNext(e);
      } else {
        handlePrev(e);
      }
    }
    isDragging.current = false;
  };

  const handleWheel = (e) => {
    if (!hasMultiple) return;
    if (Math.abs(e.deltaX) > 30) {
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaX > 0) {
        handleNext(e);
      } else {
        handlePrev(e);
      }
    }
  };

  return (
    <div
      className={`relative overflow-hidden group select-none bg-neutral-background ${className} ${aspectRatioClass}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onClick={onImageClick}
    >
      {/* Active Photo */}
      <img
        src={safeImages[currentIndex] || logo}
        alt={`${alt} - view ${currentIndex + 1}`}
        onError={(e) => { e.target.src = logo; }}
        className={`${imageClassName} transition-all duration-300 pointer-events-none`}
        draggable={false}
      />

      {/* Custom badge slot (e.g. price or category badge) */}
      {badge}

      {/* Counter Pill Badge */}
      {hasMultiple && showCountBadge && (
        <div className="absolute bottom-3 right-3 bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 pointer-events-none z-10">
          <i className="bi bi-images text-[9px]"></i>
          <span>{currentIndex + 1}/{safeImages.length}</span>
        </div>
      )}

      {/* Navigation Arrows (Transparent Frosted Glass Style) */}
      {hasMultiple && showArrows && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/35 hover:bg-black/65 text-white backdrop-blur-md border border-white/30 shadow-md flex items-center justify-center text-xs sm:text-sm transition-all duration-200 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:!opacity-100 hover:scale-110 active:scale-95 cursor-pointer z-10"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/35 hover:bg-black/65 text-white backdrop-blur-md border border-white/30 shadow-md flex items-center justify-center text-xs sm:text-sm transition-all duration-200 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:!opacity-100 hover:scale-110 active:scale-95 cursor-pointer z-10"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {hasMultiple && showDots && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full z-10">
          {safeImages.slice(0, 7).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`transition-all rounded-full cursor-pointer ${
                currentIndex === idx
                  ? 'w-4 h-1.5 bg-brand-secondary'
                  : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Jump to image ${idx + 1}`}
            />
          ))}
          {safeImages.length > 7 && (
            <span className="text-[9px] text-white/80 font-bold ml-0.5">+</span>
          )}
        </div>
      )}
    </div>
  );
}

export default ServiceImageCarousel;
