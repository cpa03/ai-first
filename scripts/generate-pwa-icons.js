const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Get project root (parent of scripts folder)
const projectRoot = path.join(__dirname, '..');
const svgPath = path.join(projectRoot, 'public', 'favicon.svg');
const publicDir = path.join(projectRoot, 'public');

// Read SVG
const svg = fs.readFileSync(svgPath);

// Generate icons
async function generateIcons() {
  // 192x192 icon
  await sharp(svg)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  console.log('Created icon-192.png');

  // 512x512 icon
  await sharp(svg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  console.log('Created icon-512.png');

  // Create a screenshot (placeholder)
  await sharp(svg)
    .resize(1280, 720)
    .png()
    .toFile(path.join(publicDir, 'screenshot.png'));

  console.log('Created screenshot.png');
}

generateIcons().catch(console.error);
