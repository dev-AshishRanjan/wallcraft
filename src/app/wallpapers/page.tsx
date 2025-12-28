"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Download, Search, ChevronLeft, ChevronRight, Loader2,
  AlertCircle, Expand, Check, ChevronsUpDown, RefreshCw,
  SlidersHorizontal, Database, Cloud
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FadeInImage } from "@/components/ui/fade-in-image";
import { WallpaperModal } from "@/components/ui/wallpaper-modal";
import { cn } from "@/lib/utils";

// --- CONFIG ---
const REPO_USER = "dev-AshishRanjan";
const REPO_NAME = "wallcraft";
const BRANCH = "dev";

// 1. RAW GITHUB (Fresh, but might be slower/rate-limited)
const RAW_URL = `https://raw.githubusercontent.com/${REPO_USER}/${REPO_NAME}/${BRANCH}/public/database.json`;

// 2. JSDELIVR (Cached, fast, highly available)
const CDN_URL = `https://cdn.jsdelivr.net/gh/${REPO_USER}/${REPO_NAME}@${BRANCH}/public/database.json`;

const ITEMS_PER_PAGE = 48;

type WallpaperEntry = {
  id: string;
  title: string;
  category: string;
  photographer: string;
  originalUrl: string;
  date: string;
  variants: Record<string, string>;
};

