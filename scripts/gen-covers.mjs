/**
 * gen-covers.mjs — generador determinista de portadas de marca por app.
 *
 * Por qué SVG y no eikon: eikon (Pinakotheke/eikon) genera con difusión en GPU
 * (RTX 5070 Ti) que no existe en este sandbox. Para no inventar imágenes ni dejar
 * cards sin marca, producimos portadas vectoriales on-brand (mismo lenguaje visual
 * que los isotipos de prizma-brand y la paleta Cloud Atlas), una por app.
 *
 * Concepto visual ("Prizma" = el prisma que refracta): un haz de luz entra por la
 * izquierda y se refracta en un espectro de bandas teñidas con el ACENTO de cada
 * módulo. Sobre eso, un glifo simbólico de la deidad + el wordmark. Resultado:
 * imágenes anchas, protagonistas, reconocibles y coherentes entre sí.
 *
 * Salida: apps/prisma/public/covers/<key>.svg  (+ prizma.svg para el hero).
 *
 * Uso:  node scripts/gen-covers.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "covers");
mkdirSync(OUT, { recursive: true });

// Cloud Atlas / Prizma — base oscura del cockpit.
const INK = "#0b1417";
const INK2 = "#0A1622";
const AQUA = "#2DCBD1";
const CORAL = "#FF5A2B"; // el "manantial"

/**
 * Paleta por app: [acento principal, acento secundario]. Tomada de los acentos
 * de módulo del brand book (tonos -700/base) para que la portada combine con el
 * data-module="<key>" del card.
 */
const APPS = {
  hermes:    { accent: "#22A45A", deep: "#125A31", glyph: "cart",     label: "Hermes" },
  iris:      { accent: "#1FB85C", deep: "#116532", glyph: "broadcast", label: "Iris" },
  talanton:  { accent: "#6366F1", deep: "#363884", glyph: "pos",      label: "Talanton" },
  pistis:    { accent: "#2FAE9B", deep: "#195F55", glyph: "credit",   label: "Pistis" },
  talaria:   { accent: "#E8A90B", deep: "#7F5C06", glyph: "delivery", label: "Talaria" },
  logos:     { accent: "#2E90FA", deep: "#1763BC", glyph: "invoice",  label: "Logos" },
  mnemosyne: { accent: "#8B5CF6", deep: "#5B2EB0", glyph: "memory",   label: "Mnemosyne" },
  peitho:    { accent: "#FF7A4D", deep: "#C53A0C", glyph: "spark",    label: "Peitho" },
  talos:     { accent: "#F59E0B", deep: "#8C5C00", glyph: "automa",   label: "Talos" },
  nous:      { accent: "#2DCBD1", deep: "#0E6E73", glyph: "hub",      label: "Nous" },
};

const W = 680;
const H = 384;

/** Glifos simbólicos (en coordenadas locales ~120x120, centrados en 0,0). */
function glyph(kind, c) {
  const s = `stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  switch (kind) {
    case "cart": // Hermes — carrito conversacional
      return `<g ${s}><path d="M-44 -34 H-30 L-20 18 H28 L40 -20 H-22"/><circle cx="-14" cy="40" r="8"/><circle cx="26" cy="40" r="8"/></g>
        <path d="M6 -36 q22 -10 40 4 q4 18 -14 26 l4 14 -18 -10 q-18 -6 -16 -22 q1 -10 4 -12z" fill="${c}" opacity="0.9"/>`;
    case "broadcast": // Iris — mensajería masiva
      return `<g ${s}><path d="M-46 -8 L34 -38 V40 L-46 12 Z"/><path d="M-46 -8 V12"/><path d="M-22 4 V44 H-4 V11"/></g>
        <g stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"><path d="M44 -22 q14 14 0 32"/><path d="M54 -34 q26 24 0 56"/></g>`;
    case "pos": // Talanton — punto de venta / caja
      return `<g ${s}><rect x="-42" y="-30" width="84" height="62" rx="8"/><path d="M-42 -8 H42"/><circle cx="-22" cy="14" r="4" fill="${c}"/><circle cx="-6" cy="14" r="4" fill="${c}"/><circle cx="10" cy="14" r="4" fill="${c}"/></g>`;
    case "credit": // Pistis — crédito / cartera
      return `<g ${s}><rect x="-46" y="-26" width="92" height="56" rx="9"/><path d="M-46 -8 H46"/><path d="M-34 16 H-8"/></g>`;
    case "delivery": // Talaria — logística / entregas (alas + pin)
      return `<g ${s}><path d="M-6 -44 C-6 -16 -24 0 -6 36 C12 0 -6 -16 -6 -44 Z" fill="${c}" opacity="0.92"/><circle cx="-6" cy="-22" r="7" fill="${INK}"/></g>
        <g stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"><path d="M-50 30 q18 -10 30 0"/><path d="M22 30 q18 -10 30 0"/></g>`;
    case "invoice": // Logos — factura electrónica
      return `<g ${s}><path d="M-30 -42 H22 L38 -26 V42 L30 36 L22 42 L14 36 L6 42 L-2 36 L-10 42 L-18 36 L-30 42 Z"/><path d="M-18 -22 H22"/><path d="M-18 -4 H22"/><path d="M-18 14 H6"/></g>`;
    case "memory": // Mnemosyne — memoria / CRM (nodos enlazados)
      return `<g ${s}><circle cx="-30" cy="-20" r="10"/><circle cx="28" cy="-26" r="10"/><circle cx="6" cy="30" r="10"/><path d="M-22 -13 L-1 24"/><path d="M20 -19 L13 23"/><path d="M-21 -23 L19 -25"/></g>`;
    case "spark": // Peitho — persuasión / contenido
      return `<g ${s}><path d="M0 -46 L12 -12 L46 0 L12 12 L0 46 L-12 12 L-46 0 L-12 -12 Z" fill="${c}" opacity="0.9"/></g>`;
    case "automa": // Talos — automatización / RPA
      return `<g ${s}><rect x="-34" y="-26" width="68" height="56" rx="12"/><circle cx="-12" cy="-2" r="6" fill="${c}"/><circle cx="12" cy="-2" r="6" fill="${c}"/><path d="M-10 18 H10"/><path d="M0 -26 V-40"/><circle cx="0" cy="-44" r="5" fill="${c}"/></g>`;
    case "hub": // Nous — orquestador (estrella de eventos)
    default:
      return `<g ${s}><circle cx="0" cy="0" r="12" fill="${c}"/><g><circle cx="-44" cy="-22" r="7"/><circle cx="44" cy="-22" r="7"/><circle cx="-44" cy="24" r="7"/><circle cx="44" cy="24" r="7"/></g><path d="M-37 -19 L-8 -5 M37 -19 L9 -5 M-37 21 L-8 5 M37 21 L9 5"/></g>`;
  }
}

