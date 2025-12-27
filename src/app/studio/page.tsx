import fs from "fs";
import path from "path";
import { StudioClient } from "./studio-client";
import { Theme } from "@/lib/types";

// Load themes from the 'themes' directory on the server
async function getThemes(): Promise<Theme[]> {
  const themeDir = path.join(process.cwd(), "themes");
  const themes: Theme[] = [];

  try {
    const files = fs.readdirSync(themeDir).filter((file) => file.endsWith(".json"));

    files.forEach((file) => {
      const content = fs.readFileSync(path.join(themeDir, file), "utf-8");
      const data = JSON.parse(content);
      themes.push(data);
    });
  } catch (e) {
    console.error("Error loading themes for Studio:", e);
  }

  return themes;
}

export default async function StudioPage() {
  const themes = await getThemes();

  return (
    <div className="min-h-screen bg-nord-0 text-nord-4 p-8">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold text-nord-8 mb-4">WallCraft Studio</h1>
        <p className="text-nord-4/60">
          Upload your own wallpapers and apply our theme engine directly in your browser.
          <br />Secure, private, and runs 100% on your device.
        </p>
      </div>

      <StudioClient themes={themes} />
    </div>
  );
}