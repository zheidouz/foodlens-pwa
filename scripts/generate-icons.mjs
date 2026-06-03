import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { writeFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "..", "public", "icons");

// Generate a simple but crisp emerald-green app icon with a white "scan" symbol
const SIZE = 512;
const HALF = SIZE / 2;

// Create an SVG that renders the FoodLens icon
const svgIcon = `
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <!-- Background circle -->
  <circle cx="${HALF}" cy="${HALF}" r="${HALF}" fill="url(#bg)"/>
  <!-- Camera/lens icon -->
  <g transform="translate(${HALF}, ${HALF})" fill="none" stroke="white" stroke-width="20" stroke-linecap="round" stroke-linejoin="round">
    <!-- Camera body -->
    <rect x="-90" y="-60" width="180" height="140" rx="20" stroke-width="20"/>
    <!-- Lens -->
    <circle cx="0" cy="10" r="40" stroke-width="16"/>
    <!-- Flash -->
    <circle cx="55" cy="-35" r="8" fill="white" stroke="none"/>
    <!-- Scan lines -->
    <line x1="-55" y1="45" x2="55" y2="45" stroke-width="6" opacity="0.7"/>
    <line x1="-45" y1="65" x2="45" y2="65" stroke-width="4" opacity="0.5"/>
  </g>
</svg>`;

async function main() {
  // Generate 512x512 icon from SVG
  await sharp(Buffer.from(svgIcon))
    .resize(512, 512)
    .png()
    .toFile(resolve(OUT, "icon-512.png"));

  // Generate 192x192 icon
  await sharp(Buffer.from(svgIcon))
    .resize(192, 192)
    .png()
    .toFile(resolve(OUT, "icon-192.png"));

  // Generate 512x512 maskable icon (full-bleed design)
  const maskableSvg = `
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <!-- Full background -->
  <rect width="${SIZE}" height="${SIZE}" rx="80" fill="url(#bg)"/>
  <!-- Camera/lens icon centered in safe zone (80% inner area) -->
  <g transform="translate(${HALF}, ${HALF})" fill="none" stroke="white" stroke-width="32" stroke-linecap="round" stroke-linejoin="round">
    <rect x="-110" y="-80" width="220" height="180" rx="28" stroke-width="28"/>
    <circle cx="0" cy="10" r="50" stroke-width="22"/>
    <circle cx="70" cy="-45" r="12" fill="white" stroke="none"/>
    <line x1="-65" y1="60" x2="65" y2="60" stroke-width="8" opacity="0.7"/>
    <line x1="-55" y1="85" x2="55" y2="85" stroke-width="6" opacity="0.5"/>
  </g>
</svg>`;

  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(resolve(OUT, "icon-512-maskable.png"));

  console.log("✅ Icons generated successfully!");
  console.log(`  ${resolve(OUT, "icon-192.png")}`);
  console.log(`  ${resolve(OUT, "icon-512.png")}`);
  console.log(`  ${resolve(OUT, "icon-512-maskable.png")}`);

  // Show file sizes
  for (const name of ["icon-192.png", "icon-512.png", "icon-512-maskable.png"]) {
    const { size } = await import("fs").then(fs => fs.promises.stat(resolve(OUT, name)));
    console.log(`  ${name}: ${(size / 1024).toFixed(1)} KB`);
  }
}

main().catch(console.error);
