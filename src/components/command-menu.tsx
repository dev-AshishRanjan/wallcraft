"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  User,
  Image as ImageIcon,
  Wand2,
  Home,
  Laptop
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

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  // Toggle with Cmd+K or Ctrl+K
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
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
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

          <CommandGroup heading="Themes">
            <CommandItem onSelect={() => runCommand(() => router.push("/wallpapers?theme=Nord"))}>
              <Laptop className="mr-2 h-4 w-4" />
              Nord
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/wallpapers?theme=Dracula"))}>
              <Laptop className="mr-2 h-4 w-4" />
              Dracula
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}