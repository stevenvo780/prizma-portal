import * as React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  DataTable,
  type DataTableColumn,
  Badge,
  type BadgeTone,
  Button,
  SearchInput,
  Segmented,
  type SegmentedOption,
  StatusDot,
  PageHeader,
  MetricGrid,
  EmptyState,
  Select,
} from "prizma-ui";
import { ScrollText, Search } from "lucide-react";

/* ----------------------------------------------------------------- types -- */

type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "EXPORT"
  | "VIEW"
  | "CONFIG";

type AuditModule =
  | "Todos"
  | "Hermes"
  | "Iris"
  | "Talaria"
  | "Talanton"
  | "Pistis"
  | "Logos"
  | "Mnemosyne"
  | "Nous"
  | "Talos"
  | "Peitho";

interface AuditEntry {
  id: string;
  timestamp: string;        // ISO string
  actor: string;
  actorRole: string;
  action: AuditAction;
  module: Exclude<AuditModule, "Todos">;
  description: string;
  ip: string;
  result: "ok" | "error" | "warn";
}

/* ------------------------------------------------------------------ data -- */

const DEMO_ENTRIES: AuditEntry[] = [
  { id: "a001", timestamp: "2026-06-14T08:02:11Z", actor: "juan.castro@prizma.co", actorRole: "Admin", action: "LOGIN",  module: "Nous",       description: "Inicio de sesión exitoso",                          ip: "190.85.143.12",  result: "ok"    },
  { id: "a002", timestamp: "2026-06-14T08:05:44Z", actor: "laura.perez@prizma.co", actorRole: "Operador", action: "CREATE", module: "Talaria", description: "Creó pedido de entrega #ENT-2981",                ip: "190.85.143.17",  result: "ok"    },
  { id: "a003", timestamp: "2026-06-14T08:11:07Z", actor: "miguel.torres@prizma.co", actorRole: "Admin", action: "CONFIG", module: "Nous",    description: "Actualizó variables de entorno del ecosistema",    ip: "200.13.55.201",  result: "ok"    },
  { id: "a004", timestamp: "2026-06-14T08:23:30Z", actor: "ana.gomez@prizma.co",  actorRole: "Comercial", action: "UPDATE", module: "Hermes", description: "Actualizó precio de producto Camiseta Ref. 4421", ip: "190.85.143.22",  result: "ok"    },
  { id: "a005", timestamp: "2026-06-14T08:31:52Z", actor: "root@sistema",         actorRole: "Sistema",  action: "CREATE", module: "Logos",   description: "Emitió factura electrónica CUFE-88192",            ip: "10.0.0.1",       result: "ok"    },
  { id: "a006", timestamp: "2026-06-14T08:45:18Z", actor: "laura.perez@prizma.co", actorRole: "Operador", action: "VIEW",   module: "Pistis",  description: "Consultó cartera vencida — cliente Moda Rápida",   ip: "190.85.143.17",  result: "ok"    },
  { id: "a007", timestamp: "2026-06-14T09:01:44Z", actor: "desconocido",          actorRole: "—",        action: "LOGIN",  module: "Nous",    description: "Intento de acceso con credenciales inválidas",     ip: "185.220.101.34", result: "error" },
  { id: "a008", timestamp: "2026-06-14T09:03:02Z", actor: "desconocido",          actorRole: "—",        action: "LOGIN",  module: "Nous",    description: "Segundo intento fallido — IP bloqueada (2/5)",     ip: "185.220.101.34", result: "error" },
  { id: "a009", timestamp: "2026-06-14T09:15:29Z", actor: "juan.castro@prizma.co", actorRole: "Admin",    action: "DELETE", module: "Hermes",  description: "Eliminó variante de producto Sudadera Ref. 9901",  ip: "200.13.55.201",  result: "warn"  },
  { id: "a010", timestamp: "2026-06-14T09:22:05Z", actor: "carlos.r@prizma.co",   actorRole: "Marketing", action: "EXPORT", module: "Iris",    description: "Exportó lista de segmento 'Clientes VIP' (4 218)", ip: "190.85.144.88",  result: "ok"    },
  { id: "a011", timestamp: "2026-06-14T09:38:51Z", actor: "root@sistema",         actorRole: "Sistema",  action: "UPDATE", module: "Mnemosyne", description: "Sincronizó 312 registros de clientes con CRM",   ip: "10.0.0.2",       result: "ok"    },
  { id: "a012", timestamp: "2026-06-14T09:55:00Z", actor: "ana.gomez@prizma.co",  actorRole: "Comercial", action: "CREATE", module: "Hermes",  description: "Creó campaña flash 'Descuento Padre 15%'",         ip: "190.85.143.22",  result: "ok"    },
  { id: "a013", timestamp: "2026-06-14T10:10:22Z", actor: "juan.castro@prizma.co", actorRole: "Admin",    action: "CONFIG", module: "Talos",   description: "Activó regla de automatización OCR-Facturas",      ip: "200.13.55.201",  result: "ok"    },
  { id: "a014", timestamp: "2026-06-14T10:18:47Z", actor: "root@sistema",         actorRole: "Sistema",  action: "CREATE", module: "Logos",   description: "Emitió nota crédito NC-0032 (error corrección)",   ip: "10.0.0.1",       result: "warn"  },
  { id: "a015", timestamp: "2026-06-14T10:35:13Z", actor: "miguel.torres@prizma.co", actorRole: "Admin", action: "UPDATE", module: "Talanton", description: "Ajustó inventario: +50 u. Camisa Formal Ref 2204",ip: "200.13.55.201",  result: "ok"    },
  { id: "a016", timestamp: "2026-06-14T10:52:04Z", actor: "laura.perez@prizma.co", actorRole: "Operador", action: "UPDATE", module: "Talaria", description: "Reasignó entrega #ENT-2981 a mensajero ID-44",    ip: "190.85.143.17",  result: "ok"    },
  { id: "a017", timestamp: "2026-06-14T11:05:33Z", actor: "carlos.r@prizma.co",   actorRole: "Marketing", action: "CREATE", module: "Peitho",  description: "Publicó post en Instagram: 'Día del Padre 2026'", ip: "190.85.144.88",  result: "ok"    },
  { id: "a018", timestamp: "2026-06-14T11:21:09Z", actor: "root@sistema",         actorRole: "Sistema",  action: "CREATE", module: "Iris",    description: "Disparó campaña masiva WhatsApp (3 714 mensajes)", ip: "10.0.0.3",       result: "ok"    },
  { id: "a019", timestamp: "2026-06-14T11:44:58Z", actor: "juan.castro@prizma.co", actorRole: "Admin",    action: "EXPORT", module: "Nous",    description: "Exportó log de auditoría completo (últimas 72 h)", ip: "200.13.55.201",  result: "ok"    },
  { id: "a020", timestamp: "2026-06-14T12:00:00Z", actor: "juan.castro@prizma.co", actorRole: "Admin",    action: "LOGOUT", module: "Nous",    description: "Cierre de sesión",                                 ip: "200.13.55.201",  result: "ok"    },
];

