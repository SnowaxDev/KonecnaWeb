import { useState, useRef, useCallback } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

/**
 * Interaktivní porovnání PŘED/PO – tažením čáry po obrázku se odkrývá výsledek.
 * Funguje myší i dotykem (pointer events).
 */
const BeforeAfterSlider = ({ before, after, alt = '', className = '', showLabels = true }) => {
  const containerRef = useRef(null);
  const draggingRef = useRef(false);
  const [position, setPosition] = useState(50); // % zleva

  const updateFromClientX = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPosition((x / rect.width) * 100);
  }, []);

  const handlePointerDown = (e) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (draggingRef.current) updateFromClientX(e.clientX);
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none touch-none cursor-ew-resize ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={e => e.stopPropagation()}
      data-testid="before-after-slider"
    >
      {/* PO – podklad */}
      <img
        src={after}
        alt={`Po – ${alt}`}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
        loading="lazy"
      />
      {/* PŘED – ořezává se podle pozice čáry */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={before}
          alt={`Před – ${alt}`}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
          loading="lazy"
        />
      </div>

      {/* Dělicí čára s úchytem */}
      <div
        className="absolute top-0 bottom-0 w-[3px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)] -translate-x-1/2 pointer-events-none"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center">
          <ChevronsLeftRight className="w-5 h-5 text-[#1B4332]" />
        </div>
      </div>

      {/* Štítky */}
      {showLabels && (
        <>
          <span className="absolute bottom-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white pointer-events-none">
            PŘED
          </span>
          <span className="absolute bottom-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full bg-[#3FA34D] text-white pointer-events-none">
            PO
          </span>
        </>
      )}
    </div>
  );
};

export default BeforeAfterSlider;
