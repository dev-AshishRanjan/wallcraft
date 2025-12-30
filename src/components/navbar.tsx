"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Menu, Wand2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CommandMenu } from "@/components/command-menu";
import { cn, getAssetPath } from "@/lib/utils";
import { FadeInImage } from "./ui/fade-in-image";

const ROUTES = [
  { name: "Home", path: "/" },
  { name: "Wallpapers", path: "/wallpapers" },
  { name: "Studio", path: "/studio" },
];

interface NavbarProps {
  themes: string[];
  categories: string[]; // Added
}

export function Navbar({ themes, categories }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">

        {/* LEFT: Logo & Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FadeInImage
                src={getAssetPath("/logo.png")}
                alt={"W"}
                className="h-full w-full object-cover shadow-sm shadow-black/50 rounded-md"
              />
            </div>
            <span className="hidden font-bold tracking-tight sm:inline-block">
              WallCraft
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {ROUTES.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "group flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                  pathname === route.path
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground bg-transparent"
                )}
              >
                {route.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* RIGHT: Search & Actions */}
        <div className="flex items-center gap-2 md:gap-4">

          {/* 1. Command Search (Hidden on tiny screens, expanded on desktop) */}
          <div className="flex-1 md:flex-none">
            <CommandMenu themes={themes} categories={categories} />
          </div>

          {/* 2. GitHub Icon (Desktop) */}
          <Link href="https://github.com/dev-AshishRanjan/wallcraft" target="_blank" className="hidden md:flex">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Button>
          </Link>

          {/* 3. CTA Button (Desktop - Shows 'Studio' unless we are IN studio) */}
          {pathname !== '/studio' && (
            <Link href="/studio" className="hidden md:flex">
              <Button size="sm" className="font-bold">
                Try Studio <Wand2 className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          )}

          {/* 4. Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="text-left border-b pb-4 mb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
                      <FadeInImage
                        src={getAssetPath("/logo.png")}
                        alt="W"
                        className="h-full w-full object-cover shadow-sm shadow-black/50 rounded-md"
                      />
                    </div>
                    WallCraft
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-4">
                  {ROUTES.map((route) => (
                    <Link
                      key={route.path}
                      href={route.path}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-md px-4 py-3 text-sm font-medium transition-colors",
                        pathname === route.path
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                      )}
                    >
                      {route.name}
                      {pathname === route.path && <ArrowRight className="h-4 w-4 opacity-50" />}
                    </Link>
                  ))}

                  <div className="border-t my-2" />

                  <Link
                    href="https://github.com/dev-AshishRanjan/wallcraft"
                    target="_blank"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    <Github className="h-4 w-4" />
                    Star on GitHub
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}