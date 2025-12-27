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
 * Resizes and crops an image client-side returning a Blob url
 */
export async function processImage(
  imageUrl: string,
  qualityKey: keyof typeof QUALITIES,
  aspectRatioKey: keyof typeof RESOLUTIONS
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No canvas context");

      // 1. Determine Target Dimensions
      let targetWidth = QUALITIES[qualityKey].width;
      // If original is smaller than target, don't upscale (optional, currently we force scale)

      // Calculate height based on aspect ratio
      const ratio = RESOLUTIONS[aspectRatioKey];
      let targetHeight = 0;

      if (ratio) {
        targetHeight = Math.round((targetWidth / ratio.w) * ratio.h);
      } else {
        // Original Aspect Ratio
        const originalRatio = img.naturalWidth / img.naturalHeight;
        targetHeight = Math.round(targetWidth / originalRatio);
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // 2. Draw & Crop (Center Crop)
      // We need to figure out source rectangle (sx, sy, sWidth, sHeight)
      // to cover the target aspect ratio
      const sourceRatio = img.naturalWidth / img.naturalHeight;
      const targetRatio = targetWidth / targetHeight;

      let sx = 0, sy = 0, sWidth = img.naturalWidth, sHeight = img.naturalHeight;

      if (sourceRatio > targetRatio) {
        // Source is wider than target: Crop width
        sWidth = sHeight * targetRatio;
        sx = (img.naturalWidth - sWidth) / 2;
      } else {
        // Source is taller than target: Crop height
        sHeight = sWidth / targetRatio;
        sy = (img.naturalHeight - sHeight) / 2;
      }

      // High quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

      // 3. Export
      canvas.toBlob((blob) => {
        if (blob) resolve(URL.createObjectURL(blob));
        else reject("Blob creation failed");
      }, "image/png");
    };

    img.onerror = reject;
  });
}