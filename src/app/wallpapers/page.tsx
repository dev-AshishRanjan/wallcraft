"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Expand,
  Check,
  ChevronsUpDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FadeInImage } from "@/components/ui/fade-in-image";
import { WallpaperModal } from "@/components/ui/wallpaper-modal";
import { cn } from "@/lib/utils";

// --- CONFIG ---
const REPO_USER = "dev-AshishRanjan";
const REPO_NAME = "wallcraft";
const DATA_URL = `https://cdn.jsdelivr.net/gh/${REPO_USER}/${REPO_NAME}@dev/public/database.json`;
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

function WallpapersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- STATE ---
  const [db, setDb] = useState<WallpaperEntry[]>([]);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [dbError, setDbError] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("All");

  // UPDATED: Default to empty string initially, populated after DB load
  const [themeFilter, setThemeFilter] = useState<string>("");
  const [openCategoryCombo, setOpenCategoryCombo] = useState(false);

  // Pagination & Modal
  const [currentPage, setCurrentPage] = useState(1);
  const [previewWallpaper, setPreviewWallpaper] = useState<WallpaperEntry | null>(null);
  const [previewTheme, setPreviewTheme] = useState<string>("");
  const [isFiltering, setIsFiltering] = useState(false);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${DATA_URL}?t=${Date.now()}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setDb(data);
      } catch (error) {
        setDbError(true);
      } finally {
        setIsDbLoading(false);
      }
    }
    loadData();
  }, []);

  // --- 2. DATA PROCESSING ---
  const categories = useMemo(() => ["All", ...Array.from(new Set(db.map((w) => w.category))).sort()], [db]);

  // UPDATED: Removed "All" option. Strictly just the theme keys.
  const themes = useMemo(() => db.length > 0 ? Object.keys(db[0].variants).sort() : [], [db]);

  // --- 3. SET DEFAULTS & SYNC URL ---
  useEffect(() => {
    // Wait for themes to load
    if (themes.length === 0) return;

    const themeFromUrl = searchParams.get("theme");
    const categoryFromUrl = searchParams.get("category");

    // Logic: If URL has theme, use it. 
    // If NOT, and we haven't set a theme yet, default to the first available theme.
    if (themeFromUrl && themes.includes(themeFromUrl)) {
      setThemeFilter(themeFromUrl);
    } else if (!themeFilter) {
      setThemeFilter(themes[0]); // Default to first theme (e.g., Dracula or Nord)
    }

    if (categoryFromUrl) setCategoryFilter(categoryFromUrl);
  }, [searchParams, themes, themeFilter]);

  // --- 4. FILTER LOGIC ---
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (isDbLoading) return;
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
    setCurrentPage(1);
    return () => clearTimeout(timer);
  }, [debouncedSearch, categoryFilter, themeFilter, isDbLoading]);

  const filteredWallpapers = useMemo(() => {
    return db.filter((wallpaper) => {
      const matchesSearch = wallpaper.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = categoryFilter === "All" || wallpaper.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [db, debouncedSearch, categoryFilter]);

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

    // Preserve current theme in URL
    if (themeFilter) params.set("theme", themeFilter);

    router.replace(`/wallpapers?${params.toString()}`, { scroll: false });
  };

  const updateTheme = (t: string) => {
    setThemeFilter(t);
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme", t);
    // Preserve category
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
  if (isDbLoading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (dbError) return <div className="h-[50vh] flex items-center justify-center text-destructive"><AlertCircle className="mr-2" /> Failed to load data.</div>;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">

      {/* 1. COMPACT HEADER & TOOLBAR */}
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

              {/* Category Combobox (Updated with Truncation) */}
              <Popover open={openCategoryCombo} onOpenChange={setOpenCategoryCombo}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCategoryCombo}
                    className="w-full sm:w-[200px] justify-between h-9 bg-card px-3"
                  >
                    {/* Added truncate and flex-1 to allow text to shrink */}
                    <span className="truncate flex-1 text-left">
                      {categoryFilter === "All" ? "Filter Category..." : categoryFilter}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search category..." />
                    <CommandList>
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((cat) => (
                          <CommandItem
                            key={cat}
                            value={cat}
                            onSelect={() => updateCategory(cat)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                categoryFilter === cat ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="truncate">{cat}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Theme Selector (Updated with Truncation) */}
              {themeFilter && (
                <Select value={themeFilter} onValueChange={updateTheme}>
                  <SelectTrigger className="w-full sm:w-[160px] h-9 bg-card px-3">
                    <div className="flex items-center gap-2 min-w-0 w-full">
                      <span className="text-muted-foreground text-xs uppercase font-bold shrink-0">Theme:</span>
                      {/* Added truncate class */}
                      <span className="truncate block font-medium">
                        {themeFilter}
                      </span>
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

      {/* 2. CONTENT GRID */}
      <div className="container mx-auto px-4 pt-6">

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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentWallpapers.map((wp) => {
                // Since themeFilter is now guaranteed to be a valid key (after load), we use it directly.
                // Fallback added just in case of transition states.
                const imageUrl = wp.variants[themeFilter] || Object.values(wp.variants)[0];

                return (
                  <Card key={wp.id} className="group overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300">

                    <div className="aspect-[16/9] relative bg-muted overflow-hidden">
                      <FadeInImage
                        src={imageUrl}
                        alt={wp.title}
                        className="group-hover:scale-105 transition-transform duration-700"
                      />

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 rounded-full"
                          onClick={() => {
                            setPreviewTheme(themeFilter);
                            setPreviewWallpaper(wp);
                          }}
                        >
                          <Expand className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleDownload(imageUrl, `${wp.title}-${themeFilter}.png`)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium text-sm truncate text-foreground" title={wp.title}>
                          {wp.title}
                        </h3>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-border text-muted-foreground shrink-0 max-w-[80px] truncate">
                          {wp.category}
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

            {filteredWallpapers.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold mb-2">No wallpapers found</h2>
                <p className="text-sm text-muted-foreground max-w-xs mb-6">
                  Try adjusting your search or category filter.
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("All");
                }}>
                  Clear Filters
                </Button>
              </div>
            )}

            {filteredWallpapers.length > ITEMS_PER_PAGE && (
              <div className="flex justify-center items-center gap-4 mt-8 py-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
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
        />
      )}
    </div>
  );
}

export default function WallpapersPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
      <WallpapersContent />
    </Suspense>
  );
}