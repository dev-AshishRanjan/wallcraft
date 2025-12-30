"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function HeroBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      
      {/* 1. Background Gradient Mesh (Optional, adds depth) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background opacity-40" />

      {/* 2. The SVG Animation */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.15] dark:opacity-[0.2]"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient for the flow lines to make them fade in/out */}
          <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
          
          {/* Mask to fade edges so it doesn't cut off harshly */}
          <mask id="hero-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect width="100%" height="100%" fill="url(#fade-edges)" />
          </mask>
          <radialGradient id="fade-edges">
            <stop offset="0%" stopColor="black" />
            <stop offset="80%" stopColor="black" />
            <stop offset="100%" stopColor="white" />
          </radialGradient>
        </defs>

        <g className="hero-lines">
          {/* Path 1: Top Curve 
            We duplicate paths: 
            1. Base darker line (Structure)
            2. Animated overlay line (The Pulse)
          */}
          <path
            d="M-100,200 C100,200 250,100 500,100 S900,200 1100,200"
            className="stroke-foreground/20 fill-none stroke-[1px]"
          />
          <path
            d="M-100,200 C100,200 250,100 500,100 S900,200 1100,200"
            className="fill-none stroke-[2px] animate-flow-slow"
            stroke="url(#pulse-gradient)"
          />

          {/* Path 2: Middle Straight-ish Flow */}
          <path
            d="M-100,300 C150,300 300,300 500,300 S850,300 1100,300"
            className="stroke-foreground/10 fill-none stroke-[1px]"
          />
          <path
            d="M-100,300 C150,300 300,300 500,300 S850,300 1100,300"
            className="fill-none stroke-[2px] animate-flow-medium"
            stroke="url(#pulse-gradient)"
          />

          {/* Path 3: Bottom Curve */}
          <path
            d="M-100,400 C100,400 250,500 500,500 S900,400 1100,400"
            className="stroke-foreground/20 fill-none stroke-[1px]"
          />
          <path
            d="M-100,400 C100,400 250,500 500,500 S900,400 1100,400"
            className="fill-none stroke-[2px] animate-flow-fast"
            stroke="url(#pulse-gradient)"
          />
        </g>
      </svg>
      
      {/* 3. Global CSS for the animation (Scoped to this component) */}
      <style jsx>{`
        .animate-flow-slow {
          stroke-dasharray: 100 1000;
          stroke-dashoffset: 1100;
          animation: flow 15s linear infinite;
        }
        .animate-flow-medium {
          stroke-dasharray: 80 800;
          stroke-dashoffset: 900;
          animation: flow 10s linear infinite;
          animation-delay: 2s;
        }
        .animate-flow-fast {
          stroke-dasharray: 60 600;
          stroke-dashoffset: 700;
          animation: flow 7s linear infinite;
          animation-delay: 1s;
        }

        @keyframes flow {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>
    </div>
  );
}