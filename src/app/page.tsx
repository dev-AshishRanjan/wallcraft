import Link from "next/link";
import fs from "fs";
import path from "path";
import { ArrowRight, Zap, Layers, Palette, Github, Clock, Tag, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroBackground } from "@/components/hero/hero-background";
import { WorkflowBackground } from "@/components/hero/workflow-background";
import { NetworkBackground } from "@/components/hero/network-background";
import { PacketBackground } from "@/components/hero/packet-background";

// --- SERVER SIDE LOGIC ---
async function getAppStats() {
  const themeDir = path.join(process.cwd(), "themes");
  const categoryFile = path.join(process.cwd(), "categories.json");

  let themeNames: string[] = [];
  try {
    const files = fs.readdirSync(themeDir).filter((file) => file.endsWith(".json"));
    themeNames = files.map((file) => {
      const content = fs.readFileSync(path.join(themeDir, file), "utf-8");
      return JSON.parse(content).name;
    });
  } catch (e) {
    themeNames = ["Nord", "Dracula"];
  }

  let categories: string[] = [];
  try {
    const content = fs.readFileSync(categoryFile, "utf-8");
    categories = JSON.parse(content);
  } catch (e) {
    categories = ["General"];
  }

  return { themeNames, categories };
}

export default async function HomePage() {
  const { themeNames, categories } = await getAppStats();

  return (
    <div className="flex flex-col">

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 py-20 md:py-32 overflow-hidden">
        <PacketBackground />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-nord-8/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nord-1 border border-nord-2 text-nord-8 text-xs font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nord-8 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-nord-8"></span>
            </span>
            New wallpapers dropped every hour
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-nord-6 tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            Beautiful Themes.<br />
            <span className="text-nord-8">Zero Effort.</span>
          </h1>

          <p className="text-lg md:text-xl text-nord-4/60 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-900">
            Open-source wallpaper engine that automatically fetches high-res photography and converts them into your favorite color palettes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <Link href="/wallpapers">
              <Button size="lg" className="bg-nord-8 text-nord-0 font-bold hover:bg-nord-9 h-12 px-8 text-base">
                Explore Gallery <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="https://github.com/dev-AshishRanjan/wallcraft" target="_blank">
              <Button variant="outline" size="lg" className="border-nord-3 text-nord-4 hover:bg-nord-1 h-12 px-8 text-base">
                <Github className="w-4 h-4 mr-2" /> Star on GitHub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC FEATURES GRID */}
      <section className="py-24 bg-nord-1 border-y border-nord-2">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-nord-6 mb-4">Why WallCraft?</h2>
            <p className="text-nord-4/60 max-w-2xl mx-auto">
              Built for developers who care about consistency in their setup.
            </p>
          </div>

          {/* Grid Layout: 2x2 on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* Feature 1: Themes */}
            <div className="p-8 bg-nord-0 border border-nord-2 rounded-2xl hover:border-nord-8 transition-colors group">
              <div className="mb-6 p-4 bg-nord-1 rounded-xl inline-block group-hover:scale-110 transition-transform">
                <Palette className="w-8 h-8 text-nord-14" />
              </div>
              <h3 className="text-xl font-bold text-nord-6 mb-3">{themeNames.length} Supported Themes</h3>
              <p className="text-nord-4/60 leading-relaxed mb-4">
                We strictly follow the color palettes you love.
              </p>
              <div className="flex flex-wrap gap-2">
                {themeNames.slice(0, 5).map(name => (
                  <Badge key={name} variant="secondary" className="bg-nord-1 text-nord-4 text-[10px] border-nord-2">
                    {name}
                  </Badge>
                ))}
                {themeNames.length > 5 && (
                  <span className="text-xs text-nord-4/40 self-center">+{themeNames.length - 5} more</span>
                )}
              </div>
            </div>

            {/* Feature 2: Studio */}
            <div className="p-8 bg-nord-0 border border-nord-2 rounded-2xl hover:border-nord-8 transition-colors group">
              <div className="mb-6 p-4 bg-nord-1 rounded-xl inline-block group-hover:scale-110 transition-transform">
                <Wand2 className="w-8 h-8 text-nord-15" />
              </div>
              <h3 className="text-xl font-bold text-nord-6 mb-3">WallCraft Studio</h3>
              <p className="text-nord-4/60 leading-relaxed mb-4">
                Have a specific image? Drag & drop it into our Studio to apply themes instantly in your browser.
              </p>
              <Link href="/studio">
                <span className="text-nord-8 text-sm font-bold hover:underline inline-flex items-center">
                  Try Studio <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </Link>
            </div>

            {/* Feature 3: Categories */}
            <div className="p-8 bg-nord-0 border border-nord-2 rounded-2xl hover:border-nord-8 transition-colors group">
              <div className="mb-6 p-4 bg-nord-1 rounded-xl inline-block group-hover:scale-110 transition-transform">
                <Tag className="w-8 h-8 text-nord-13" />
              </div>
              <h3 className="text-xl font-bold text-nord-6 mb-3">{categories.length} Categories</h3>
              <p className="text-nord-4/60 leading-relaxed mb-4">
                From nature to cyberpunk, we cover it all.
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 5).map(cat => (
                  <Badge key={cat} variant="secondary" className="bg-nord-1 text-nord-4 text-[10px] border-nord-2">
                    {cat}
                  </Badge>
                ))}
                {categories.length > 5 && (
                  <span className="text-xs text-nord-4/40 self-center">+{categories.length - 5} more</span>
                )}
              </div>
            </div>

            {/* Feature 4: Quality */}
            <div className="p-8 bg-nord-0 border border-nord-2 rounded-2xl hover:border-nord-8 transition-colors group">
              <div className="mb-6 p-4 bg-nord-1 rounded-xl inline-block group-hover:scale-110 transition-transform">
                <Layers className="w-8 h-8 text-nord-9" />
              </div>
              <h3 className="text-xl font-bold text-nord-6 mb-3">4K Quality</h3>
              <p className="text-nord-4/60 leading-relaxed">
                We strictly process high-resolution images (3840px width), ensuring they look crisp on any monitor, from 1080p to 4K Ultrawide.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. CTA SECTION */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto bg-gradient-to-b from-nord-1 to-nord-0 border border-nord-2 p-12 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-nord-8/5 blur-[80px] -z-10 pointer-events-none" />
            <Clock className="w-12 h-12 text-nord-4/30 mx-auto mb-6" />

            <h2 className="text-3xl font-bold text-nord-6 mb-4">
              Your desktop deserves an update
            </h2>
            <p className="text-nord-4/60 mb-8">
              Join thousands of developers using WallCraft to keep their setup fresh.
            </p>

            <Link href="/wallpapers">
              <Button className="bg-nord-8 text-nord-0 font-bold hover:bg-nord-9 hover:scale-105 transition-transform">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}