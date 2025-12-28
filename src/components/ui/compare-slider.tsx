"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronsLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompareSliderProps {
  original: string;
  processed: string;
  className?: string;
}

export function CompareSlider({ original, processed, className }: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(10); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  }, []);

  // Mouse Events
  const onMouseDown = () => setIsDragging(true);
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  // Touch Events
  const onTouchStart = () => setIsDragging(true);
  const onTouchEnd = () => setIsDragging(false);
  const onTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleGlobalUp = () => setIsDragging(false);
    const handleGlobalMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };

    if (isDragging) {
      window.addEventListener("mouseup", handleGlobalUp);
      window.addEventListener("mousemove", handleGlobalMove);
    }
    return () => {
      window.removeEventListener("mouseup", handleGlobalUp);
      window.removeEventListener("mousemove", handleGlobalMove);
    };
  }, [isDragging, handleMove]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full select-none overflow-hidden group cursor-ew-resize bg-muted", className)}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseMove={onMouseMove}
    >
      {/* 1. BOTTOM IMAGE (Processed / After) */}
      <img
        src={processed}
        alt="After"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
      />

      {/* 2. TOP IMAGE (Original / Before) - Clipped */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={original}
          alt="Before"
          className="absolute inset-0 w-full h-full object-contain max-w-none"
        />

        {/* Label Badge for 'Original' - Using Semantic Colors */}
        <div className="absolute top-4 left-4 bg-background/80 text-foreground border border-border/50 text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm shadow-sm">
          ORIGINAL
        </div>
      </div>

      {/* Label Badge for 'Processed' - Using Semantic Colors */}
      <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm pointer-events-none shadow-sm">
        PROCESSED
      </div>

      {/* 3. SLIDER HANDLE & LINE */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-primary cursor-ew-resize z-20 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-background border-2 border-primary rounded-full shadow-lg flex items-center justify-center">
          <ChevronsLeftRight className="w-4 h-4 text-primary" />
        </div>
      </div>

    </div>
  );
}