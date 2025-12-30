"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { ImageIcon, Cpu, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type Point = { x: number; y: number };
type Status = "pending" | "success" | "error";
type Phase =
  | "idle"              // Waiting to start
  | "traveling-to-mid"  // Line drawing from Start -> Node
  | "processing"        // Node pulsing
  | "traveling-to-end"  // Line drawing from Node -> End
  | "revealed";         // Result shown

export function NetworkBackground() {
  const [mounted, setMounted] = useState(false);
  const [cycleId, setCycleId] = useState(0);

  // --- State for the current simulation cycle ---
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState<Status>("success");

  // Coordinates (0-100 percentage)
  const [points, setPoints] = useState<{ start: Point; mid: Point; end: Point }>({
    start: { x: 10, y: 50 },
    mid: { x: 50, y: 50 },
    end: { x: 90, y: 50 },
  });

  // Paths
  const [path1, setPath1] = useState("");
  const [path2, setPath2] = useState("");

  useEffect(() => {
    setMounted(true);
    runSimulation();
  }, []);

  // --- 1. Random Coordinate Generator ---
  const getRandomPoint = (section: "start" | "mid" | "end") => {
    const yMin = 15;
    const yMax = 85;
    const randY = () => Math.floor(Math.random() * (yMax - yMin) + yMin);

    if (section === "start") return { x: Math.floor(Math.random() * 10 + 5), y: randY() };    // 5-15%
    if (section === "mid") return { x: Math.floor(Math.random() * 20 + 40), y: randY() };     // 40-60%
    return { x: Math.floor(Math.random() * 10 + 85), y: randY() };                            // 85-95%
  };

  // --- 2. Orthogonal (Network) Path Builder ---
  const buildPath = (p1: Point, p2: Point) => {
    const midX = (p1.x + p2.x) / 2;
    // Creates a "step" line: Horizontal -> Vertical -> Horizontal
    return `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
  };

  // --- 3. The Simulation Loop ---
  const runSimulation = () => {
    if (!mounted && typeof window === "undefined") return;

    // A. Setup New Data
    const p1 = getRandomPoint("start");
    const p2 = getRandomPoint("mid");
    const p3 = getRandomPoint("end");

    // B. Determine Fate (20% chance of failure)
    const isError = Math.random() > 0.8;
    const nextStatus = isError ? "error" : "success";

    setPoints({ start: p1, mid: p2, end: p3 });
    setPath1(buildPath(p1, p2));
    setPath2(buildPath(p2, p3));
    setStatus(nextStatus);
    setCycleId(prev => prev + 1); // Force re-render of paths

    // C. Execute Timeline
    setPhase("idle");

    setTimeout(() => {
      // Step 1: Reveal Start & Travel to Processor
      setPhase("traveling-to-mid");

      setTimeout(() => {
        // Step 2: Arrive at Processor & Process
        setPhase("processing");

        setTimeout(() => {
          // Step 3: Travel to Destination
          setPhase("traveling-to-end");

          setTimeout(() => {
            // Step 4: Arrive & Reveal Result
            setPhase("revealed");

            // Step 5: Fade out & Restart
            setTimeout(() => {
              setPhase("idle"); // This fades everything out via CSS
              setTimeout(runSimulation, 1000); // Wait 1s then restart
            }, 3000);

          }, 1000); // Duration of Travel 2

        }, 1500); // Duration of Processing

      }, 1000); // Duration of Travel 1

    }, 500); // Initial Delay
  };

  if (!mounted) return null;

  // Colors
  const beamColor = status === "error" && (phase === "traveling-to-end" || phase === "revealed")
    ? "#ef4444" // Red (Tailwind red-500)
    : "var(--primary)"; // Theme Primary

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-background/50" aria-hidden="true">

      {/* BACKGROUND: Cyber Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* SVG LAYER: Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">

        {/* PATH 1: Start -> Mid */}
        {/* Only exists if we are traveling or past it */}
        {phase !== "idle" && (
          <path
            key={`p1-${cycleId}`} // Key forces animation restart
            d={path1}
            fill="none"
            stroke={beamColor}
            strokeWidth="0.3"
            vectorEffect="non-scaling-stroke"
            pathLength="1"
            className={cn(
              "transition-opacity duration-500",
              // Fade out the path once we arrive at the next node (optional "disappearing path" effect)
              phase === "processing" ? "opacity-30" : "opacity-100",
              "animate-network-draw"
            )}
          />
        )}

        {/* PATH 2: Mid -> End */}
        {(phase === "traveling-to-end" || phase === "revealed") && (
          <path
            key={`p2-${cycleId}`}
            d={path2}
            fill="none"
            stroke={beamColor}
            strokeWidth="0.3"
            vectorEffect="non-scaling-stroke"
            pathLength="1"
            className="animate-network-draw"
          />
        )}
      </svg>


      {/* HTML LAYER: Nodes (Revealed by the beam) */}

      {/* 1. START NODE (Revealed immediately on travel) */}
      <div
        className={cn(
          "absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500",
          phase !== "idle" ? "opacity-100 scale-100" : "opacity-0 scale-0"
        )}
        style={{ left: `${points.start.x}%`, top: `${points.start.y}%` }}
      >
        <div className="bg-background border border-border p-2 rounded-md shadow-lg flex flex-col items-center gap-1">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] font-mono text-muted-foreground uppercase">IMG_001</span>
        </div>
      </div>

      {/* 2. PROCESS NODE (Revealed when beam hits it) */}
      <div
        className={cn(
          "absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300",
          (phase === "processing" || phase === "traveling-to-end" || phase === "revealed") ? "opacity-100 scale-100" : "opacity-0 scale-0"
        )}
        style={{ left: `${points.mid.x}%`, top: `${points.mid.y}%` }}
      >
        {/* Status Badge */}
        <div className="relative bg-card border border-border p-2 rounded-full shadow-xl z-10 flex items-center justify-center w-10 h-10">
          <Cpu className={cn(
            "w-5 h-5 transition-colors duration-300",
            phase === "processing" ? "text-primary animate-pulse" : "text-muted-foreground"
          )} />

          {/* Spinner Ring */}
          {phase === "processing" && (
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          )}
        </div>
      </div>

      {/* 3. END NODE (Revealed at end) */}
      <div
        className={cn(
          "absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500",
          phase === "revealed" ? "opacity-100 scale-100" : "opacity-0 scale-0"
        )}
        style={{ left: `${points.end.x}%`, top: `${points.end.y}%` }}
      >
        {/* SUCCESS STATE */}
        {status === "success" ? (
          <div className="flex items-center gap-2 bg-background border border-primary/20 px-3 py-1.5 rounded-lg shadow-[0_0_15px_-3px_var(--primary)]">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-primary leading-none">COMPLETE</span>
              <span className="text-[8px] text-muted-foreground leading-none mt-0.5">Theme Applied</span>
            </div>
          </div>
        ) : (
          /* FAILURE STATE */
          <div className="flex items-center gap-2 bg-background border border-red-500/20 px-3 py-1.5 rounded-lg shadow-[0_0_15px_-3px_rgba(239,68,68,0.5)]">
            <XCircle className="w-4 h-4 text-red-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-red-500 leading-none">ERROR</span>
              <span className="text-[8px] text-muted-foreground leading-none mt-0.5">Low Contrast</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-network-draw {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: draw-network 1s ease-out forwards;
        }

        @keyframes draw-network {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}