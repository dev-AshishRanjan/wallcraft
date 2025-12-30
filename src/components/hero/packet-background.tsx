"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { CloudDownload, Palette, Check, X, Play, Image as ImageIcon } from "lucide-react";

type Point = { x: number; y: number };
type Phase = "idle" | "starting" | "traveling-1" | "fetching" | "traveling-2" | "processing" | "traveling-3" | "finished" | "clearing";

export function PacketBackground() {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState<"success" | "error">("success");

  // Ref for coordinates to ensure they don't shift during re-renders
  const coordsRef = useRef<{ p1: Point; p2: Point; p3: Point; p4: Point }>({
    p1: { x: 0, y: 0 }, p2: { x: 0, y: 0 }, p3: { x: 0, y: 0 }, p4: { x: 0, y: 0 }
  });

  const [paths, setPaths] = useState<{ path1: string; path2: string; path3: string }>({ path1: "", path2: "", path3: "" });

  // --- 1. RESIZE OBSERVER (Robust Dimensions) ---
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Initial measure
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- 2. PATH BUILDER (Quadratic Bezier Curves) ---
  const buildCurvedPath = useCallback((start: Point, end: Point) => {
    const midX = (start.x + end.x) / 2;
    // Fixed radius ensures consistent corner shape regardless of distance
    const r = 24;
    const safeR = Math.min(r, Math.abs(midX - start.x) / 2, Math.abs(end.y - start.y) / 2);

    const dirX1 = midX > start.x ? 1 : -1;
    const dirY = end.y > start.y ? 1 : -1;
    const dirX2 = end.x > midX ? 1 : -1;

    return [
      `M ${start.x} ${start.y}`,
      `L ${midX - (safeR * dirX1)} ${start.y}`,
      `Q ${midX} ${start.y}, ${midX} ${start.y + (safeR * dirY)}`,
      `L ${midX} ${end.y - (safeR * dirY)}`,
      `Q ${midX} ${end.y}, ${midX + (safeR * dirX2)} ${end.y}`,
      `L ${end.x} ${end.y}`
    ].join(" ");
  }, []);

  // --- 3. COORDINATE LOGIC ---
  const generateNewCoords = useCallback(() => {
    if (!dimensions) return;
    const { width, height } = dimensions;

    // Margins to keep nodes away from absolute edges
    const minY = height * 0.25;
    const maxY = height * 0.75;
    const randY = () => Math.floor(Math.random() * (maxY - minY) + minY);

    const p1 = { x: width * 0.1, y: randY() };
    const p2 = { x: width * 0.35, y: randY() };
    const p3 = { x: width * 0.65, y: randY() };
    const p4 = { x: width * 0.9, y: randY() };

    coordsRef.current = { p1, p2, p3, p4 };

    setPaths({
      path1: buildCurvedPath(p1, p2),
      path2: buildCurvedPath(p2, p3),
      path3: buildCurvedPath(p3, p4),
    });
    setStatus(Math.random() > 0.85 ? "error" : "success");
  }, [dimensions, buildCurvedPath]);

  // --- 4. STATE MACHINE (Atomic Transitions) ---
  useEffect(() => {
    if (!dimensions) return;

    let timeoutId: NodeJS.Timeout;

    // Helper to schedule next phase
    const next = (p: Phase, ms: number) => {
      timeoutId = setTimeout(() => setPhase(p), ms);
    };

    switch (phase) {
      case "idle":
        if (dimensions.width > 0) {
          generateNewCoords();
          next("starting", 500);
        }
        break;
      case "starting": next("traveling-1", 1000); break;
      case "traveling-1": next("fetching", 1500); break; // Matches CSS animation duration
      case "fetching": next("traveling-2", 2000); break;
      case "traveling-2": next("processing", 1500); break;
      case "processing": next("traveling-3", 2500); break;
      case "traveling-3": next("finished", 1500); break;
      case "finished": next("clearing", 3500); break;
      case "clearing": next("idle", 1000); break;
    }

    return () => clearTimeout(timeoutId);
  }, [phase, dimensions, generateNewCoords]);


  // --- RENDER ---
  if (!dimensions) return null;

  const { p1, p2, p3, p4 } = coordsRef.current;
  const isClearing = phase === "clearing";
  const isError = status === "error";

  // Visibility flags
  const showP1 = phase !== "idle";
  const showP2 = ["fetching", "traveling-2", "processing", "traveling-3", "finished", "clearing"].includes(phase);
  const showP3 = ["processing", "traveling-3", "finished", "clearing"].includes(phase);
  const showP4 = ["finished", "clearing"].includes(phase);

  const showPath1 = ["traveling-1", "fetching", "traveling-2", "processing", "traveling-3", "finished", "clearing"].includes(phase);
  const showPath2 = ["traveling-2", "processing", "traveling-3", "finished", "clearing"].includes(phase);
  const showPath3 = ["traveling-3", "finished", "clearing"].includes(phase);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-background/50" aria-hidden="true">

      {/* 1. Grid Background */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] block" xmlns="http://www.w3.org/2000/svg">
        <pattern id="grid-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      {/* 2. SVG Paths (Z-Index 0) */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 z-0 block" // block is crucial to remove line-height spacing
      >
        {/* PATH 1 */}
        {showPath1 && paths.path1 && (
          <g>
            <path d={paths.path1} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className={cn("text-primary/40 transition-opacity duration-700", isClearing ? "opacity-0" : "opacity-100")}
              pathLength="1" strokeDasharray="1" strokeDashoffset="1"
              style={{ animation: "reveal-path 1.5s linear forwards" }}
            />
            {phase === "traveling-1" && (
              <circle r="4" fill="currentColor" className="text-primary"
                style={{ offsetPath: `path('${paths.path1}')`, animation: "move-packet 1.5s linear forwards" }}
              />
            )}
          </g>
        )}

        {/* PATH 2 */}
        {showPath2 && paths.path2 && (
          <g>
            <path d={paths.path2} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className={cn("text-primary/40 transition-opacity duration-700", isClearing ? "opacity-0" : "opacity-100")}
              pathLength="1" strokeDasharray="1" strokeDashoffset="1"
              style={{ animation: "reveal-path 1.5s linear forwards" }}
            />
            {phase === "traveling-2" && (
              <circle r="4" fill="currentColor" className="text-primary"
                style={{ offsetPath: `path('${paths.path2}')`, animation: "move-packet 1.5s linear forwards" }}
              />
            )}
          </g>
        )}

        {/* PATH 3 */}
        {showPath3 && paths.path3 && (
          <g>
            <path d={paths.path3} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className={cn("transition-opacity duration-700", isError ? "text-red-500/50" : "text-primary/40", isClearing ? "opacity-0" : "opacity-100")}
              pathLength="1" strokeDasharray="1" strokeDashoffset="1"
              style={{ animation: "reveal-path 1.5s linear forwards" }}
            />
            {phase === "traveling-3" && (
              <circle r="4" fill="currentColor" className={isError ? "text-red-500" : "text-primary"}
                style={{ offsetPath: `path('${paths.path3}')`, animation: "move-packet 1.5s linear forwards" }}
              />
            )}
          </g>
        )}
      </svg>

      {/* 3. HTML Nodes (Z-Index 10) */}
      {/* CRITICAL FIX: 
          We position the wrapper div at (x,y).
          We translate it -50% -50% so (x,y) is exactly in the center of the wrapper.
          The Icon Box inside is flex-centered.
          The Text Labels are ABSOLUTE positioned outside the flow, so they don't shift the center point.
      */}

      {/* NODE 1: START */}
      <div
        className={cn("absolute z-10 left-0 top-0 transition-all duration-700", showP1 && !isClearing ? "opacity-100 scale-100" : "opacity-0 scale-50")}
        style={{ transform: `translate(${p1.x}px, ${p1.y}px) translate(-50%, -50%)` }}
      >
        {/* Icon Box - Perfectly Centered */}
        <div className="bg-card border border-border p-2 rounded-full shadow-sm relative">
          <div className="w-4 h-4 flex items-center justify-center">
            <Play className="w-3 h-3 text-muted-foreground ml-0.5" />
          </div>
          {/* Pulse Ring */}
          {phase === "starting" && <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />}
        </div>
      </div>

      {/* NODE 2: FETCH */}
      <div
        className={cn("absolute z-10 left-0 top-0 transition-all duration-500", showP2 && !isClearing ? "opacity-100 scale-100" : "opacity-0 scale-50")}
        style={{ transform: `translate(${p2.x}px, ${p2.y}px) translate(-50%, -50%)` }}
      >
        <div className="bg-background border border-border p-2 rounded-md shadow-md relative">
          <div className="w-5 h-5 flex items-center justify-center">
            <CloudDownload className={cn("w-4 h-4 text-muted-foreground", phase === "fetching" && "animate-bounce")} />
          </div>
          {phase === "fetching" && <div className="absolute inset-0 bg-primary/20 rounded-md animate-ping" />}
        </div>
        {/* Label: Absolute position so it doesn't affect centering */}
        {phase === "fetching" && (
          <div className="absolute top-[120%] left-1/2 -translate-x-1/2 bg-background/90 px-1.5 py-0.5 rounded border text-[9px] font-mono whitespace-nowrap animate-in fade-in slide-in-from-top-1">
            Fetching...
          </div>
        )}
      </div>

      {/* NODE 3: THEME */}
      <div
        className={cn("absolute z-10 left-0 top-0 transition-all duration-500", showP3 && !isClearing ? "opacity-100 scale-100" : "opacity-0 scale-50")}
        style={{ transform: `translate(${p3.x}px, ${p3.y}px) translate(-50%, -50%)` }}
      >
        <div className="bg-background border border-border p-2 rounded-md shadow-md relative">
          <div className="w-5 h-5 flex items-center justify-center">
            <Palette className={cn("w-4 h-4", phase === "processing" ? "text-primary animate-pulse" : "text-muted-foreground")} />
          </div>
          {phase === "processing" && <div className="absolute inset-0 bg-primary/20 rounded-md animate-ping" />}
        </div>
        {phase === "processing" && (
          <div className="absolute top-[120%] left-1/2 -translate-x-1/2 bg-background/90 px-1.5 py-0.5 rounded border text-[9px] font-mono whitespace-nowrap animate-in fade-in slide-in-from-top-1">
            Processing...
          </div>
        )}
      </div>

      {/* NODE 4: RESULT */}
      <div
        className={cn("absolute z-10 left-0 top-0 transition-all duration-500", showP4 && !isClearing ? "opacity-100 scale-100" : "opacity-0 scale-50")}
        style={{ transform: `translate(${p4.x}px, ${p4.y}px) translate(-50%, -50%)` }}
      >
        <div className={cn("flex items-center gap-2 bg-background border px-3 py-1.5 rounded-lg shadow-xl", isError ? "border-red-500/30" : "border-primary/30")}>
          {isError ? <X className="w-4 h-4 text-red-500" /> : <ImageIcon className="w-4 h-4 text-primary" />}
          <div className="flex flex-col leading-none">
            <span className={cn("text-[10px] font-bold", isError ? "text-red-500" : "text-primary")}>{isError ? "ERROR" : "READY"}</span>
            <span className="text-[8px] text-muted-foreground mt-0.5">{isError ? "Retry" : "4K Export"}</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes reveal-path {
          from { stroke-dashoffset: 1; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes move-packet {
          from { offset-distance: 0%; }
          to { offset-distance: 100%; }
        }
      `}</style>
    </div>
  );
}