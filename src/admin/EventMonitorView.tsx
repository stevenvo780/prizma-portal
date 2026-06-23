/**
 * EventMonitorView — Monitor del Hub/event-bus (Nous) para el panel de admin Prizma.
 *
 * Muestra:
 *   - Tarjetas MetricGrid con throughput, latencia media y error-rate
 *   - Tabla DataTable de eventos recientes con Badge de estado
 *   - Sección Dead-Letter Queue (DLQ)
 *   - Salud real del Hub (fetch /api/v1/health, tolerante a fallos)
 *
 * Datos demo en es-CO. Sin dependencias nuevas. Exporta `EventMonitorView`.
 */

import * as React from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  type DataTableColumn,
  EmptyState,
  MetricGrid,
  PageHeader,
  SearchInput,
  Segmented,
  StatusDot,
  Tabs,
} from "prizma-ui";
import { Satellite, RefreshCw, Inbox, CheckCircle2 } from "lucide-react";
import { SERVICE_HEALTH, PRODUCT_BY_KEY } from "../data";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EventStatus = "procesado" | "reintento" | "DLQ";
type EventPriority = "alta" | "media" | "baja";

interface BusEvent {
  eventId: string;
  tipo: string;
  source: string;
  prioridad: EventPriority;
  estado: EventStatus;
  ts: string;
  intentos: number;
  latenciaMs: number;
}

// ─── Datos demo ───────────────────────────────────────────────────────────────

const DEMO_EVENTS: BusEvent[] = [
  { eventId: "evt-00192", tipo: "pedido.pagado",          source: "Hermes (Graf)",          prioridad: "alta",  estado: "procesado", ts: "2026-06-14 14:37:02", intentos: 1,  latenciaMs: 82  },
  { eventId: "evt-00191", tipo: "customer.update",        source: "Mnemosyne (ApiSoftia)",  prioridad: "baja",  estado: "procesado", ts: "2026-06-14 14:36:55", intentos: 1,  latenciaMs: 47  },
  { eventId: "evt-00190", tipo: "delivery.create",        source: "Talaria",   prioridad: "alta",  estado: "reintento", ts: "2026-06-14 14:36:44", intentos: 3,  latenciaMs: 310 },
  { eventId: "evt-00189", tipo: "invoice.create",         source: "Logos (ApiSigo)",        prioridad: "alta",  estado: "procesado", ts: "2026-06-14 14:36:30", intentos: 1,  latenciaMs: 135 },
  { eventId: "evt-00188", tipo: "notification.whatsapp",  source: "Iris (EMW)",             prioridad: "media", estado: "DLQ",       ts: "2026-06-14 14:35:58", intentos: 5,  latenciaMs: 0   },
  { eventId: "evt-00187", tipo: "pedido.cancelado",       source: "Hermes (Graf)",          prioridad: "media", estado: "procesado", ts: "2026-06-14 14:35:21", intentos: 1,  latenciaMs: 61  },
  { eventId: "evt-00186", tipo: "cartera.alerta",         source: "Pistis (Fiar)",          prioridad: "alta",  estado: "procesado", ts: "2026-06-14 14:34:50", intentos: 1,  latenciaMs: 99  },
  { eventId: "evt-00185", tipo: "pos.cierre",             source: "Talanton (Sinergia)",    prioridad: "baja",  estado: "procesado", ts: "2026-06-14 14:34:02", intentos: 1,  latenciaMs: 44  },
  { eventId: "evt-00184", tipo: "rpa.tarea.completada",   source: "Talos (Automatización)", prioridad: "media", estado: "reintento", ts: "2026-06-14 14:33:29", intentos: 2,  latenciaMs: 520 },
  { eventId: "evt-00183", tipo: "notification.whatsapp",  source: "Iris (EMW)",             prioridad: "media", estado: "procesado", ts: "2026-06-14 14:32:45", intentos: 1,  latenciaMs: 78  },
  { eventId: "evt-00182", tipo: "delivery.update",        source: "Talaria",   prioridad: "baja",  estado: "DLQ",       ts: "2026-06-14 14:31:18", intentos: 5,  latenciaMs: 0   },
  { eventId: "evt-00181", tipo: "invoice.anulada",        source: "Logos (ApiSigo)",        prioridad: "alta",  estado: "procesado", ts: "2026-06-14 14:30:55", intentos: 1,  latenciaMs: 110 },
  { eventId: "evt-00180", tipo: "pedido.pagado",          source: "Hermes (Graf)",          prioridad: "alta",  estado: "procesado", ts: "2026-06-14 14:30:12", intentos: 1,  latenciaMs: 74  },
  { eventId: "evt-00179", tipo: "customer.update",        source: "Mnemosyne (ApiSoftia)",  prioridad: "baja",  estado: "DLQ",       ts: "2026-06-14 14:29:38", intentos: 5,  latenciaMs: 0   },
  { eventId: "evt-00178", tipo: "rpa.tarea.fallida",      source: "Talos (Automatización)", prioridad: "alta",  estado: "reintento", ts: "2026-06-14 14:28:50", intentos: 4,  latenciaMs: 850 },
];

