import fs from 'fs';
import path from 'path';

export interface Theme {
  name: string;
  colors: string[]; // Hex strings from JSON
  rgbPalette?: number[][]; // Converted RGB arrays for processing
}

// Helper: Convert Hex (#282a36) to RGB Array [40, 42, 54]
export function hexToRgb(hex: string): number[] {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

// Helper: Load all JSON themes from the directory
export function loadThemes(): Theme[] {
  const themeDir = path.join(__dirname, '../themes');
  const files = fs.readdirSync(themeDir).filter(file => file.endsWith('.json'));

  const themes: Theme[] = [];

  files.forEach(file => {
    const rawData = fs.readFileSync(path.join(themeDir, file), 'utf-8');
    const theme: Theme = JSON.parse(rawData);

    // Pre-calculate RGB values for performance (do it once, not per pixel)
    theme.rgbPalette = theme.colors.map(hex => hexToRgb(hex));
    themes.push(theme);
  });

  return themes;
}

// Helper: Ensure directory exists (Fixes your local error)
export function ensureDirectory(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function loadCategories(): string[] {
  const filePath = path.join(__dirname, '../categories.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function loadHistory(): string[] {
  const filePath = path.join(__dirname, '../history.json');
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function saveHistory(ids: string[]) {
  const filePath = path.join(__dirname, '../history.json');
  fs.writeFileSync(filePath, JSON.stringify(ids, null, 2));
}