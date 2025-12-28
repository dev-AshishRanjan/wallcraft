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
    const dist = (r - color[0]) ** 2 + (g - color[1]) ** 2 + (b - color[2]) ** 2;
    if (dist < minDist) {
      minDist = dist;
      nearest = color;
    }
  }
  return nearest;
}

/**
 * Processes an image file with a STACK of palettes sequentially.
 */
export async function processImageStack(
  imageFile: File,
  themeStack: string[][] // Array of Palettes (each palette is array of hex strings)
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(imageFile);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas not supported");

      // Limit to 4K
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

      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Pre-calculate ALL palettes in the stack
      const rgbPalettes = themeStack.map(palette => palette.map(hexToRgb));

      // Pixel Loop
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue; // Skip alpha

        let [r, g, b] = [data[i], data[i + 1], data[i + 2]];

        // PIPELINE: Run pixel through every theme layer in order
        for (const palette of rgbPalettes) {
          [r, g, b] = getNearestColor(r, g, b, palette);
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) resolve(URL.createObjectURL(blob));
        else reject("Processing failed");
      }, "image/png");

      URL.revokeObjectURL(img.src);
    };

    img.onerror = reject;
  });
}