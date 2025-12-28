"use client";

import { useState } from "react";
import { X, Download, Monitor, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { processImage, QUALITIES, RESOLUTIONS } from "@/lib/image-processor";
import { cn } from "@/lib/utils";
// Import the FadeInImage component
import { FadeInImage } from "@/components/ui/fade-in-image";

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
      const blobUrl = await processImage(imageUrl, selectedQuality, selectedRatio);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${title}-${theme}-${selectedQuality}-${selectedRatio}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Download failed", e);
      alert("Failed to download. The image might be restricted.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0 bg-nord-0 border-nord-2 flex flex-col md:flex-row overflow-hidden focus:outline-none">

        {/* LEFT: Image Preview Area */}
        <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden group">
          {/* Uses FadeInImage for better UX */}
          {/* We wrap it in a div that constrains the size so the image doesn't explode */}
          <div className="relative w-full h-full flex items-center justify-center">
            <FadeInImage
              src={imageUrl}
              alt={title}
              // 'object-contain' ensures we see the whole wallpaper without cropping in preview
              className="max-h-full max-w-full object-contain sm:object-cover shadow-2xl shadow-black/50 rounded-md"
            />
          </div>
        </div>

        {/* RIGHT: Controls Sidebar */}
        <div className="w-full md:w-80 bg-nord-1 border-l border-nord-2 p-6 flex flex-col gap-6 shrink-0 z-50 overflow-y-auto">

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