function cover(key, { accent, deep, glyph: gk, label }) {
  // Bandas del espectro refractado: del acento profundo al claro, abanico.
  const bands = [0, 1, 2, 3, 4]
    .map((i) => {
      const t = i / 4;
      const y = 150 + t * 150;
      const op = 0.16 + (1 - t) * 0.5;
      const x2 = W + 40;
      const skew = 30 - i * 9;
      return `<path d="M-40 ${y} L${x2} ${y - 70 + skew} L${x2} ${y - 30 + skew} L-40 ${y + 40} Z" fill="url(#beam_${key})" opacity="${op.toFixed(2)}"/>`;
    })
    .join("\n      ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Prizma ${label}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="ground_${key}" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${INK}"/>
      <stop offset="0.55" stop-color="${INK2}"/>
      <stop offset="1" stop-color="${deep}"/>
    </linearGradient>
    <linearGradient id="beam_${key}" x1="0" y1="0" x2="${W}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${accent}" stop-opacity="0"/>
      <stop offset="0.4" stop-color="${accent}"/>
      <stop offset="1" stop-color="${AQUA}"/>
    </linearGradient>
    <radialGradient id="glow_${key}" cx="0.18" cy="0.32" r="0.7">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.42"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#ground_${key})"/>
  <rect width="${W}" height="${H}" fill="url(#glow_${key})"/>

  <!-- espectro refractado -->
  <g>
      ${bands}
  </g>

  <!-- el prisma: triángulo translúcido que refracta el haz -->
  <g transform="translate(96 110)">
    <path d="M0 -58 L60 64 L-60 64 Z" fill="#ffffff" opacity="0.06"/>
    <path d="M0 -58 L60 64 L-60 64 Z" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2"/>
    <circle cx="-2" cy="-42" r="6" fill="${CORAL}"/>
  </g>

  <!-- haz de entrada -->
  <path d="M-10 120 L120 150" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3" stroke-linecap="round"/>

  <!-- glifo de la deidad -->
  <g transform="translate(${W - 150} ${H / 2 - 18})">
    ${glyph(gk, "#ffffff")}
  </g>

  <!-- wordmark -->
  <text x="40" y="${H - 34}" font-family="Sora, system-ui, sans-serif" font-size="34" font-weight="700" letter-spacing="-0.5" fill="#ffffff">${label}</text>
  <text x="42" y="${H - 14}" font-family="Inter, system-ui, sans-serif" font-size="13" letter-spacing="2" fill="${accent}" opacity="0.95">PRIZMA</text>
</svg>
`;
}

let n = 0;
for (const [key, def] of Object.entries(APPS)) {
  writeFileSync(join(OUT, `${key}.svg`), cover(key, def));
  n++;
}

// Portada del hero (suite completa): el prisma maestro con espectro completo.
const heroSpectrum = ["#22A45A", "#1FB85C", "#2DCBD1", "#2E90FA", "#6366F1", "#8B5CF6", "#E8A90B", "#FF5A2B"]
  .map((c, i, a) => {
    const t = i / (a.length - 1);
    const y = 120 + t * 200;
    return `<path d="M150 150 L${W + 40} ${y} L${W + 40} ${y + 26} L150 162 Z" fill="${c}" opacity="0.72"/>`;
  })
  .join("\n    ");

const hero = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Prizma — la suite" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="hero_ground" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${INK}"/><stop offset="0.6" stop-color="${INK2}"/><stop offset="1" stop-color="#0E6E73"/>
    </linearGradient>
    <radialGradient id="hero_glow" cx="0.22" cy="0.4" r="0.75">
      <stop offset="0" stop-color="${AQUA}" stop-opacity="0.4"/><stop offset="1" stop-color="${AQUA}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#hero_ground)"/>
  <rect width="${W}" height="${H}" fill="url(#hero_glow)"/>
  ${heroSpectrum}
  <g transform="translate(150 156)">
    <path d="M0 -86 L92 86 L-92 86 Z" fill="#ffffff" opacity="0.07"/>
    <path d="M0 -86 L92 86 L-92 86 Z" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="2.5"/>
    <circle cx="-3" cy="-60" r="8" fill="${CORAL}"/>
  </g>
  <path d="M-10 150 L60 168" stroke="#ffffff" stroke-opacity="0.55" stroke-width="4" stroke-linecap="round"/>
</svg>
`;
writeFileSync(join(OUT, "prizma.svg"), hero);
n++;

console.log(`generadas ${n} portadas en public/covers/`);
