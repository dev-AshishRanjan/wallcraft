import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import axios from "axios";
import { ensureDirectory, loadCategories, loadThemes } from "./utils";
import { applyThemeToImage } from "./process";

// Load environment variables
dotenv.config();

// --- CONFIGURATION ---
const DATABASE_PATH = path.join(__dirname, "public/database.json");
const HISTORY_PATH = path.join(__dirname, "history.json");
const OUTPUT_DIR = path.join(__dirname, '../output');
const RELEASE_BODY_PATH = path.join(OUTPUT_DIR, "release_body.md");
const RELEASE_TAG_PATH = path.join(OUTPUT_DIR, "tag_name.txt");

const UNSPLASH_API_URL = "https://api.unsplash.com";

// --- TYPES ---
interface Theme {
  name: string;
  colors: string[];
}

interface WallpaperEntry {
  id: string;
  title: string;
  category: string;
  photographer: string;
  originalUrl: string; // CamelCase to match Frontend
  date: string;
  variants: Record<string, string>; // Required for Frontend to work
}

// --- HELPER FUNCTIONS ---

function loadJson(filePath: string) {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    console.error(`Error reading ${filePath}`, e);
    return [];
  }
}

function getRandomCategories(allCategories: string[], count: number): string[] {
  const shuffled = [...allCategories].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Parse Args: --cats=5 --imgs=10
function getArgs() {
  const args = process.argv.slice(2);
  const catsArg = args.find(a => a.startsWith("--cats="))?.split("=")[1];
  const imgsArg = args.find(a => a.startsWith("--imgs="))?.split("=")[1];
  return {
    categoryCount: catsArg ? parseInt(catsArg) : 3,
    imagesPerCategory: imgsArg ? parseInt(imgsArg) : 5
  };
}

async function fetchUnsplashBatch(query: string, count: number): Promise<any[]> {
  const accessKey = process.env.UNSPLASH_KEY;
  if (!accessKey) throw new Error("Missing UNSPLASH_KEY");

  // Unsplash max count is 30 per request
  const safeCount = Math.min(count, 30);

  const url = `${UNSPLASH_API_URL}/photos/random?client_id=${accessKey}&query=${encodeURIComponent(query)}&count=${safeCount}&orientation=landscape`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`❌ Unsplash API Error: ${res.status} ${res.statusText}`);
    return [];
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

// --- MAIN LOGIC ---

async function main() {
  console.log("🚀 Starting Bulk Generation...");
  ensureDirectory(OUTPUT_DIR);

  const { categoryCount, imagesPerCategory } = getArgs();
  console.log(`⚙️  Config: ${categoryCount} Categories, ${imagesPerCategory} Images/Cat`);

  // 1. Load Data
  const database: WallpaperEntry[] = loadJson(DATABASE_PATH);
  const history: string[] = loadJson(HISTORY_PATH);
  const categories = loadCategories();
  const themes = loadThemes(); // Assuming returns { name: string, colors: string[] }[]

  // FIX: Properly map theme names for logging
  console.log(`🎨 Loaded ${themes.length} themes: ${themes.map(t => t.name).join(", ")}`);

  // 2. Select Categories
  const targetCategories = getRandomCategories(categories, categoryCount);
  console.log(`🎯 Targets: ${targetCategories.join(", ")}`);

  const newEntries: WallpaperEntry[] = [];
  const newHistoryIds: string[] = [];

  const repoName = process.env.GITHUB_REPOSITORY || 'dev-AshishRanjan/wallcraft';

  const date = new Date();
  const tagName = `db-${date.toISOString().slice(0, 10).replace(/-/g, '')}-${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;

  const baseUrl = `https://github.com/${repoName}/releases/download/${tagName}`;

  // 3. Process
  for (const category of targetCategories) {
    console.log(`\n📸 Fetching '${category}'...`);

    // Add small delay to respect API rate limits logic
    await new Promise(r => setTimeout(r, 1000));

    try {
      const photos = await fetchUnsplashBatch(`Minimalist ${category}`, imagesPerCategory);

      for (const photo of photos) {
        if (history.includes(photo.id) || newHistoryIds.includes(photo.id)) {
          console.log(`⚠️ Duplicate skipped: ${photo.id}`);
          continue;
        }

        let rawTitle = photo.description || photo.alt_description || `${category} Wallpaper`;
        // Formatting: Capitalize first letter, truncate if too long (max 50 chars)
        rawTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
        if (rawTitle.length > 50) rawTitle = rawTitle.substring(0, 47) + '...';
        const imageTitle = rawTitle.replace(/\n/g, ' ').trim();

        console.log(`🖼️ Processing: "${imageTitle}"`);

        // DOWNLOAD & PROCESS (Local Artifact Generation)
        try {
          const downloadUrl = photo.urls.raw + '&q=85&w=3840';
          const imgBuffer = (await axios({ url: downloadUrl, responseType: 'arraybuffer' })).data;

          for (const theme of themes) {
            await applyThemeToImage(imgBuffer, theme, OUTPUT_DIR, photo.id);
          }
        } catch (procErr) {
          console.warn(`⚠️ Processing warning (image might be too large or network fail):`, procErr);
          // We continue even if local processing fails, because the app relies on the Raw URL.
        }

        // CONSTRUCT DB ENTRY
        const variants: Record<string, string> = {};
        themes.forEach((t: Theme) => {
          const fileName = `wallpaper-${t.name.toLowerCase().replace(/\s+/g, '-')}-${photo.id}.png`;
          variants[t.name] = `${baseUrl}/${fileName}`;
        });

        const entry: WallpaperEntry = {
          id: photo.id,
          title: imageTitle,
          category: category,
          originalUrl: photo.links.html,
          photographer: photo.user.name,
          date: new Date().toISOString(),
          variants: variants
        };

        newEntries.push(entry);
        newHistoryIds.push(photo.id);
        console.log(`✅ Added to DB: ${entry.id}`);
      }
    } catch (e) {
      console.error(`❌ Failed to process category ${category}:`, e);
    }
  }

  // 4. Save & Report
  if (newEntries.length > 0) {
    // Write DB (Newest first)
    const updatedDb = [...newEntries, ...database];
    const updatedHistory = [...history, ...newHistoryIds];

    fs.writeFileSync(DATABASE_PATH, JSON.stringify(updatedDb, null, 2));
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(updatedHistory, null, 2));

    // Generate Markdown Table for Release
    let mdContent = `### 🚀 Added ${newEntries.length} New Wallpapers\n\n`;
    mdContent += `| Title | Category  | Photographer | Original Image|\n`;
    mdContent += `| :--- | :--- | :--- | :--- |\n`;

    newEntries.forEach(w => {
      mdContent += `| ${w.title} | **${w.category}** | ${w.photographer} | [View on Unsplash](${w.originalUrl}) |\n`;
    });

    fs.writeFileSync(RELEASE_BODY_PATH, mdContent);
    fs.writeFileSync(RELEASE_TAG_PATH, tagName);

    console.log(`\n✨ Successfully added ${newEntries.length} items.`);
    console.log(`📝 Release notes generated at ${RELEASE_BODY_PATH}`);
  } else {
    console.log("\n⚠️ No new items generated.");
    fs.writeFileSync(RELEASE_BODY_PATH, "");
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Fatal Error:", err);
    process.exit(1);
  });
}