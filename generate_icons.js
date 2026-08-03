import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const generateSvgLogo = (size, isMaskable = false) => {
  const rx = isMaskable ? 0 : Math.floor(size * 0.22);
  const scale = (size / 512).toFixed(4);
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

  <g transform="translate(${size/2}, ${size/2}) scale(${(0.95 * scale).toFixed(4)})">
    <rect x="-130" y="-85" width="260" height="180" rx="36" fill="url(#walletGrad_${size})" filter="url(#shadow_${size})"/>
    <path d="M-130,-85 L130,-85 C125,-120 70,-125 -110,-125 Z" fill="#66BB6A" opacity="0.95"/>
    <circle cx="75" cy="5" r="18" fill="#E8F5E9"/>
    <circle cx="75" cy="5" r="9" fill="#1B5E20"/>
    <text x="-25" y="25" text-anchor="middle" dominant-baseline="middle" fill="#FFFFFF" font-family="'Segoe UI', Roboto, Helvetica, sans-serif" font-weight="900" font-size="105px">₹</text>
  </g>
</svg>`;
};

sizes.forEach(size => {
  const svgContent = generateSvgLogo(size, false);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svgContent);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.png`), svgContent);
});

// Apple Touch Icon & Maskable Icon & Favicons
const icon512 = generateSvgLogo(512, false);
const maskable512 = generateSvgLogo(512, true);

fs.writeFileSync(path.join(iconsDir, `apple-touch-icon.png`), icon512);
fs.writeFileSync(path.join(iconsDir, `apple-touch-icon.svg`), icon512);
fs.writeFileSync(path.join(iconsDir, `maskable-icon-512x512.svg`), maskable512);
fs.writeFileSync(path.join(iconsDir, `maskable-icon-512x512.png`), maskable512);
fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), generateSvgLogo(64, false));
fs.writeFileSync(path.join(__dirname, 'public', 'favicon.ico'), generateSvgLogo(64, false));

console.log('All green wallet logo PWA icons generated successfully!');
