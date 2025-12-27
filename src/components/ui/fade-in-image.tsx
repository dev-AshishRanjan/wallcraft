"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface FadeInImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export function FadeInImage({ src, alt, className, ...props }: FadeInImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Skeleton - Visible only while loading */}
      {!isLoaded && (
        <Skeleton className="absolute inset-0 z-10 w-full h-full bg-nord-2 animate-pulse" />
      )}

      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "transition-all duration-700 ease-in-out w-full h-full object-cover",
          // Blur and Scale logic:
          // If NOT loaded: Blur it and scale it down slightly
          // If loaded: Remove blur and scale to normal
          !isLoaded ? "scale-105 blur-xl opacity-0" : "scale-100 blur-0 opacity-100",
          className
        )}
        {...props}
      />
    </div>
  );
}