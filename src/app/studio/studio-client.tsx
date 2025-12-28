"use client";

import { useState, useRef } from "react";
import {
  Upload, Download, Loader2, Image as ImageIcon,
  RefreshCw, X, ArrowUp, ArrowDown, Plus,
  Trash2, Wand2, Settings2, ZoomIn, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { processImageStack } from "@/lib/browser-theme-engine";
import { Theme } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CompareSlider } from "@/components/ui/compare-slider";

interface StudioClientProps {
  themes: Theme[];
}

type Layer = {
  id: string;
  themeName: string;
};

export function StudioClient({ themes }: StudioClientProps) {
  // --- STATE ---
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Original
  const [processedUrl, setProcessedUrl] = useState<string | null>(null); // Result
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Mode & Layers
  const [isStackMode, setIsStackMode] = useState(false);
  const [simpleTheme, setSimpleTheme] = useState<string>(themes[0]?.name || "Nord");
  const [layers, setLayers] = useState<Layer[]>([{ id: '1', themeName: themes[0]?.name || "Nord" }]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ACTIONS ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) loadFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
  };

  const loadFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setProcessedUrl(null);
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);

    // Give UI a moment to update loading state
    setTimeout(async () => {
      try {
        // 1. Determine Stack
        let activeStack: string[] = [];

        if (isStackMode) {
          activeStack = layers.map(l => l.themeName);
        } else {
          activeStack = [simpleTheme];
        }

        // 2. Get Colors for each layer
        const paletteStack = activeStack.map(name => {
          const t = themes.find(x => x.name === name);
          return t ? t.colors : [];
        }).filter(colors => colors.length > 0);

        // 3. Process
        const url = await processImageStack(file, paletteStack);
        setProcessedUrl(url);
      } catch (err) {
        console.error(err);
        alert("Processing failed.");
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  // --- LAYER MANAGEMENT ---
  const addLayer = () => {
    setLayers([...layers, { id: crypto.randomUUID(), themeName: themes[0].name }]);
  };

  const removeLayer = (id: string) => {
    if (layers.length <= 1) return; // Prevent empty
    setLayers(layers.filter(l => l.id !== id));
  };

  const moveLayer = (index: number, direction: -1 | 1) => {
    const newLayers = [...layers];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newLayers.length) return;

    [newLayers[index], newLayers[targetIndex]] = [newLayers[targetIndex], newLayers[index]];
    setLayers(newLayers);
  };

  const updateLayerTheme = (id: string, newTheme: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, themeName: newTheme } : l));
  };

  // --- RENDER ---
  return (
    <div className="flex flex-col lg:flex-row h-full bg-background">

      {/* 1. SIDEBAR (CONTROLS) */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-card/30 flex flex-col shrink-0 overflow-hidden h-full">
        {/* ... Keep sidebar content exactly as before ... */}
        {/* (Header, ScrollArea, Input, Switch, Theme Stack, Generate Button) */}

        {/* RE-PASTING SIDEBAR FOR CONTEXT IF NEEDED, BUT YOU CAN KEEP EXISTING CODE */}
        <div className="p-4 border-b">
          <h2 className="font-bold flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" /> Configuration
          </h2>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">

            {/* INPUT SECTION */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Source Image</Label>
              {!file ? (
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors",
                    dragActive ? "border-primary bg-primary/10" : "border-border hover:bg-accent/50"
                  )}
                  onDragEnter={() => setDragActive(true)}
                  onDragLeave={() => setDragActive(false)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-xs font-medium text-muted-foreground">Click or Drag Image</span>
                </div>
              ) : (
                <div className="relative group rounded-lg overflow-hidden border">
                  <img src={previewUrl!} className="w-full h-32 object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Button variant="destructive" size="sm" onClick={() => { setFile(null); setProcessedUrl(null); }}>
                      <Trash2 className="w-4 h-4 mr-2" /> Remove
                    </Button>
                  </div>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
            </div>

            {/* MODE TOGGLE */}
            <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Stack Mode</Label>
                <p className="text-[10px] text-muted-foreground">Apply multiple themes</p>
              </div>
              <Switch checked={isStackMode} onCheckedChange={setIsStackMode} />
            </div>

            {/* THEME CONFIGURATION */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase flex justify-between items-center">
                {isStackMode ? "Layer Stack" : "Active Theme"}
                {isStackMode && (
                  <span className="text-[10px] font-normal opacity-70">Top to Bottom</span>
                )}
              </Label>

              {isStackMode ? (
                // --- STACK MODE ---
                <div className="space-y-2">
                  {layers.map((layer, index) => (
                    <div key={layer.id} className="flex items-center gap-2 p-2 bg-background border rounded-md shadow-sm group animate-in slide-in-from-left-2 fade-in">
                      <span className="text-xs font-mono text-muted-foreground w-4">{index + 1}</span>
                      <Select value={layer.themeName} onValueChange={(val) => updateLayerTheme(layer.id, val)}>
                        <SelectTrigger className="h-8 text-xs flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {themes.map(t => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>

                      {/* Controls */}
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost" size="icon" className="h-6 w-6"
                          onClick={() => moveLayer(index, -1)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-6 w-6"
                          onClick={() => moveLayer(index, 1)}
                          disabled={index === layers.length - 1}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeLayer(layer.id)}
                          disabled={layers.length === 1}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full text-xs dashed border-dashed" onClick={addLayer}>
                    <Plus className="w-3 h-3 mr-2" /> Add Theme Layer
                  </Button>
                </div>
              ) : (
                // --- SIMPLE MODE ---
                <Select value={simpleTheme} onValueChange={setSimpleTheme}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map(t => (
                      <SelectItem key={t.name} value={t.name}>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {t.colors.slice(0, 3).map(c => (
                              <div key={c} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          {t.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Button
              size="lg"
              className="w-full font-bold shadow-lg"
              onClick={handleProcess}
              disabled={!file || isProcessing}
            >
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <><Wand2 className="w-4 h-4 mr-2" /> Generate Wallpaper</>
              )}
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* 2. MAIN WORKSPACE (CANVAS) */}
      <div className="flex-1 bg-muted/20 flex flex-col relative overflow-hidden h-full">

        {/* Workspace Toolbar */}
        <div className="h-14 border-b bg-background/50 backdrop-blur flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ZoomIn className="w-4 h-4" />
            <span className="font-medium">Workspace</span>
            {processedUrl && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-accent/50 px-2 py-0.5 rounded-full ml-2">
                <Info className="w-3 h-3" /> Drag slider to compare
              </span>
            )}
          </div>
          {processedUrl && (
            <Button
              size="sm"
              onClick={() => {
                const link = document.createElement("a");
                link.href = processedUrl;
                link.download = `wallcraft-studio-${Date.now()}.png`;
                link.click();
              }}
            >
              <Download className="w-4 h-4 mr-2" /> Download Result
            </Button>
          )}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden p-0 flex items-center justify-center bg-[url('/grid-pattern.svg')] bg-center relative">

          {processedUrl && previewUrl ? (
            // --- COMPARISON MODE ---
            <div className="relative w-full h-full p-8 flex items-center justify-center">
              <div className="relative shadow-2xl rounded-lg overflow-hidden border bg-background/50 max-w-full max-h-full animate-in zoom-in-95 duration-300">
                {/* This wrapper limits the size to the image aspect ratio so it fits on screen */}
                <div className="relative max-h-[calc(100vh-8rem)] aspect-[16/9] min-w-[50vw]">
                  <CompareSlider
                    original={previewUrl}
                    processed={processedUrl}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          ) : file ? (
            // --- PREVIEW MODE ---
            <div className="relative shadow-xl rounded-lg overflow-hidden border bg-background opacity-80 transition-all duration-500 p-2">
              <img src={previewUrl!} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Badge variant="secondary" className="text-lg px-4 py-2 shadow-lg backdrop-blur-md bg-background/80">Original Preview</Badge>
              </div>
            </div>
          ) : (
            // --- EMPTY STATE ---
            <div className="flex flex-col items-center justify-center text-muted-foreground opacity-30 select-none">
              <ImageIcon className="w-24 h-24 mb-6 stroke-1" />
              <p className="text-xl font-medium">No image loaded</p>
              <p className="text-sm">Upload an image from the sidebar to begin</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}