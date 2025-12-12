const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const iconDir = path.join(__dirname, 'icons');
const svgPath = path.join(iconDir, 'icon.svg');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);
  
  for (const size of sizes) {
    const outputPath = path.join(iconDir, `icon-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Created: icon-${size}x${size}.png`);
  }
  
  // Apple touch icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconDir, 'apple-touch-icon.png'));
  console.log('Created: apple-touch-icon.png');
  
  // Favicons
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(iconDir, 'favicon-32x32.png'));
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(iconDir, 'favicon-16x16.png'));
  console.log('Created: favicons');
  
  // favicon.ico (32x32 png renamed)
  fs.copyFileSync(
    path.join(iconDir, 'favicon-32x32.png'),
    path.join(__dirname, 'favicon.ico')
  );
  console.log('Created: favicon.ico');
  
  console.log('\n✅ All icons generated!');
}

generateIcons().catch(console.error);