const DLQ_EVENTS = DEMO_EVENTS.filter((e) => e.estado === "DLQ");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function estadoBadge(estado: EventStatus) {
  if (estado === "procesado") return <Badge tone="success" dot>procesado</Badge>;
  if (estado === "reintento") return <Badge tone="warning" dot>reintento</Badge>;
  return <Badge tone="danger" dot>DLQ</Badge>;
}

function prioridadBadge(p: EventPriority) {
  if (p === "alta")  return <Badge tone="danger">alta</Badge>;
  if (p === "media") return <Badge tone="warning">media</Badge>;
  return <Badge tone="neutral">baja</Badge>;
}

// ─── Columnas tabla principal ─────────────────────────────────────────────────

const EVENT_COLUMNS: DataTableColumn<BusEvent>[] = [
  { key: "eventId",    header: "ID evento",  width: 110, sortable: true },
  { key: "tipo",       header: "Tipo",       sortable: true },
  { key: "source",     header: "Origen",     sortable: true },
  { key: "ts",         header: "Timestamp",  width: 170, sortable: true },
  { key: "prioridad",  header: "Prioridad",  width: 100, align: "center",
    render: (r) => prioridadBadge(r.prioridad) },
  { key: "intentos",   header: "Intentos",   width: 88,  align: "center", sortable: true },
  { key: "latenciaMs", header: "Latencia",   width: 96,  align: "right",  sortable: true,
    render: (r) => r.latenciaMs > 0 ? `${r.latenciaMs} ms` : <span style={{ color: "var(--c-text-subtle)" }}>—</span> },
  { key: "estado",     header: "Estado",     width: 120, align: "center",
    render: (r) => estadoBadge(r.estado) },
];

const DLQ_COLUMNS: DataTableColumn<BusEvent>[] = [
  { key: "eventId",   header: "ID evento",  width: 110 },
  { key: "tipo",      header: "Tipo" },
  { key: "source",    header: "Origen" },
  { key: "ts",        header: "Última vez",  width: 170 },
  { key: "intentos",  header: "Intentos",    width: 88,  align: "center" },
  { key: "prioridad", header: "Prioridad",   width: 100, align: "center",
    render: (r) => prioridadBadge(r.prioridad) },
  { key: "estado",    header: "Estado",      width: 120, align: "center",
    render: (r) => estadoBadge(r.estado) },
];

// ─── Sonda de salud del Hub ───────────────────────────────────────────────────

type HubHealth = "desconocido" | "activo";

/**
 * Sonda del Hub (Nous). Nous es infraestructura interna sin dominio público,
 * por lo que el navegador no puede comprobarlo cross-origin. Si hay una URL
 * pública configurada la sondeamos (no-cors -> opaca = respondió); en cualquier
 * otro caso devolvemos "desconocido" (neutro), nunca "caído" en rojo.
 */
async function probeHub(timeoutMs = 4000): Promise<HubHealth> {
  const hubDef = SERVICE_HEALTH.find((s) => s.key === "nous");
  const product = hubDef ? PRODUCT_BY_KEY[hubDef.key] : undefined;
  if (!hubDef || !product?.url || product.url.startsWith("http://localhost")) {
    return "desconocido";
  }
  let url: string;
  try {
    url = `${new URL(product.url).origin}${hubDef.healthPath}`;
  } catch {
    return "desconocido";
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: "GET", mode: "no-cors", cache: "no-store", signal: ctrl.signal });
    const ok = res.type === "opaque" || res.ok;
    return ok ? "activo" : "desconocido";
  } catch {
    return "desconocido";
  } finally {
    clearTimeout(timer);
  }
}

// ─── Métricas demo ────────────────────────────────────────────────────────────

const THROUGHPUT_SPARK = [42, 58, 71, 64, 80, 95, 88, 102, 97, 115, 110, 124];
const LATENCIA_SPARK   = [78, 82, 95, 70, 88, 110, 92, 84, 105, 79, 88, 92];
const ERROR_SPARK      = [2, 1, 3, 0, 2, 5, 4, 2, 1, 3, 2, 4];

// ─── Componente principal ─────────────────────────────────────────────────────

