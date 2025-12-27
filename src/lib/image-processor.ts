// src/lib/image-processor.ts

export const RESOLUTIONS = {
  "16:9": { w: 16, h: 9 },
  "4:3": { w: 4, h: 3 },
  "1:1": { w: 1, h: 1 },
  "Original": null
};

export const QUALITIES = {
  "4K": { width: 3840, label: "4K (UHD)" },
  "2K": { width: 2560, label: "2K (QHD)" },
  "1080p": { width: 1920, label: "1080p (FHD)" },
  "720p": { width: 1280, label: "720p (HD)" },
};

/**
 * Resizes and crops an image client-side returning a Blob url.
 * Uses a CORS proxy to bypass GitHub's 302 Redirect security restrictions.
 */
export async function processImage(
  imageUrl: string,
  qualityKey: keyof typeof QUALITIES,
  aspectRatioKey: keyof typeof RESOLUTIONS
): Promise<string> {

  // 1. Construct Proxy URL
  // We use wsrv.nl to fetch the image on our behalf and add CORS headers.
  // 'url' param must be the encoded GitHub URL.
  // 'n=-1' ensures we get the original image without compression artifacts.
  const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&n=-1`;

  return new Promise((resolve, reject) => {
    const img = new Image();

    // 2. Setup CORS
    // Since we are hitting the proxy, this is now guaranteed to work.
    img.crossOrigin = "anonymous";
    img.src = proxyUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No canvas context");

      // 3. Determine Target Dimensions
      let targetWidth = QUALITIES[qualityKey].width;

      const ratio = RESOLUTIONS[aspectRatioKey];
      let targetHeight = 0;

      if (ratio) {
        targetHeight = Math.round((targetWidth / ratio.w) * ratio.h);
      } else {
        const originalRatio = img.naturalWidth / img.naturalHeight;
        targetHeight = Math.round(targetWidth / originalRatio);
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // 4. Draw & Crop (Center Crop Logic)
      const sourceRatio = img.naturalWidth / img.naturalHeight;
      const targetRatio = targetWidth / targetHeight;

      let sx = 0, sy = 0, sWidth = img.naturalWidth, sHeight = img.naturalHeight;

      if (sourceRatio > targetRatio) {
        // Image is wider than target: Crop the sides
        sWidth = sHeight * targetRatio;
        sx = (img.naturalWidth - sWidth) / 2;
      } else {
        // Image is taller than target: Crop the top/bottom
        sHeight = sWidth / targetRatio;
        sy = (img.naturalHeight - sHeight) / 2;
      }

      // High Quality Scaling Settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

      // 5. Export
      canvas.toBlob((blob) => {
        if (blob) resolve(URL.createObjectURL(blob));
        else reject("Blob creation failed");
      }, "image/png");
    };

    img.onerror = (e) => {
      console.error("Proxy Load Error", e);
      reject("Failed to load image via proxy.");
    };
  });
}