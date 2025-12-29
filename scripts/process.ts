import sharp from 'sharp';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import dotenv from "dotenv";
import { loadThemes, loadCategories, loadHistory, saveHistory, ensureDirectory, Theme } from './utils';
import { updateDatabase } from './update-db';

dotenv.config();


// 1. Math: Euclidean Color Distance
// Calculates which theme color is closest to the current pixel
export function getNearestColor(pixel: number[], palette: number[][]): number[] {
  let minDistance = Infinity;
  let nearest = palette[0];

  for (const color of palette) {
    // Simple Euclidean distance (Fastest for 4k images)
    // For higher accuracy (but slower), convert RGB to LAB space
    const dist = (pixel[0] - color[0]) ** 2 +
      (pixel[1] - color[1]) ** 2 +
      (pixel[2] - color[2]) ** 2;

    if (dist < minDistance) {
      minDistance = dist;
      nearest = color;
    }
  }
  return nearest;
}

// 2. Image Processor
export async function applyThemeToImage(imageBuffer: Buffer, theme: Theme, outputDir: string, originalId: string) {
  console.log(`🎨 Applying theme: ${theme.name}...`);

  // 1. Initialize Sharp
  const image = sharp(imageBuffer);

  // 2. Metadata is crucial for the output reconstruction
  const { width, height } = await image.metadata();

  // 3. FIX: Force the image to have an Alpha channel (RGBA)
  // This ensures the buffer is always 4 channels, matching our loop logic.
  const rawBuffer = await image
    .ensureAlpha()
    .raw()
    .toBuffer();

  const palette = theme.rgbPalette!;

  // 4. Process Pixels (R, G, B, A)
  for (let i = 0; i < rawBuffer.length; i += 4) {
    // i = Red, i+1 = Green, i+2 = Blue, i+3 = Alpha

    // Skip fully transparent pixels (optimization)
    if (rawBuffer[i + 3] === 0) continue;

    const r = rawBuffer[i];
    const g = rawBuffer[i + 1];
    const b = rawBuffer[i + 2];

    // Find nearest theme color
    const [newR, newG, newB] = getNearestColor([r, g, b], palette);

    // Overwrite pixel
    rawBuffer[i] = newR;
    rawBuffer[i + 1] = newG;
    rawBuffer[i + 2] = newB;
    // We leave Alpha (i+3) alone
  }

  // 5. Save the result
  const fileName = `wallpaper-${theme.name.toLowerCase().replace(/\s+/g, '-')}-${originalId}.png`;

  await sharp(rawBuffer, {
    raw: {
      width: width!,
      height: height!,
      channels: 4 // This now matches because we used ensureAlpha()
    }
  })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(outputDir, fileName));
}

// 3. Main Execution
(async () => {
  try {
    const outputDir = path.join(__dirname, '../output');
    ensureDirectory(outputDir); // 1. Fix: Ensure folder exists

    const themes = loadThemes();
    const categories = loadCategories();
    const history = loadHistory();

    // We generate the tag HERE so we can write it to the DB correctly.
    const date = new Date();
    // Format: wallpapers-YYYYMMDD-HHMM
    const tagName = `wallpapers-${date.toISOString().slice(0, 10).replace(/-/g, '')}-${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;

    // Get Repo Name from ENV (provided by GitHub Actions) or fallback
    const repoName = process.env.GITHUB_REPOSITORY || 'dev-AshishRanjan/wallcraft';

    // 2. Logic: Pick Random Category
    const category = categories[Math.floor(Math.random() * categories.length)];
    console.log(`🎯 Selected Category: ${category}`);

    // 3. Logic: Fetch Unique Image (Retry up to 3 times)
    let imgData = null;
    let attempts = 0;

    while (attempts < 3) {
      console.log(`📡 Fetching Unsplash image (Attempt ${attempts + 1})...`);
      const url = `https://api.unsplash.com/photos/random?orientation=landscape&query=Minimalist,${category}&client_id=${process.env.UNSPLASH_KEY}`;
      const res = await axios.get(url);

      if (!history.includes(res.data.id)) {
        imgData = res.data;
        break;
      }
      console.warn(`⚠️ Duplicate image ID ${res.data.id} found. Retrying...`);
      attempts++;
    }

    if (!imgData) throw new Error("Could not find a unique image after 3 attempts.");

    // Get Title: Prefer 'description' (often null), fallback to 'alt_description', fallback to Category
    let rawTitle = imgData.description || imgData.alt_description || `${category} Wallpaper`;

    // Formatting: Capitalize first letter, truncate if too long (max 50 chars)
    rawTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
    if (rawTitle.length > 50) rawTitle = rawTitle.substring(0, 47) + '...';

    // Clean for Filenames/Tags (Optional, mostly for display)
    const imageTitle = rawTitle.replace(/\n/g, ' ').trim();
    console.log(`🖼️ Image Title: "${imageTitle}"`);

    // Download High-Res Buffer
    const downloadUrl = imgData.urls.raw + '&q=85&w=3840';
    const imgBuffer = (await axios({ url: downloadUrl, responseType: 'arraybuffer' })).data;

    // Process Themes
    for (const theme of themes) {
      await applyThemeToImage(imgBuffer, theme, outputDir, imgData.id);
    }

    // 4. Update History
    history.push(imgData.id);
    saveHistory(history);

    // 5. Generate Metadata for Frontend
    const metaData = {
      id: imgData.id,
      title: imageTitle,
      category: category,
      original_url: imgData.links.html,
      photographer: imgData.user.name,
      photographer_username: imgData.user.username,
      themes: themes.map(t => t.name),
      created_at: new Date().toISOString()
    };

    fs.writeFileSync(path.join(outputDir, 'meta.json'), JSON.stringify(metaData, null, 2));

    // 6. Update the "Zero-API" Database
    // This writes to public/database.json
    updateDatabase(metaData, tagName, repoName);

    // 7. Generate Release Description (Markdown)
    const releaseBody = `
## ${imageTitle}

- **Category:** ${category}
- **Photographer:** [${imgData.user.name}](https://unsplash.com/@${imgData.user.username})
- **Original Image:** [View on Unsplash](${imgData.links.html})

### Available Themes
${themes.map(t => `- **${t.name}**`).join('\n')}

> *Generated automatically by WallCraft*
    `;
    fs.writeFileSync(path.join(outputDir, 'release_body.md'), releaseBody.trim());

    // 9. IMPORTANT: Output the Tag Name for GitHub Actions
    // The YAML needs to know which tag we decided on.
    fs.writeFileSync(path.join(outputDir, 'tag_name.txt'), tagName);


    console.log('✅ Generation Complete.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();