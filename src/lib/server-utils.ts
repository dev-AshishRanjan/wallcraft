import fs from "fs";
import path from "path";

export function getAppConfig() {
  const themeDir = path.join(process.cwd(), "themes");
  const categoryFile = path.join(process.cwd(), "categories.json");

  // 1. Get Themes
  let themes: string[] = [];
  try {
    const files = fs.readdirSync(themeDir).filter((file) => file.endsWith(".json"));
    themes = files.map((file) => {
      const content = fs.readFileSync(path.join(themeDir, file), "utf-8");
      return JSON.parse(content).name;
    });
  } catch (e) {
    themes = ["Nord", "Dracula"];
  }

  // 2. Get Categories
  let categories: string[] = [];
  try {
    const content = fs.readFileSync(categoryFile, "utf-8");
    categories = JSON.parse(content);
  } catch (e) {
    categories = ["General"];
  }

  return { themes, categories };
}