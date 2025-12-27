// scripts/update-db.ts
import fs from 'fs';
import path from 'path';

// The path to the "Zero-API" database
const DB_PATH = path.join(__dirname, '../public/database.json');

export interface WallpaperEntry {
  id: string;
  title: string;
  category: string;
  photographer: string;
  originalUrl: string;
  date: string;
  variants: Record<string, string>; // Theme Name -> Download URL
}

export function updateDatabase(
  meta: any,
  tagName: string,
  repoName: string // e.g. "username/wallcraft"
) {
  let db: WallpaperEntry[] = [];

  // 1. Load existing DB if it exists
  if (fs.existsSync(DB_PATH)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } catch (e) {
      console.warn("⚠️ Database file corrupted or empty, starting fresh.");
      db = [];
    }
  }

  // 2. Construct GitHub Release URLs
  // Pattern: https://github.com/{user}/{repo}/releases/download/{tag}/{filename}
  const baseUrl = `https://github.com/${repoName}/releases/download/${tagName}`;
  const variants: Record<string, string> = {};

  meta.themes.forEach((themeName: string) => {
    // Filename logic must match exactly what we generate in process.ts
    const fileName = `wallpaper-${themeName.toLowerCase().replace(/\s+/g, '-')}-${meta.id}.png`;
    variants[themeName] = `${baseUrl}/${fileName}`;
  });

  // 3. Create New Entry
  const newEntry: WallpaperEntry = {
    id: meta.id,
    title: meta.title,
    category: meta.category,
    photographer: meta.photographer,
    originalUrl: meta.original_url,
    date: meta.created_at, // Use the ISO string from meta
    variants: variants
  };

  // 4. Prepend (Newest first) and Deduplicate
  // Remove any existing entry with same ID to avoid duplicates if re-run
  db = db.filter(item => item.id !== newEntry.id);
  db.unshift(newEntry);

  // 5. Save
  // Ensure public dir exists
  const publicDir = path.dirname(DB_PATH);
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  console.log(`💾 Database updated. Total entries: ${db.length}`);
}