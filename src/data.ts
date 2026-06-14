export type ModuleKey =
  | "graf" | "emw" | "meravuelta" | "sinergia" | "fiar"
  | "apisigo" | "apisoftia" | "comercial" | "automatizacion" | "hub";

export interface Product {
  key: ModuleKey;
  name: string;       // Greek god (public name)
  aka: string;        // legacy product name (for recognition)
  line: "Comercial" | "Operación" | "Facturación" | "Marketing" | "Infra" | "Conector";
  tagline: string;
  url: string;
  star?: boolean;
  internal?: boolean;
}

// The Olympo pantheon — stable technical key + Greek public name (+ legacy alias).
export const PRODUCTS: Product[] = [
  { key: "graf", name: "Hermes", aka: "Graf", line: "Comercial", star: true, url: "http://localhost:4010",
    tagline: "Comercio conversacional: catálogo y carrito por WhatsApp." },
  { key: "emw", name: "Iris", aka: "EMW", line: "Comercial", star: true, url: "http://localhost:4020",
    tagline: "Mensajería masiva y segmentada por WhatsApp. Reactiva tu base." },
  { key: "meravuelta", name: "Talaria", aka: "Mera Vuelta", line: "Operación", url: "http://localhost:4040",
    tagline: "Logística y entregas con trazabilidad y asignación automática." },
  { key: "sinergia", name: "Talanton", aka: "Sinergia POS", line: "Operación", url: "http://localhost:4050",
    tagline: "Punto de venta, caja e inventario en tiempo real." },
  { key: "fiar", name: "Pistis", aka: "Fiar", line: "Facturación", url: "http://localhost:4030",
    tagline: "Créditos y control de cartera con trazabilidad." },
  { key: "apisigo", name: "Logos", aka: "ApiSigo", line: "Conector", url: "http://localhost:3004",
    tagline: "Facturación electrónica conectada a SIGO." },
  { key: "apisoftia", name: "Mnemosyne", aka: "ApiSoftia", line: "Conector", url: "http://localhost:3005",
    tagline: "Memoria de clientes: sincronización con tu CRM." },
  { key: "comercial", name: "Peitho", aka: "Comercial", line: "Marketing", url: "http://localhost:4001",
    tagline: "Persuasión: autopiloto de contenido y campañas." },
  { key: "automatizacion", name: "Talos", aka: "Automatización", line: "Operación", url: "http://localhost:4060",
    tagline: "Autómata: RPA, OCR y procesos repetitivos en piloto automático." },
  { key: "hub", name: "Nous", aka: "HubCentral", line: "Infra", internal: true, url: "http://localhost:3007/api/v1/health",
    tagline: "La mente que orquesta los eventos del ecosistema (interno)." },
];

export interface FlowStep { module: ModuleKey | "cliente"; label: string; event?: string }
export const FLOW: FlowStep[] = [
  { module: "cliente", label: "Cliente compra" },
  { module: "graf", label: "Hermes", event: "pedido.pagado" },
  { module: "hub", label: "Nous orquesta" },
  { module: "apisigo", label: "Logos · factura", event: "invoice.create" },
  { module: "meravuelta", label: "Talaria · entrega", event: "delivery.create" },
  { module: "emw", label: "Iris · WhatsApp", event: "notification.whatsapp" },
  { module: "apisoftia", label: "Mnemosyne · CRM", event: "customer.update" },
];

export const KPIS = [
  { label: "Dioses conectados", value: "10", delta: "+10 unificados", up: true },
  { label: "Flujos de negocio", value: "7", delta: "automatizados", up: true },
  { label: "Eventos en catálogo", value: "22", delta: "@olympo/contracts", up: true },
  { label: "Un solo sistema de diseño", value: "1", delta: "@olympo/ui", up: true },
];

export const PRODUCT_BY_KEY: Record<string, Product> =
  Object.fromEntries(PRODUCTS.map((p) => [p.key, p]));

export interface NavEntry { key: ModuleKey; label: string; icon: string }
export interface NavGroupDef { label: string; items: NavEntry[] }

export const NAV_GROUPS: NavGroupDef[] = [
  { label: "Comercial", items: [
    { key: "graf", label: "Hermes", icon: "🛒" },
    { key: "emw", label: "Iris", icon: "📣" },
  ]},
  { label: "Operación", items: [
    { key: "meravuelta", label: "Talaria", icon: "🚚" },
    { key: "sinergia", label: "Talanton", icon: "🧾" },
    { key: "automatizacion", label: "Talos", icon: "🤖" },
  ]},
  { label: "Facturación", items: [
    { key: "fiar", label: "Pistis", icon: "💳" },
    { key: "apisigo", label: "Logos", icon: "🧮" },
  ]},
  { label: "Conectores", items: [{ key: "apisoftia", label: "Mnemosyne", icon: "🔌" }] },
  { label: "Infra", items: [{ key: "hub", label: "Nous", icon: "🛰️" }] },
];

export interface ServiceHealthDef { key: string; name: string; port: number; healthPath: string }

// Browser-safe mirror of SERVICES from @olympo/contracts (avoids bundling node:crypto).
export const SERVICE_HEALTH: ServiceHealthDef[] = [
  { key: "hub", name: "Nous (HubCentral)", port: 3007, healthPath: "/api/v1/health" },
  { key: "graf", name: "Hermes (Graf)", port: 3000, healthPath: "/health" },
  { key: "emw", name: "Iris (EMW)", port: 3001, healthPath: "/health" },
  { key: "sinergia", name: "Talanton (Sinergia)", port: 3002, healthPath: "/health" },
  { key: "apisigo", name: "Logos (ApiSigo)", port: 3004, healthPath: "/health" },
  { key: "apisoftia", name: "Mnemosyne (ApiSoftia)", port: 3005, healthPath: "/health" },
  { key: "meravuelta", name: "Talaria (MeraVuelta)", port: 3006, healthPath: "/health" },
  { key: "fiar", name: "Pistis (Fiar)", port: 8090, healthPath: "/health" },
];
