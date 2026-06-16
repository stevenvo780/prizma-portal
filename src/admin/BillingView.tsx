/**
 * BillingView — Admin view for Prizma Suite subscription & billing management.
 *
 * Shows per-module subscription cards, MRR summary metrics, and an invoice
 * history table. All data is demo data in Colombian Spanish (es-CO).
 *
 * Uses ONLY prizma-ui components. No external dependencies.
 */

import * as React from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  MetricGrid,
  Money,
  PageHeader,
  StatCard,
  StatusDot,
  Switch,
  Tabs,
  formatCOP,
  type DataTableColumn,
} from "prizma-ui";
import { Wallet, Download, Receipt } from "lucide-react";
import { MODULE_ICON } from "../data";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanTier = "Gratuito" | "Básico" | "Profesional" | "Empresarial";
type InvoiceStatus = "pagada" | "pendiente" | "vencida" | "anulada";
type ModuleKey =
  | "hermes"
  | "iris"
  | "talaria"
  | "talanton"
  | "pistis"
  | "logos"
  | "mnemosyne"
  | "peitho"
  | "talos"
  | "nous";

interface ModuleSub {
  key: ModuleKey;
  name: string;
  aka: string;
  plan: PlanTier;
  /** Monthly price in COP */
  price: number;
  /** Whether the module is currently active */
  active: boolean;
  /** Billing cycle */
  cycle: "mensual" | "anual";
  /** Next renewal date (ISO) */
  renewalDate: string;
  /** Users included in this plan */
  seats: number;
  /** MRR contribution demo series */
  mrrSeries: number[];
}

