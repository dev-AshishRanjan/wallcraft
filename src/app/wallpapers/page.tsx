"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Import the JSON directly (This is the magic - Zero API calls)
import db from "../../../public/database.json";

// Type definitions
type Wallpaper = typeof db[0];

export default function WallpapersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [themeFilter, setThemeFilter] = useState("All");

  // Extract unique categories and themes for filters
  const categories = ["All", ...Array.from(new Set(db.map((w) => w.category)))];
  // Assuming all wallpapers have the same themes, take from the first one
  const themes = db.length > 0 ? ["All", ...Object.keys(db[0].variants)] : ["All"];

  // Filter Logic
  const filteredWallpapers = useMemo(() => {
    return db.filter((wallpaper) => {
      const matchesSearch = wallpaper.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "All" || wallpaper.category === categoryFilter;
      // Note: Theme filter is tricky. We show the IMAGE corresponding to that theme, 
      // but the wallpaper entry itself contains ALL themes.
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, categoryFilter]);

  // Download Handler (Client-Side Resizing)
  const handleDownload = async (url: string, filename: string, quality: number) => {
    // For now, simple direct download. 
    // For resizing, we'd fetch blob -> canvas -> resize -> save.
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank"; // GitHub releases need this usually
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-nord-0 text-nord-4 p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-nord-8 tracking-tight mb-2">WallCraft</h1>
          <p className="text-nord-4/60">Curated, automated, themed.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap gap-4 items-center bg-nord-1 p-2 rounded-lg border border-nord-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-nord-4/50" />
            <Input
              placeholder="Search wallpapers..."
              className="pl-8 bg-nord-0 border-none w-64 focus-visible:ring-nord-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] bg-nord-0 border-none">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-nord-1 border-nord-3 text-nord-4">
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={themeFilter} onValueChange={setThemeFilter}>
            <SelectTrigger className="w-[140px] bg-nord-0 border-none">
              <SelectValue placeholder="Preview Theme" />
            </SelectTrigger>
            <SelectContent className="bg-nord-1 border-nord-3 text-nord-4">
              {themes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredWallpapers.map((wp) => {
          // Determine which image URL to show based on theme filter
          // Default to 'Nord' or the first available variant if filter is 'All'
          const displayTheme = themeFilter === "All" ? "Nord" : themeFilter;
          // Fallback if that specific theme doesn't exist for this image
          const imageUrl = wp.variants[displayTheme] || Object.values(wp.variants)[0];

          return (
            <Card key={wp.id} className="group relative overflow-hidden bg-nord-1 border-nord-2 hover:border-nord-8 transition-all duration-300">
              <div className="aspect-[16/9] relative">
                {/* Note: For production, you must add 'github.com' to next.config.js images remotePatterns 
                  */}
                <img
                  src={imageUrl}
                  alt={wp.title}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-nord-0/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                  <Button
                    variant="default"
                    className="bg-nord-8 text-nord-0 font-bold hover:bg-nord-9"
                    onClick={() => handleDownload(imageUrl, `${wp.title}-${displayTheme}.png`, 1)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    4K PNG
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg truncate pr-2" title={wp.title}>{wp.title}</h3>
                  <Badge variant="outline" className="border-nord-3 text-nord-4/70 text-xs shrink-0">
                    {wp.category}
                  </Badge>
                </div>
                <p className="text-xs text-nord-4/50">
                  By {wp.photographer} • {new Date(wp.date).toLocaleDateString()}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredWallpapers.length === 0 && (
        <div className="text-center py-20 text-nord-3">
          <h2 className="text-2xl font-bold">No wallpapers found</h2>
          <p>Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}