// --- HELPER: Fetch with Timeout ---
async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${url}?t=${Date.now()}`, {
      signal: controller.signal,
      // Priority high tells browser this is critical
      priority: "high"
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

function WallpapersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- STATE ---
  const [db, setDb] = useState<WallpaperEntry[]>([]);

  // Loading States
  // 'IDLE' | 'CONNECTING_DB' (GitHub) | 'CONNECTING_CDN' (jsDelivr) | 'READY' | 'ERROR'
  const [connectionStatus, setConnectionStatus] = useState<string>("CONNECTING_DB");
  const [errorMsg, setErrorMsg] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [themeFilter, setThemeFilter] = useState<string>("");
  const [openCategoryCombo, setOpenCategoryCombo] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [previewWallpaper, setPreviewWallpaper] = useState<WallpaperEntry | null>(null);
  const [previewTheme, setPreviewTheme] = useState<string>("");
  const [isFiltering, setIsFiltering] = useState(false);

  // --- 1. SMART FETCH STRATEGY ---
  useEffect(() => {
    async function loadData() {
      try {
        // ATTEMPT 1: Raw GitHub (Timeout: 2.5s)
        // We set a very low timeout because if GitHub is lagging, we want CDN immediately.
        setConnectionStatus("CONNECTING_DB");

        try {
          const res = await fetchWithTimeout(RAW_URL, 2500);
          if (!res.ok) throw new Error("GitHub Raw Failed");
          const data = await res.json();
          if (!Array.isArray(data)) throw new Error("Invalid Data");

          setDb(data);
          setConnectionStatus("READY");
          return; // Success! Exit.
        } catch (ghError) {
          console.warn("GitHub Fetch failed/timed out, switching to CDN...", ghError);
        }

        // ATTEMPT 2: jsDelivr CDN (Timeout: 10s)
        setConnectionStatus("CONNECTING_CDN");

        const resCDN = await fetchWithTimeout(CDN_URL, 10000);
        if (!resCDN.ok) throw new Error(`CDN Error ${resCDN.status}`);
        const dataCDN = await resCDN.json();
        if (!Array.isArray(dataCDN)) throw new Error("Invalid Data");

        setDb(dataCDN);
        setConnectionStatus("READY");

      } catch (finalError: any) {
        setConnectionStatus("ERROR");
        setErrorMsg(finalError.message || "Network Error");
      }
    }
    loadData();
  }, []);

  // --- 2. DATA PROCESSING ---
  const categories = useMemo(() => ["All", ...Array.from(new Set(db.map((w) => w.category))).sort()], [db]);
  const themes = useMemo(() => db.length > 0 ? Object.keys(db[0].variants).sort() : [], [db]);

  // --- 3. URL SYNC ---
  useEffect(() => {
    if (themes.length === 0) return;
    const tUrl = searchParams.get("theme");
    const cUrl = searchParams.get("category");

    if (tUrl && themes.includes(tUrl)) setThemeFilter(tUrl);
    else if (!themeFilter) setThemeFilter(themes[0]);

    if (cUrl) setCategoryFilter(cUrl);
  }, [searchParams, themes, themeFilter]);

  // --- 4. FILTERING ---
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (connectionStatus !== "READY") return;
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
    setCurrentPage(1);
    return () => clearTimeout(timer);
  }, [debouncedSearch, categoryFilter, themeFilter, connectionStatus]);

  const filteredWallpapers = useMemo(() => {
    return db.filter((wallpaper) => {
      const matchesSearch = wallpaper.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = categoryFilter === "All" || wallpaper.category === categoryFilter;
      const matchesTheme = themeFilter ? wallpaper.variants.hasOwnProperty(themeFilter) : true;
      return matchesSearch && matchesCategory && matchesTheme;
    });
  }, [db, debouncedSearch, categoryFilter, themeFilter]);

  const currentWallpapers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredWallpapers.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredWallpapers]);

  const totalPages = Math.ceil(filteredWallpapers.length / ITEMS_PER_PAGE);

  // --- HANDLERS ---
  const updateCategory = (cat: string) => {
    setCategoryFilter(cat);
    setOpenCategoryCombo(false);
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "All") params.delete("category");
    else params.set("category", cat);
    if (themeFilter) params.set("theme", themeFilter);
    router.replace(`/wallpapers?${params.toString()}`, { scroll: false });
  };

  const updateTheme = (t: string) => {
    setThemeFilter(t);
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme", t);
    if (categoryFilter !== "All") params.set("category", categoryFilter);
    router.replace(`/wallpapers?${params.toString()}`, { scroll: false });
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">

      {/* HEADER */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight hidden md:block">Gallery</h1>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search wallpapers..."
                  className="pl-9 h-9 bg-card"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category */}
              <Popover open={openCategoryCombo} onOpenChange={setOpenCategoryCombo}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={openCategoryCombo} className="w-full sm:w-[200px] justify-between h-9 bg-card px-3">
                    <span className="truncate flex-1 text-left">{categoryFilter === "All" ? "Filter Category..." : categoryFilter}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search category..." />
                    <CommandList className="max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((cat) => (
                          <CommandItem key={cat} value={cat} onSelect={() => updateCategory(cat)}>
                            <Check className={cn("mr-2 h-4 w-4", categoryFilter === cat ? "opacity-100" : "opacity-0")} />
                            <span className="truncate">{cat}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Theme */}
              {themeFilter && (
                <Select value={themeFilter} onValueChange={updateTheme}>
                  <SelectTrigger className="w-full sm:w-[160px] h-9 bg-card px-3">
                    <div className="flex items-center gap-2 min-w-0 w-full">
                      <span className="text-muted-foreground text-xs uppercase font-bold shrink-0">Theme:</span>
                      <span className="truncate block font-medium">{themeFilter}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="container mx-auto px-4 pt-6">

        {/* A. LOADING STATES */}
        {connectionStatus === "CONNECTING_DB" && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-500">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div className="flex items-center gap-2 text-muted-foreground animate-pulse font-medium">
              <Database className="w-4 h-4" />
              <span>Connecting to database...</span>
            </div>
          </div>
        )}

        {connectionStatus === "CONNECTING_CDN" && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-300">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div className="flex items-center gap-2 text-muted-foreground animate-pulse font-medium">
              <Cloud className="w-4 h-4" />
              <span>Switching to CDN...</span>
            </div>
          </div>
        )}

        {/* B. ERROR STATE */}
        {connectionStatus === "ERROR" && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="text-center max-w-sm">
              <h3 className="font-bold text-lg">Failed to load wallpapers</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                We tried both primary and backup sources but couldn't connect. {errorMsg}
              </p>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" /> Retry Connection
              </Button>
            </div>
          </div>
        )}

        {/* C. GRID */}
        {connectionStatus === "READY" && (
          <>
            {isFiltering ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded-lg border bg-card shadow-sm space-y-3 p-3">
                    <Skeleton className="aspect-[16/9] w-full rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentWallpapers.map((wp) => {
                  const imageUrl = wp.variants[themeFilter];
                  return (
                    <Card key={wp.id} className="group overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300">

                      <div className="aspect-[16/9] relative bg-muted overflow-hidden">
                        <FadeInImage
                          src={imageUrl}
                          alt={wp.title}
                          className="group-hover:scale-105 transition-transform duration-700"
                        />

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => { setPreviewTheme(themeFilter); setPreviewWallpaper(wp); }}>
                            <Expand className="w-4 h-4" />
                          </Button>
                          <Button size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDownload(imageUrl, `${wp.title}-${themeFilter}.png`)}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-3">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-medium text-sm truncate text-foreground" title={wp.title}>
                            {wp.title}
                          </h3>
                          <Badge
                            className="text-[10px] h-5 px-1.5 font-normal border-none shrink-0 max-w-[80px] bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          >
                            <span className="truncate w-full block text-center">
                              {wp.category}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          By {wp.photographer}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {filteredWallpapers.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                  <SlidersHorizontal className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold mb-2">No wallpapers found</h2>
                <Button variant="outline" onClick={() => { setSearchTerm(""); setCategoryFilter("All"); }}>
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {filteredWallpapers.length > ITEMS_PER_PAGE && (
              <div className="flex justify-center items-center gap-4 mt-8 py-8">
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {previewWallpaper && (
        <WallpaperModal
          isOpen={!!previewWallpaper}
          onClose={() => setPreviewWallpaper(null)}
          imageUrl={previewWallpaper.variants[previewTheme] || Object.values(previewWallpaper.variants)[0]}
          title={previewWallpaper.title}
          theme={previewTheme}
          // ADD THESE LINES:
          category={previewWallpaper.category}
          photographer={previewWallpaper.photographer}
          originalUrl={previewWallpaper.originalUrl}
          date={previewWallpaper.date}
        />
      )}
    </div>
  );
}

export default function WallpapersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <WallpapersContent />
    </Suspense>
  );
}