// Script to create meditation icon
const fs = require('fs');

// Create meditation icon
const createIcon = (size) => {
  const scale = size / 512;
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#F2E9E4"/>

  <g transform="translate(${size/2}, ${size*0.547}) scale(${scale})">
    <circle cx="0" cy="-50" r="120" fill="none" stroke="#8E9AAF" stroke-width="6" opacity="0.5"/>
    <circle cx="0" cy="-50" r="100" fill="none" stroke="#8E9AAF" stroke-width="5" opacity="0.4"/>
    <g transform="translate(0, -50)">
      <ellipse cx="0" cy="-45" rx="24" ry="28" fill="#6B8FA3"/>
      <ellipse cx="0" cy="-8" rx="30" ry="38" fill="#6B8FA3"/>
      <path d="M -30,-8 Q -50,0 -58,17 L -50,25 Q -42,8 -25,4 Z" fill="#6B8FA3"/>
      <path d="M 30,-8 Q 50,0 58,17 L 50,25 Q 42,8 25,4 Z" fill="#6B8FA3"/>
      <ellipse cx="-35" cy="30" rx="38" ry="17" fill="#6B8FA3"/>
      <ellipse cx="35" cy="30" rx="38" ry="17" fill="#6B8FA3"/>
      <ellipse cx="0" cy="35" rx="42" ry="10" fill="#8E9AAF" opacity="0.6"/>
    </g>
  </g>

  <text x="${size/2}" y="${size*0.84}" font-family="serif" font-size="${size/11.6}" font-weight="300" fill="#2C3E50" text-anchor="middle">Halterra</text>
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
