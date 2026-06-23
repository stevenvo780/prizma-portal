import type { LucideIcon } from "lucide-react";
import {
  ShoppingCart,
  Megaphone,
  Truck,
  Receipt,
  CreditCard,
  Calculator,
  Plug,
  Bot,
  Satellite,
} from "lucide-react";

export type ModuleKey =
  | "hermes" | "iris" | "talaria" | "talanton" | "pistis"
  | "logos" | "mnemosyne" | "peitho" | "talos" | "nous";

/**
 * Icono de marca por módulo (lucide-react). Un único registro para todo el
 * portal: nav, launcher, módulos y facturación leen de aquí en vez de repetir
 * literales. Nunca emojis. Cada componente decide el tamaño/color.
 */
export const MODULE_ICON: Record<ModuleKey, LucideIcon> = {
  hermes: ShoppingCart,
  iris: Megaphone,
  talaria: Truck,
  talanton: Receipt,
  pistis: CreditCard,
  logos: Calculator,
  mnemosyne: Plug,
  peitho: Megaphone,
  talos: Bot,
  nous: Satellite,
};

export interface Product {
  key: ModuleKey;
  name: string;       // Greek god (public name)
  aka: string;        // legacy product name (for recognition)
  line: "Comercial" | "Operación" | "Facturación" | "Marketing" | "Infra" | "Conector";
  tagline: string;    // short one-liner for compact rows
  /** Real product blurb shown on the launcher card. */
  blurb: string;
  url: string;
  /** Branded cover image (public/covers/<key>.svg), shown big on the card. */
  cover: string;
  star?: boolean;
  internal?: boolean;
  /**
   * Customer-facing app with a live subdomain on prisma-enterprice.cloud.
   * These get the big image-forward hero grid; the rest go in a quieter lane.
   */
  customerFacing?: boolean;
}

// Per-service base URLs — configurable via VITE_* env vars for production deployments.
// Fallback to localhost ports used in local development.
//
// Precedencia de env vars (en orden):
// 1. VITE_<APP>_URL (nuevo nombre)
// 2. VITE_<LEGACY>_URL (nombre antiguo, p. ej. VITE_GRAF_URL)
// 3. fallback (subdominio en prod o localhost en dev)
//
// Nota: una VITE_*_URL vacía ("") en Vercel NO debe ganarle al fallback.
// Con `??` el string vacío se considera "definido" y causa hrefs rotos.
// El helper `pick()` trata "" (y solo-espacios) como ausente.
const pick = (...vals: (string | undefined)[]): string | undefined =>
  vals.find((v) => typeof v === "string" && v.trim() !== "");

const env = (key: string, fallback: string, legacyKey?: string): string =>
  pick(
    import.meta.env[key] as string | undefined,
    legacyKey ? (import.meta.env[legacyKey] as string | undefined) : undefined,
    fallback,
  ) ?? fallback;

// Subdominios de producción confirmados por el owner. El DEFAULT de una app de
// cara al cliente es siempre su subdominio real, de modo que los links abren la
// app aunque Vercel tenga la VITE_*_URL vacía. Para desarrollo local, define la
// VITE_<APP>_URL correspondiente (p. ej. en .env.local) apuntando a localhost;
// ese valor gana sobre el subdominio. El segundo parámetro (devHint) queda
// documentado como el puerto local sugerido para cada app.
const sub = (host: string, _devHint: string): string =>
  `https://${host}.prisma-enterprice.cloud`;