interface Invoice {
  id: string;
  fecha: string;
  concepto: string;
  modulo: string;
  /** Total in COP */
  total: number;
  status: InvoiceStatus;
  /** PDF URL placeholder */
  pdf: string;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const PLAN_PRICES: Record<PlanTier, number> = {
  Gratuito: 0,
  Básico: 149_000,
  Profesional: 349_000,
  Empresarial: 899_000,
};

const MODULE_SUBS: ModuleSub[] = [
  {
    key: "hermes",
    name: "Hermes",
    aka: "Graf",
    plan: "Profesional",
    price: PLAN_PRICES["Profesional"],
    active: true,
    cycle: "mensual",
    renewalDate: "2026-07-01",
    seats: 10,
    mrrSeries: [280_000, 295_000, 310_000, 330_000, 349_000, 349_000],
  },
  {
    key: "iris",
    name: "Iris",
    aka: "EMW",
    plan: "Profesional",
    price: PLAN_PRICES["Profesional"],
    active: true,
    cycle: "mensual",
    renewalDate: "2026-07-01",
    seats: 5,
    mrrSeries: [200_000, 250_000, 310_000, 349_000, 349_000, 349_000],
  },
  {
    key: "talaria",
    name: "Talaria",
    aka: "Mera Vuelta",
    plan: "Básico",
    price: PLAN_PRICES["Básico"],
    active: true,
    cycle: "mensual",
    renewalDate: "2026-07-01",
    seats: 3,
    mrrSeries: [100_000, 120_000, 130_000, 140_000, 149_000, 149_000],
  },
  {
    key: "talanton",
    name: "Talanton",
    aka: "Sinergia POS",
    plan: "Empresarial",
    price: PLAN_PRICES["Empresarial"],
    active: true,
    cycle: "anual",
    renewalDate: "2027-01-01",
    seats: 25,
    mrrSeries: [750_000, 780_000, 820_000, 860_000, 899_000, 899_000],
  },
  {
    key: "pistis",
    name: "Pistis",
    aka: "Fiar",
    plan: "Básico",
    price: PLAN_PRICES["Básico"],
    active: true,
    cycle: "mensual",
    renewalDate: "2026-07-01",
    seats: 4,
    mrrSeries: [100_000, 130_000, 140_000, 149_000, 149_000, 149_000],
  },
  {
    key: "logos",
    name: "Logos",
    aka: "ApiSigo",
    plan: "Profesional",
    price: PLAN_PRICES["Profesional"],
    active: true,
    cycle: "mensual",
    renewalDate: "2026-07-01",
    seats: 2,
    mrrSeries: [290_000, 300_000, 340_000, 349_000, 349_000, 349_000],
  },
  {
    key: "mnemosyne",
    name: "Mnemosyne",
    aka: "ApiSoftia",
    plan: "Básico",
    price: PLAN_PRICES["Básico"],
    active: false,
    cycle: "mensual",
    renewalDate: "—",
    seats: 2,
    mrrSeries: [100_000, 100_000, 100_000, 0, 0, 0],
  },
  {
    key: "peitho",
    name: "Peitho",
    aka: "Comercial",
    plan: "Profesional",
    price: PLAN_PRICES["Profesional"],
    active: true,
    cycle: "mensual",
    renewalDate: "2026-07-01",
    seats: 6,
    mrrSeries: [300_000, 320_000, 335_000, 349_000, 349_000, 349_000],
  },
  {
    key: "talos",
    name: "Talos",
    aka: "Automatización",
    plan: "Empresarial",
    price: PLAN_PRICES["Empresarial"],
    active: true,
    cycle: "anual",
    renewalDate: "2027-01-01",
    seats: 15,
    mrrSeries: [700_000, 750_000, 810_000, 870_000, 899_000, 899_000],
  },
  {
    key: "nous",
    name: "Nous",
    aka: "HubCentral",
    plan: "Gratuito",
    price: 0,
    active: true,
    cycle: "mensual",
    renewalDate: "—",
    seats: 999,
    mrrSeries: [0, 0, 0, 0, 0, 0],
  },
];

const INVOICES: Invoice[] = [
  {
    id: "OLY-2026-0042",
    fecha: "2026-06-01",
    concepto: "Suscripción Hermes · Profesional",
    modulo: "Hermes",
    total: 349_000,
    status: "pagada",
    pdf: "#",
  },
  {
    id: "OLY-2026-0043",
    fecha: "2026-06-01",
    concepto: "Suscripción Iris · Profesional",
    modulo: "Iris",
    total: 349_000,
    status: "pagada",
    pdf: "#",
  },
  {
    id: "OLY-2026-0044",
    fecha: "2026-06-01",
    concepto: "Suscripción Talaria · Básico",
    modulo: "Talaria",
    total: 149_000,
    status: "pagada",
    pdf: "#",
  },
  {
    id: "OLY-2026-0045",
    fecha: "2026-06-01",
    concepto: "Suscripción Pistis · Básico",
    modulo: "Pistis",
    total: 149_000,
    status: "pagada",
    pdf: "#",
  },
  {
    id: "OLY-2026-0046",
    fecha: "2026-06-01",
    concepto: "Suscripción Peitho · Profesional",
    modulo: "Peitho",
    total: 349_000,
    status: "pagada",
    pdf: "#",
  },
  {
    id: "OLY-2026-0047",
    fecha: "2026-06-01",
    concepto: "Suscripción Logos · Profesional",
    modulo: "Logos",
    total: 349_000,
    status: "pagada",
    pdf: "#",
  },
  {
    id: "OLY-2026-0041",
    fecha: "2026-05-01",
    concepto: "Suscripción Talanton · Empresarial (anual)",
    modulo: "Talanton",
    total: 10_788_000,
    status: "pagada",
    pdf: "#",
  },
  {
    id: "OLY-2026-0040",
    fecha: "2026-05-01",
    concepto: "Suscripción Talos · Empresarial (anual)",
    modulo: "Talos",
    total: 10_788_000,
    status: "pagada",
    pdf: "#",
  },
  {
    id: "OLY-2026-0048",
    fecha: "2026-06-07",
    concepto: "Ajuste por prorrateo · Hermes — 3 licencias adicionales",
    modulo: "Hermes",
    total: 87_250,
    status: "pendiente",
    pdf: "#",
  },
  {
    id: "OLY-2026-0035",
    fecha: "2026-04-01",
    concepto: "Suscripción Mnemosyne · Básico",
    modulo: "Mnemosyne",
    total: 149_000,
    status: "vencida",
    pdf: "#",
  },
  {
    id: "OLY-2025-0012",
    fecha: "2025-12-01",
    concepto: "Suscripción Hermes · Básico (cancelada)",
    modulo: "Hermes",
    total: 149_000,
    status: "anulada",
    pdf: "#",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_BADGE: Record<PlanTier, React.ReactNode> = {
  Gratuito: <Badge tone="neutral">Gratuito</Badge>,
  Básico: <Badge tone="info">Básico</Badge>,
  Profesional: <Badge tone="primary">Profesional</Badge>,
  Empresarial: <Badge tone="module">Empresarial</Badge>,
};

const STATUS_BADGE: Record<InvoiceStatus, React.ReactNode> = {
  pagada: <Badge tone="success">Pagada</Badge>,
  pendiente: <Badge tone="warning">Pendiente</Badge>,
  vencida: <Badge tone="danger">Vencida</Badge>,
  anulada: <Badge tone="neutral">Anulada</Badge>,
};

function formatDate(iso: string): string {
  if (!iso || iso === "—") return "—";
  const [y, m, d] = iso.split("-");
  const months = [
    "", "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  return `${d} ${months[parseInt(m, 10)]}. ${y}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Individual module subscription card */
function ModuleSubCard({
  sub,
  onToggle,
}: {
  sub: ModuleSub;
  onToggle: (key: ModuleKey) => void;
}) {
  const mrr = sub.active ? sub.price : 0;
  const Icon = MODULE_ICON[sub.key];

  return (
    <Card raised={sub.active} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardHeader
        title={
          <div className="cui-row" style={{ gap: 8, alignItems: "center" }}>
            <Icon size={18} aria-hidden style={{ color: "var(--c-primary)" }} />
            <span>{sub.name}</span>
            <span style={{ color: "var(--c-text-subtle)", fontWeight: 400, fontSize: 13 }}>
              · ex-{sub.aka}
            </span>
          </div>
        }
        action={
          <Switch
            checked={sub.active}
            onChange={() => onToggle(sub.key)}
            aria-label={`${sub.active ? "Desactivar" : "Activar"} ${sub.name}`}
          />
        }
      />
      <CardBody style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {/* Plan + cycle */}
        <div className="cui-row cui-row--between" style={{ gap: 8, flexWrap: "wrap" }}>
          <div className="cui-row" style={{ gap: 6 }}>
            {PLAN_BADGE[sub.plan]}
            <Badge tone="neutral" style={{ textTransform: "lowercase" }}>{sub.cycle}</Badge>
          </div>
          <StatusDot
            status={sub.active ? "online" : "offline"}
            label={sub.active ? "Activo" : "Inactivo"}
            size="sm"
          />
        </div>

        {/* Price */}
        <div>
          <div style={{ color: "var(--c-text-muted)", fontSize: 12, marginBottom: 2 }}>
            Precio mensual
          </div>
          {sub.price === 0 ? (
            <span style={{ fontSize: 20, fontWeight: 700, color: "var(--c-success)" }}>
              Sin costo
            </span>
          ) : (
            <Money
              value={sub.price}
              tone="neutral"
              style={{ fontSize: 20, fontWeight: 700 }}
            />
          )}
        </div>

        {/* MRR contribution */}
        <div style={{ color: "var(--c-text-muted)", fontSize: 13 }}>
          <span>MRR aportado: </span>
          <strong style={{ color: mrr > 0 ? "var(--c-success)" : "var(--c-text-subtle)" }}>
            {mrr > 0 ? formatCOP(mrr) : "$ 0"}
          </strong>
        </div>

        {/* Meta */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px 12px",
            fontSize: 13,
            color: "var(--c-text-muted)",
            marginTop: "auto",
          }}
        >
          <span>Licencias</span>
          <span style={{ textAlign: "right", fontWeight: 600, color: "var(--c-text)" }}>
            {sub.seats === 999 ? "Ilimitadas" : sub.seats}
          </span>
          <span>Renovación</span>
          <span style={{ textAlign: "right", fontWeight: 600, color: "var(--c-text)" }}>
            {formatDate(sub.renewalDate)}
          </span>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Invoice table columns ────────────────────────────────────────────────────

const INVOICE_COLUMNS: DataTableColumn<Invoice>[] = [
  {
    key: "id",
    header: "N.° Factura",
    width: 140,
    render: (row) => (
      <code style={{ fontSize: 12, color: "var(--c-text-muted)" }}>{row.id}</code>
    ),
  },
  {
    key: "fecha",
    header: "Fecha",
    sortable: true,
    width: 110,
    render: (row) => formatDate(row.fecha),
  },
  {
    key: "modulo",
    header: "Módulo",
    width: 110,
    render: (row) => (
      <Badge tone="neutral">{row.modulo}</Badge>
    ),
  },
  {
    key: "concepto",
    header: "Concepto",
  },
  {
    key: "total",
    header: "Total",
    align: "right",
    width: 160,
    sortable: true,
    render: (row) => (
      <Money value={row.total} tone={row.status === "anulada" ? "negative" : "neutral"} />
    ),
  },
  {
    key: "status",
    header: "Estado",
    width: 110,
    align: "center",
    render: (row) => STATUS_BADGE[row.status],
  },
  {
    key: "pdf",
    header: "",
    width: 80,
    align: "center",
    render: (row) =>
      row.status !== "anulada" ? (
        <a
          href={row.pdf}
          aria-label={`Descargar factura ${row.id}`}
          style={{
            fontSize: 13,
            color: "var(--c-primary)",
            textDecoration: "none",
            fontWeight: 600,
            padding: "4px 8px",
            borderRadius: "var(--c-radius-sm)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "var(--c-surface-raised)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "")}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Download size={13} aria-hidden /> PDF
          </span>
        </a>
      ) : null,
  },
];

// ─── Main view ────────────────────────────────────────────────────────────────

export function BillingView() {
  // Module active state (local demo state)
  const [subs, setSubs] = React.useState<ModuleSub[]>(MODULE_SUBS);

  const toggleModule = React.useCallback((key: ModuleKey) => {
    setSubs((prev) =>
      prev.map((s) =>
        s.key === key ? { ...s, active: !s.active } : s
      )
    );
  }, []);

  // Derived metrics
  const activeSubs = subs.filter((s) => s.active);
  const mrr = activeSubs.reduce((acc, s) => acc + s.price, 0);
  const arr = mrr * 12;
  const activeCount = activeSubs.length;
  const pendingInvoices = INVOICES.filter((i) => i.status === "pendiente").length;
  const overdueInvoices = INVOICES.filter((i) => i.status === "vencida").length;

  // Invoice filter state
  const [invoiceFilter, setInvoiceFilter] = React.useState<InvoiceStatus | "todas">("todas");

  const filteredInvoices = invoiceFilter === "todas"
    ? INVOICES
    : INVOICES.filter((i) => i.status === invoiceFilter);

  const invoiceFilterOptions: Array<{ key: InvoiceStatus | "todas"; label: string }> = [
    { key: "todas", label: "Todas" },
    { key: "pagada", label: "Pagadas" },
    { key: "pendiente", label: "Pendientes" },
    { key: "vencida", label: "Vencidas" },
    { key: "anulada", label: "Anuladas" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Page header ── */}
      <PageHeader
        title="Facturación y suscripciones"
        description="Gestiona los planes activos del ecosistema Prizma y consulta el historial de facturas."
        icon={<Wallet size={22} aria-hidden />}
        bordered
        actions={
          <div className="cui-row" style={{ gap: 8 }}>
            {/* UX-01: botones disabled con tooltip hasta implementar handler real */}
            <Button
              variant="ghost"
              size="sm"
              disabled
              title="Próximamente: exportar facturas en CSV"
            >
              Exportar CSV
            </Button>
            <Button
              variant="accent"
              size="sm"
              disabled
              title="Próximamente: actualizar método de pago"
            >
              Actualizar método de pago
            </Button>
          </div>
        }
      />

      {/* ── KPI metrics ── */}
      <section aria-label="Resumen de facturación">
        <MetricGrid
          aria-label="Métricas de facturación"
          minTileWidth={200}
          maxColumns={4}
          metrics={[
            {
              id: "mrr",
              label: "MRR total",
              value: <Money value={mrr} tone="positive" />,
              delta: "+12% vs. mes anterior",
              trend: "up",
              sparkline: [1_500_000, 1_700_000, 1_900_000, 2_100_000, 2_300_000, mrr],
            },
            {
              id: "arr",
              label: "ARR proyectado",
              value: <Money value={arr} tone="positive" />,
              delta: "estimado",
              trend: "up",
            },
            {
              id: "active",
              label: "Módulos activos",
              value: `${activeCount} / ${subs.length}`,
              delta: activeCount === subs.length ? "todos activos" : `${subs.length - activeCount} inactivos`,
              trend: activeCount === subs.length ? "up" : "down",
            },
            {
              id: "alerts",
              label: "Alertas de cobro",
              value: `${pendingInvoices + overdueInvoices}`,
              delta: overdueInvoices > 0 ? `${overdueInvoices} vencida(s)` : "sin vencidas",
              trend: overdueInvoices > 0 ? "down" : "up",
            },
          ]}
        />
      </section>

      {/* ── Tabs: Suscripciones | Facturas ── */}
      <Tabs
        defaultValue="suscripciones"
        tabs={[
          {
            key: "suscripciones",
            label: (
              <span className="cui-row" style={{ gap: 6 }}>
                Suscripciones por módulo
                <Badge tone="primary">{activeCount}</Badge>
              </span>
            ),
            content: (
              <div style={{ paddingTop: 20 }}>
                {/* Summary row */}
                <div className="cui-row cui-row--between cui-row--wrap" style={{ gap: 12, marginBottom: 20 }}>
                  <p style={{ color: "var(--c-text-muted)", fontSize: 14, margin: 0 }}>
                    Activa o desactiva módulos con el interruptor. Los cambios son inmediatos en este demo.
                  </p>
                  <StatCard
                    label="MRR activo"
                    value={<Money value={mrr} tone="positive" />}
                    delta={`${activeCount} módulos`}
                    trend="up"
                    style={{ minWidth: 180 }}
                  />
                </div>

                {/* Module cards grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 16,
                  }}
                >
                  {subs.map((sub) => (
                    <ModuleSubCard key={sub.key} sub={sub} onToggle={toggleModule} />
                  ))}
                </div>
              </div>
            ),
          },
          {
            key: "facturas",
            label: (
              <span className="cui-row" style={{ gap: 6 }}>
                Historial de facturas
                {overdueInvoices > 0 && (
                  <Badge tone="danger">{overdueInvoices} vencida{overdueInvoices !== 1 ? "s" : ""}</Badge>
                )}
              </span>
            ),
            content: (
              <div style={{ paddingTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Invoice filter + totals summary */}
                <div className="cui-row cui-row--between cui-row--wrap" style={{ gap: 12 }}>
                  {/* Filter pills */}
                  <div className="cui-row" style={{ gap: 6, flexWrap: "wrap" }}>
                    {invoiceFilterOptions.map((opt) => {
                      const isActive = invoiceFilter === opt.key;
                      const count = opt.key === "todas"
                        ? INVOICES.length
                        : INVOICES.filter((i) => i.status === opt.key).length;
                      return (
                        <Button
                          key={opt.key}
                          variant={isActive ? "primary" : "ghost"}
                          size="sm"
                          onClick={() => setInvoiceFilter(opt.key)}
                        >
                          {opt.label}
                          {count > 0 && (
                            <Badge
                              tone={isActive ? "primary" : "neutral"}
                              style={{ marginLeft: 6 }}
                            >
                              {count}
                            </Badge>
                          )}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Totals for current filter */}
                  <div
                    style={{ fontSize: 13, color: "var(--c-text-muted)" }}
                    aria-live="polite"
                  >
                    Total filtrado:{" "}
                    <strong style={{ color: "var(--c-text)" }}>
                      {formatCOP(filteredInvoices.reduce((s, i) => s + i.total, 0))} COP
                    </strong>
                  </div>
                </div>

                {/* Overdue alert banner */}
                {overdueInvoices > 0 && (
                  <Card style={{ borderLeft: "4px solid var(--c-danger)", background: "var(--c-surface-raised)" }}>
                    <CardBody>
                      <div className="cui-row" style={{ gap: 10, alignItems: "center" }}>
                        <StatusDot status="busy" pulse size="md" />
                        <div>
                          <strong>
                            {overdueInvoices} factura{overdueInvoices !== 1 ? "s" : ""} vencida{overdueInvoices !== 1 ? "s" : ""}
                          </strong>
                          <span style={{ color: "var(--c-text-muted)", marginLeft: 8, fontSize: 13 }}>
                            Regulariza el pago para mantener los módulos activos.
                          </span>
                        </div>
                        <div style={{ marginLeft: "auto" }}>
                          <Button variant="primary" size="sm">
                            Pagar ahora
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Pending reminder */}
                {pendingInvoices > 0 && (
                  <Card style={{ borderLeft: "4px solid var(--c-warning)", background: "var(--c-surface-raised)" }}>
                    <CardBody>
                      <div className="cui-row" style={{ gap: 10, alignItems: "center" }}>
                        <StatusDot tone="warning" size="md" />
                        <div>
                          <strong>
                            {pendingInvoices} factura{pendingInvoices !== 1 ? "s" : ""} pendiente{pendingInvoices !== 1 ? "s" : ""}
                          </strong>
                          <span style={{ color: "var(--c-text-muted)", marginLeft: 8, fontSize: 13 }}>
                            Serán cobradas automáticamente en los próximos días hábiles.
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Table */}
                <DataTable<Invoice>
                  columns={INVOICE_COLUMNS}
                  rows={filteredInvoices}
                  rowKey={(row) => row.id}
                  sortable
                  pageSize={8}
                  ariaLabel="Historial de facturas Prizma"
                  empty={
                    <div style={{ padding: "32px 0", textAlign: "center" }}>
                      <div style={{ marginBottom: 8, color: "var(--c-text-subtle)", display: "flex", justifyContent: "center" }}>
                        <Receipt size={32} aria-hidden />
                      </div>
                      <div style={{ fontWeight: 600 }}>Sin facturas en este filtro</div>
                      <div style={{ color: "var(--c-text-muted)", fontSize: 14, marginTop: 4 }}>
                        Prueba seleccionando otro estado.
                      </div>
                    </div>
                  }
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
