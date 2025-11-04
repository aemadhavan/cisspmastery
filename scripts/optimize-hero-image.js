const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeHeroImage() {
  const inputPath = path.join(__dirname, '../public/images/raju.jpg');
  const outputPathWebP = path.join(__dirname, '../public/images/raju.webp');
  const outputPathJpg = path.join(__dirname, '../public/images/raju-optimized.jpg');

  console.log('Optimizing hero image...');

  // Get original file size
  const originalSize = fs.statSync(inputPath).size;
  console.log(`Original size: ${(originalSize / 1024).toFixed(2)} KB`);

  // Convert to WebP (best compression)
  await sharp(inputPath)
    .resize(1200, 1200, { // Reasonable size for hero image
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 85 })
    .toFile(outputPathWebP);

  const webpSize = fs.statSync(outputPathWebP).size;
  console.log(`WebP size: ${(webpSize / 1024).toFixed(2)} KB (${((webpSize/originalSize)*100).toFixed(1)}% of original)`);

  // Also create optimized JPG fallback
  await sharp(inputPath)
    .resize(1200, 1200, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(outputPathJpg);

  const jpgSize = fs.statSync(outputPathJpg).size;
  console.log(`Optimized JPG size: ${(jpgSize / 1024).toFixed(2)} KB (${((jpgSize/originalSize)*100).toFixed(1)}% of original)`);

  console.log('\nOptimization complete! ✓');
  console.log('Files created:');
  console.log('- public/images/raju.webp');
  console.log('- public/images/raju-optimized.jpg');
}

optimizeHeroImage().catch(console.error);