/* --------------------------------------------------------------- helpers -- */

const ACTION_TONE: Record<AuditAction, BadgeTone> = {
  LOGIN:  "success",
  LOGOUT: "neutral",
  CREATE: "primary",
  UPDATE: "info",
  DELETE: "danger",
  EXPORT: "warning",
  VIEW:   "neutral",
  CONFIG: "module",
};

const ACTION_LABEL: Record<AuditAction, string> = {
  LOGIN:  "Acceso",
  LOGOUT: "Salida",
  CREATE: "Crear",
  UPDATE: "Editar",
  DELETE: "Eliminar",
  EXPORT: "Exportar",
  VIEW:   "Consulta",
  CONFIG: "Config",
};

const RESULT_STATUS = {
  ok:    { status: "online",  label: "OK"    } as const,
  warn:  { status: "idle",    label: "Alerta" } as const,
  error: { status: "busy",    label: "Error" } as const,
};

function fmtTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-CO", {
    day:    "2-digit",
    month:  "2-digit",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/* -------------------------------------------------------- module options -- */

const ALL_MODULES: AuditModule[] = [
  "Todos", "Hermes", "Iris", "Talaria", "Talanton",
  "Pistis", "Logos", "Mnemosyne", "Nous", "Talos", "Peitho",
];

