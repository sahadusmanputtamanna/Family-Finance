import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Helper to construct vector SVG template matching the green wallet logo with ₹ symbol
const createVectorSvg = (size, isMaskable = false) => {
  const rx = isMaskable ? 0 : Math.floor(size * 0.22);
  const scale = (size / 512).toFixed(4);

  // For maskable icons, scale down slightly (80% safe area zone) per PWA specs
  const groupScale = isMaskable ? (0.76 * scale).toFixed(4) : (0.95 * scale).toFixed(4);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bgGrad_${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4CAF50"/>
      <stop offset="100%" stop-color="#2E7D32"/>
    </linearGradient>
    <linearGradient id="walletGrad_${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#388E3C"/>
      <stop offset="100%" stop-color="#1B5E20"/>
    </linearGradient>
    <filter id="shadow_${size}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${(8 * scale).toFixed(1)}" stdDeviation="${(10 * scale).toFixed(1)}" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <rect width="${size}" height="${size}" rx="${rx}" fill="url(#bgGrad_${size})"/>

  <g transform="translate(${size/2}, ${size/2}) scale(${groupScale})">
    <rect x="-130" y="-85" width="260" height="180" rx="36" fill="url(#walletGrad_${size})" filter="url(#shadow_${size})"/>
    <path d="M-130,-85 L130,-85 C125,-120 70,-125 -110,-125 Z" fill="#66BB6A" opacity="0.95"/>
    <circle cx="75" cy="5" r="18" fill="#E8F5E9"/>
    <circle cx="75" cy="5" r="9" fill="#1B5E20"/>
    <text x="-25" y="25" text-anchor="middle" dominant-baseline="middle" fill="#FFFFFF" font-family="'Segoe UI', Roboto, Helvetica, sans-serif" font-weight="900" font-size="105px">₹</text>
  </g>
</svg>`;
};

async function buildPngIcons() {
  console.log('Generating true binary PNG icons using Sharp...');

  // 1. Standard PWA PNG Icons
  for (const size of sizes) {
    const svgBuffer = Buffer.from(createVectorSvg(size, false));
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(outputPath);

    console.log(`✓ Generated ${outputPath} (${size}x${size} PNG)`);
  }

  // 2. Maskable Icon (512x512 PNG with 20% safe zone padding)
  const maskableSvg = Buffer.from(createVectorSvg(512, true));
  const maskablePngPath = path.join(iconsDir, 'maskable-icon-512x512.png');
  await sharp(maskableSvg)
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(maskablePngPath);
  console.log(`✓ Generated ${maskablePngPath} (512x512 Maskable PNG)`);

  // 3. Apple Touch Icon (192x192 PNG)
  const appleSvg = Buffer.from(createVectorSvg(192, false));
  const applePngPath = path.join(iconsDir, 'apple-touch-icon.png');
  await sharp(appleSvg)
    .resize(192, 192)
    .png({ compressionLevel: 9 })
    .toFile(applePngPath);
  console.log(`✓ Generated ${applePngPath} (Apple Touch PNG)`);

  // 4. Favicon (64x64 PNG & ICO)
  const favSvg = Buffer.from(createVectorSvg(64, false));
  const favPngPath = path.join(__dirname, 'public', 'favicon.png');
  const favIcoPath = path.join(__dirname, 'public', 'favicon.ico');

  await sharp(favSvg).resize(64, 64).png().toFile(favPngPath);
  await sharp(favSvg).resize(64, 64).png().toFile(favIcoPath);
  console.log('✓ Generated favicons in /public');

  // 5. Clean up any leftover .svg files in /public/icons/
  const existingFiles = fs.readdirSync(iconsDir);
  for (const file of existingFiles) {
    if (file.endsWith('.svg')) {
      fs.unlinkSync(path.join(iconsDir, file));
      console.log(`🗑 Removed legacy SVG: ${file}`);
    }
  }

  const publicSvgFavicon = path.join(__dirname, 'public', 'favicon.svg');
  if (fs.existsSync(publicSvgFavicon)) {
    fs.unlinkSync(publicSvgFavicon);
    console.log('🗑 Removed public/favicon.svg');
  }

  console.log('\nAll binary PNG icons built successfully!');
}

buildPngIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
