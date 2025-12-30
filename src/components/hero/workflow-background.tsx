"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function WorkflowBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-background/50" aria-hidden="true">

      {/* 1. Background Grid Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="small-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#small-grid)" />
      </svg>

      {/* 2. The Workflow Animation */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient for the active beam */}
          <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>

          {/* Glow Filter for nodes */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- GROUP: The Workflow Circuit --- */}
        <g className="workflow-circuit opacity-60 dark:opacity-80">

          {/* SEGMENT 1: Input -> Processor (Zig Zag Up) */}
          {/* Path: Start(100,300) -> Right(300,300) -> Up(300,150) -> Right(500,150) -> Down(500,300) -> Processor(600,300) */}
          <path
            d="M100,300 L280,300 Q300,300 300,280 L300,170 Q300,150 320,150 L480,150 Q500,150 500,170 L500,280 Q500,300 520,300 L600,300"
            className="fill-none stroke-muted-foreground/20 stroke-[2px]"
          />
          <path
            d="M100,300 L280,300 Q300,300 300,280 L300,170 Q300,150 320,150 L480,150 Q500,150 500,170 L500,280 Q500,300 520,300 L600,300"
            className="fill-none stroke-[3px] animate-circuit-1"
            stroke="url(#beam-gradient)"
            strokeLinecap="round"
          />

          {/* SEGMENT 2: Processor -> Output (Zig Zag Down) */}
          {/* Path: Processor(600,300) -> Right(680,300) -> Down(700,450) -> Right(900,450) -> Up(900,300) -> End(1100,300) */}
          <path
            d="M600,300 L680,300 Q700,300 700,320 L700,430 Q700,450 720,450 L880,450 Q900,450 900,430 L900,320 Q900,300 920,300 L1100,300"
            className="fill-none stroke-muted-foreground/20 stroke-[2px]"
          />
          <path
            d="M600,300 L680,300 Q700,300 700,320 L700,430 Q700,450 720,450 L880,450 Q900,450 900,430 L900,320 Q900,300 920,300 L1100,300"
            className="fill-none stroke-[3px] animate-circuit-2"
            stroke="url(#beam-gradient)"
            strokeLinecap="round"
          />

          {/* --- NODES --- */}

          {/* NODE 1: INPUT (Raw Image) */}
          <g transform="translate(100, 300)">
            <circle r="6" className="fill-background stroke-muted-foreground stroke-2" />
            <text x="0" y="25" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono opacity-50">RAW</text>
          </g>

          {/* NODE 2: PROCESSOR (Theme Engine) */}
          <g transform="translate(600, 300)">
            <circle r="12" className="fill-background stroke-primary stroke-2 animate-pulse-slow" filter="url(#glow)" />
            {/* Minimal Code Icon inside */}
            <path d="M-4 -2 L-6 0 L-4 2 M4 -2 L6 0 L4 2" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
            <text x="0" y="35" textAnchor="middle" className="text-[10px] fill-primary font-mono tracking-widest uppercase">Theme</text>

            {/* Processing Rings */}
            <circle r="18" className="fill-none stroke-primary/30 stroke-1 animate-ping-slow" />
          </g>

          {/* NODE 3: OUTPUT (4K Wallpaper) */}
          <g transform="translate(1100, 300)">
            <circle r="8" className="fill-primary stroke-none animate-scale-in" filter="url(#glow)" />
            <text x="0" y="25" textAnchor="middle" className="text-[10px] fill-foreground font-bold font-mono">4K</text>
          </g>

        </g>
      </svg>

      {/* 3. Animation Styles */}
      <style jsx>{`
        /* Segment 1: Draws from 0s to 3s */
        .animate-circuit-1 {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw-line 8s ease-in-out infinite;
        }

        /* Segment 2: Draws from 4s to 7s (Waits for processing) */
        .animate-circuit-2 {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw-line 8s ease-in-out infinite;
          animation-delay: 4s; /* Starts after processing */
        }

        /* Node Pulse */
        .animate-pulse-slow {
          animation: pulse-node 8s ease-in-out infinite;
        }

        /* Processing Ping */
        .animate-ping-slow {
          opacity: 0;
          animation: process-ping 8s ease-out infinite;
          animation-delay: 3s; /* Fires when line 1 hits it */
        }
        
        /* Final Result Pop */
        .animate-scale-in {
            animation: pop-in 8s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite;
            transform-box: fill-box;
            transform-origin: center;
            opacity: 0;
            animation-delay: 7s;
        }

        @keyframes draw-line {
          0% { stroke-dashoffset: 1000; opacity: 0;}
          10% { opacity: 1; }
          40% { stroke-dashoffset: 0; opacity: 1; }
          50% { stroke-dashoffset: -1000; opacity: 0; }
          100% { stroke-dashoffset: -1000; opacity: 0; }
        }

        @keyframes pulse-node {
          0%, 30% { transform: scale(1); stroke-width: 2px; }
          35%, 45% { transform: scale(1.2); stroke-width: 3px; stroke: var(--primary); }
          50%, 100% { transform: scale(1); stroke-width: 2px; }
        }

        @keyframes process-ping {
          0% { transform: scale(0.8); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: scale(2); opacity: 0; }
          100% { transform: scale(2); opacity: 0; }
        }
        
        @keyframes pop-in {
            0% { transform: scale(0); opacity: 0; }
            10% { transform: scale(1); opacity: 1; }
            30% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}