const SEGMENTED_OPTS: SegmentedOption[] = ALL_MODULES.slice(0, 6).map((m) => ({
  label: m,
  value: m,
}));

/* ----------------------------------------------------------- main summary -- */

function buildMetrics(entries: AuditEntry[]) {
  const errors  = entries.filter((e) => e.result === "error").length;
  const warns   = entries.filter((e) => e.result === "warn").length;
  const deletes = entries.filter((e) => e.action === "DELETE").length;
  const actors  = new Set(entries.map((e) => e.actor)).size;
  // StatDirection es "up" | "down"; omitimos trend (undefined) para neutral.
  return [
    { id: "total",   label: "Eventos totales",   value: String(entries.length) },
    { id: "actors",  label: "Actores únicos",     value: String(actors) },
    { id: "errors",  label: "Errores de acceso",  value: String(errors),  delta: errors > 0 ? `+${errors}` : "0", trend: errors > 0 ? ("down" as const) : undefined },
    { id: "warns",   label: "Alertas",            value: String(warns),   delta: warns > 0  ? `+${warns}`  : "0", trend: warns > 0  ? ("down" as const) : undefined },
    { id: "deletes", label: "Eliminaciones",      value: String(deletes), delta: deletes > 0 ? `+${deletes}` : "0" },
  ];
}

/* ---------------------------------------------------------- column defs -- */

const COLUMNS: DataTableColumn<AuditEntry>[] = [
  {
    key: "timestamp",
    header: "Fecha / Hora",
    sortable: true,
    width: 170,
    render: (row) => (
      <span style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", fontSize: 13, color: "var(--c-text-muted)" }}>
        {fmtTimestamp(row.timestamp)}
      </span>
    ),
  },
  {
    key: "actor",
    header: "Actor",
    sortable: true,
    width: 200,
    render: (row) => (
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{row.actor}</div>
        <div style={{ fontSize: 11, color: "var(--c-text-subtle)" }}>{row.actorRole}</div>
      </div>
    ),
  },
  {
    key: "action",
    header: "Acción",
    sortable: true,
    width: 100,
    render: (row) => (
      <Badge tone={ACTION_TONE[row.action]}>{ACTION_LABEL[row.action]}</Badge>
    ),
  },
  {
    key: "module",
    header: "Módulo",
    sortable: true,
    width: 110,
    render: (row) => (
      <Badge tone="module">{row.module}</Badge>
    ),
  },
  {
    key: "description",
    header: "Descripción",
    render: (row) => (
      <span style={{ fontSize: 13 }}>{row.description}</span>
    ),
  },
  {
    key: "ip",
    header: "IP",
    width: 140,
    render: (row) => (
      <code style={{ fontSize: 12 }}>{row.ip}</code>
    ),
  },
  {
    key: "result",
    header: "Resultado",
    width: 90,
    align: "center",
    render: (row) => {
      const r = RESULT_STATUS[row.result];
      return <StatusDot status={r.status} label={r.label} />;
    },
  },
];

/* ======================================================= AuditView ======= */

