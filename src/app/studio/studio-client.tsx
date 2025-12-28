"use client";

import { useState, useRef } from "react";
import {
  Upload, Download, Loader2, Image as ImageIcon,
  X, ArrowUp, ArrowDown, Plus,
  Trash2, Wand2, Settings2, ZoomIn, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
import { CompareSlider } from "@/components/ui/compare-slider";

interface StudioClientProps {
  themes: Theme[];
}

type Layer = {
  id: string;
  themeName: string;
};

export function StudioClient({ themes }: StudioClientProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isStackMode, setIsStackMode] = useState(false);
  const [simpleTheme, setSimpleTheme] = useState<string>(themes[0]?.name || "Nord");
  const [layers, setLayers] = useState<Layer[]>([{ id: '1', themeName: themes[0]?.name || "Nord" }]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setTimeout(async () => {
      try {
        let activeStack: string[] = isStackMode ? layers.map(l => l.themeName) : [simpleTheme];
        const paletteStack = activeStack.map(name => themes.find(x => x.name === name)?.colors || []).filter(c => c.length > 0);
        const url = await processImageStack(file, paletteStack);
        setProcessedUrl(url);
      } catch (err) {
        alert("Processing failed.");
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };
  const addLayer = () => setLayers([...layers, { id: crypto.randomUUID(), themeName: themes[0].name }]);
  const removeLayer = (id: string) => layers.length > 1 && setLayers(layers.filter(l => l.id !== id));
  const moveLayer = (index: number, dir: -1 | 1) => {
    const n = [...layers], t = index + dir;
    if (t >= 0 && t < n.length) { [n[index], n[t]] = [n[t], n[index]]; setLayers(n); }
  };
  const updateLayerTheme = (id: string, val: string) => setLayers(layers.map(l => l.id === id ? { ...l, themeName: val } : l));

  const activeThemeData = themes.find(t => t.name === simpleTheme);

  return (
    <div className="flex flex-col lg:flex-row h-full bg-background">

      {/* SIDEBAR */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-card/30 flex flex-col shrink-0 overflow-hidden h-full">
        <div className="p-4 border-b">
          <h2 className="font-bold flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" /> Configuration
          </h2>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">

            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Source Image</Label>
              {!file ? (
                <div
                  className={cn("border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors", dragActive ? "border-primary bg-primary/10" : "border-border hover:bg-accent/50")}
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
                    <Button variant="destructive" size="sm" onClick={() => { setFile(null); setProcessedUrl(null); }}><Trash2 className="w-4 h-4 mr-2" /> Remove</Button>
                  </div>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
            </div>

            <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Stack Mode</Label>
                <p className="text-[10px] text-muted-foreground">Apply multiple themes</p>
              </div>
              <Switch checked={isStackMode} onCheckedChange={setIsStackMode} />
            </div>

            {/* THEME CONFIG */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase flex justify-between items-center">
                {isStackMode ? "Layer Stack" : "Active Theme"}
                {isStackMode && <span className="text-[10px] font-normal opacity-70">Top to Bottom</span>}
              </Label>

              {isStackMode ? (
                // --- STACK MODE ---
                <div className="space-y-2">
                  {layers.map((layer, index) => (
                    <div key={layer.id} className="flex items-center gap-2 p-2 bg-background border rounded-md shadow-sm group animate-in slide-in-from-left-2 fade-in">
                      <span className="text-xs font-mono text-muted-foreground w-4 shrink-0">{index + 1}</span>

                      {/* FIX: Explicit max-width [140px] forces truncation within sidebar */}
                      <div className="flex-1 max-w-[140px]">
                        <Select value={layer.themeName} onValueChange={(val) => updateLayerTheme(layer.id, val)}>
                          <SelectTrigger className="h-8 text-xs w-full focus:ring-0 focus:ring-offset-0 px-2">
                            <span className="truncate block w-full text-left">{layer.themeName}</span>
                          </SelectTrigger>
                          <SelectContent>
                            {themes.map(t => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0 ml-auto">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveLayer(index, -1)} disabled={index === 0}><ArrowUp className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveLayer(index, 1)} disabled={index === layers.length - 1}><ArrowDown className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeLayer(layer.id)} disabled={layers.length === 1}><X className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full text-xs dashed border-dashed" onClick={addLayer}><Plus className="w-3 h-3 mr-2" /> Add Theme Layer</Button>
                </div>
              ) : (
                // --- SIMPLE MODE ---
                <Select value={simpleTheme} onValueChange={setSimpleTheme}>
                  <SelectTrigger className="w-full focus:ring-0 focus:ring-offset-0">
                    {/* Container for Dots + Text */}
                    <div className="flex items-center gap-2 min-w-0 w-full">

                      {/* 1. Color Dots (Shrink-0 prevents them from getting squished) */}
                      <div className="flex gap-0.5 shrink-0">
                        {activeThemeData?.colors.slice(0, 3).map((c) => (
                          <div
                            key={c}
                            className="w-2 h-2 rounded-full ring-1 ring-border/20"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>

                      {/* 2. Theme Name (Truncates if too long) */}
                      <span className="truncate text-xs">{simpleTheme}</span>
                    </div>
                  </SelectTrigger>

                  <SelectContent>
                    {themes.map((t) => (
                      <SelectItem key={t.name} value={t.name}>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5 shrink-0">
                            {t.colors.slice(0, 3).map((c) => (
                              <div
                                key={c}
                                className="w-2 h-2 rounded-full ring-1 ring-border/20"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                          <span className="truncate">{t.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Button size="lg" className="w-full font-bold shadow-lg mt-4" onClick={handleProcess} disabled={!file || isProcessing}>
              {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Wand2 className="w-4 h-4 mr-2" /> Generate Wallpaper</>}
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* WORKSPACE */}
      <div className="flex-1 bg-muted/20 flex flex-col relative overflow-hidden h-full">
        <div className="h-14 border-b bg-background/50 backdrop-blur flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ZoomIn className="w-4 h-4" />
            <span className="font-medium">Workspace</span>
            {processedUrl && <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-accent/50 px-2 py-0.5 rounded-full ml-2"><Info className="w-3 h-3" /> Drag slider to compare</span>}
          </div>
          {processedUrl && (
            <Button size="sm" onClick={() => { const link = document.createElement("a"); link.href = processedUrl; link.download = `wallcraft-${Date.now()}.png`; link.click(); }}>
              <Download className="w-4 h-4 mr-2" /> Download Result
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-hidden p-0 flex items-center justify-center bg-[url('/grid-pattern.svg')] bg-center relative">
          {processedUrl && previewUrl ? (
            <div className="relative w-full h-full p-8 flex items-center justify-center">
              <div className="relative shadow-2xl rounded-lg overflow-hidden border bg-background/50 max-w-full max-h-full animate-in zoom-in-95 duration-300">
                <div className="relative max-h-[calc(100vh-8rem)] aspect-[16/9] min-w-[50vw]">
                  <CompareSlider original={previewUrl} processed={processedUrl} className="w-full h-full" />
                </div>
              </div>
            </div>
          ) : file ? (
            <div className="relative shadow-xl rounded-lg overflow-hidden border bg-background opacity-80 p-2">
              <img src={previewUrl!} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Badge variant="secondary" className="text-lg px-4 py-2 shadow-lg backdrop-blur-md bg-background/80">Original Preview</Badge>
              </div>
            </div>
          ) : (
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