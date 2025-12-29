import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { ensureDirectory, loadCategories, loadHistory, loadThemes } from "./utils";
import axios from "axios";
import { applyThemeToImage } from "./process";

// Load environment variables
dotenv.config();

// --- CONFIGURATION ---
const DATABASE_PATH = path.join(process.cwd(), "public/database.json");
const HISTORY_PATH = path.join(process.cwd(), "history.json");
const RELEASE_BODY_PATH = path.join(process.cwd(), "release_body.md");

const UNSPLASH_API_URL = "https://api.unsplash.com";

// --- TYPES ---
interface Theme {
  name: string;
  colors: string[];
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
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) throw new Error("Missing UNSPLASH_ACCESS_KEY");

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
  const outputDir = path.join(__dirname, '../output');
  ensureDirectory(outputDir);

  const { categoryCount, imagesPerCategory } = getArgs();
  console.log(`⚙️ Config: ${categoryCount} Categories, ${imagesPerCategory} Images/Cat`);

  // 1. Load Data
  const database = loadJson(DATABASE_PATH);
  const themes = loadThemes();
  const categories = loadCategories();
  const history = loadHistory();

  console.log(`🎨 Loaded ${themes.length} themes: ${themes.join(", ")}`);

  // 2. Select Categories
  const targetCategories = getRandomCategories(categories, categoryCount);
  console.log(`🎯 Targets: ${targetCategories.join(", ")}`);

  const newEntries = [];
  const newHistoryIds: string[] = [];

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

        // Clean for Filenames/Tags (Optional, mostly for display)
        const imageTitle = rawTitle.replace(/\n/g, ' ').trim();
        console.log(`🖼️ Image Title: "${imageTitle}"`);

        // Download High-Res Buffer
        const downloadUrl = photo.urls.raw + '&q=85&w=3840';
        const imgBuffer = (await axios({ url: downloadUrl, responseType: 'arraybuffer' })).data;

        // Process Themes
        for (const theme of themes) {
          await applyThemeToImage(imgBuffer, theme, outputDir, photo.id);
        }

        const entry = {
          id: photo.id,
          title: imageTitle,
          category: category,
          original_url: photo.links.html,
          photographer: photo.user.name,
          photographer_username: photo.user.username,
          themes: themes.map(t => t.name),
          created_at: new Date().toISOString()
        };

        newEntries.push(entry);
        newHistoryIds.push(photo.id);
        console.log(`✅ Added: ${entry.id}`);
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
      mdContent += `| ${w.title} | **${w.category}** | ${w.photographer} | [Original Work](${w.original_url}) |\n`;
    });

    fs.writeFileSync(RELEASE_BODY_PATH, mdContent);

    console.log(`\n✨ Successfully added ${newEntries.length} items.`);
    console.log(`📝 Release notes generated at ${RELEASE_BODY_PATH}`);
  } else {
    console.log("\n ⚠️ No new items generated.");
    // Create empty file so workflow doesn't crash if it tries to read
    fs.writeFileSync(RELEASE_BODY_PATH, "");
  }
}

main().catch(err => {
  console.error("Fatal Error:", err);
  process.exit(1);
});