export function AuditView() {
  const [search,   setSearch]   = React.useState("");
  const [module,   setModule]   = React.useState<AuditModule>("Todos");
  const [result,   setResult]   = React.useState<"todos" | "ok" | "warn" | "error">("todos");
  const [page,     setPage]     = React.useState(1);

  /* Reset page when filters change */
  React.useEffect(() => { setPage(1); }, [search, module, result]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return DEMO_ENTRIES.filter((e) => {
      if (module !== "Todos" && e.module !== module) return false;
      if (result !== "todos" && e.result !== result) return false;
      if (q) {
        const haystack = [e.actor, e.action, e.module, e.description, e.ip].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [search, module, result]);

  const metrics = React.useMemo(() => buildMetrics(filtered), [filtered]);

  const exportCSV = React.useCallback(() => {
    const header = "Timestamp,Actor,Rol,Acción,Módulo,Descripción,IP,Resultado";
    const rows = filtered.map((e) =>
      [e.timestamp, e.actor, e.actorRole, e.action, e.module, `"${e.description}"`, e.ip, e.result].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditoria-prizma-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ---- Page header ------------------------------------------------- */}
      <PageHeader
        title="Log de auditoría"
        description="Trazabilidad completa de acciones de usuarios y sistema en el ecosistema Prizma."
        icon={<ScrollText size={22} aria-hidden />}
        bordered
        actions={
          <Button variant="secondary" size="sm" onClick={exportCSV}>
            Exportar CSV
          </Button>
        }
      />

      {/* ---- Summary metrics --------------------------------------------- */}
      <MetricGrid
        metrics={metrics}
        minTileWidth={160}
        maxColumns={5}
        aria-label="Resumen de auditoría"
      />

      {/* ---- Filters ----------------------------------------------------- */}
      <Card>
        <CardHeader
          title="Filtros"
          subtitle="Combine búsqueda de texto, módulo y resultado para acotar el log."
        />
        <CardBody>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Row 1: search + result filter */}
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div style={{ flex: "1 1 260px", minWidth: 200 }}>
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  onClear={() => setSearch("")}
                  placeholder="Buscar actor, IP, descripción…"
                  aria-label="Buscar en el log de auditoría"
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "var(--c-text-muted)", whiteSpace: "nowrap" }}>
                  Resultado:
                </span>
                <Select
                  value={result}
                  onChange={(e) => setResult(e.target.value as typeof result)}
                  style={{ minWidth: 130 }}
                  aria-label="Filtrar por resultado"
                >
                  <option value="todos">Todos</option>
                  <option value="ok">OK</option>
                  <option value="warn">Alerta</option>
                  <option value="error">Error</option>
                </Select>
              </div>
            </div>

            {/* Row 2: module segmented (primary 6) + overflow select */}
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Segmented
                options={SEGMENTED_OPTS}
                value={ALL_MODULES.indexOf(module) < 6 ? module : "Todos"}
                onChange={(v) => setModule(v as AuditModule)}
              />

              {/* Full module selector for overflow + mobile */}
              <Select
                value={module}
                onChange={(e) => setModule(e.target.value as AuditModule)}
                aria-label="Filtrar por módulo"
                style={{ minWidth: 140 }}
              >
                {ALL_MODULES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </div>

          </div>
        </CardBody>
      </Card>

      {/* ---- DataTable --------------------------------------------------- */}
      <Card>
        <CardHeader
          title={
            <div className="cui-row" style={{ gap: 8, alignItems: "center" }}>
              <span>Eventos</span>
              <Badge tone={filtered.length === 0 ? "neutral" : "primary"}>
                {filtered.length}
              </Badge>
            </div>
          }
          subtitle={
            search || module !== "Todos" || result !== "todos"
              ? "Mostrando resultados filtrados"
              : "Todos los eventos del día — datos demo (es-CO)"
          }
        />
        <CardBody style={{ padding: 0 }}>
          <DataTable<AuditEntry>
            columns={COLUMNS}
            rows={filtered}
            rowKey={(row) => row.id}
            sortable
            pageSize={10}
            page={page}
            onPageChange={setPage}
            compact
            ariaLabel="Log de auditoría"
            empty={
              <EmptyState
                icon={<Search size={32} aria-hidden />}
                title="Sin eventos"
                description="No hay entradas que coincidan con los filtros aplicados."
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSearch(""); setModule("Todos"); setResult("todos"); }}
                  >
                    Limpiar filtros
                  </Button>
                }
              />
            }
          />
        </CardBody>
      </Card>

    </div>
  );
}