export function EventMonitorView() {
  // Estado de búsqueda y filtro
  const [search, setSearch] = React.useState("");
  const [filtroEstado, setFiltroEstado] = React.useState<"todos" | EventStatus>("todos");

  // Salud del Hub
  const [hubHealth, setHubHealth] = React.useState<HubHealth>("desconocido");
  const [sondeando, setSondeando] = React.useState(false);

  // Reintento seleccionado en DLQ para reintentar
  const [dlqPending, setDlqPending] = React.useState<string | null>(null);

  const runHealthProbe = React.useCallback(async () => {
    setSondeando(true);
    const result = await probeHub();
    setHubHealth(result);
    setSondeando(false);
  }, []);

  React.useEffect(() => { runHealthProbe(); }, [runHealthProbe]);

  // Filtrado de la tabla principal
  const filteredEvents = React.useMemo(() => {
    return DEMO_EVENTS.filter((e) => {
      const matchEstado = filtroEstado === "todos" || e.estado === filtroEstado;
      const q = search.toLowerCase().trim();
      const matchSearch = !q ||
        e.eventId.toLowerCase().includes(q) ||
        e.tipo.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q);
      return matchEstado && matchSearch;
    });
  }, [search, filtroEstado]);

  // Contadores
  const totalProcesados = DEMO_EVENTS.filter((e) => e.estado === "procesado").length;
  const totalReintentos = DEMO_EVENTS.filter((e) => e.estado === "reintento").length;
  const totalDLQ        = DLQ_EVENTS.length;

  const hubStatusDot: React.ReactNode = (() => {
    if (sondeando) return <StatusDot tone="info"  label="Sondeando…" pulse />;
    if (hubHealth === "activo") return <StatusDot status="online" label="Nous activo" />;
    return <StatusDot status="idle" label="No verificable" />;
  })();

  // Endpoint legible del Hub (host público si existe; si no, etiqueta neutra).
  const hubEndpointLabel = (() => {
    const url = PRODUCT_BY_KEY["nous"]?.url ?? "";
    if (!url || url.startsWith("http://localhost")) return "interno · sin endpoint público";
    try {
      return `${new URL(url).origin}/api/v1/health`;
    } catch {
      return "endpoint no disponible";
    }
  })();

  // Tab: eventos recientes
  const tabEventos = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Barra de filtros */}
      <div className="cui-row cui-row--wrap" style={{ gap: 12 }}>
        <SearchInput
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
          placeholder="Buscar por ID, tipo u origen…"
          style={{ maxWidth: 340 }}
        />
        <Segmented
          value={filtroEstado}
          onChange={(v) => setFiltroEstado(v as typeof filtroEstado)}
          options={[
            { value: "todos",     label: "Todos" },
            { value: "procesado", label: "Procesados" },
            { value: "reintento", label: "Reintentos" },
            { value: "DLQ",       label: "DLQ" },
          ]}
        />
      </div>

      <DataTable<BusEvent>
        columns={EVENT_COLUMNS}
        rows={filteredEvents}
        rowKey={(r) => r.eventId}
        sortable
        pageSize={8}
        compact
        ariaLabel="Eventos recientes del bus"
        empty={
          <EmptyState
            icon={<Inbox size={32} aria-hidden />}
            title="Sin eventos"
            description="No hay eventos que coincidan con el filtro actual."
          />
        }
      />
    </div>
  );

  // Tab: Dead-Letter Queue
  const tabDLQ = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {DLQ_EVENTS.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={32} aria-hidden style={{ color: "var(--c-success)" }} />}
          title="DLQ vacía"
          description="Ningún evento ha superado el límite de reintentos. El bus está limpio."
        />
      ) : (
        <>
          <div className="cui-row cui-row--wrap" style={{ gap: 8 }}>
            <Badge tone="danger" dot>{DLQ_EVENTS.length} eventos muertos</Badge>
            <span style={{ fontSize: 13, color: "var(--c-text-muted)" }}>
              Eventos que superaron 5 intentos sin éxito y requieren intervención manual o re-encolado.
            </span>
          </div>

          <DataTable<BusEvent>
            columns={[
              ...DLQ_COLUMNS,
              {
                key: "eventId" as keyof BusEvent,
                header: "Acción",
                width: 120,
                align: "center",
                render: (r) => (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setDlqPending(r.eventId)}
                  >
                    Re-encolar
                  </Button>
                ),
              },
            ]}
            rows={DLQ_EVENTS}
            rowKey={(r) => r.eventId}
            compact
            ariaLabel="Cola de mensajes muertos (DLQ)"
          />

          {dlqPending && (
            <Card>
              <CardBody>
                <div className="cui-row" style={{ gap: 12, flexWrap: "wrap" }}>
                  <Badge tone="warning">Confirmación requerida</Badge>
                  <span style={{ fontSize: 14 }}>
                    ¿Re-encolar evento <code>{dlqPending}</code> en el bus de Nous?
                  </span>
                  <div className="cui-row" style={{ gap: 8, marginLeft: "auto" }}>
                    <Button variant="ghost" size="sm" onClick={() => setDlqPending(null)}>
                      Cancelar
                    </Button>
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => {
                        // En producción: POST /api/v1/events/{id}/retry
                        setDlqPending(null);
                      }}
                    >
                      Confirmar re-encolado
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </div>
  );

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Cabecera de página */}
      <PageHeader
        title="Monitor de Eventos — Nous"
        description="Observabilidad en tiempo real del Hub/event-bus del ecosistema Prizma."
        icon={<Satellite size={22} aria-hidden />}
        bordered
        actions={
          <div className="cui-row" style={{ gap: 10 }}>
            {hubStatusDot}
            <Button
              variant="secondary"
              size="sm"
              onClick={runHealthProbe}
              disabled={sondeando}
              leftIcon={<RefreshCw size={14} aria-hidden className={sondeando ? "pzl-spin" : undefined} />}
            >
              {sondeando ? "Verificando…" : "Verificar salud"}
            </Button>
          </div>
        }
      />

      {/* Métricas principales */}
      <MetricGrid
        aria-label="Métricas del event-bus"
        metrics={[
          {
            id: "throughput",
            label: "Throughput (últ. hora)",
            value: "124 evt/min",
            delta: "+9%",
            trend: "up",
            sparkline: THROUGHPUT_SPARK,
            sparklineLabel: "Tendencia throughput",
          },
          {
            id: "latencia",
            label: "Latencia media",
            value: "92 ms",
            delta: "-6 ms",
            trend: "up",
            sparkline: LATENCIA_SPARK,
            sparklineLabel: "Tendencia latencia",
          },
          {
            id: "error-rate",
            label: "Tasa de error",
            value: "2.6%",
            delta: "+0.4%",
            trend: "down",
            sparkline: ERROR_SPARK,
            sparklineLabel: "Tendencia errores",
          },
          {
            id: "procesados",
            label: "Procesados",
            value: String(totalProcesados),
            delta: "en esta sesión",
          },
          {
            id: "reintentos",
            label: "En reintento",
            value: String(totalReintentos),
            delta: totalReintentos > 0 ? `${totalReintentos} pendientes` : "limpio",
            trend: totalReintentos > 0 ? "down" : undefined,
          },
          {
            id: "dlq-count",
            label: "Dead-Letter Queue",
            value: String(totalDLQ),
            delta: totalDLQ > 0 ? "requieren atención" : "vacía",
            trend: totalDLQ > 0 ? "down" : undefined,
          },
        ]}
        minTileWidth={180}
        maxColumns={6}
      />

      {/* Panel de salud del Hub */}
      <Card>
        <CardHeader
          title="Estado del Hub — Nous (HubCentral)"
          subtitle="Conexión en tiempo real al endpoint /api/v1/health vía sondeo tolerante a CORS."
          action={
            <div className="cui-row" style={{ gap: 8 }}>
              {hubStatusDot}
            </div>
          }
        />
        {/* A11Y-06: aria-live para anunciar cambios de salud del Hub a AT */}
        <CardBody aria-live="polite" aria-atomic="true">
          <div className="cui-row cui-row--wrap" style={{ gap: 16, fontSize: 14 }}>
            <div>
              <span style={{ color: "var(--c-text-muted)" }}>Endpoint: </span>
              <code>{hubEndpointLabel}</code>
            </div>
            <div>
              <span style={{ color: "var(--c-text-muted)" }}>Estado actual: </span>
              {hubHealth === "activo"      && <Badge tone="success" dot>activo</Badge>}
              {hubHealth === "desconocido" && <Badge tone="neutral" dot>no verificable</Badge>}
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span style={{ fontSize: 12, color: "var(--c-text-subtle)" }}>
                Último sondeo: {new Date().toLocaleTimeString("es-CO")}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs: Eventos recientes + DLQ */}
      <Tabs
        defaultValue="eventos"
        tabs={[
          {
            key: "eventos",
            label: (
              <span className="cui-row" style={{ gap: 6 }}>
                Eventos recientes
                <Badge tone="neutral">{DEMO_EVENTS.length}</Badge>
              </span>
            ),
            content: tabEventos,
          },
          {
            key: "dlq",
            label: (
              <span className="cui-row" style={{ gap: 6 }}>
                Dead-Letter Queue
                {totalDLQ > 0
                  ? <Badge tone="danger">{totalDLQ}</Badge>
                  : <Badge tone="neutral">0</Badge>}
              </span>
            ),
            content: tabDLQ,
          },
        ]}
      />
    </section>
  );
}
