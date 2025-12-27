"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Download, Loader2, Image as ImageIcon, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { processImageClient } from "@/lib/browser-theme-engine";
import { Theme } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StudioClientProps {
  themes: Theme[];
}

export function StudioClient({ themes }: StudioClientProps) {
  // State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Original
  const [processedUrl, setProcessedUrl] = useState<string | null>(null); // Themed

  const [selectedTheme, setSelectedTheme] = useState<string>(themes[0]?.name || "Nord");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setProcessedUrl(null); // Reset processed image
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (!selected.type.startsWith("image/")) return;
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setProcessedUrl(null);
    }
  };

  const handleProcess = async () => {
    if (!file || !selectedTheme) return;

    setIsProcessing(true);

    // Small timeout to allow React to render the Loading state before the UI freezes
    setTimeout(async () => {
      try {
        const themeData = themes.find(t => t.name === selectedTheme);
        if (!themeData) return;

        const url = await processImageClient(file, themeData.colors);
        setProcessedUrl(url);
      } catch (err) {
        console.error(err);
        alert("Failed to process image.");
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const link = document.createElement("a");
    link.href = processedUrl;
    link.download = `wallcraft-${selectedTheme.toLowerCase()}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setProcessedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* 1. CONTROL BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-nord-1 p-4 rounded-xl border border-nord-2 sticky top-20 z-40 shadow-xl">

        {/* Theme Select */}
        <div className="w-full md:w-64">
          <Select value={selectedTheme} onValueChange={setSelectedTheme}>
            <SelectTrigger className="bg-nord-0 border-nord-3 text-nord-4">
              <SelectValue placeholder="Select Theme" />
            </SelectTrigger>
            <SelectContent className="bg-nord-0 border-nord-2 text-nord-4">
              {themes.map(t => (
                <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
          {file && (
            <Button
              variant="ghost"
              onClick={clearSelection}
              className="text-nord-4 hover:text-nord-11 hover:bg-nord-1"
            >
              <X className="w-4 h-4 mr-2" /> Clear
            </Button>
          )}

          <Button
            className="bg-nord-8 text-nord-0 font-bold hover:bg-nord-9 w-full md:w-auto"
            onClick={handleProcess}
            disabled={!file || isProcessing}
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" /> Apply Theme</>
            )}
          </Button>

          {processedUrl && (
            <Button
              className="bg-nord-14 text-nord-0 font-bold hover:bg-nord-14/90 w-full md:w-auto"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          )}
        </div>
      </div>

      {/* 2. MAIN WORKSPACE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[500px]">

        {/* LEFT: UPLOAD / ORIGINAL */}
        <Card
          className={cn(
            "relative flex flex-col items-center justify-center p-8 border-2 border-dashed transition-all h-[500px] overflow-hidden",
            dragActive ? "border-nord-8 bg-nord-8/10" : "border-nord-3 bg-nord-1",
            previewUrl ? "border-solid border-nord-2 p-0" : ""
          )}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={handleDrop}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Original" className="w-full h-full object-contain" />
          ) : (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-nord-2 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-10 h-10 text-nord-4/50" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-nord-6">Upload Image</h3>
                <p className="text-nord-4/60 mt-2 text-sm">Drag & drop or click to browse</p>
                <p className="text-nord-4/40 mt-1 text-xs">Supports JPG, PNG (Max 10MB)</p>
              </div>
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4"
              >
                Select File
              </Button>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />
        </Card>

        {/* RIGHT: PREVIEW */}
        <Card className="relative flex items-center justify-center bg-nord-0 border border-nord-2 h-[500px] overflow-hidden shadow-inner">
          {processedUrl ? (
            <img src={processedUrl} alt="Processed" className="w-full h-full object-contain animate-in fade-in duration-500" />
          ) : (
            <div className="text-center text-nord-4/30">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Preview will appear here</p>
            </div>
          )}

          {/* Loading Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-nord-0/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <Loader2 className="w-12 h-12 text-nord-8 animate-spin mb-4" />
              <p className="text-nord-4 font-medium animate-pulse">Analyzing Pixels...</p>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}