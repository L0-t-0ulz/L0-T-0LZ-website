/* ============================================================
   Single source of truth for all site copy.
   ============================================================ */

export const brand = {
  wordmark: 'LO$T$0LZ',
  subBrand: 'L0-t-0ulz',
  tagline: 'FORGING · FASHION · IN · 3D',
  email: 'khanzayan_123@hotmail.com',
  github: 'https://github.com/L0-t-0ulz',
  status: 'Active Development',
};

export const hero = {
  tag: brand.tagline,
  titleLines: ['Forging the future', 'of fashion — in 3D'],
  lead:
    'LO$T$0LZ builds next-generation design software — garments engineered in true 3D, dressed in real fabrics with live cloth physics, and carried from a first sketch all the way to a factory-ready pattern.',
  readoutLeft: [
    ['SYS', 'LOSTSOULZ // ONLINE'],
    ['STACK', 'THREE.JS · WEBGL · TS'],
    ['MODE', 'REAL-TIME SIMULATION'],
  ] as [string, string][],
  readoutRight: [
    ['NODE', 'DESIGN·IO'],
    ['SIM', 'XPBD CLOTH'],
    ['STATE', 'ACTIVE DEV'],
  ] as [string, string][],
};

export const manifesto = {
  index: '01 / MANIFESTO',
  // Words wrapped with * become highlighted spans.
  text: 'We work at the *seam* of fashion, *real-time graphics*, and *physical simulation*.',
};

export const designio = {
  index: '02 / FLAGSHIP',
  title: 'DesignIO',
  intro:
    'A fully-3D clothing-design studio, in the spirit of CLO3D and Browzwear — from a friendly launcher through a professional CAD-style workspace.',
  body:
    'Design garments on a slim, poseable human avatar, drape them in 35 real fabrics with XPBD cloth simulation, sculpt and animate the body, and export everything — glTF · OBJ · USDZ (AR Quick Look) · SVG / DXF flat patterns · a full manufacturing pack — inside a photographic studio.',
  specs: [
    ['Garments', '50+ data-driven — parametric templates, or sewn from your own 2D patterns'],
    ['Fabrics', '35 real fabrics whose physics and look drive both drape and render'],
    ['Simulation', 'XPBD cloth · mesh-accurate BVH body collision · self / inter-garment collision · trapped-air loft'],
    ['Pipeline', '3D + 2D flat pattern + path-traced hero renders · size grading · tech pack · marker-ready output'],
    ['Stack', 'Electron · Three.js · TypeScript'],
  ] as [string, string][],
  links: [
    { label: 'CLO3D', href: 'https://www.clo3d.com/' },
    { label: 'Browzwear', href: 'https://browzwear.com/' },
  ],
};

export const capabilities = {
  index: '03 / CAPABILITIES',
  title: 'The studio, in numbers.',
  cards: [
    {
      stat: '50+',
      countTo: 50,
      suffix: '+',
      name: 'Garments',
      desc: 'Data-driven — parametric templates, or sewn from your own 2D patterns.',
    },
    {
      stat: '35',
      countTo: 35,
      suffix: '',
      name: 'Fabrics',
      desc: 'Real fabrics whose physics and look drive both drape and render.',
    },
    {
      stat: 'XPBD',
      countTo: null,
      suffix: '',
      name: 'Simulation',
      desc: 'Mesh-accurate BVH body collision · self / inter-garment collision · trapped-air loft.',
    },
    {
      stat: '3D+2D',
      countTo: null,
      suffix: '',
      name: 'Pipeline',
      desc: 'Flat patterns · path-traced renders · size grading · tech pack · marker-ready output.',
    },
  ],
};

export const formats = {
  index: '04 / OUTPUT',
  title: 'From a sketch to the factory floor.',
  chips: [
    'glTF',
    'OBJ',
    'USDZ · AR Quick Look',
    'SVG flat patterns',
    'DXF flat patterns',
    'Path-traced renders',
    'Size grading',
    'Tech pack',
    'Marker-ready output',
  ],
  flow: ['Sketch', '3D Garment', 'Flat Pattern', 'Tech Pack', 'Factory'],
};

export const tech = {
  index: '05 / DOMAINS',
  title: 'What we work in.',
  tags: [
    '3D / WebGL',
    'XPBD cloth simulation',
    'Physically-based rendering',
    'Path tracing',
    'Computational geometry',
    'Pattern-making / CAD',
  ],
  stack: ['TypeScript', 'Three.js', 'Electron', 'WebGL', 'Vite'],
};

export const founder = {
  index: '06 / FOUNDER',
  quote: 'Built by *Zayan Khan* — engineering the tools that make 3D fashion design feel effortless.',
  by: 'Founder · L0$T$0LZ',
};

export const footer = {
  cta: "Let's forge the future.",
  fine: 'Proprietary · all rights reserved · © 2026 L0-t-0ulz · Zayan Khan',
};

export const navLinks = [
  { label: 'DesignIO', href: '#designio' },
  { label: 'Tech', href: '#tech' },
  { label: 'Founder', href: '#founder' },
  { label: 'Contact', href: '#contact' },
];

// T14 — swatchable fabrics; each drives the live garment material.
export interface Fabric {
  name: string;
  hex: string;
  roughness: number;
  metalness: number;
  sheen: number;
  clearcoat: number;
}

export const fabrics: Fabric[] = [
  { name: 'Indigo Denim', hex: '#2b3a67', roughness: 0.85, metalness: 0.0, sheen: 0.15, clearcoat: 0.0 },
  { name: 'Cyan Silk', hex: '#7df9ff', roughness: 0.22, metalness: 0.05, sheen: 1.0, clearcoat: 0.25 },
  { name: 'Onyx Leather', hex: '#15171d', roughness: 0.5, metalness: 0.05, sheen: 0.25, clearcoat: 0.5 },
  { name: 'Violet Satin', hex: '#b46cff', roughness: 0.28, metalness: 0.15, sheen: 0.85, clearcoat: 0.3 },
  { name: 'Chrome Tech', hex: '#9aa7bd', roughness: 0.3, metalness: 0.85, sheen: 0.1, clearcoat: 0.15 },
  { name: 'Crimson Vinyl', hex: '#ff4d6d', roughness: 0.12, metalness: 0.1, sheen: 0.3, clearcoat: 0.95 },
];
