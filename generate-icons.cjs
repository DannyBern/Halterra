// Simple script to create placeholder icons
const fs = require('fs');

// Create a simple SVG that we'll use as PNG placeholders
const createIcon = (size) => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#F2E9E4"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size/8}" fill="#C9ADA7"/>
  ${[0,1,2,3,4].map(i => {
    const angle = i * 72 - 90;
    const rad = angle * Math.PI / 180;
    const cx = size/2 + Math.sin(rad) * size/5;
    const cy = size/2 + Math.cos(rad) * size/5;
    return `<ellipse cx="${cx}" cy="${cy}" rx="${size/7}" ry="${size/4}" fill="rgba(142, 154, 175, 0.8)" transform="rotate(${angle} ${cx} ${cy})"/>`;
  }).join('')}
  <text x="${size/2}" y="${size*0.82}" font-family="serif" font-size="${size/11}" font-weight="300" fill="#2C3E50" text-anchor="middle">Halterra</text>
</svg>`;
  return svg;
};

// Generate icons
const sizes = [192, 512];
sizes.forEach(size => {
  const svg = createIcon(size);
  fs.writeFileSync(`public/icon-${size}.svg`, svg);
  console.log(`Created icon-${size}.svg`);
});

console.log('\n✅ Icons generated! Use create-icons.html to convert to PNG if needed.');
