"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Download, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { FadeInImage } from "@/components/ui/fade-in-image";

// Import DB
import db from "../../../public/database.json";

const ITEMS_PER_PAGE = 50;

export default function WallpapersPage() {
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [themeFilter, setThemeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Loading State
  // We use 'isFiltering' to show the Skeletons
  const [isFiltering, setIsFiltering] = useState(true);

  // --- DERIVED DATA ---
  const categories = ["All", ...Array.from(new Set(db.map((w) => w.category)))];
  const themes = db.length > 0 ? ["All", ...Object.keys(db[0].variants)] : ["All"];

  // --- DEBOUNCE SEARCH (0.5s delay) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- ARTIFICIAL DELAY LOADER ---
  // Whenever filters change (debouncedSearch, category, theme), trigger the loader for at least 1s
  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 1000); // Stays for 1 second minimum

    // Reset page on filter change
    setCurrentPage(1);

    return () => clearTimeout(timer);
  }, [debouncedSearch, categoryFilter, themeFilter]);


  // --- FILTER LOGIC ---
  const filteredWallpapers = useMemo(() => {
    return db.filter((wallpaper) => {
      const matchesSearch = wallpaper.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = categoryFilter === "All" || wallpaper.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [debouncedSearch, categoryFilter]);

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredWallpapers.length / ITEMS_PER_PAGE);
  const currentWallpapers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredWallpapers.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredWallpapers]);

  // Auto-scroll
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // --- HANDLERS ---
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
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

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 items-center bg-nord-1 p-2 rounded-lg border border-nord-2 shadow-sm">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-nord-4/50" />
            <Input
              placeholder="Search wallpapers..."
              className="pl-8 bg-nord-0 border-none w-64 focus-visible:ring-nord-8 placeholder:text-nord-3"
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

      {/* --- CONTENT AREA --- */}

      {isFiltering ? (
        // 1. SKELETON GRID (Shown during the 1s delay)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Show 8 skeletons as a placeholder */}
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* 2. REAL GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentWallpapers.map((wp) => {
              const displayTheme = themeFilter === "All" ? "Nord" : themeFilter;
              const imageUrl = wp.variants[displayTheme] || Object.values(wp.variants)[0];

              return (
                <Card key={wp.id} className="group relative overflow-hidden bg-nord-1 border-nord-2 hover:border-nord-8 transition-all duration-300 shadow-md">

                  {/* Image Container with Overflow Hidden (Fixes the scaling issue) */}
                  <div className="aspect-[16/9] relative bg-nord-2 overflow-hidden">
                    <FadeInImage
                      src={imageUrl}
                      alt={wp.title}
                      // The hover effect is now applied here, handled by FadeInImage props or parent CSS
                      className="group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-nord-0/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm z-20">
                      <Button
                        variant="default"
                        className="bg-nord-8 text-nord-0 font-bold hover:bg-nord-9 hover:scale-105 transition-transform"
                        onClick={() => handleDownload(imageUrl, `${wp.title}-${displayTheme}.png`)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 relative z-20 bg-nord-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg truncate pr-2 text-nord-6" title={wp.title}>{wp.title}</h3>
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

          {/* Empty State */}
          {filteredWallpapers.length === 0 && (
            <div className="text-center py-20 text-nord-3 border-2 border-dashed border-nord-2 rounded-xl mt-8">
              <h2 className="text-2xl font-bold mb-2">No wallpapers found</h2>
              <p>Try searching for something else.</p>
            </div>
          )}

          {/* Pagination */}
          {filteredWallpapers.length > ITEMS_PER_PAGE && (
            <div className="flex justify-center items-center gap-6 mt-16 pb-12">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-nord-1 border-nord-3 hover:bg-nord-2 text-nord-4 w-32"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
              </Button>

              <span className="text-nord-4 font-mono">
                Page <span className="text-nord-8 font-bold">{currentPage}</span> of {totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-nord-1 border-nord-3 hover:bg-nord-2 text-nord-4 w-32"
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}