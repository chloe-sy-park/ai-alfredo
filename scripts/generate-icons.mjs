/**
 * Alfredo Icon Generator
 *
 * 마스터 이미지에서 모든 필요한 아이콘 사이즈 생성
 */

import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// 마스터 이미지 경로
const APP_ICON_MASTER = join(rootDir, 'public/assets/alfredo/app-icon/alfredo-app-icon-1024.png');
const AVATAR_MASTER = join(rootDir, 'public/assets/alfredo/avatar/alfredo-avatar-1024.png');

// PWA 아이콘 사이즈
const PWA_SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];

// iOS 앱 아이콘 사이즈
const IOS_ICONS = [
  { name: 'AppIcon-20.png', size: 20 },
  { name: 'AppIcon-20@2x.png', size: 40 },
  { name: 'AppIcon-20@3x.png', size: 60 },
  { name: 'AppIcon-29.png', size: 29 },
  { name: 'AppIcon-29@2x.png', size: 58 },
  { name: 'AppIcon-29@3x.png', size: 87 },
  { name: 'AppIcon-40.png', size: 40 },
  { name: 'AppIcon-40@2x.png', size: 80 },
  { name: 'AppIcon-40@3x.png', size: 120 },
  { name: 'AppIcon-60@2x.png', size: 120 },
  { name: 'AppIcon-60@3x.png', size: 180 },
  { name: 'AppIcon-76.png', size: 76 },
  { name: 'AppIcon-76@2x.png', size: 152 },
  { name: 'AppIcon-83.5@2x.png', size: 167 },
  { name: 'AppIcon-1024.png', size: 1024 },
];

// Android mipmap 사이즈
const ANDROID_MIPMAPS = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

async function generateIcon(input, output, size) {
  const dir = dirname(output);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  await sharp(input)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(output);

  console.log(`✓ Generated: ${output} (${size}x${size})`);
}

async function generateFavicon(input, output) {
  // Generate 32x32 PNG for favicon
  await sharp(input)
    .resize(32, 32)
    .png()
    .toFile(output.replace('.ico', '-32.png'));

  // For ICO, we'll use the 32x32 PNG as favicon
  await sharp(input)
    .resize(32, 32)
    .toFile(output.replace('.ico', '.png'));

  console.log(`✓ Generated favicon: ${output}`);
}

async function main() {
  console.log('🐧 Alfredo Icon Generator\n');

  // 1. PWA 아이콘 생성
  console.log('📱 Generating PWA icons...');
  const pwaDir = join(rootDir, 'public/icons');

  for (const size of PWA_SIZES) {
    await generateIcon(
      APP_ICON_MASTER,
      join(pwaDir, `icon-${size}x${size}.png`),
      size
    );
  }

  // Apple touch icon
  await generateIcon(APP_ICON_MASTER, join(pwaDir, 'apple-touch-icon.png'), 180);

  // Favicons
  await generateIcon(APP_ICON_MASTER, join(pwaDir, 'favicon-16x16.png'), 16);
  await generateIcon(APP_ICON_MASTER, join(pwaDir, 'favicon-32x32.png'), 32);

  // 2. iOS 앱 아이콘 생성
  console.log('\n🍎 Generating iOS app icons...');
  const iosDir = join(rootDir, 'mobile/ios/AppIcon.appiconset');

  for (const icon of IOS_ICONS) {
    await generateIcon(
      APP_ICON_MASTER,
      join(iosDir, icon.name),
      icon.size
    );
  }

  // 3. Android mipmap 아이콘 생성
  console.log('\n🤖 Generating Android mipmap icons...');
  const androidDir = join(rootDir, 'mobile/android/res');

  for (const mipmap of ANDROID_MIPMAPS) {
    const mipmapDir = join(androidDir, mipmap.folder);
    await generateIcon(
      APP_ICON_MASTER,
      join(mipmapDir, 'ic_launcher.png'),
      mipmap.size
    );
    await generateIcon(
      APP_ICON_MASTER,
      join(mipmapDir, 'ic_launcher_round.png'),
      mipmap.size
    );
  }

  // 4. Shortcut 아이콘 생성
  console.log('\n🔗 Generating shortcut icons...');
  await generateIcon(APP_ICON_MASTER, join(rootDir, 'public/chat-icon.png'), 96);
  await generateIcon(APP_ICON_MASTER, join(rootDir, 'public/focus-icon.png'), 96);

  console.log('\n✅ All icons generated successfully!');
}

main().catch(console.error);
