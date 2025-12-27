import { Theme } from "@/lib/types";

// Helper: Convert Hex to RGB
function hexToRgb(hex: string): number[] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

// Math: Find nearest color in palette
function getNearestColor(r: number, g: number, b: number, palette: number[][]): number[] {
  let minDist = Infinity;
  let nearest = palette[0];

  for (const color of palette) {
    // Euclidean distance (no sqrt needed for comparison)
    const dist = (r - color[0]) ** 2 + (g - color[1]) ** 2 + (b - color[2]) ** 2;
    if (dist < minDist) {
      minDist = dist;
      nearest = color;
    }
  }
  return nearest;
}

/**
 * Processes an image file with the given theme palette
 */
export async function processImageClient(
  imageFile: File,
  themeColors: string[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(imageFile);

    img.onload = () => {
      // 1. Setup Canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas not supported");

      // Set dimensions (limit to 4K to prevent browser crash)
      const MAX_WIDTH = 3840;
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (width > MAX_WIDTH) {
        const ratio = MAX_WIDTH / width;
        width = MAX_WIDTH;
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // 2. Draw Original
      ctx.drawImage(img, 0, 0, width, height);

      // 3. Get Raw Pixels
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data; // The Uint8ClampedArray (R,G,B,A, R,G,B,A...)

      // 4. Pre-calculate RGB Palette
      const rgbPalette = themeColors.map(hexToRgb);

      // 5. Pixel Loop (Heavy CPU Task)
      for (let i = 0; i < data.length; i += 4) {
        // Skip transparent pixels
        if (data[i + 3] === 0) continue;

        const [r, g, b] = getNearestColor(data[i], data[i + 1], data[i + 2], rgbPalette);

        data[i] = r;     // Red
        data[i + 1] = g; // Green
        data[i + 2] = b; // Blue
        // data[i+3] is Alpha, leave it
      }

      // 6. Put Pixels Back
      ctx.putImageData(imageData, 0, 0);

      // 7. Export to Blob URL
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          reject("Processing failed");
        }
      }, "image/png");

      // Cleanup
      URL.revokeObjectURL(img.src);
    };

    img.onerror = reject;
  });
}