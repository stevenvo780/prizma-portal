/**
 * CockpitView.tsx — Dashboard unificador ("Cockpit") de la suite Prizma.
 *
 * Vista de inicio del Portal. Compone los widgets de prizma-ui@1.1.0:
 *   1. ServiceHealthGrid    — salud up/down/degraded de los módulos (fetch tolerante).
 *   2. KpiTile (fila)       — KPIs cross-módulo con delta direccional real.
 *   3. ActivityFeed         — eventos del Hub (Nous) + sección DLQ con "Re-encolar".
 *   4. AppLauncher          — lanzadores por módulo con control de rol (useSession).
 *   5. OnboardingChecklist  — puesta en marcha de la suite, progreso persistente.
 *
 * Todos los datos son demo realista es-CO. Las llamadas de red son tolerantes:
 * cualquier error de CORS/red/timeout degrada al estado en caché, nunca lanza.
 */

import * as React from "react";
import {
  ServiceHealthGrid,
  KpiTile,
  ActivityFeed,
  AppLauncher,
  OnboardingChecklist,
  ConfirmDialog,
  Money,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  formatCOP,
  type ServiceHealthEntry,
  type ServiceStatus,
  type ActivityEvent,
  type AppModule,
  type OnboardingStep,
} from "prizma-ui";
import {
  ShoppingCart,
  Banknote,
  Megaphone,
  CreditCard,
  Truck,
  RefreshCw,
  ArrowRight,
  Star,
} from "lucide-react";
import {
  PRODUCTS,
  SERVICE_HEALTH,
  PRODUCT_BY_KEY,
  MODULE_ICON,
  externalHref,
  type ModuleKey,
  type ServiceHealthDef,
} from "./data";
import { useSession, type UserRole } from "./session";

/* ════════════════════════════════════════════════════════════ 1. salud ══ */

/**
 * URL pública del servicio para el sondeo. Preferimos el subdominio real de
 * cada módulo de cara al cliente (p. ej. https://hermes.prisma-enterprice.cloud)
 * sobre el localhost de desarrollo: así, en producción, el chequeo apunta al
 * host vivo y no a un puerto local inexistente. Si la app no expone una URL
 * pública (conectores internos), devolvemos null -> estado neutro, nunca rojo.
 */
function publicHealthUrl(def: ServiceHealthDef): string | null {
  const product = PRODUCT_BY_KEY[def.key];
  const url = product?.url;
  if (!url) return null;
  // Solo apps de cara al cliente tienen subdominio verificable desde el portal.
  // El resto (conectores sin frontend) no se puede comprobar cross-origin.
  if (!product?.customerFacing) return null;
  try {
    const base = new URL(url);
    return `${base.origin}${def.healthPath}`;
  } catch {
    return null;
  }
}

/**
 * Sonda tolerante de un servicio.
 *
 * Realidad cross-origin: el portal vive en prisma-enterprice.cloud y no puede
 * leer el cuerpo de un /health en otro subdominio (CORS). Con `no-cors` la
 * respuesta es opaca: si llega, el socket respondió -> "up". Si no hay URL
 * pública o el host no responde, NO marcamos "down" (rojo alarmante): lo
 * dejamos en "degraded" (neutro), porque la imposibilidad de comprobar no es
 * lo mismo que una caída confirmada. Así el widget nunca se ve "roto".
 */
