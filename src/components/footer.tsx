"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Github, Heart, Palette, Twitter, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { FadeInImage } from "./ui/fade-in-image";
import { getAssetPath } from "@/lib/utils";

export function Footer() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="w-full border-t bg-card/30 backdrop-blur-sm mt-auto">
      {/* Tighter vertical padding (py-8) for a denser production feel */}
      <div className="container mx-auto px-4 py-8 md:py-10">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* 1. Brand & Description */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <FadeInImage
                  src={getAssetPath("/logo.png")}
                  alt="W"
                  className="h-full w-full object-cover shadow-sm shadow-black/50 rounded-md"
                />
              </div>
              <span className="font-bold text-lg tracking-tight">WallCraft</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-snug max-w-xs">
              The automated, open-source wallpaper engine for developers.
            </p>
          </div>

          {/* 2. Product Links - Tighter spacing (space-y-2) */}
          <div>
            <h3 className="font-semibold mb-3 text-sm text-foreground">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/wallpapers" className="hover:text-primary transition-colors">Gallery</Link></li>
              <li><Link href="/studio" className="hover:text-primary transition-colors">Studio</Link></li>
              <li><Link href="https://github.com/dev-AshishRanjan/wallcraft/releases" className="hover:text-primary transition-colors">Releases</Link></li>
            </ul>
          </div>

          {/* 3. Legal Links */}
          <div>
            <h3 className="font-semibold mb-3 text-sm text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="https://unsplash.com/license" className="hover:text-primary transition-colors">Image License</Link></li>
            </ul>
          </div>

          {/* 4. Social & Connect */}
          <div>
            <h3 className="font-semibold mb-3 text-sm text-foreground">Connect</h3>
            <div className="flex items-center gap-2">
              <Link href="https://github.com/dev-AshishRanjan/wallcraft" target="_blank">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background hover:bg-accent hover:text-accent-foreground border-border/60">
                  <Github className="w-4 h-4" />
                  <span className="sr-only">GitHub</span>
                </Button>
              </Link>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background border-border/60 opacity-50 cursor-not-allowed">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background border-border/60 opacity-50 cursor-not-allowed">
                <Globe className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Reduced top margin (mt-8) and padding (pt-6) */}
        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} WallCraft. Built with</span>
            <Heart className="w-3 h-3 text-destructive fill-current" />
            <span>by Open Source.</span>
          </div>

          {/* Theme Selector - Slightly more compact */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground hidden sm:inline-block">Theme</span>
            {mounted ? (
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[120px] h-7 text-xs bg-background border-input/60 focus:ring-0">
                  <Palette className="w-3 h-3 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nord">Nord</SelectItem>
                  <SelectItem value="midnight">Midnight</SelectItem>
                  <SelectItem value="daylight">Daylight</SelectItem>
                  <SelectItem value="latte">Latte</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="w-[120px] h-7 bg-muted/20 rounded animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}