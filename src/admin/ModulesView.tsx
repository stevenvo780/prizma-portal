import * as React from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  PageHeader,
  SearchInput,
  Segmented,
  Select,
  StatCard,
  StatusDot,
  Switch,
} from "prizma-ui";
import {
  CheckCircle2,
  Package,
  BarChart3,
  CircleDot,
  Search,
} from "lucide-react";
import { PRODUCTS, MODULE_ICON, type ModuleKey, type Product } from "../data";

/* ─── tipos demo ─────────────────────────────────────────────────────────────── */

type Plan = "starter" | "pro" | "enterprise";
type TenantStatus = "activo" | "suspendido" | "prueba";

interface Tenant {
  id: string;
  nombre: string;
  nit: string;
  plan: Plan;
  estado: TenantStatus;
  modulosActivos: ModuleKey[];
  ciudad: string;
  contacto: string;
}

/* ─── datos demo ─────────────────────────────────────────────────────────────── */

const PLAN_LABEL: Record<Plan, string> = {
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

const PLAN_TONE: Record<Plan, "neutral" | "primary" | "module"> = {
  starter: "neutral",
  pro: "primary",
  enterprise: "module",
};

const LINE_TONE: Record<Product["line"], "neutral" | "primary" | "module" | "success" | "warning" | "info"> = {
  Comercial:   "primary",
  Operación:   "success",
  Facturación: "warning",
  Marketing:   "module",
  Infra:       "info",
  Conector:    "neutral",
};

const TENANTS: Tenant[] = [
  {
    id: "t1",
    nombre: "Distribuidora Palma Real",
    nit: "900.123.456-1",
    plan: "pro",
    estado: "activo",
    ciudad: "Barranquilla",
    contacto: "Ana Sofía Rincón",
    modulosActivos: ["hermes", "iris", "talanton", "pistis", "nous"],
  },
  {
    id: "t2",
    nombre: "Supermercados El Trigal",
    nit: "800.654.321-7",
    plan: "enterprise",
    estado: "activo",
    ciudad: "Medellín",
    contacto: "Carlos Esteban Vega",
    modulosActivos: ["hermes", "iris", "talaria", "talanton", "pistis", "logos", "mnemosyne", "peitho", "talos", "nous"],
  },
  {
    id: "t3",
    nombre: "Ferretería Colina Norte",
    nit: "901.234.567-2",
    plan: "starter",
    estado: "prueba",
    ciudad: "Bogotá",
    contacto: "María del Pilar Torres",
    modulosActivos: ["hermes", "nous"],
  },
  {
    id: "t4",
    nombre: "Tecno Soluciones del Caribe",
    nit: "800.987.654-3",
    plan: "pro",
    estado: "activo",
    ciudad: "Cartagena",
    contacto: "Julián Andrés Mosquera",
    modulosActivos: ["hermes", "iris", "pistis", "logos", "nous"],
  },
  {
    id: "t5",
    nombre: "Inversiones Ríoverde S.A.S.",
    nit: "901.345.678-4",
    plan: "enterprise",
    estado: "suspendido",
    ciudad: "Cali",
    contacto: "Luisa Fernanda Castañeda",
    modulosActivos: ["talanton", "pistis", "nous"],
  },
];

const ESTADO_STATUS: Record<TenantStatus, "online" | "busy" | "offline"> = {
  activo:     "online",
  suspendido: "busy",
  prueba:     "idle" as unknown as "offline",
};

const ESTADO_LABEL: Record<TenantStatus, string> = {
  activo:     "Activo",
  suspendido: "Suspendido",
  prueba:     "En prueba",
};

/* ─── helpers ─────────────────────────────────────────────────────────────────── */

function productosPorPlan(plan: Plan): ModuleKey[] {
  if (plan === "starter")    return ["hermes", "nous"];
  if (plan === "pro")        return ["hermes", "iris", "talanton", "pistis", "nous"];
  return PRODUCTS.map((p) => p.key); // enterprise: todos
}

function contarActivos(t: Tenant) {
  return t.modulosActivos.length;
}

/* ─── sub-componente: tarjeta de módulo ──────────────────────────────────────── */

interface ModuleCardProps {
  product: Product;
  enabled: boolean;
  locked: boolean;
  onToggle: (key: ModuleKey, next: boolean) => void;
}

function ModuleCard({ product, enabled, locked, onToggle }: ModuleCardProps) {
  const lineTone = LINE_TONE[product.line];
  const Icon = MODULE_ICON[product.key];

  return (
    <div data-module={product.key}>
      <Card
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          opacity: locked ? 0.55 : 1,
          transition: "opacity 0.2s",
        }}
      >
        <CardHeader
          title={
            <div className="cui-row" style={{ gap: 8, flexWrap: "wrap" }}>
              <Icon size={18} aria-hidden style={{ color: "var(--c-accent-module, var(--c-primary))" }} />
              <span style={{ fontWeight: 600, fontSize: 16 }}>{product.name}</span>
              {product.internal && <Badge tone="neutral">interno</Badge>}
            </div>
          }
          subtitle={
            <span style={{ color: "var(--c-text-subtle)", fontSize: 12 }}>
              ex-{product.aka}
            </span>
          }
          action={
            <Switch
              checked={enabled}
              disabled={locked}
              onChange={(e) => onToggle(product.key, e.target.checked)}
              aria-label={`${enabled ? "Desactivar" : "Activar"} ${product.name}`}
            />
          }
        />
        <CardBody style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ color: "var(--c-text-muted)", fontSize: 13, margin: 0, flex: 1 }}>
            {product.tagline}
          </p>
          <div className="cui-row" style={{ gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <Badge tone={lineTone}>{product.line}</Badge>
            {enabled
              ? <StatusDot status="online" label="Habilitado" size="sm" />
              : <StatusDot status="offline" label="Deshabilitado" size="sm" />}
            {locked && (
              <span style={{ fontSize: 11, color: "var(--c-text-subtle)" }}>
                requiere plan superior
              </span>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/* ─── sub-componente: selector de tenant ──────────────────────────────────────── */

interface TenantSelectorProps {
  tenants: Tenant[];
  selectedId: string;
  onSelect: (id: string) => void;
}

function TenantSelector({ tenants, selectedId, onSelect }: TenantSelectorProps) {
  const t = tenants.find((x) => x.id === selectedId);
  return (
    <Card>
      <CardBody>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            alignItems: "end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="tenant-select" style={{ fontSize: 13, color: "var(--c-text-muted)", fontWeight: 500 }}>
              Tenant / empresa
            </label>
            <Select
              id="tenant-select"
              value={selectedId}
              onChange={(e) => onSelect(e.target.value)}
            >
              {tenants.map((tn) => (
                <option key={tn.id} value={tn.id}>
                  {tn.nombre} — {tn.nit}
                </option>
              ))}
            </Select>
          </div>

          {t && (
            <div className="cui-row" style={{ gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--c-text-subtle)", marginBottom: 2 }}>Plan</div>
                <Badge tone={PLAN_TONE[t.plan]}>{PLAN_LABEL[t.plan]}</Badge>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--c-text-subtle)", marginBottom: 2 }}>Estado</div>
                <StatusDot
                  status={ESTADO_STATUS[t.estado] as "online" | "busy" | "offline"}
                  label={ESTADO_LABEL[t.estado]}
                  size="sm"
                  pulse={t.estado === "activo"}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--c-text-subtle)", marginBottom: 2 }}>Ciudad</div>
                <span style={{ fontSize: 13 }}>{t.ciudad}</span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--c-text-subtle)", marginBottom: 2 }}>Contacto</div>
                <span style={{ fontSize: 13 }}>{t.contacto}</span>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── vista principal ────────────────────────────────────────────────────────── */

export function ModulesView() {
  // tenant seleccionado
  const [selectedTenantId, setSelectedTenantId] = React.useState<string>(TENANTS[0].id);

  // estado local de módulos por tenant (copia mutable de datos demo)
  const [tenantModules, setTenantModules] = React.useState<Record<string, ModuleKey[]>>(
    () => Object.fromEntries(TENANTS.map((t) => [t.id, [...t.modulosActivos]]))
  );

  // búsqueda y filtro de línea
  const [search, setSearch] = React.useState("");
  const [lineFilter, setLineFilter] = React.useState("todos");

  // feedback de guardado (simulado)
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const currentTenant = TENANTS.find((t) => t.id === selectedTenantId)!;
  const activeModules = tenantModules[selectedTenantId] ?? [];
  const allowedByPlan = productosPorPlan(currentTenant.plan);

  // filtrar productos
  const lineOptions = [
    { value: "todos", label: "Todas" },
    { value: "Comercial",   label: "Comercial" },
    { value: "Operación",   label: "Operación" },
    { value: "Facturación", label: "Facturación" },
    { value: "Marketing",   label: "Marketing" },
    { value: "Conector",    label: "Conectores" },
    { value: "Infra",       label: "Infra" },
  ];

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchSearch =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.aka.toLowerCase().includes(search.toLowerCase()) ||
      p.tagline.toLowerCase().includes(search.toLowerCase());
    const matchLine = lineFilter === "todos" || p.line === lineFilter;
    return matchSearch && matchLine;
  });

  // toggle módulo para tenant actual
  const handleToggle = (key: ModuleKey, next: boolean) => {
    setTenantModules((prev) => {
      const current = prev[selectedTenantId] ?? [];
      const updated = next ? [...current, key] : current.filter((k) => k !== key);
      return { ...prev, [selectedTenantId]: updated };
    });
    setSaved(false);
  };

  // guardar cambios (simulado)
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 900);
  };

  // estadísticas rápidas
  const totalActivos = activeModules.length;
  const totalDisponibles = allowedByPlan.length;
  const pctUso = Math.round((totalActivos / PRODUCTS.length) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* encabezado */}
      <PageHeader
        title="Gestión de módulos"
        description="Habilita o deshabilita módulos de la suite Prizma por tenant. Los módulos disponibles dependen del plan contratado."
        bordered
        actions={
          <div className="cui-row" style={{ gap: 8 }}>
            {/* UX-04/A11Y-06: aria-live para anunciar "Cambios guardados" a AT */}
            <div aria-live="polite" aria-atomic="true" style={{ display: "flex", alignItems: "center" }}>
              {saved && (
                <Badge tone="success" style={{ alignSelf: "center" }}>
                  Cambios guardados
                </Badge>
              )}
            </div>
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              onClick={handleSave}
            >
              Guardar cambios
            </Button>
          </div>
        }
      />

      {/* selector de tenant */}
      <TenantSelector
        tenants={TENANTS}
        selectedId={selectedTenantId}
        onSelect={(id) => {
          setSelectedTenantId(id);
          setSaved(false);
        }}
      />

      {/* KPIs del tenant */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <StatCard
          label="Módulos activos"
          value={`${totalActivos} / ${PRODUCTS.length}`}
          delta={`+${totalActivos} habilitados`}
          trend="up"
          icon={<CheckCircle2 size={18} aria-hidden />}
        />
        <StatCard
          label="Disponibles en plan"
          value={totalDisponibles}
          delta={PLAN_LABEL[currentTenant.plan]}
          icon={<Package size={18} aria-hidden />}
        />
        <StatCard
          label="Uso del plan"
          value={`${pctUso}%`}
          delta={pctUso >= 80 ? "alta adopción" : "adopción parcial"}
          trend={pctUso >= 80 ? "up" : "flat"}
          icon={<BarChart3 size={18} aria-hidden />}
        />
        <StatCard
          label="Estado del tenant"
          value={ESTADO_LABEL[currentTenant.estado]}
          delta={currentTenant.ciudad}
          icon={
            <CircleDot
              size={18}
              aria-hidden
              style={{
                color:
                  currentTenant.estado === "activo"
                    ? "var(--c-success)"
                    : currentTenant.estado === "suspendido"
                    ? "var(--c-danger)"
                    : "var(--c-warning)",
              }}
            />
          }
        />
      </div>

      {/* filtros */}
      <div
        className="cui-row"
        style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
      >
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar módulo…"
            onClear={() => setSearch("")}
          />
        </div>
        <Segmented
          options={lineOptions}
          value={lineFilter}
          onChange={setLineFilter}
        />
      </div>

      {/* grid de módulos */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Search size={32} aria-hidden />}
          title="Sin resultados"
          description={`No hay módulos que coincidan con "${search}" en la línea seleccionada.`}
          action={
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setLineFilter("todos"); }}>
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {filteredProducts.map((product) => {
            const enabled = activeModules.includes(product.key);
            const locked = !allowedByPlan.includes(product.key);
            return (
              <ModuleCard
                key={product.key}
                product={product}
                enabled={enabled}
                locked={locked}
                onToggle={handleToggle}
              />
            );
          })}
        </div>
      )}

      {/* leyenda de plan */}
      <Card>
        <CardBody>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text-muted)" }}>
              Módulos incluidos por plan
            </span>
            <div className="cui-row" style={{ gap: 24, flexWrap: "wrap" }}>
              {(["starter", "pro", "enterprise"] as Plan[]).map((plan) => {
                const keys = productosPorPlan(plan);
                return (
                  <div key={plan} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Badge tone={PLAN_TONE[plan]}>{PLAN_LABEL[plan]}</Badge>
                    <span style={{ fontSize: 12, color: "var(--c-text-subtle)" }}>
                      {keys.map((k) => PRODUCTS.find((p) => p.key === k)?.name).filter(Boolean).join(", ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
