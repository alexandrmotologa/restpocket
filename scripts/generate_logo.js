import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function buildLogoSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#030712"/>
    </linearGradient>

    <!-- Squircle Border Gradient -->
    <linearGradient id="border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#1e293b" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0.6"/>
    </linearGradient>

    <!-- Glowing Core Cyan Gradient -->
    <linearGradient id="cyan-glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f5ff"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>

    <!-- Wing Top Face (Bright Sky) -->
    <linearGradient id="wing-top" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>

    <!-- Wing Left Face (Electric Cyan) -->
    <linearGradient id="wing-left" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#67e8f9"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>

    <!-- Wing Underside Face (Deep Indigo/Sapphire) -->
    <linearGradient id="wing-under" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <!-- Trail Exhaust Stream -->
    <linearGradient id="trail-grad" x1="0%" y1="100%" x2="50%" y2="0%">
      <stop offset="0%" stop-color="#00f5ff" stop-opacity="0"/>
      <stop offset="40%" stop-color="#00f5ff" stop-opacity="0.4"/>
      <stop offset="80%" stop-color="#38bdf8" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>

    <!-- Soft Ambient Glow Filter -->
    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="24" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <radialGradient id="ambient-radial" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.25"/>
      <stop offset="60%" stop-color="#0284c7" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Modern Dark Squircle Canvas -->
  <rect x="24" y="24" width="976" height="976" rx="224" fill="url(#bg-grad)" stroke="url(#border-grad)" stroke-width="8" />

  <!-- Ambient Backdrop Glow -->
  <circle cx="512" cy="512" r="380" fill="url(#ambient-radial)" />

  <!-- ================= REST POCKET EMBLEM ================= -->
  <!-- Outer Stylized Pocket / Orbital Halo -->
  <g filter="url(#neon-glow)">
    <!-- Pocket U-Shield Arc -->
    <path d="
      M 310,400
      L 310,560
      C 310,700 400,770 512,770
      C 624,770 714,700 714,560
      L 714,480
    " fill="none" stroke="url(#cyan-glow)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />

    <!-- Upper Pocket Hem / Horizon Line with center notch -->
    <path d="
      M 310,400
      L 430,400
      L 460,430
      L 564,430
      L 594,400
      L 714,400
    " fill="none" stroke="#38bdf8" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.75" />

    <!-- Interior REST Packet Brackets < / > subtle watermark -->
    <path d="M 400,560 L 370,590 L 400,620" fill="none" stroke="#0ea5e9" stroke-width="10" stroke-linecap="round" opacity="0.4" />
    <path d="M 624,560 L 654,590 L 624,620" fill="none" stroke="#0ea5e9" stroke-width="10" stroke-linecap="round" opacity="0.4" />
    <path d="M 495,625 L 530,555" fill="none" stroke="#0ea5e9" stroke-width="10" stroke-linecap="round" opacity="0.4" />
  </g>

  <!-- Dynamic Exhaust Trail from Pocket into Plane -->
  <path d="
    M 440,730
    C 420,640 450,560 520,490
    C 545,465 565,445 580,410
  " fill="none" stroke="url(#trail-grad)" stroke-width="18" stroke-linecap="round" />

  <path d="
    M 470,740
    C 450,660 480,580 540,510
  " fill="none" stroke="#00f5ff" stroke-width="8" stroke-linecap="round" opacity="0.6" />

  <!-- ================= SUPERSONIC SEND PLANE (TELEGRAM + REST DISPATCHER) ================= -->
  <g transform="translate(40, -30)">
    <!-- Plane Drop Shadow for 3D Pop -->
    <polygon points="720,250 360,400 480,470 650,470" fill="#000000" opacity="0.45" filter="url(#neon-glow)" />

    <!-- Left Main Wing Facet -->
    <polygon points="720,250 360,400 490,460" fill="url(#wing-left)" stroke="#00f5ff" stroke-width="3" stroke-linejoin="round" />

    <!-- Right Main Wing Facet -->
    <polygon points="720,250 490,460 650,470" fill="url(#wing-top)" stroke="#38bdf8" stroke-width="3" stroke-linejoin="round" />

    <!-- Underside Keel / Fold Facet -->
    <polygon points="490,460 550,540 580,465" fill="url(#wing-under)" stroke="#1e3a8a" stroke-width="2" stroke-linejoin="round" />

    <!-- Left Fold Under-Fin -->
    <polygon points="490,460 470,520 520,480" fill="#0284c7" />

    <!-- Center Spine Ridge (Razor-sharp Highlight) -->
    <line x1="720" y1="250" x2="490" y2="460" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.95" />

    <!-- Supersonic Nose Beacon -->
    <circle cx="720" cy="250" r="8" fill="#ffffff" filter="url(#neon-glow)" />
    <circle cx="720" cy="250" r="4" fill="#00f5ff" />
  </g>

</svg>`;
}

async function run() {
  const svg = buildLogoSvg();
  const outputDir = path.resolve(__dirname, '../docs/images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const svgPath = path.join(outputDir, 'logo.svg');
  fs.writeFileSync(svgPath, svg, 'utf8');
  console.log(`[SVG Saved] ${svgPath} (${svg.length} bytes)`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
