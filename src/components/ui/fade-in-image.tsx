"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface FadeInImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function FadeInImage({ src, alt, className, priority = false, ...props }: FadeInImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy Load Observer
  useEffect(() => {
    if (priority || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "50px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isVisible]);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <div ref={containerRef} className="relative w-full h-full">

      {/* 1. Loader (Spinner) */}
      {!hasError && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-500 ease-out bg-muted/5",
            isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <Loader2 className="w-6 h-6 text-muted-foreground/40 animate-spin" />
        </div>
      )}

      {/* 2. Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50 bg-muted/10">
          <ImageOff className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-[10px] uppercase font-bold tracking-widest">Failed</span>
        </div>
      )}

      {/* 3. The Image */}
      {isVisible && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-all duration-700 ease-in-out will-change-[opacity,transform]",
            isLoaded
              ? "opacity-100 scale-100 blur-0 grayscale-0"
              : "opacity-0 scale-110 blur-xl grayscale",
            className
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading={priority ? "eager" : undefined}
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
}