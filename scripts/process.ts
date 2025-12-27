import sharp from 'sharp';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { loadThemes, Theme } from './utils';

// 1. Math: Euclidean Color Distance
// Calculates which theme color is closest to the current pixel
function getNearestColor(pixel: number[], palette: number[][]): number[] {
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
async function applyThemeToImage(imageBuffer: Buffer, theme: Theme, outputDir: string) {
  console.log(`🎨 Applying theme: ${theme.name}...`);

  const image = sharp(imageBuffer);
  const { width, height } = await image.metadata();

  // Get raw pixel data
  const rawBuffer = await image.raw().toBuffer();
  const palette = theme.rgbPalette!; // We know this exists from loadThemes

  // Process Pixels (Performance Critical Loop)
  for (let i = 0; i < rawBuffer.length; i += 4) { // 4 channels: R, G, B, Alpha
    // Skip transparent pixels
    if (rawBuffer[i + 3] === 0) continue;

    const r = rawBuffer[i];
    const g = rawBuffer[i + 1];
    const b = rawBuffer[i + 2];

    const [newR, newG, newB] = getNearestColor([r, g, b], palette);

    rawBuffer[i] = newR;
    rawBuffer[i + 1] = newG;
    rawBuffer[i + 2] = newB;
  }

  // Save the result
  const fileName = `wallpaper-${theme.name.toLowerCase().replace(/\s+/g, '-')}.png`;
  await sharp(rawBuffer, {
    raw: { width: width!, height: height!, channels: 4 }
  })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(outputDir, fileName));
}

// 3. Main Execution
(async () => {
  try {
    const themes = loadThemes();
    console.log(`Loaded ${themes.length} themes.`);

    // Fetch High-Res Image (Unsplash)
    // Note: 'orientation=landscape' ensures desktop wallpaper format
    const url = `https://api.unsplash.com/photos/random?orientation=landscape&query=minimalist,nature&client_id=${process.env.UNSPLASH_KEY}`;
    const response = await axios.get(url);
    const downloadUrl = response.data.urls.raw + '&q=85&w=3840'; // Force 4k

    const metaData = {
      original_url: downloadUrl, // The Unsplash URL
      photographer: response.data.user.name,
      photographer_url: response.data.user.links.html,
      themes_generated: themes.map(t => t.name),
      created_at: new Date().toISOString()
    };

    // Write this to output/meta.json so it gets uploaded to the Release
    fs.writeFileSync(
      path.join(__dirname, '../output/meta.json'),
      JSON.stringify(metaData, null, 2)
    );

    console.log(`⬇️ Downloading base image from Unsplash...`);
    const imgBuffer = (await axios({ url: downloadUrl, responseType: 'arraybuffer' })).data;

    // Process all themes in parallel? 
    // No, sequential is safer for memory on free GitHub Runners (7GB RAM limit).
    for (const theme of themes) {
      await applyThemeToImage(imgBuffer, theme, path.join(__dirname, '../output'));
    }

    console.log('✅ All themes generated successfully.');

  } catch (error) {
    console.error('❌ Error in generation process:', error);
    process.exit(1);
  }
})();