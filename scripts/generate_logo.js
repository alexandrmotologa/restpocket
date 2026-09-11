import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Resvg } = require('@resvg/resvg-js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function buildLogoSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <clipPath id="squircle-clip">
      <rect x="24" y="24" width="976" height="976" rx="220" />
    </clipPath>

    <linearGradient id="cyan-glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f5ff"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>

    <linearGradient id="amber-accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>

    <linearGradient id="slate-light" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>

    <linearGradient id="slate-mid" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>

    <linearGradient id="slate-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <filter id="subtle-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.14" />
    </filter>
  </defs>

  <!-- Luxury White Squircle Container -->
  <rect x="24" y="24" width="976" height="976" rx="220" fill="#ffffff" stroke="#e2e8f0" stroke-width="6" />

  <g clip-path="url(#squircle-clip)">
    <g transform="translate(512, 512)" filter="url(#subtle-shadow)">

      <!-- Hexagonal Architectural Gateway -->
      <polygon points="
        0,-400
        346,-200
        346,200
        0,400
        -346,200
        -346,-200
      " fill="none" stroke="#0f172a" stroke-width="36" stroke-linejoin="round" />

      <!-- Dashed Cyan Gateway Ring -->
      <polygon points="
        0,-366
        316,-183
        316,183
        0,366
        -316,183
        -316,-183
      " fill="none" stroke="#00f5ff" stroke-width="4" opacity="0.45" stroke-dasharray="16, 12" />

      <!-- 100% Watertight Solid Base Silhouette -->
      <path d="
        M 0,-265
        L 75,-215 L 125,-165 L 140,-95 L 205,-45 L 255,50 L 265,160 L 210,235 L 120,285 L 0,335
        L -120,285 L -210,235 L -265,160 L -255,50 L -205,-45 L -140,-95 L -125,-165 L -75,-215
        Z
      " fill="#0b0f19" />

      <!-- ================= HEAD & CROWN FACETS ================= -->
      <!-- Crown Central Ridge -->
      <polygon points="0,-265 -50,-200 0,-165" fill="#475569" />
      <polygon points="0,-265 50,-200 0,-165" fill="#334155" />

      <!-- Crown Lateral Flanks -->
      <polygon points="-50,-200 -105,-175 -55,-135 0,-165" fill="#1e293b" />
      <polygon points="50,-200 105,-175 55,-135 0,-165" fill="#334155" />

      <!-- Ear Crest / Temples -->
      <polygon points="-105,-175 -125,-165 -100,-115 -55,-135" fill="#0f172a" />
      <polygon points="105,-175 125,-165 100,-115 55,-135" fill="#1e293b" />

      <!-- Forehead & Supraorbital Brows -->
      <polygon points="0,-165 -55,-135 -40,-95 0,-115" fill="#334155" />
      <polygon points="0,-165 55,-135 40,-95 0,-115" fill="#1e293b" />

      <!-- Cheeks & Zygomatic Facets -->
      <polygon points="-100,-115 -140,-95 -120,-35 -55,-65" fill="#1e293b" />
      <polygon points="100,-115 140,-95 120,-35 55,-65" fill="#334155" />

      <!-- Predator Optics (Almond Cant toward Ears) -->
      <!-- Left Eye Socket & Eye -->
      <polygon points="-55,-135 -40,-95 -75,-85" fill="#0f172a" />
      <polygon points="-52,-125 -42,-98 -68,-92" fill="url(#cyan-glow)" />
      <polygon points="-49,-112 -44,-103 -58,-100" fill="#ffffff" opacity="0.8" />

      <!-- Right Eye Socket & Eye -->
      <polygon points="55,-135 40,-95 75,-85" fill="#0b0f19" />
      <polygon points="52,-125 42,-98 68,-92" fill="url(#cyan-glow)" />
      <polygon points="49,-112 44,-103 58,-100" fill="#ffffff" opacity="0.8" />

      <!-- Beak / Aerodynamic Ram (Upper & Lower Hook) -->
      <polygon points="0,-115 -25,-85 0,-45" fill="url(#amber-accent)" />
      <polygon points="0,-115 25,-85 0,-45" fill="#d97706" />
      <polygon points="0,-45 -20,-45 0,-15" fill="#ea580c" />
      <polygon points="0,-45 20,-45 0,-15" fill="#b45309" />

      <!-- Throat & Chin Armor Plating -->
      <polygon points="-40,-95 -25,-85 0,-45 -25,-15 -55,-65" fill="#1e293b" />
      <polygon points="40,-95 25,-85 0,-45 25,-15 55,-65" fill="#0f172a" />

      <!-- ================= CHEST & REST DISPATCHER CORE ================= -->
      <!-- Upper Breastplate -->
      <polygon points="0,-15 -55,-65 -75,20 0,55" fill="#334155" />
      <polygon points="0,-15 55,-65 75,20 0,55" fill="#1e293b" />

      <!-- Central Hexagonal Pocket Dispatcher Core (Electric Cyan) -->
      <polygon points="
        0,65
        50,95
        50,155
        0,185
        -50,155
        -50,95
      " fill="#0f172a" stroke="url(#cyan-glow)" stroke-width="6" stroke-linejoin="round" />

      <!-- Inner Core Glyph (Fast REST Runner Vector) -->
      <polygon points="
        0,82
        33,102
        33,142
        0,162
        -33,142
        -33,102
      " fill="url(#cyan-glow)" />

      <polygon points="
        0,95
        18,106
        18,128
        0,139
        -18,128
        -18,106
      " fill="#0b0f19" />

      <!-- Core Flank Plates -->
      <polygon points="-75,20 -50,95 0,65" fill="#1e293b" />
      <polygon points="75,20 50,95 0,55" fill="#334155" />

      <polygon points="-75,20 -125,75 -85,145 -50,155 -50,95" fill="#334155" />
      <polygon points="75,20 125,75 85,145 50,155 50,95" fill="#1e293b" />

      <!-- Lower Abdominal Keel -->
      <polygon points="0,185 -50,155 -60,225 0,265" fill="#1e293b" />
      <polygon points="0,185 50,155 60,225 0,265" fill="#334155" />

      <!-- Tail Rudder Stabilizer -->
      <polygon points="0,265 -60,225 -35,295 0,335" fill="#0f172a" />
      <polygon points="0,265 60,225 35,295 0,335" fill="#1e293b" />

      <!-- ================= WINGS (DIRECTIONAL EXECUTION VECTORS) ================= -->
      <!-- Left Wing - Shoulder & Upper Coverts -->
      <polygon points="-120,-35 -205,-45 -165,35 -125,75" fill="#475569" />
      <polygon points="-205,-45 -255,50 -195,95 -165,35" fill="#334155" />

      <!-- Left Wing - Primary Flight Feathers (Stealth Facets) -->
      <polygon points="-165,35 -195,95 -265,160 -195,175 -125,75" fill="#1e293b" />
      <polygon points="-195,175 -265,160 -210,235 -145,215" fill="#0f172a" />
      <polygon points="-145,215 -210,235 -120,285 -85,225" fill="#1e293b" />
      <polygon points="-125,75 -85,145 -145,215 -85,225" fill="#334155" />

      <!-- Right Wing - Shoulder & Upper Coverts -->
      <polygon points="120,-35 205,-45 165,35 125,75" fill="#334155" />
      <polygon points="205,-45 255,50 195,95 165,35" fill="#1e293b" />

      <!-- Right Wing - Primary Flight Feathers (Stealth Facets) -->
      <polygon points="165,35 195,95 265,160 195,175 125,75" fill="#0f172a" />
      <polygon points="195,175 265,160 210,235 145,215" fill="#1e293b" />
      <polygon points="145,215 210,235 120,285 85,225" fill="#0f172a" />
      <polygon points="125,75 85,145 145,215 85,225" fill="#1e293b" />

      <!-- Wing Edge Cyan Micro-Accents -->
      <polygon points="-255,50 -265,160 -258,105" fill="#00f5ff" opacity="0.8" />
      <polygon points="255,50 265,160 258,105" fill="#00f5ff" opacity="0.8" />

    </g>
  </g>
</svg>`;
}

async function renderLogo() {
  const outputDir = path.resolve(__dirname, '../docs/images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const svg = buildLogoSvg();
  const svgPath = path.join(outputDir, 'logo.svg');
  const pngPath = path.join(outputDir, 'logo.png');

  fs.writeFileSync(svgPath, svg, 'utf-8');

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1024,
    },
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(pngPath, pngBuffer);

  console.log(`✓ Successfully rendered:`);
  console.log(`  SVG: ${svgPath}`);
  console.log(`  PNG: ${pngPath} (1024x1024)`);
}

renderLogo().catch((err) => {
  console.error('Failed to generate logo:', err);
  process.exit(1);
});