async function probeHealth(
  def: ServiceHealthDef,
  timeoutMs = 4000,
): Promise<{ status: ServiceStatus; latencyMs?: number }> {
  const url = publicHealthUrl(def);
  if (!url) return { status: "degraded" }; // sin endpoint verificable -> neutro
  const started =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      signal: ctrl.signal,
    });
    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const latencyMs = Math.round(now - started);
    // Opaque (no-cors) -> status 0, pero significa que el socket respondió.
    const answered = res.type === "opaque" || res.ok;
    if (!answered) return { status: "degraded", latencyMs };
    return { status: latencyMs > 1200 ? "degraded" : "up", latencyMs };
  } catch {
    // No pudimos comprobar (CORS/red/timeout). Neutro, no "caído".
    return { status: "degraded" };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Deep-link URL para la tarjeta de salud de un servicio. Solo devolvemos un
 * enlace cuando la app tiene frontend público vivo (root = 200); los conectores
 * internos y placeholders no llevan href para no renderizar enlaces muertos
 * (ServiceHealthGrid renderiza un <div> sin enlace cuando url es undefined).
 */
function serviceUrl(key: string): string | undefined {
  const p = PRODUCT_BY_KEY[key];
  return p ? externalHref(p) : undefined;
}

function useServiceHealth() {
  const [entries, setEntries] = React.useState<ServiceHealthEntry[]>(() =>
    SERVICE_HEALTH.map((def) => ({
      key: def.key,
      label: def.name,
      // Estado neutro de partida hasta que el primer sondeo resuelva.
      status: "degraded" as ServiceStatus,
      url: serviceUrl(def.key),
    })),
  );
  const [scanning, setScanning] = React.useState(false);

  const scan = React.useCallback(async () => {
    setScanning(true);
    const checkedAt = new Date().toISOString();
    const results = await Promise.all(
      SERVICE_HEALTH.map(async (def) => {
        const { status, latencyMs } = await probeHealth(def);
        return {
          key: def.key,
          label: def.name,
          status,
          latencyMs,
          url: serviceUrl(def.key),
          checkedAt,
        } satisfies ServiceHealthEntry;
      }),
    );
    setEntries(results);
    setScanning(false);
  }, []);

  React.useEffect(() => {
    void scan();
  }, [scan]);

  return { entries, scanning, scan };
}

/* ══════════════════════════════════════════════════════════════ 2. kpis ══ */

interface KpiDatum {
  label: string;
  /** Current period value. */
  value: number;
  /** Previous period value — delta is derived, never hardcoded. */
  previous: number;
  /** Render as Colombian pesos via <Money>. */
  money?: boolean;
  icon: React.ReactNode;
  context: string;
}

/** Demo realista es-CO. El delta % se computa desde value/previous. */
const KPI_DATA: KpiDatum[] = [
  { label: "Pedidos hoy", value: 184, previous: 162, icon: <ShoppingCart size={18} aria-hidden />, context: "vs. ayer" },
  { label: "Ventas (Talanton)", value: 18_640_000, previous: 17_120_000, money: true, icon: <Banknote size={18} aria-hidden />, context: "vs. ayer" },
  { label: "Mensajes Iris", value: 5_320, previous: 5_870, icon: <Megaphone size={18} aria-hidden />, context: "WhatsApp · vs. ayer" },
  { label: "Crédito vigente (Pistis)", value: 42_300_000, previous: 39_900_000, money: true, icon: <CreditCard size={18} aria-hidden />, context: "cartera activa" },
  { label: "Entregas Talaria", value: 96, previous: 96, icon: <Truck size={18} aria-hidden />, context: "en ruta hoy" },
];

/** Signed percentage change between two periods; 0 when previous is 0. */
function deltaPercent(value: number, previous: number): number {
  if (previous === 0) return 0;
  return ((value - previous) / previous) * 100;
}

function KpiRow() {
  return (
    <section aria-label="Indicadores cross-módulo">
      <div
        className="cui-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}
      >
        {KPI_DATA.map((k) => {
          const pct = deltaPercent(k.value, k.previous);
          return (
            <KpiTile
              key={k.label}
              label={k.label}
              icon={k.icon}
              // delta direccional REAL derivado de value/previous (no hardcodeado)
              deltaPercent={Number(pct.toFixed(1))}
              context={k.context}
              value={
                k.money ? <Money value={k.value} currency="COP" /> : k.value.toLocaleString("es-CO")
              }
            />
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════ 3. activity/dlq ══ */

type FeedStatus = "procesado" | "reintento" | "dlq";

interface HubEvent {
  eventId: string;
  /** Event type, e.g. "pedido.pagado". */
  type: string;
  /** Emitting module (display name). */
  source: string;
  /** Pipeline outcome. */
  outcome: FeedStatus;
  ts: string;
}

/** ISO timestamp N minutes ago (stable per render via a base date). */
function minsAgo(base: number, mins: number): string {
  return new Date(base - mins * 60_000).toISOString();
}

function buildEvents(base: number): HubEvent[] {
  return [
    { eventId: "evt-9f21", type: "pedido.pagado", source: "Hermes", outcome: "procesado", ts: minsAgo(base, 2) },
    { eventId: "evt-9f22", type: "invoice.create", source: "Logos", outcome: "procesado", ts: minsAgo(base, 3) },
    { eventId: "evt-9f23", type: "delivery.create", source: "Talaria", outcome: "reintento", ts: minsAgo(base, 6) },
    { eventId: "evt-9f24", type: "notification.whatsapp", source: "Iris", outcome: "procesado", ts: minsAgo(base, 8) },
    { eventId: "evt-9f25", type: "customer.update", source: "Mnemosyne", outcome: "procesado", ts: minsAgo(base, 12) },
    { eventId: "evt-9f26", type: "invoice.create", source: "Logos", outcome: "dlq", ts: minsAgo(base, 21) },
    { eventId: "evt-9f27", type: "credit.assess", source: "Pistis", outcome: "dlq", ts: minsAgo(base, 34) },
  ];
}

const OUTCOME_TO_STATUS: Record<FeedStatus, ActivityEvent["status"]> = {
  procesado: "success",
  reintento: "warning",
  dlq: "error",
};

function outcomeBadge(outcome: FeedStatus) {
  if (outcome === "procesado") return <Badge tone="success" dot>procesado</Badge>;
  if (outcome === "reintento") return <Badge tone="warning" dot>reintento</Badge>;
  return <Badge tone="danger" dot>DLQ</Badge>;
}

function HubActivity() {
  // Base timestamp captured once so the feed is stable across re-renders.
  const baseRef = React.useRef(Date.now());
  const [events, setEvents] = React.useState<HubEvent[]>(() => buildEvents(baseRef.current));
  const [hasBackend] = React.useState(false); // tolerante: sin backend mostramos demo
  const [requeueId, setRequeueId] = React.useState<string | null>(null);
  const [requeuing, setRequeuing] = React.useState(false);

  const dlq = events.filter((e) => e.outcome === "dlq");

  const activityEvents: ActivityEvent[] = events.map((e) => ({
    eventId: e.eventId,
    type: e.type,
    source: e.source,
    status: OUTCOME_TO_STATUS[e.outcome],
    ts: e.ts,
    description: (
      <span className="cui-row" style={{ gap: 8 }}>
        <code style={{ fontSize: 12 }}>{e.type}</code>
        {outcomeBadge(e.outcome)}
      </span>
    ),
  }));

  const confirmRequeue = React.useCallback(async () => {
    if (!requeueId) return;
    setRequeuing(true);
    try {
      // Intento tolerante: POST al re-encolado del Hub. Si no hay backend, se
      // ignora el error y se actualiza el estado local de forma optimista.
      await fetch("/api/v1/dlq/requeue", {
        method: "POST",
        mode: "no-cors",
        cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eventId: requeueId }),
      }).catch(() => undefined);
    } finally {
      // Optimista: el evento DLQ pasa a "reintento".
      setEvents((prev) =>
        prev.map((e) =>
          e.eventId === requeueId ? { ...e, outcome: "reintento" as FeedStatus } : e,
        ),
      );
      setRequeuing(false);
      setRequeueId(null);
    }
  }, [requeueId]);

  return (
    <section
      className="cui-grid"
      style={{ gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 20, alignItems: "start" }}
    >
      <ActivityFeed
        heading="Actividad del Hub (Nous)"
        events={activityEvents}
        maxVisible={5}
        loadMoreLabel="Ver más eventos"
      />

      <Card data-module="nous">
        <CardHeader
          title="Cola de errores (DLQ)"
          subtitle={`${dlq.length} evento(s) sin procesar`}
          action={dlq.length > 0 ? <Badge tone="danger">{dlq.length}</Badge> : <Badge tone="success">limpia</Badge>}
        />
        <CardBody style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dlq.length === 0 ? (
            <EmptyState
              title="Sin eventos en DLQ"
              description="Todos los eventos se procesaron correctamente."
            />
          ) : (
            dlq.map((e) => (
              <div
                key={e.eventId}
                className="cui-row cui-row--between"
                style={{ gap: 12, padding: "8px 0", borderBottom: "1px solid var(--c-border)" }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{e.source}</div>
                  <code style={{ fontSize: 12, color: "var(--c-text-subtle)" }}>{e.type}</code>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRequeueId(e.eventId)}
                  leftIcon={<RefreshCw size={14} aria-hidden />}
                >
                  Re-encolar
                </Button>
              </div>
            ))
          )}
          {!hasBackend && (
            <p style={{ fontSize: 12, color: "var(--c-text-subtle)", marginTop: 4 }}>
              Modo demo: sin Hub conectado, las acciones se simulan localmente.
            </p>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={requeueId !== null}
        onClose={() => setRequeueId(null)}
        onConfirm={() => void confirmRequeue()}
        loading={requeuing}
        title="Re-encolar evento"
        message={
          requeueId
            ? `El evento ${requeueId} volverá a la cola de procesamiento del Hub. ¿Continuar?`
            : ""
        }
        confirmLabel="Re-encolar"
        cancelLabel="Cancelar"
      />
    </section>
  );
}

/* ════════════════════════════════════════════════════════════ 4. launcher ══ */

/**
 * Role gating per module. Roles allowed to launch each product.
 * Empty / omitted => visible para todos. "nous" (interno) solo admin.
 */
const MODULE_ROLES: Partial<Record<ModuleKey, UserRole[]>> = {
  hermes: ["admin", "operador", "viewer"],
  iris: ["admin", "operador", "viewer"],
  talaria: ["admin", "operador", "viewer"],
  talanton: ["admin", "operador"],
  pistis: ["admin", "operador"],
  logos: ["admin", "operador"],
  mnemosyne: ["admin", "operador"],
  peitho: ["admin", "operador"],
  talos: ["admin"],
  nous: ["admin"], // Nous (interno) — solo administradores
};

function SuiteLauncher({ onLaunch }: { onLaunch?: (module: AppModule) => void }) {
  const { user } = useSession();

  const modules: AppModule[] = PRODUCTS.map((p) => {
    const roles = MODULE_ROLES[p.key] ?? [];
    const allowed = roles.length === 0 || roles.includes(user.role);
    const Icon = MODULE_ICON[p.key];
    return {
      key: p.key,
      label: p.name,
      icon: <Icon size={18} aria-hidden />,
      // Solo apps con frontend público vivo abren enlace externo; el resto
      // (conectores internos / placeholders) navegan a su ficha interna vía
      // onLaunch para no producir enlaces muertos (404 / DNS fail).
      href: externalHref(p),
      // El widget oculta módulos cuyo `roles` no incluye el rol del usuario.
      roles,
      description: `${p.tagline} (ex-${p.aka})`,
      badge: p.star ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Star size={11} fill="currentColor" aria-hidden /> estrella
        </span>
      ) : p.internal ? "interno" : undefined,
      // Si el rol no alcanza, lo dejamos visible pero inhabilitado para que el
      // usuario sepa que existe (salvo "nous", que se oculta por completo).
      disabled: !allowed && p.key !== "nous",
    };
  });

  return (
    <AppLauncher
      heading="Tu panteón — abrir un módulo"
      modules={modules}
      userRoles={[user.role]}
      onLaunch={onLaunch}
    />
  );
}

/* ═══════════════════════════════════════════════════════ 5. onboarding ══ */

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "connect-siigo",
    // Logos es un conector interno (sin UI pública): su root daría 404, así que
    // el paso no lleva enlace externo muerto; se configura desde la suite.
    label: "Conectar facturación (Siigo / Logos)",
    description: "Vincula tu cuenta de facturación electrónica para emitir documentos.",
  },
  {
    id: "connect-crm",
    label: "Sincronizar clientes (Mnemosyne)",
    description: "Importa tu base de clientes desde el CRM para personalizar la operación.",
  },
  {
    id: "activate-modules",
    label: "Activar módulos del plan",
    description: "Enciende Hermes, Iris, Talanton y Talaria según tu operación.",
  },
  {
    id: "invite-users",
    label: "Invitar usuarios y asignar roles",
    description: "Suma a tu equipo y define quién es admin, operador o viewer.",
  },
  {
    id: "first-flow",
    label: "Probar el primer flujo (pedido, factura y entrega)",
    description: "Genera un pedido de prueba y observa el flujo orquestado por Nous.",
  },
];

/* ═══════════════════════════════════════════════════════════ cockpit view ══ */

export interface CockpitViewProps {
  /** Navega a una vista interna del portal (ej. abrir un módulo o el estado). */
  onNavigate?: (moduleKey: ModuleKey) => void;
  /** Navega a la vista de estado del sistema. */
  onOpenStatus?: () => void;
}

export function CockpitView({ onNavigate, onOpenStatus }: CockpitViewProps) {
  const { user, tenant } = useSession();
  const { entries, scanning, scan } = useServiceHealth();

  const upCount = entries.filter((e) => e.status === "up").length;
  const downCount = entries.filter((e) => e.status === "down").length;

  const handleLaunch = React.useCallback(
    (m: AppModule) => {
      // Deep-link real al módulo. Si hay handler de navegación interna, también
      // lo notificamos (analytics / SPA). El href del tile abre la URL del módulo.
      onNavigate?.(m.key as ModuleKey);
    },
    [onNavigate],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      {/* Encabezado del cockpit */}
      <header id="cockpit-header" className="cui-row cui-row--between cui-row--wrap" style={{ gap: 12 }}>
        <div>
          <div className="cui-row" style={{ gap: 10 }}>
            <h1 style={{ fontSize: 28 }}>Cockpit</h1>
            <Badge tone="primary">{tenant.nombre}</Badge>
          </div>
          <p style={{ color: "var(--c-text-muted)", marginTop: 4 }}>
            Hola, {user.name}. Salud, indicadores y operación de toda la suite en un solo lugar.
          </p>
        </div>
        <div className="cui-row" style={{ gap: 8 }}>
          <Badge tone={downCount > 0 ? "danger" : upCount > 0 ? "success" : "neutral"}>
            {downCount > 0
              ? `${downCount} con incidencia`
              : upCount > 0
              ? `${upCount} verificado${upCount !== 1 ? "s" : ""}`
              : "Estado en vivo"}
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void scan()}
            disabled={scanning}
            leftIcon={<RefreshCw size={14} aria-hidden className={scanning ? "pzl-spin" : undefined} />}
          >
            {scanning ? "Sondeando…" : "Re-escanear"}
          </Button>
        </div>
      </header>

      {/* 1. Salud de servicios */}
      <section id="cockpit-health" aria-label="Salud de servicios">
        <ServiceHealthGrid heading="Salud de la suite" services={entries} columns={4} />
        <p style={{ color: "var(--c-text-subtle)", fontSize: 12, margin: "8px 2px 0" }}>
          Se comprueban en vivo las apps con dominio público. Los conectores internos
          muestran estado neutro: su salida no es verificable desde el navegador.
        </p>
      </section>

      {/* 2. KPIs cross-módulo */}
      <div id="cockpit-kpis">
        <KpiRow />
      </div>

      {/* 3. Actividad del Hub + DLQ */}
      <div id="cockpit-activity">
        <HubActivity />
      </div>

      {/* 4. App launcher con control de rol */}
      <div id="cockpit-launcher">
        <SuiteLauncher onLaunch={handleLaunch} />
      </div>

      {/* 5. Onboarding de la suite */}
      <section
        id="cockpit-onboarding"
        className="cui-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}
      >
        <OnboardingChecklist
          heading="Pon en marcha tu suite"
          steps={ONBOARDING_STEPS}
          storageKey={`cui-onboarding:${tenant.id}`}
          resetLabel="Reiniciar progreso"
        />
        <Card>
          <CardHeader title="Estado del sistema" subtitle="Detalle servicio a servicio" />
          <CardBody style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ color: "var(--c-text-muted)", fontSize: 14 }}>
              Revisa latencias, puertos y el sondeo a <code>/health</code> de cada servicio.
            </p>
            <Button
              variant="module"
              size="md"
              onClick={() => onOpenStatus?.()}
              rightIcon={<ArrowRight size={16} aria-hidden />}
            >
              Abrir estado del sistema
            </Button>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
