const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];
const inputSvg = path.join(__dirname, 'public', 'icon.svg');
const outputDir = path.join(__dirname, 'public');

// Create icons directory if it doesn't exist
if (!fs.existsSync(path.join(outputDir))) {
  fs.mkdirSync(path.join(outputDir), { recursive: true });
}

// Generate PNG files in different sizes
async function generateIcons() {
  try {
    const svgBuffer = fs.readFileSync(inputSvg);

    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon-${size}.png`));

      console.log(`Generated icon-${size}.png`);
    }

    // Also generate the main icon.png (128px version)
    await sharp(svgBuffer)
      .resize(128, 128)
      .png()
      .toFile(path.join(outputDir, 'icon.png'));

    console.log('Generated main icon.png');
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    console.log('Make sure you have sharp installed: npm install --save-dev sharp');
  }
}

generateIcons();
