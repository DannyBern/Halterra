/**
 * Script d'optimisation des images pour Halterra
 *
 * Usage: npm run optimize-images
 *
 * Ce script:
 * 1. Compresse les PNG surdimensionnés (icon-*.png)
 * 2. Convertit les JPEG en WebP (avec qualité préservée)
 * 3. Génère un rapport des économies réalisées
 */

import sharp from 'sharp';
import { readdir, stat, mkdir, readFile, writeFile } from 'fs/promises';
import { join, extname, basename, resolve } from 'path';
import { existsSync } from 'fs';

// Utiliser des chemins absolus pour Windows
const PUBLIC_DIR = resolve('./public');
const BACKUP_DIR = resolve('./public/backup-originals');

// Configuration de qualité
const CONFIG = {
  png: {
    compressionLevel: 9,
    quality: 80
  },
  webp: {
    quality: 85,  // Qualité haute pour préserver les détails
    effort: 6     // Compression effort (0-6)
  },
  jpeg: {
    quality: 85,
    mozjpeg: true
  }
};

// Fichiers PNG à compresser (icônes surdimensionnées)
const OVERSIZED_PNGS = [
  'icon-location.png',
  'icon-date.png',
  'icon-time.png'
];

// Extensions à convertir en WebP
const JPEG_EXTENSIONS = ['.jpeg', '.jpg'];

async function getFileSize(filePath) {
  const stats = await stat(filePath);
  return stats.size;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function compressPNG(filePath) {
  const originalSize = await getFileSize(filePath);
  const fileName = basename(filePath);

  console.log(`\n📦 Compressing PNG: ${fileName}`);
  console.log(`   Original: ${formatSize(originalSize)}`);

  try {
    // Lire l'image et obtenir ses dimensions
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Redimensionner si trop grande (max 512px pour les icônes)
    let resized = image;
    if (metadata.width > 512 || metadata.height > 512) {
      resized = image.resize(512, 512, {
        fit: 'inside',
        withoutEnlargement: true
      });
      console.log(`   Resized from ${metadata.width}x${metadata.height} to max 512px`);
    }

    // Compresser
    const buffer = await resized
      .png({
        compressionLevel: CONFIG.png.compressionLevel,
        quality: CONFIG.png.quality
      })
      .toBuffer();

    // Sauvegarder
    await sharp(buffer).toFile(filePath);

    const newSize = await getFileSize(filePath);
    const savings = originalSize - newSize;
    const percent = ((savings / originalSize) * 100).toFixed(1);

    console.log(`   Compressed: ${formatSize(newSize)}`);
    console.log(`   💰 Saved: ${formatSize(savings)} (${percent}%)`);

    return { original: originalSize, compressed: newSize, savings };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { original: originalSize, compressed: originalSize, savings: 0 };
  }
}

async function convertToWebP(filePath) {
  const originalSize = await getFileSize(filePath);
  const fileName = basename(filePath);
  const webpPath = filePath.replace(/\.(jpeg|jpg)$/i, '.webp');

  console.log(`\n🖼️  Converting to WebP: ${fileName}`);
  console.log(`   Original JPEG: ${formatSize(originalSize)}`);

  try {
    // Lire le fichier en buffer pour éviter les problèmes de chemin Windows
    const inputBuffer = await readFile(filePath);

    // Convertir en WebP
    const webpBuffer = await sharp(inputBuffer)
      .webp({
        quality: CONFIG.webp.quality,
        effort: CONFIG.webp.effort
      })
      .toBuffer();

    // Écrire le fichier WebP
    await writeFile(webpPath, webpBuffer);

    const webpSize = webpBuffer.length;
    const savings = originalSize - webpSize;
    const percent = ((savings / originalSize) * 100).toFixed(1);

    console.log(`   WebP: ${formatSize(webpSize)}`);
    console.log(`   💰 Saved: ${formatSize(savings)} (${percent}%)`);

    // Aussi optimiser le JPEG original
    const optimizedBuffer = await sharp(inputBuffer)
      .jpeg({
        quality: CONFIG.jpeg.quality,
        mozjpeg: CONFIG.jpeg.mozjpeg
      })
      .toBuffer();

    // Écrire le JPEG optimisé
    await writeFile(filePath, optimizedBuffer);
    const optimizedJpegSize = optimizedBuffer.length;

    if (optimizedJpegSize < originalSize) {
      console.log(`   Optimized JPEG: ${formatSize(optimizedJpegSize)}`);
    }

    return {
      original: originalSize,
      webp: webpSize,
      optimizedJpeg: optimizedJpegSize,
      savings: savings + (originalSize - optimizedJpegSize)
    };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { original: originalSize, webp: 0, savings: 0 };
  }
}

async function main() {
  console.log('🚀 Halterra Image Optimization Script\n');
  console.log('='.repeat(50));

  let totalOriginal = 0;
  let totalSavings = 0;

  // 1. Compresser les PNG surdimensionnés
  console.log('\n📦 PHASE 1: Compressing oversized PNGs...');
  console.log('-'.repeat(50));

  for (const pngFile of OVERSIZED_PNGS) {
    const filePath = join(PUBLIC_DIR, pngFile);
    if (existsSync(filePath)) {
      const result = await compressPNG(filePath);
      totalOriginal += result.original;
      totalSavings += result.savings;
    } else {
      console.log(`   ⚠️  File not found: ${pngFile}`);
    }
  }

  // 2. Convertir les JPEG en WebP
  console.log('\n\n🖼️  PHASE 2: Converting JPEGs to WebP...');
  console.log('-'.repeat(50));

  const files = await readdir(PUBLIC_DIR);
  const jpegFiles = files.filter(f =>
    JPEG_EXTENSIONS.includes(extname(f).toLowerCase())
  );

  for (const jpegFile of jpegFiles) {
    const filePath = join(PUBLIC_DIR, jpegFile);
    const result = await convertToWebP(filePath);
    totalOriginal += result.original;
    totalSavings += result.savings;
  }

  // Rapport final
  console.log('\n\n' + '='.repeat(50));
  console.log('📊 OPTIMIZATION REPORT');
  console.log('='.repeat(50));
  console.log(`   Total original size: ${formatSize(totalOriginal)}`);
  console.log(`   Total savings: ${formatSize(totalSavings)}`);
  console.log(`   Reduction: ${((totalSavings / totalOriginal) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  console.log('\n✅ Optimization complete!');
  console.log('\n⚠️  Note: You may need to update image imports in your code');
  console.log('   to use .webp instead of .jpeg for optimal performance.\n');
}

main().catch(console.error);
