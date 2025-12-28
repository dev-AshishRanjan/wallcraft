import fs from "fs";
import path from "path";
import { StudioClient } from "./studio-client";
import { Theme } from "@/lib/types";

async function getThemes(): Promise<Theme[]> {
  const themeDir = path.join(process.cwd(), "themes");
  const themes: Theme[] = [];
  try {
    const files = fs.readdirSync(themeDir).filter((file) => file.endsWith(".json"));
    files.forEach((file) => {
      const content = fs.readFileSync(path.join(themeDir, file), "utf-8");
      themes.push(JSON.parse(content));
    });
  } catch (e) {
    console.error("Error loading themes", e);
  }
  return themes;
}

export default async function StudioPage() {
  const themes = await getThemes();

  // REMOVE padding-top here because the global layout already has pt-16
  // We want this component to fill the remaining height
  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <StudioClient themes={themes} />
    </div>
  );
}