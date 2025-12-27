"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const ROUTES = [
  { name: "Home", path: "/" },
  { name: "Wallpapers", path: "/wallpapers" },
  { name: "Studio", path: "/studio" }, // Placeholder for now
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full z-50 border-b border-nord-2/50 bg-nord-0/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-nord-8 rounded-lg flex items-center justify-center">
            <span className="font-bold text-nord-0 text-lg">W</span>
          </div>
          <span className="font-bold text-xl text-nord-6 tracking-tight">WallCraft</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {ROUTES.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-nord-8",
                pathname === route.path ? "text-nord-8" : "text-nord-4/70"
              )}
            >
              {route.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="https://github.com/dev-AshishRanjan/wallcraft" target="_blank">
            <Button variant="ghost" size="icon" className="text-nord-4 hover:text-nord-8 hover:bg-nord-1">
              <Github className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/wallpapers">
            <Button className="bg-nord-8 text-nord-0 font-bold hover:bg-nord-9">
              Browse Gallery
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-nord-4">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-nord-0 border-nord-2 text-nord-4">
              <div className="flex flex-col gap-6 mt-8">
                {ROUTES.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    className="text-lg font-medium hover:text-nord-8"
                  >
                    {route.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}