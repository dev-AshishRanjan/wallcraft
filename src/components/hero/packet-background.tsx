"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CloudDownload, Palette, Check, X, Play, Image as ImageIcon } from "lucide-react";

type Point = { x: number; y: number };
type Status = "success" | "error";

type Phase =
  | "idle"
  | "starting"
  | "traveling-1"
  | "fetching"
  | "traveling-2"
  | "processing"
  | "traveling-3"
  | "finished"
  | "clearing";

export function PacketBackground() {
  const [mounted, setMounted] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState<Status>("success");

  const [points, setPoints] = useState<{ p1: Point; p2: Point; p3: Point; p4: Point }>({
    p1: { x: 5, y: 50 }, p2: { x: 30, y: 50 }, p3: { x: 60, y: 50 }, p4: { x: 90, y: 50 },
  });

  const [paths, setPaths] = useState<{ path1: string; path2: string; path3: string }>({
    path1: "", path2: "", path3: ""
  });

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(startSimulation, 1000);
    return () => clearTimeout(timer);
  }, []);

  // --- 1. Geometry & Logic ---
  const getRandomPoint = (section: 1 | 2 | 3 | 4) => {
    const yMin = 20; const yMax = 80;
    const randY = () => Math.floor(Math.random() * (yMax - yMin) + yMin);
    if (section === 1) return { x: Math.floor(Math.random() * 5 + 5), y: randY() };
    if (section === 2) return { x: Math.floor(Math.random() * 10 + 25), y: randY() };
    if (section === 3) return { x: Math.floor(Math.random() * 10 + 55), y: randY() };
    return { x: Math.floor(Math.random() * 5 + 85), y: randY() };
  };

  // FIX: New function to build paths with real rounded corners using Quadratic bezier curves (Q)
  const buildRoundedPath = (start: Point, end: Point) => {
    const midX = (start.x + end.x) / 2;
    const r = 3; // Corner radius (in SVG units 0-100)

    // Calculate safe radius so corners don't overlap on short segments
    const safeR = Math.min(r, Math.abs(midX - start.x) / 2, Math.abs(end.y - start.y) / 2, Math.abs(end.x - midX) / 2);

    // Determine directions for the curve offset
    const dirX1 = midX > start.x ? 1 : -1;
    const dirY = end.y > start.y ? 1 : -1;
    const dirX2 = end.x > midX ? 1 : -1;

    let d = `M ${start.x} ${start.y}`;
    // Line to start of first corner
    d += ` L ${midX - (safeR * dirX1)} ${start.y}`;
    // Curve 1 (Horizontal to Vertical)
    d += ` Q ${midX} ${start.y}, ${midX} ${start.y + (safeR * dirY)}`;
    // Line to start of second corner
    d += ` L ${midX} ${end.y - (safeR * dirY)}`;
    // Curve 2 (Vertical to Horizontal)
    d += ` Q ${midX} ${end.y}, ${midX + (safeR * dirX2)} ${end.y}`;
    // Line to end
    d += ` L ${end.x} ${end.y}`;

    return d;
  };

  // --- 2. Simulation Timeline ---
  const startSimulation = () => {
    if (!mounted && typeof window === "undefined") return;

    const p1 = getRandomPoint(1);
    const p2 = getRandomPoint(2);
    const p3 = getRandomPoint(3);
    const p4 = getRandomPoint(4);
    const nextStatus = Math.random() > 0.9 ? "error" : "success";

    setPoints({ p1, p2, p3, p4 });
    setPaths({
      // FIX: Use new rounded path builder
      path1: buildRoundedPath(p1, p2),
      path2: buildRoundedPath(p2, p3),
      path3: buildRoundedPath(p3, p4),
    });
    setStatus(nextStatus);
    setCycle(prev => prev + 1);

    // Sequence timeline (same as before)
    setPhase("starting");
    setTimeout(() => {
      setPhase("traveling-1");
      setTimeout(() => {
        setPhase("fetching");
        setTimeout(() => {
          setPhase("traveling-2");
          setTimeout(() => {
            setPhase("processing");
            setTimeout(() => {
              setPhase("traveling-3");
              setTimeout(() => {
                setPhase("finished");
                setTimeout(() => {
                  setPhase("clearing");
                  setTimeout(() => {
                    setPhase("idle");
                    setTimeout(startSimulation, 2000);
                  }, 1000);
                }, 3500);
              }, 1500);
            }, 2000);
          }, 1500);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  if (!mounted) return null;

  const isError = status === "error";
  const isClearing = phase === "clearing";

  const showPath1 = ["traveling-1", "fetching", "traveling-2", "processing", "traveling-3", "finished", "clearing"].includes(phase);
  const showPath2 = ["traveling-2", "processing", "traveling-3", "finished", "clearing"].includes(phase);
  const showPath3 = ["traveling-3", "finished", "clearing"].includes(phase);

  const showNode1 = phase !== "idle";
  const showNode2 = ["fetching", "traveling-2", "processing", "traveling-3", "finished", "clearing"].includes(phase);
  const showNode3 = ["processing", "traveling-3", "finished", "clearing"].includes(phase);
  const showNode4 = ["finished", "clearing"].includes(phase);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-background/50" aria-hidden="true">

      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <pattern id="grid-dots-detailed" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid-dots-detailed)" />
      </svg>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">

        {/* --- SEGMENT 1 --- */}
        {showPath1 && paths.path1 && (
          <>
            <path
              key={`p1-${cycle}`}
              d={paths.path1}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.12"
              strokeLinecap="round"
              strokeLinejoin="round" // Ensures smooth joins on the new curves
              className={cn("text-primary/40 transition-opacity duration-700", isClearing ? "opacity-0" : "opacity-100")}
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
              style={{ animation: "reveal-path 1.5s linear forwards" }}
            />
            {phase === "traveling-1" && (
              // FIX: Increased radius to 0.5 to ensure it looks perfectly circular
              <circle r="0.5" fill="currentColor" className="text-primary"
                style={{ offsetPath: `path("${paths.path1}")`, animation: "move-packet 1.5s linear forwards" }} />
            )}
          </>
        )}

        {/* --- SEGMENT 2 --- */}
        {showPath2 && paths.path2 && (
          <>
            <path
              key={`p2-${cycle}`}
              d={paths.path2}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.12"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("text-primary/40 transition-opacity duration-700", isClearing ? "opacity-0" : "opacity-100")}
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
              style={{ animation: "reveal-path 1.5s linear forwards" }}
            />
            {phase === "traveling-2" && (
              <circle r="0.5" fill="currentColor" className="text-primary"
                style={{ offsetPath: `path("${paths.path2}")`, animation: "move-packet 1.5s linear forwards" }} />
            )}
          </>
        )}

        {/* --- SEGMENT 3 --- */}
        {showPath3 && paths.path3 && (
          <>
            <path
              key={`p3-${cycle}`}
              d={paths.path3}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.12"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                "transition-opacity duration-700",
                isError ? "text-red-500/50" : "text-primary/40",
                isClearing ? "opacity-0" : "opacity-100"
              )}
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
              style={{ animation: "reveal-path 1.5s linear forwards" }}
            />
            {phase === "traveling-3" && (
              <circle r="0.5" fill="currentColor" className={isError ? "text-red-500" : "text-primary"}
                style={{ offsetPath: `path("${paths.path3}")`, animation: "move-packet 1.5s linear forwards" }} />
            )}
          </>
        )}
      </svg>


      {/* 3. HTML Nodes (Same as before) */}

      {/* NODE 1: START */}
      <div
        className={cn("absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700", showNode1 && !isClearing ? "opacity-100 scale-100" : "opacity-0 scale-50")}
        style={{ left: `${points.p1.x}%`, top: `${points.p1.y}%` }}
      >
        <div className="relative">
          {phase === "starting" && <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />}
          <div className="relative bg-card border border-border p-2 rounded-full shadow-sm">
            <Play className="w-3 h-3 fill-muted-foreground text-muted-foreground ml-0.5" />
          </div>
        </div>
      </div>

      {/* NODE 2: FETCH */}
      <div
        className={cn("absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500", showNode2 && !isClearing ? "opacity-100 scale-100" : "opacity-0 scale-50")}
        style={{ left: `${points.p2.x}%`, top: `${points.p2.y}%` }}
      >
        <div className="flex flex-col items-center gap-1">
          <div className="relative">
            {phase === "fetching" && <div className="absolute inset-0 bg-primary/20 rounded-md animate-ping" />}
            <div className="relative bg-background border border-border p-2 rounded-md shadow-md">
              <CloudDownload className={cn("w-4 h-4 text-muted-foreground", phase === "fetching" && "animate-bounce")} />
            </div>
          </div>
          {phase === "fetching" && (
            <span className="absolute top-10 text-[9px] font-mono whitespace-nowrap bg-background/90 px-1 rounded border animate-in fade-in slide-in-from-top-1">Fetching...</span>
          )}
        </div>
      </div>

      {/* NODE 3: THEME */}
      <div
        className={cn("absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500", showNode3 && !isClearing ? "opacity-100 scale-100" : "opacity-0 scale-50")}
        style={{ left: `${points.p3.x}%`, top: `${points.p3.y}%` }}
      >
        <div className="flex flex-col items-center gap-1">
          <div className="relative">
            {phase === "processing" && <div className="absolute inset-0 bg-primary/20 rounded-md animate-ping" />}
            <div className="relative bg-background border border-border p-2 rounded-md shadow-md">
              <Palette className={cn("w-4 h-4", phase === "processing" ? "text-primary animate-pulse" : "text-muted-foreground")} />
            </div>
          </div>
          {phase === "processing" && (
            <span className="absolute top-10 text-[9px] font-mono whitespace-nowrap bg-background/90 px-1 rounded border animate-in fade-in slide-in-from-top-1">Processing...</span>
          )}
        </div>
      </div>

      {/* NODE 4: RESULT */}
      <div
        className={cn("absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500", showNode4 && !isClearing ? "opacity-100 scale-100" : "opacity-0 scale-50")}
        style={{ left: `${points.p4.x}%`, top: `${points.p4.y}%` }}
      >
        <div className={cn("flex items-center gap-2 bg-background border px-3 py-1.5 rounded-lg shadow-xl", isError ? "border-red-500/30" : "border-primary/30")}>
          {isError ? <X className="w-4 h-4 text-red-500" /> : <ImageIcon className="w-4 h-4 text-primary" />}
          <div className="flex flex-col leading-none">
            <span className={cn("text-[10px] font-bold", isError ? "text-red-500" : "text-primary")}>{isError ? "ERROR" : "READY"}</span>
            <span className="text-[8px] text-muted-foreground mt-0.5">{isError ? "Retry" : "4K Export"}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
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