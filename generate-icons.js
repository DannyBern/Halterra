// Script pour générer toutes les icônes PWA à partir du logo SVG
// Run: node generate-icons.js

const fs = require('fs');
const path = require('path');

// Tailles d'icônes PWA nécessaires
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('🎨 Génération des icônes PWA pour Halterra...\n');

// Créer le dossier icons s'il n'existe pas
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Copier le logo SVG comme icône maskable
const logoPath = path.join(__dirname, 'public', 'logo.svg');
const logoContent = fs.readFileSync(logoPath, 'utf8');

console.log('✅ Logo SVG trouvé');
console.log(`📁 Dossier icons créé: ${iconsDir}\n`);

// Pour chaque taille, créer une version PNG (nécessite une conversion manuelle ou un outil)
console.log('📋 Tailles d'icônes nécessaires:');
sizes.forEach(size => {
  console.log(`   - icon-${size}x${size}.png`);
});

console.log('\n💡 Instructions:');
console.log('1. Ouvrez logo.svg dans un éditeur (Inkscape, Figma, etc.)');
console.log('2. Exportez en PNG aux tailles suivantes:');
sizes.forEach(size => {
  console.log(`   - ${size}x${size}px → public/icons/icon-${size}x${size}.png`);
});
console.log('\n✨ Ou utilisez un convertisseur en ligne comme:');
console.log('   - https://realfavicongenerator.net/');
console.log('   - https://www.favicon-generator.org/');

// Créer une version maskable (avec padding) du logo
const maskableSVG = logoContent.replace(
  '<svg',
  '<svg style="background: linear-gradient(135deg, #0A0E1A 0%, #1C2333 100%); padding: 10%"'
);

fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), maskableSVG);
console.log('\n✅ icon-maskable.svg créé (pour Android adaptive icons)');

// Générer le manifest.json
const manifest = {
  name: 'Halterra',
  short_name: 'Halterra',
  description: 'Votre moment de pause quotidien - Méditations personnalisées',
  start_url: '/Halterra/',
  display: 'standalone',
  background_color: '#0A0E1A',
  theme_color: '#667eea',
  orientation: 'portrait',
  icons: [
    ...sizes.map(size => ({
      src: `/Halterra/icons/icon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
      purpose: 'any'
    })),
    {
      src: '/Halterra/icons/icon-maskable.svg',
      sizes: '512x512',
      type: 'image/svg+xml',
      purpose: 'maskable'
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, 'public', 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('✅ manifest.json créé\n');

console.log('🎉 Configuration PWA prête!');
console.log('\n📱 Prochaines étapes:');
console.log('1. Convertir logo.svg en PNG aux tailles requises');
console.log('2. Placer les fichiers dans public/icons/');
console.log('3. Build et deploy l\'app');
console.log('4. Installer la PWA sur votre Pixel 8 Pro!');