// The Prizma pantheon — stable technical key + Greek public name (+ legacy alias).
export const PRODUCTS: Product[] = [
  { key: "hermes", name: "Hermes", aka: "Graf", line: "Comercial", star: true,
    customerFacing: true, cover: "/covers/hermes.svg",
    url: env("VITE_HERMES_URL", sub("hermes", "http://localhost:4010"), "VITE_GRAF_URL"),
    tagline: "Comercio conversacional por WhatsApp.",
    blurb: "Catálogo, carrito y cierre de venta dentro del chat de WhatsApp. Tus clientes compran sin salir de la conversación y el pedido entra ordenado a la suite." },
  { key: "iris", name: "Iris", aka: "EMW", line: "Comercial", star: true,
    customerFacing: true, cover: "/covers/iris.svg",
    url: env("VITE_IRIS_URL", sub("iris", "http://localhost:4020"), "VITE_EMW_URL"),
    tagline: "Marketing masivo por WhatsApp.",
    blurb: "Envíos masivos y segmentados por WhatsApp para reactivar tu base de clientes. Plantillas, listas y métricas de apertura en un solo panel." },
  { key: "talanton", name: "Talanton", aka: "Sinergia POS", line: "Operación",
    customerFacing: true, cover: "/covers/talanton.svg",
    url: env("VITE_TALANTON_URL", sub("talanton", "http://localhost:4050"), "VITE_SINERGIA_URL"),
    tagline: "Punto de venta, caja e inventario.",
    blurb: "POS con caja, inventario en tiempo real y facturación electrónica DIAN. Vende en mostrador y mantén el stock sincronizado con el resto de la suite." },
  { key: "pistis", name: "Pistis", aka: "Fiar", line: "Facturación",
    customerFacing: true, cover: "/covers/pistis.svg",
    url: env("VITE_PISTIS_URL", sub("pistis", "http://localhost:4030"), "VITE_FIAR_URL"),
    tagline: "Crédito sin interés y control de cartera.",
    blurb: "Ofrece crédito sin interés a tus clientes y controla la cartera con trazabilidad: cupos, abonos y recordatorios automáticos por WhatsApp." },
  { key: "talaria", name: "Talaria", aka: "Talaria", line: "Operación",
    customerFacing: true, cover: "/covers/talaria.svg",
    url: env("VITE_TALARIA_URL", sub("talaria", "http://localhost:4040")),
    tagline: "Logística y entregas con tracking.",
    blurb: "Logística de última milla: asignación automática de domiciliarios, rutas y seguimiento en vivo. Cada entrega trazable de la orden a la puerta." },
  { key: "logos", name: "Logos", aka: "ApiSigo", line: "Conector",
    cover: "/covers/logos.svg",
    url: env("VITE_LOGOS_URL", "http://localhost:3004", "VITE_APISIGO_URL"),
    tagline: "Conector de facturación electrónica.",
    blurb: "Puente con Siigo para emitir facturación electrónica DIAN desde cualquier módulo de la suite. Conector interno, sin frontend propio." },
  { key: "mnemosyne", name: "Mnemosyne", aka: "ApiSoftia", line: "Conector",
    cover: "/covers/mnemosyne.svg",
    url: env("VITE_MNEMOSYNE_URL", "http://localhost:3005", "VITE_APISOFTIA_URL"),
    tagline: "Conector de CRM y memoria de clientes.",
    blurb: "Sincroniza tu base de clientes con el CRM Soft-IA para que la suite recuerde a cada cliente. Conector interno, sin frontend propio." },
  { key: "peitho", name: "Peitho", aka: "Comercial", line: "Marketing",
    cover: "/covers/peitho.svg",
    url: env("VITE_PEITHO_URL", "http://localhost:4001"),
    tagline: "Autopiloto de contenido y campañas.",
    blurb: "Genera contenido y campañas comerciales con IA. Herramienta de marketing en evolución dentro del ecosistema Prizma." },
  { key: "talos", name: "Talos", aka: "Automatización", line: "Operación",
    cover: "/covers/talos.svg",
    url: env("VITE_TALOS_URL", "http://localhost:4060"),
    tagline: "RPA, OCR y procesos automáticos.",
    blurb: "Autómata de procesos: RPA, OCR y tareas repetitivas en piloto automático para liberar a tu equipo del trabajo manual." },
  { key: "nous", name: "Nous", aka: "HubCentral", line: "Infra", internal: true,
    cover: "/covers/nous.svg",
    url: env("VITE_NOUS_URL", "http://localhost:3007", "VITE_HUB_URL") + "/api/v1/health",
    tagline: "Orquestador de eventos (interno).",
    blurb: "La mente que orquesta los eventos del ecosistema. Infraestructura interna: enruta, firma y reintenta cada evento entre módulos." },
];

