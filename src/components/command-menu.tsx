"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Image as ImageIcon,
  Wand2,
  Home,
  Palette,
  Tag
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommandMenuProps {
  themes: string[];
  categories: string[];
}

export function CommandMenu({ themes, categories }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(""); // Track user input
  const router = useRouter();

  const sortedThemes = React.useMemo(() => [...themes].sort(), [themes]);
  const sortedCategories = React.useMemo(() => [...categories].sort(), [categories]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        )}
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search wallpapers...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* IMPORTANT: We attach onValueChange to update our 'query' state.
         We only slice the arrays if query is empty.
      */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
      >
        <CommandInput
          placeholder="Type a command, theme, or category..."
          value={query}
          onValueChange={setQuery}
        />

        <CommandList className="max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <Home className="mr-2 h-4 w-4" />
              Home
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/wallpapers"))}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Gallery
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/studio"))}>
              <Wand2 className="mr-2 h-4 w-4" />
              Studio
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Categories">
            {sortedCategories
              // LOGIC: If user is typing, show ALL (let cmdk filter). If not, show top 5.
              .slice(0, query.length > 0 ? undefined : 5)
              .map((cat) => (
                <CommandItem
                  key={cat}
                  onSelect={() => runCommand(() => router.push(`/wallpapers?category=${cat}`))}
                >
                  <Tag className="mr-2 h-4 w-4" />
                  {cat}
                </CommandItem>
              ))}
            {/* Visual indicator that there are more */}
            {!query && sortedCategories.length > 5 && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                Type to see {sortedCategories.length - 5} more...
              </div>
            )}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Themes">
            {sortedThemes
              // LOGIC: If user is typing, show ALL (let cmdk filter). If not, show top 5.
              .slice(0, query.length > 0 ? undefined : 5)
              .map((themeName) => (
                <CommandItem
                  key={themeName}
                  onSelect={() => runCommand(() => router.push(`/wallpapers?theme=${themeName}`))}
                >
                  <Palette className="mr-2 h-4 w-4" />
                  {themeName}
                </CommandItem>
              ))}
            {!query && sortedThemes.length > 5 && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                Type to see {sortedThemes.length - 5} more...
              </div>
            )}
          </CommandGroup>

        </CommandList>
      </CommandDialog>
    </>
  );
}