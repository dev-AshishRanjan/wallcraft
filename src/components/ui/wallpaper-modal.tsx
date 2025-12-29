"use client";

import { useState } from "react";
import {
  X, Download, Monitor, Loader2, User,
  Calendar, Tag, Palette, ExternalLink,
  Image as ImageIcon, Layers
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { processImage, QUALITIES, RESOLUTIONS } from "@/lib/image-processor";
import { cn } from "@/lib/utils";
import { FadeInImage } from "@/components/ui/fade-in-image";

interface WallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  theme: string;
  category: string;
  photographer: string;
  originalUrl: string;
  date: string;
}

export function WallpaperModal({
  isOpen, onClose, imageUrl, title, theme,
  category, photographer, originalUrl, date
}: WallpaperModalProps) {

  const [selectedQuality, setSelectedQuality] = useState<keyof typeof QUALITIES>("4K");
  const [selectedRatio, setSelectedRatio] = useState<keyof typeof RESOLUTIONS>("Original");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownload = async () => {
    setIsProcessing(true);
    try {
      const blobUrl = await processImage(imageUrl, selectedQuality, selectedRatio);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${theme}-${selectedQuality}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Download failed", e);
      alert("Failed to download. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] h-[90dvh] p-0 gap-0 bg-background border-border flex flex-col md:flex-row overflow-hidden focus:outline-none rounded-sm">

        {/* LEFT: Image Preview Area */}
        <div className="flex-1 relative flex items-center justify-center p-4 md:p-8 bg-muted/20 overflow-hidden group z-50 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
          <div className="relative w-full h-full flex items-center justify-center">
            <FadeInImage
              src={imageUrl}
              alt={title}
              className="max-h-full max-w-full object-cover shadow-2xl shadow-black/50 rounded-md"
              priority={true}
            />
          </div>
        </div>

        {/* RIGHT: Controls Sidebar */}
        <div className="w-full md:w-[400px] bg-card border-l border-border flex flex-col shrink-0 z-50 h-[60dvh] md:h-full">

          {/* Header */}
          <div className="p-6 pb-2 flex justify-between items-start shrink-0">
            <div className="space-y-1 pr-4">
              <h2 className="text-xl font-bold tracking-tight text-card-foreground line-clamp-2 leading-tight">
                {title}
              </h2>
              {/* Removed Category Badge here as requested */}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0 -mt-1 -mr-2">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 py-4">

              {/* 1. METADATA BANNER (Refined UI) */}
              {/* Using same style as Attribution: bg-background + border + shadow-sm */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-border bg-background shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                    <Palette className="w-3 h-3" /> Theme
                  </span>
                  <p className="text-sm font-medium truncate" title={theme}>{theme}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> Category
                  </span>
                  <p className="text-sm font-medium truncate" title={category}>{category}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Created
                  </span>
                  <p className="text-sm font-medium">{new Date(date).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                    <Layers className="w-3 h-3" /> Resolution
                  </span>
                  <p className="text-sm font-medium">4K Ultra HD</p>
                </div>
              </div>

              {/* 2. CONFIGURATION */}
              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-primary" /> Quality Preset
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(QUALITIES).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedQuality(key as any)}
                        // UPDATED: Simple layout, 2nd line removed
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all",
                          selectedQuality === key
                            ? "bg-primary/10 border-primary text-primary shadow-sm"
                            : "bg-background border-border text-foreground hover:bg-muted"
                        )}
                      >
                        <span className="font-bold">{key}</span>
                        {/* UPDATED: Muted comment style */}
                        <span className={cn(
                          "text-[10px] uppercase tracking-wider font-medium",
                          selectedQuality === key ? "text-primary/70" : "text-muted-foreground"
                        )}>
                          {val.label.replace(key, '').replace('Quality', '').trim() || 'STD'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" /> Crop Ratio
                  </label>
                  <Select value={selectedRatio} onValueChange={(v: any) => setSelectedRatio(v)}>
                    {/* UPDATED: No Focus Border */}
                    <SelectTrigger className="w-full bg-background border-input focus:ring-0 focus:ring-offset-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(RESOLUTIONS).map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 3. ATTRIBUTION BANNER */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Shot by</p>
                    <p className="text-sm font-bold truncate text-foreground">{photographer}</p>
                  </div>
                </div>
                <a
                  href={originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-primary"
                  title="View Original on Unsplash"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-2 pt-4 mt-auto border-t bg-card">
            <Button
              size="lg"
              className="w-full font-bold shadow-lg"
              onClick={handleDownload}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Preparing...</>
              ) : (
                <><Download className="w-5 h-5 mr-2" /> Download Wallpaper</>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-3">
              Processed securely on your device.
            </p>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}