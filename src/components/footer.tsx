import Link from "next/link";
import { Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-nord-2 bg-nord-0 py-12 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">

        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="font-bold text-nord-6 text-lg">WallCraft</span>
          <p className="text-nord-4/50 text-sm">
            Automated, open-source wallpaper engine.
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm text-nord-4/60">
          <Link href="/wallpapers" className="hover:text-nord-8 transition-colors">Gallery</Link>
          <Link href="/studio" className="hover:text-nord-8 transition-colors">Studio</Link>
          <Link href="https://github.com/your-username/wallcraft" className="hover:text-nord-8 transition-colors">GitHub</Link>
        </div>

        <div className="flex items-center gap-2 text-xs text-nord-4/40">
          <span>Built with</span>
          <Heart className="w-3 h-3 text-nord-11 fill-current" />
          <span>by WallCraft</span>
        </div>
      </div>
    </footer>
  );
}