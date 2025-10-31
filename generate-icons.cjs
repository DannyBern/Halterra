const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Generation des icones PWA pour Halterra...\n');

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const logoPath = path.join(__dirname, 'public', 'logo.svg');
const logoContent = fs.readFileSync(logoPath, 'utf8');

console.log('Logo SVG trouve');
console.log('Dossier icons cree: ' + iconsDir + '\n');

console.log('Tailles d\'icones necessaires:');
sizes.forEach(size => {
  console.log('   - icon-' + size + 'x' + size + '.png');
});

const maskableSVG = logoContent.replace(
  '<svg',
  '<svg style="background: linear-gradient(135deg, #0A0E1A 0%, #1C2333 100%); padding: 10%"'
);

fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), maskableSVG);
console.log('\nicon-maskable.svg cree\n');

const manifest = {
  name: 'Halterra',
  short_name: 'Halterra',
  description: 'Votre moment de pause quotidien',
  start_url: '/Halterra/',
  display: 'standalone',
  background_color: '#0A0E1A',
  theme_color: '#667eea',
  orientation: 'portrait',
  icons: [
    ...sizes.map(size => ({
      src: '/Halterra/logo.svg',
      sizes: size + 'x' + size,
      type: 'image/svg+xml',
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

console.log('manifest.json cree!');
