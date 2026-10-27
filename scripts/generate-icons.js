import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// 1. Standard App Icon SVG (with rounded corners/border, dark emerald background, gold AG badge, NOTEPAD badge)
const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A3326"/>
      <stop offset="40%" stop-color="#14241D"/>
      <stop offset="100%" stop-color="#0E1B15"/>
    </linearGradient>
    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE699"/>
      <stop offset="25%" stop-color="#F2CB60"/>
      <stop offset="65%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#A68019"/>
    </linearGradient>
    <linearGradient id="gold-ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF5D1"/>
      <stop offset="100%" stop-color="#8C6A14"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
    <filter id="badge-glow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#D4AF37" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="112" fill="url(#bg-grad)"/>
  
  <!-- Subtle Outer Golden Accent Border -->
  <rect x="8" y="8" width="496" height="496" rx="104" fill="none" stroke="url(#gold-ring)" stroke-width="4" stroke-opacity="0.4"/>
  <rect x="18" y="18" width="476" height="476" rx="96" fill="none" stroke="#2D4A3D" stroke-width="2" stroke-opacity="0.5"/>

  <!-- Golden Center Badge -->
  <g filter="url(#badge-glow)">
    <!-- Base Gold Circle -->
    <circle cx="256" cy="216" r="140" fill="url(#gold-grad)" filter="url(#shadow)"/>
    <!-- Outer Rim Highlight -->
    <circle cx="256" cy="216" r="140" fill="none" stroke="url(#gold-ring)" stroke-width="5" stroke-opacity="0.8"/>
    <!-- Inner Delicate Ring -->
    <circle cx="256" cy="216" r="130" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-opacity="0.45"/>
    <circle cx="256" cy="216" r="122" fill="none" stroke="#8C6A14" stroke-width="1.5" stroke-opacity="0.4"/>
  </g>

  <!-- Bold AG Monogram -->
  <!-- Subtle text shadow for crisp contrast -->
  <text x="256" y="267" 
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
        font-weight="900" 
        font-size="134" 
        fill="#14241D" 
        text-anchor="middle" 
        letter-spacing="-2">AG</text>

  <!-- NOTEPAD Label Pill -->
  <g filter="url(#shadow)">
    <rect x="146" y="380" width="220" height="46" rx="23" fill="#12211A" stroke="url(#gold-ring)" stroke-width="2.5"/>
    <text x="256" y="410" 
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
          font-weight="800" 
          font-size="19" 
          fill="#D4AF37" 
          text-anchor="middle" 
          letter-spacing="5">NOTEPAD</text>
  </g>
</svg>`;

// 2. Maskable Icon SVG (full-bleed background, everything inside 80% safe zone = radius 204px around (256, 256))
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="mask-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A3326"/>
      <stop offset="45%" stop-color="#14241D"/>
      <stop offset="100%" stop-color="#0E1B15"/>
    </linearGradient>
    <linearGradient id="mask-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE699"/>
      <stop offset="25%" stop-color="#F2CB60"/>
      <stop offset="65%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#A68019"/>
    </linearGradient>
    <linearGradient id="mask-gold-ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF5D1"/>
      <stop offset="100%" stop-color="#8C6A14"/>
    </linearGradient>
    <filter id="mask-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Full-bleed background covering 100% of the canvas -->
  <rect width="512" height="512" fill="url(#mask-bg)"/>

  <!-- Golden Center Badge within 80% safe zone -->
  <g filter="url(#mask-shadow)">
    <!-- Base Gold Circle -->
    <circle cx="256" cy="216" r="136" fill="url(#mask-gold)"/>
    <circle cx="256" cy="216" r="136" fill="none" stroke="url(#mask-gold-ring)" stroke-width="4.5" stroke-opacity="0.8"/>
    <circle cx="256" cy="216" r="126" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.45"/>
    <circle cx="256" cy="216" r="118" fill="none" stroke="#8C6A14" stroke-width="1.5" stroke-opacity="0.4"/>
  </g>

  <!-- Bold AG Monogram -->
  <text x="256" y="266" 
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
        font-weight="900" 
        font-size="130" 
        fill="#14241D" 
        text-anchor="middle" 
        letter-spacing="-2">AG</text>

  <!-- NOTEPAD Label Pill -->
  <g filter="url(#mask-shadow)">
    <rect x="151" y="378" width="210" height="44" rx="22" fill="#12211A" stroke="url(#mask-gold-ring)" stroke-width="2.5"/>
    <text x="256" y="407" 
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
          font-weight="800" 
          font-size="18" 
          fill="#D4AF37" 
          text-anchor="middle" 
          letter-spacing="5">NOTEPAD</text>
  </g>
</svg>`;

async function main() {
  const publicDir = path.resolve('public');

  // Save SVG files
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSvg);
  fs.writeFileSync(path.join(publicDir, 'icon-maskable.svg'), maskableSvg);
  console.log('Saved public/icon.svg and public/icon-maskable.svg');

  // Generate pwa-192x192.png
  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated public/pwa-192x192.png');

  // Generate pwa-512x512.png
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated public/pwa-512x512.png');

  // Generate pwa-maskable-512x512.png
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated public/pwa-maskable-512x512.png');

  // Generate apple-touch-icon.png (180x180)
  await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated public/apple-touch-icon.png');

  // Generate favicon.ico (64x64 PNG format / ICO)
  await sharp(Buffer.from(standardSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Generated public/favicon.ico');

  console.log('All icons generated successfully!');
}

main().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
