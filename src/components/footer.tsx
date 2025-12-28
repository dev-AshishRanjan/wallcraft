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

export function Footer() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="font-bold text-primary-foreground text-lg">W</span>
              </div>
              <span className="font-bold text-xl tracking-tight">WallCraft</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Open-source automated wallpaper engine for developers. High-quality, themed, and free forever.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/wallpapers" className="hover:text-primary transition-colors">Wallpaper Gallery</Link></li>
              <li><Link href="/studio" className="hover:text-primary transition-colors">WallCraft Studio</Link></li>
              <li><Link href="https://github.com/your-username/wallcraft/releases" className="hover:text-primary transition-colors">Releases</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="https://unsplash.com/license" className="hover:text-primary transition-colors">Image License</Link></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex items-center gap-2">
              <Link href="https://github.com/your-username/wallcraft" target="_blank">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-background hover:bg-accent hover:text-accent-foreground">
                  <Github className="w-4 h-4" />
                  <span className="sr-only">GitHub</span>
                </Button>
              </Link>
              {/* Placeholders for future socials */}
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-background hover:bg-accent hover:text-accent-foreground" disabled>
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-background hover:bg-accent hover:text-accent-foreground" disabled>
                <Globe className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-6">

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} WallCraft. Built with</span>
            <Heart className="w-3 h-3 text-destructive fill-current" />
            <span>by Open Source.</span>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Theme:</span>
            {mounted && (
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[130px] h-8 text-xs bg-background border-input">
                  <Palette className="w-3 h-3 mr-2 text-primary" />
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nord">Nord</SelectItem>
                  <SelectItem value="midnight">Midnight</SelectItem>
                  <SelectItem value="daylight">Daylight</SelectItem>
                  <SelectItem value="latte">Latte</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}