#!/usr/bin/env node
/**
 * generate-icons.mjs
 * Converts public/icon.svg → all required PNG icons + OG image.
 *
 * Usage: node scripts/generate-icons.mjs
 * Requires: sharp  (already in node_modules)
 */

import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");
const iconsDir = path.join(publicDir, "icons");

const iconSvg = readFileSync(path.join(publicDir, "icon.svg"));

// ---------------------------------------------------------------------------
// Standard icons (from colored icon.svg)
// ---------------------------------------------------------------------------
const icons = [
  { file: "icon-16.png",        size: 16 },
  { file: "icon-32.png",        size: 32 },
  { file: "icon-180.png",       size: 180 },
  { file: "icon-192.png",       size: 192 },
  { file: "icon-512.png",       size: 512 },
  { file: "icon-512-maskable.png", size: 512 },  // same content, maskable role in manifest
];

for (const { file, size } of icons) {
  await sharp(iconSvg)
    .resize(size, size)
    .png()
    .toFile(path.join(iconsDir, file));
  console.log(`  ✓ icons/${file}`);
}

// ---------------------------------------------------------------------------
// favicon.ico — 32×32 PNG saved as .ico (browsers accept PNG-inside-ICO)
// ---------------------------------------------------------------------------
await sharp(iconSvg)
  .resize(32, 32)
  .png()
  .toFile(path.join(publicDir, "favicon.ico"));
console.log("  ✓ favicon.ico");

// ---------------------------------------------------------------------------
// OG image — 1200×630, dark bg, strata band strip + wordmark
// ---------------------------------------------------------------------------

// Build a composite OG SVG (rendered by sharp to PNG)
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- Background -->
  <rect width="1200" height="630" fill="#0B1117"/>

  <!-- Subtle noise/grain overlay via a faint pattern -->
  <defs>
    <pattern id="grain" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="2" height="2" fill="rgba(255,255,255,0.015)"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#grain)"/>

  <!-- Strata band strip left -->
  <!-- Layer 1 — surface teal -->
  <rect x="0" y="0"   width="320" height="126" fill="#3A9096"/>
  <!-- Layer 2 — brand teal (wavy boundary approximated) -->
  <path d="M0 126 Q55 112 110 120 Q180 130 240 118 Q290 108 320 118 L320 252 L0 252 Z" fill="#1F5A5C"/>
  <!-- Layer 3 — ochre -->
  <path d="M0 252 Q60 238 120 246 Q190 256 250 242 Q295 232 320 242 L320 378 L0 378 Z" fill="#8C7448"/>
  <!-- Layer 4 — brown -->
  <path d="M0 378 Q50 364 108 372 Q175 382 235 368 Q285 358 320 368 L320 504 L0 504 Z" fill="#5C4030"/>
  <!-- Layer 5 — bedrock deep -->
  <path d="M0 504 Q55 490 115 498 Q180 508 245 494 Q290 484 320 494 L320 630 L0 630 Z" fill="#252E38"/>

  <!-- Gradient fade right edge of strip -->
  <defs>
    <linearGradient id="stripFade" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0.6" stop-color="#0B1117" stop-opacity="0"/>
      <stop offset="1.0" stop-color="#0B1117" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="320" height="630" fill="url(#stripFade)"/>

  <!-- Wordmark area (right of strip) -->
  <!-- Teal accent bar -->
  <rect x="370" y="220" width="4" height="96" fill="#3A9096" rx="2"/>

  <!-- "Substrata" heading -->
  <text x="394" y="272"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="72"
    font-weight="bold"
    letter-spacing="-1"
    fill="#F0F0EE">Substrata</text>

  <!-- Tagline -->
  <text x="396" y="308"
    font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="22"
    fill="#6B7280"
    letter-spacing="1">Explore the hidden layers of the world</text>

  <!-- Small pill tags -->
  <rect x="396" y="338" width="108" height="26" rx="13" fill="rgba(44,111,116,0.25)" stroke="rgba(44,111,116,0.5)" stroke-width="1"/>
  <text x="450" y="355" text-anchor="middle"
    font-family="-apple-system, BlinkMacSystemFont, sans-serif"
    font-size="12" fill="#89CDD1">Deep Time</text>

  <rect x="516" y="338" width="140" height="26" rx="13" fill="rgba(44,111,116,0.25)" stroke="rgba(44,111,116,0.5)" stroke-width="1"/>
  <text x="586" y="355" text-anchor="middle"
    font-family="-apple-system, BlinkMacSystemFont, sans-serif"
    font-size="12" fill="#89CDD1">Paleogeography</text>

  <rect x="668" y="338" width="116" height="26" rx="13" fill="rgba(44,111,116,0.25)" stroke="rgba(44,111,116,0.5)" stroke-width="1"/>
  <text x="726" y="355" text-anchor="middle"
    font-family="-apple-system, BlinkMacSystemFont, sans-serif"
    font-size="12" fill="#89CDD1">History Layers</text>
</svg>`;

await sharp(Buffer.from(ogSvg))
  .resize(1200, 630)
  .png()
  .toFile(path.join(publicDir, "og.png"));

console.log("  ✓ og.png");
console.log("\nAll icons generated successfully.");