export interface FlowStep { module: ModuleKey | "cliente"; label: string; event?: string }
export const FLOW: FlowStep[] = [
  { module: "cliente", label: "Cliente compra" },
  { module: "hermes", label: "Hermes", event: "pedido.pagado" },
  { module: "nous", label: "Nous orquesta" },
  { module: "logos", label: "Logos · factura", event: "invoice.create" },
  { module: "talaria", label: "Talaria · entrega", event: "delivery.create" },
  { module: "iris", label: "Iris · WhatsApp", event: "notification.whatsapp" },
  { module: "mnemosyne", label: "Mnemosyne · CRM", event: "customer.update" },
];

export const KPIS = [
  { label: "Dioses conectados", value: "10", delta: "+10 unificados", up: true },
  { label: "Flujos de negocio", value: "7", delta: "automatizados", up: true },
  { label: "Eventos en catálogo", value: "22", delta: "prizma-contracts", up: true },
  { label: "Un solo sistema de diseño", value: "1", delta: "prizma-ui", up: true },
];

export const PRODUCT_BY_KEY: Record<string, Product> =
  Object.fromEntries(PRODUCTS.map((p) => [p.key, p]));

/**
 * URL externa SEGURA para "abrir" un módulo desde el launcher/grid.
 *
 * Solo las apps de cara al cliente tienen un frontend público vivo en su
 * subdominio (root = 200). El resto son conectores internos sin UI (Logos,
 * Mnemosyne, Nous) o herramientas en desarrollo cuyo dominio aún es un
 * placeholder (Peitho, Talos): abrir su root daría 404 / DNS fail (enlace
 * muerto). Para esas, devolvemos `undefined` y la UI navega a la ficha interna
 * del módulo en lugar de un enlace externo roto.
 */
export function externalHref(p: Product): string | undefined {
  if (!p.customerFacing) return undefined;
  try {
    // Debe ser un origin http(s) real, no un localhost de dev ni vacío.
    const u = new URL(p.url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return undefined;
    if (/(^|\.)localhost$/i.test(u.hostname) || u.hostname === "127.0.0.1") {
      return undefined;
    }
    return p.url;
  } catch {
    return undefined;
  }
}

export interface NavEntry { key: ModuleKey; label: string; icon: LucideIcon }
export interface NavGroupDef { label: string; items: NavEntry[] }

export const NAV_GROUPS: NavGroupDef[] = [
  { label: "Comercial", items: [
    { key: "hermes", label: "Hermes", icon: MODULE_ICON.hermes },
    { key: "iris", label: "Iris", icon: MODULE_ICON.iris },
  ]},
  { label: "Operación", items: [
    { key: "talaria", label: "Talaria", icon: MODULE_ICON.talaria },
    { key: "talanton", label: "Talanton", icon: MODULE_ICON.talanton },
    { key: "talos", label: "Talos", icon: MODULE_ICON.talos },
  ]},
  { label: "Facturación", items: [
    { key: "pistis", label: "Pistis", icon: MODULE_ICON.pistis },
    { key: "logos", label: "Logos", icon: MODULE_ICON.logos },
  ]},
  { label: "Conectores", items: [{ key: "mnemosyne", label: "Mnemosyne", icon: MODULE_ICON.mnemosyne }] },
  { label: "Infra", items: [{ key: "nous", label: "Nous", icon: MODULE_ICON.nous }] },
];

export interface ServiceHealthDef { key: string; name: string; port: number; healthPath: string }

// Browser-safe mirror of SERVICES from prizma-contracts (avoids bundling node:crypto).
export const SERVICE_HEALTH: ServiceHealthDef[] = [
  { key: "nous", name: "Nous", port: 3007, healthPath: "/api/v1/health" },
  { key: "hermes", name: "Hermes", port: 3000, healthPath: "/health" },
  { key: "iris", name: "Iris", port: 3001, healthPath: "/health" },
  { key: "talanton", name: "Talanton", port: 3002, healthPath: "/health" },
  { key: "logos", name: "Logos", port: 3004, healthPath: "/health" },
  { key: "mnemosyne", name: "Mnemosyne", port: 3005, healthPath: "/health" },
  { key: "talaria", name: "Talaria", port: 3006, healthPath: "/health" },
  { key: "pistis", name: "Pistis", port: 8090, healthPath: "/health" },
];
