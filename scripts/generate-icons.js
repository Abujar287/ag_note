import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SOURCE_LOGO = path.resolve('public/assets/aistudio/image_c4fcbe6a.png');
const BRAND_BG = { r: 242, g: 206, b: 93, alpha: 1 };

async function createCircularMaskedLogo(size) {
  const circleMask = Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="#ffffff"/>
    </svg>`
  );

  return sharp(SOURCE_LOGO)
    .extract({ left: 28, top: 27, width: 964, height: 964 })
    .resize(size, size, { fit: 'cover' })
    .ensureAlpha()
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function createFullBleedSafeIcon(size, innerScale = 0.8) {
  const innerSize = Math.round(size * innerScale);
  const circularBuffer = await createCircularMaskedLogo(innerSize);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_BG,
    },
  })
    .composite([{ input: circularBuffer, gravity: 'center' }])
    .png()
    .toBuffer();
}

async function main() {
  const publicDir = path.resolve('public');
  const androidResDir = path.resolve('android/app/src/main/res');

  // Remove old SVG logos
  for (const oldFile of ['icon.svg', 'icon-maskable.svg']) {
    const p = path.join(publicDir, oldFile);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }

  // Web & PWA icons
  fs.writeFileSync(path.join(publicDir, 'app-logo.png'), await createCircularMaskedLogo(192));
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), await createCircularMaskedLogo(192));
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), await createCircularMaskedLogo(512));
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), await createFullBleedSafeIcon(512, 0.8));
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), await createFullBleedSafeIcon(180, 0.86));
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), await createCircularMaskedLogo(64));

  // Android mipmap icons
  const densities = [
    { name: 'mipmap-mdpi', size: 48 },
    { name: 'mipmap-hdpi', size: 72 },
    { name: 'mipmap-xhdpi', size: 96 },
    { name: 'mipmap-xxhdpi', size: 144 },
    { name: 'mipmap-xxxhdpi', size: 192 },
  ];

  for (const d of densities) {
    const dir = path.join(androidResDir, d.name);
    fs.mkdirSync(dir, { recursive: true });
    const iconBuf = await createCircularMaskedLogo(d.size);
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), iconBuf);
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), iconBuf);
  }

  // Android adaptive icon foreground (432x432 with 66% safe zone inner logo)
  const drawableDir = path.join(androidResDir, 'drawable');
  fs.mkdirSync(drawableDir, { recursive: true });
  const oldForegroundXml = path.join(drawableDir, 'ic_launcher_foreground.xml');
  if (fs.existsSync(oldForegroundXml)) fs.unlinkSync(oldForegroundXml);

  const adaptiveInner = await createCircularMaskedLogo(288);
  const adaptiveFg = await sharp({
    create: {
      width: 432,
      height: 432,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: adaptiveInner, gravity: 'center' }])
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(drawableDir, 'ic_launcher_foreground.png'), adaptiveFg);

  console.log('All web, PWA, and Android launcher icons updated successfully!');
}

main().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
