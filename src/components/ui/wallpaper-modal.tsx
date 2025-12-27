"use client";

import { useState } from "react";
import { X, Download, Monitor, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { processImage, QUALITIES, RESOLUTIONS } from "@/lib/image-processor";
import { cn } from "@/lib/utils";

interface WallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  theme: string;
}

export function WallpaperModal({ isOpen, onClose, imageUrl, title, theme }: WallpaperModalProps) {
  const [selectedQuality, setSelectedQuality] = useState<keyof typeof QUALITIES>("4K");
  const [selectedRatio, setSelectedRatio] = useState<keyof typeof RESOLUTIONS>("Original");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownload = async () => {
    setIsProcessing(true);
    try {
      // Process image in browser
      const blobUrl = await processImage(imageUrl, selectedQuality, selectedRatio);

      // Trigger Download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${title}-${theme}-${selectedQuality}-${selectedRatio}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Download failed", e);
      alert("Failed to process image. Try a different browser.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0 bg-nord-0 border-nord-2 flex flex-col md:flex-row overflow-hidden">

        {/* LEFT: Image Preview Area */}
        <div className="flex-1 bg-black/50 relative flex items-center justify-center p-4 overflow-hidden group">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-full max-w-full object-contain shadow-2xl shadow-black/50"
          />

          {/* Close Btn (Mobile friendly overlay) */}
          <Button
            variant="ghost"
            className="absolute top-4 right-4 text-white bg-black/20 hover:bg-black/40 rounded-full p-2 md:hidden"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* RIGHT: Controls Sidebar */}
        <div className="w-full md:w-80 bg-nord-1 border-l border-nord-2 p-6 flex flex-col gap-6 shrink-0 z-50">

          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-nord-6 line-clamp-2">{title}</h2>
              <span className="text-sm text-nord-4/60 mt-1 block">Theme: {theme}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-nord-4 hover:text-nord-8 -mt-2 -mr-2 hidden md:flex">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <hr className="border-nord-2" />

          {/* Download Options */}
          <div className="space-y-6 flex-1">

            {/* Resolution/Quality */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-nord-4 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-nord-8" /> Quality
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(QUALITIES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedQuality(key as any)}
                    className={cn(
                      "text-xs p-2 rounded-md border transition-all text-left",
                      selectedQuality === key
                        ? "bg-nord-8/10 border-nord-8 text-nord-8 font-bold"
                        : "bg-nord-2 border-transparent text-nord-4 hover:bg-nord-3"
                    )}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-nord-4">Aspect Ratio</label>
              <Select
                value={selectedRatio}
                onValueChange={(v: any) => setSelectedRatio(v)}
              >
                <SelectTrigger className="bg-nord-2 border-none text-nord-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-nord-2 border-nord-3 text-nord-4">
                  {Object.keys(RESOLUTIONS).map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* Action Button */}
          <Button
            size="lg"
            className="w-full bg-nord-8 text-nord-0 font-bold hover:bg-nord-9 h-12 text-base shadow-lg shadow-nord-8/20"
            onClick={handleDownload}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" /> Download
              </>
            )}
          </Button>

          <p className="text-xs text-nord-4/40 text-center">
            Processed securely in your browser.
          </p>
        </div>

      </DialogContent>
    </Dialog>
  );
}