import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/assets/uno');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Color bases (red, blue, green, yellow)
const colors = {
  red: '#E52521',
  blue: '#0096E6',
  green: '#2BA84A',
  yellow: '#FFD100'
};

for (const [name, hex] of Object.entries(colors)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="200" height="300">
  <rect x="4" y="4" width="192" height="292" rx="24" fill="${hex}" stroke="#FFFFFF" stroke-width="8"/>
</svg>`;
  fs.writeFileSync(path.join(outDir, `${name}_base.svg`), svg);
  fs.writeFileSync(path.join(outDir, `${name}_base.png`), svg); // fallback
}

// 2. Card Back
const backSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="200" height="300">
  <rect x="4" y="4" width="192" height="292" rx="24" fill="#0A0A0A" stroke="#FFFFFF" stroke-width="8"/>
  <ellipse cx="100" cy="150" rx="90" ry="55" transform="rotate(-25 100 150)" fill="#E52521" stroke="#FFAA00" stroke-width="4"/>
  <text x="100" y="165" font-family="'Impact', 'Arial Black', sans-serif" font-size="52" font-style="italic" font-weight="900" text-anchor="middle" fill="#FFD100" stroke="#000000" stroke-width="3" transform="rotate(-25 100 150)">UNO</text>
</svg>`;
fs.writeFileSync(path.join(outDir, 'back.svg'), backSvg);
fs.writeFileSync(path.join(outDir, 'back.png'), backSvg);

// 3. Logo
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
  <ellipse cx="160" cy="100" rx="140" ry="85" transform="rotate(-15 160 100)" fill="#E52521" stroke="#FFFFFF" stroke-width="6"/>
  <text x="160" y="125" font-family="'Impact', 'Arial Black', sans-serif" font-size="96" font-style="italic" font-weight="900" text-anchor="middle" fill="#FFD100" stroke="#000000" stroke-width="8" transform="rotate(-15 160 100)">UNO</text>
</svg>`;
fs.writeFileSync(path.join(outDir, 'logo.svg'), logoSvg);
fs.writeFileSync(path.join(outDir, 'logo.png'), logoSvg);

// 4. Deck
const deckSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 320" width="240" height="320">
  <g transform="translate(16, 20)">
    <rect x="0" y="8" width="180" height="270" rx="20" fill="#222" stroke="#FFF" stroke-width="4"/>
    <rect x="6" y="4" width="180" height="270" rx="20" fill="#1A1A1A" stroke="#FFF" stroke-width="4"/>
    <rect x="12" y="0" width="180" height="270" rx="20" fill="#0A0A0A" stroke="#FFF" stroke-width="6"/>
    <ellipse cx="102" cy="135" rx="80" ry="50" transform="rotate(-25 102 135)" fill="#E52521" stroke="#FFAA00" stroke-width="4"/>
    <text x="102" y="150" font-family="'Impact', 'Arial Black', sans-serif" font-size="48" font-style="italic" font-weight="900" text-anchor="middle" fill="#FFD100" stroke="#000000" stroke-width="3" transform="rotate(-25 102 135)">UNO</text>
  </g>
</svg>`;
fs.writeFileSync(path.join(outDir, 'deck.svg'), deckSvg);
fs.writeFileSync(path.join(outDir, 'deck.png'), deckSvg);

// 5. Background table
const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#5a1010"/>
      <stop offset="60%" stop-color="#3b0808"/>
      <stop offset="100%" stop-color="#140202"/>
    </radialGradient>
  </defs>
  <rect width="800" height="600" fill="url(#vignette)"/>
</svg>`;
fs.writeFileSync(path.join(outDir, 'background.svg'), bgSvg);
fs.writeFileSync(path.join(outDir, 'background.png'), bgSvg);

// 6. Number overlays _0.svg to _9.svg
for (let i = 0; i <= 9; i++) {
  const numSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="200" height="300">
  <!-- Corner pips -->
  <text x="24" y="44" font-family="'Arial Black', sans-serif" font-size="28" font-weight="900" fill="#FFFFFF">${i}</text>
  <text x="176" y="276" font-family="'Arial Black', sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" transform="rotate(180 176 266)">${i}</text>
  <!-- Center White Oval -->
  <ellipse cx="100" cy="150" rx="80" ry="52" transform="rotate(-25 100 150)" fill="#FFFFFF"/>
  <!-- Center Digit -->
  <text x="100" y="185" font-family="'Impact', 'Arial Black', sans-serif" font-size="98" font-weight="900" text-anchor="middle" fill="#000000">${i}</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, `_${i}.svg`), numSvg);
  fs.writeFileSync(path.join(outDir, `_${i}.png`), numSvg);
}

// 7. Action overlays (_draw2, _interdit, _revers, _wild, _wild_draw)
const draw2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="200" height="300">
  <text x="22" y="44" font-family="'Arial Black', sans-serif" font-size="24" font-weight="900" fill="#FFFFFF">+2</text>
  <text x="178" y="276" font-family="'Arial Black', sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" transform="rotate(180 178 266)">+2</text>
  <ellipse cx="100" cy="150" rx="80" ry="52" transform="rotate(-25 100 150)" fill="#FFFFFF"/>
  <rect x="74" y="112" width="28" height="42" rx="4" fill="#000" stroke="#FFF" stroke-width="2" transform="rotate(-15 88 133)"/>
  <rect x="98" y="112" width="28" height="42" rx="4" fill="#000" stroke="#FFF" stroke-width="2" transform="rotate(15 112 133)"/>
  <text x="100" y="196" font-family="'Impact', 'Arial Black', sans-serif" font-size="44" font-weight="900" text-anchor="middle" fill="#000000">+2</text>
</svg>`;
fs.writeFileSync(path.join(outDir, '_draw2.svg'), draw2Svg);
fs.writeFileSync(path.join(outDir, '_draw2.png'), draw2Svg);

const interditSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="200" height="300">
  <circle cx="28" cy="34" r="14" fill="none" stroke="#FFFFFF" stroke-width="4"/>
  <line x1="18" y1="24" x2="38" y2="44" stroke="#FFFFFF" stroke-width="4"/>
  <circle cx="172" cy="266" r="14" fill="none" stroke="#FFFFFF" stroke-width="4"/>
  <line x1="162" y1="256" x2="182" y2="276" stroke="#FFFFFF" stroke-width="4"/>
  <ellipse cx="100" cy="150" rx="80" ry="52" transform="rotate(-25 100 150)" fill="#FFFFFF"/>
  <circle cx="100" cy="150" r="36" fill="none" stroke="#000000" stroke-width="12"/>
  <line x1="74" y1="124" x2="126" y2="176" stroke="#000000" stroke-width="12" stroke-linecap="round"/>
</svg>`;
fs.writeFileSync(path.join(outDir, '_interdit.svg'), interditSvg);
fs.writeFileSync(path.join(outDir, '_interdit.png'), interditSvg);

const reversSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="200" height="300">
  <text x="24" y="44" font-family="'Arial Black', sans-serif" font-size="26" font-weight="900" fill="#FFFFFF">⇄</text>
  <text x="176" y="276" font-family="'Arial Black', sans-serif" font-size="26" font-weight="900" fill="#FFFFFF" transform="rotate(180 176 266)">⇄</text>
  <ellipse cx="100" cy="150" rx="80" ry="52" transform="rotate(-25 100 150)" fill="#FFFFFF"/>
  <path d="M 72 136 C 72 110, 116 104, 134 122" fill="none" stroke="#000000" stroke-width="10" stroke-linecap="round"/>
  <polygon points="124,110 148,124 130,146" fill="#000000"/>
  <path d="M 128 164 C 128 190, 84 196, 66 178" fill="none" stroke="#000000" stroke-width="10" stroke-linecap="round"/>
  <polygon points="76,190 52,176 70,154" fill="#000000"/>
</svg>`;
fs.writeFileSync(path.join(outDir, '_revers.svg'), reversSvg);
fs.writeFileSync(path.join(outDir, '_revers.png'), reversSvg);

const wildSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="200" height="300">
  <rect x="4" y="4" width="192" height="292" rx="24" fill="#121316" stroke="#FFFFFF" stroke-width="8"/>
  <g transform="translate(100, 150) rotate(-25)">
    <clipPath id="ovalClip">
      <ellipse cx="0" cy="0" rx="76" ry="50"/>
    </clipPath>
    <g clip-path="url(#ovalClip)">
      <rect x="-80" y="-60" width="80" height="60" fill="#E52521"/>
      <rect x="0" y="-60" width="80" height="60" fill="#0096E6"/>
      <rect x="-80" y="0" width="80" height="60" fill="#FFD100"/>
      <rect x="0" y="0" width="80" height="60" fill="#2BA84A"/>
    </g>
    <ellipse cx="0" cy="0" rx="76" ry="50" fill="none" stroke="#FFFFFF" stroke-width="5"/>
  </g>
</svg>`;
fs.writeFileSync(path.join(outDir, '_wild.svg'), wildSvg);
fs.writeFileSync(path.join(outDir, '_wild.png'), wildSvg);

const wildDrawSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="200" height="300">
  <rect x="4" y="4" width="192" height="292" rx="24" fill="#121316" stroke="#FFFFFF" stroke-width="8"/>
  <text x="24" y="44" font-family="'Arial Black', sans-serif" font-size="24" font-weight="900" fill="#FFFFFF">+4</text>
  <text x="176" y="276" font-family="'Arial Black', sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" transform="rotate(180 176 266)">+4</text>
  <ellipse cx="100" cy="150" rx="80" ry="52" transform="rotate(-25 100 150)" fill="#FFFFFF"/>
  <g transform="translate(100, 135)">
    <rect x="-42" y="-30" width="26" height="38" rx="4" fill="#E52521" stroke="#FFF" stroke-width="2" transform="rotate(-15)"/>
    <rect x="-18" y="-36" width="26" height="38" rx="4" fill="#0096E6" stroke="#FFF" stroke-width="2" transform="rotate(2)"/>
    <rect x="8" y="-32" width="26" height="38" rx="4" fill="#FFD100" stroke="#FFF" stroke-width="2" transform="rotate(16)"/>
    <rect x="24" y="-18" width="26" height="38" rx="4" fill="#2BA84A" stroke="#FFF" stroke-width="2" transform="rotate(28)"/>
  </g>
  <text x="100" y="200" font-family="'Impact', 'Arial Black', sans-serif" font-size="52" font-weight="900" text-anchor="middle" fill="#000000">+4</text>
</svg>`;
fs.writeFileSync(path.join(outDir, '_wild_draw.svg'), wildDrawSvg);
fs.writeFileSync(path.join(outDir, '_wild_draw.png'), wildDrawSvg);

console.log('All UNO assets generated successfully in', outDir);
