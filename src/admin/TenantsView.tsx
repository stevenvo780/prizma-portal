/**
 * TenantsView — gestión de organizaciones/tenants para el panel admin de Prizma.
 * Exporta `TenantsView` como named export. Autocontenido (sin deps externas).
 */

import * as React from "react";
import {
  PageHeader,
  Card,
  CardBody,
  DataTable,
  type DataTableColumn,
  Badge,
  Button,
  Modal,
  ConfirmDialog,
  Field,
  Input,
  Select,
  SearchInput,
  StatusDot,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  StatCard,
  Segmented,
  Switch,
} from "prizma-ui";
import {
  Building2,
  FlaskConical,
  Users,
  Puzzle,
  Pencil,
  Play,
  Pause,
  Ban,
  MoreHorizontal,
} from "lucide-react";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

type Plan = "Esencial" | "Profesional" | "Empresarial" | "Personalizado";
type EstadoTenant = "activo" | "suspendido" | "prueba" | "cancelado";

interface Modulo {
  key: string;
  nombre: string;
}

const MODULOS_DISPONIBLES: Modulo[] = [
  { key: "hermes", nombre: "Hermes (Graf)" },
  { key: "iris", nombre: "Iris (EMW)" },
  { key: "talaria", nombre: "Talaria" },
  { key: "talanton", nombre: "Talanton POS" },
  { key: "pistis", nombre: "Pistis (Fiar)" },
  { key: "logos", nombre: "Logos (ApiSigo)" },
  { key: "mnemosyne", nombre: "Mnemosyne" },
  { key: "peitho", nombre: "Peitho (Comercial)" },
  { key: "talos", nombre: "Talos" },
  { key: "nous", nombre: "Nous (Hub)" },
];

interface Tenant {
  id: string;
  nombre: string;
  nit: string;
  ciudad: string;
  plan: Plan;
  modulos: string[]; // keys de MODULOS_DISPONIBLES
  usuarios: number;
  estado: EstadoTenant;
  creadoEn: string; // ISO date string (YYYY-MM-DD)
  contacto: string;
  email: string;
}

/* ─── Datos demo ─────────────────────────────────────────────────────────── */

const TENANTS_DEMO: Tenant[] = [
  {
    id: "t-001",
    nombre: "Distribuidora Caribe S.A.S.",
    nit: "900.123.456-7",
    ciudad: "Barranquilla",
    plan: "Empresarial",
    modulos: ["hermes", "iris", "talaria", "talanton", "pistis", "logos"],
    usuarios: 48,
    estado: "activo",
    creadoEn: "2025-03-10",
    contacto: "Adriana Montoya",
    email: "adriana@caribeDistrib.co",
  },
  {
    id: "t-002",
    nombre: "Merkacentro Bogotá Ltda.",
    nit: "830.567.891-2",
    ciudad: "Bogotá",
    plan: "Profesional",
    modulos: ["hermes", "iris", "talanton", "pistis"],
    usuarios: 21,
    estado: "activo",
    creadoEn: "2025-05-22",
    contacto: "Felipe Rueda",
    email: "frueda@merkacentro.com.co",
  },
  {
    id: "t-003",
    nombre: "Logística del Pacífico",
    nit: "805.234.678-0",
    ciudad: "Cali",
    plan: "Esencial",
    modulos: ["talaria", "nous"],
    usuarios: 9,
    estado: "prueba",
    creadoEn: "2026-05-30",
    contacto: "Diana Quintero",
    email: "dquintero@logpacifico.co",
  },
  {
    id: "t-004",
    nombre: "Ferrehogar del Eje Cafetero",
    nit: "811.345.901-5",
    ciudad: "Manizales",
    plan: "Profesional",
    modulos: ["talanton", "pistis", "logos", "talos"],
    usuarios: 15,
    estado: "activo",
    creadoEn: "2025-09-14",
    contacto: "Hernán Arias",
    email: "harias@ferrehogar.com",
  },
  {
    id: "t-005",
    nombre: "Tecnired Antioquia",
    nit: "890.400.112-3",
    ciudad: "Medellín",
    plan: "Empresarial",
    modulos: ["hermes", "iris", "talanton", "pistis", "logos", "mnemosyne", "peitho", "nous"],
    usuarios: 74,
    estado: "activo",
    creadoEn: "2024-11-01",
    contacto: "Valentina Ospina",
    email: "vospina@tecnired.co",
  },
  {
    id: "t-006",
    nombre: "AgroNorte Exportaciones",
    nit: "826.789.234-6",
    ciudad: "Cúcuta",
    plan: "Personalizado",
    modulos: ["hermes", "talaria", "pistis", "logos", "talos", "peitho"],
    usuarios: 33,
    estado: "suspendido",
    creadoEn: "2025-01-20",
    contacto: "Omar Castellanos",
    email: "ocastellanos@agronorte.co",
  },
  {
    id: "t-007",
    nombre: "Belleza y Estilo SAS",
    nit: "901.022.567-1",
    ciudad: "Bucaramanga",
    plan: "Esencial",
    modulos: ["talanton", "iris"],
    usuarios: 5,
    estado: "activo",
    creadoEn: "2026-04-03",
    contacto: "Marcela Sandoval",
    email: "marcela@belestilo.co",
  },
  {
    id: "t-008",
    nombre: "Proquifar del Caribe",
    nit: "802.678.345-9",
    ciudad: "Cartagena",
    plan: "Profesional",
    modulos: ["hermes", "pistis", "logos"],
    usuarios: 12,
    estado: "cancelado",
    creadoEn: "2024-08-15",
    contacto: "Andrés Herrera",
    email: "aherrera@proquifar.com",
  },
];

/* ─── Helpers de presentación ────────────────────────────────────────────── */

const ESTADO_CONFIG: Record<
  EstadoTenant,
  { label: string; tone: "success" | "warning" | "info" | "danger"; dotStatus: "online" | "idle" | "busy" | "offline" }
> = {
  activo: { label: "Activo", tone: "success", dotStatus: "online" },
  prueba: { label: "En prueba", tone: "info", dotStatus: "idle" },
  suspendido: { label: "Suspendido", tone: "warning", dotStatus: "busy" },
  cancelado: { label: "Cancelado", tone: "danger", dotStatus: "offline" },
};

const PLAN_TONE: Record<Plan, "neutral" | "primary" | "module" | "warning"> = {
  Esencial: "neutral",
  Profesional: "primary",
  Empresarial: "module",
  Personalizado: "warning",
};

function EstadoBadge({ estado }: { estado: EstadoTenant }) {
  const cfg = ESTADO_CONFIG[estado];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <StatusDot status={cfg.dotStatus} size="sm" />
      <Badge tone={cfg.tone}>{cfg.label}</Badge>
    </span>
  );
}

function ModulosPills({ keys }: { keys: string[] }) {
  const nombres = keys
    .map((k) => MODULOS_DISPONIBLES.find((m) => m.key === k)?.nombre ?? k)
    .map((n) => n.split(" ")[0]); // solo el primer token (nombre corto)
  const max = 3;
  const visible = nombres.slice(0, max);
  const resto = nombres.length - max;
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 4 }}>
      {visible.map((n) => (
        <Badge key={n} tone="neutral" style={{ fontSize: 11 }}>
          {n}
        </Badge>
      ))}
      {resto > 0 && (
        <Badge tone="neutral" style={{ fontSize: 11, opacity: 0.7 }}>
          +{resto}
        </Badge>
      )}
    </span>
  );
}

/* ─── Formulario de nueva/editar organización ────────────────────────────── */

interface FormState {
  nombre: string;
  nit: string;
  ciudad: string;
  contacto: string;
  email: string;
  plan: Plan;
  estado: EstadoTenant;
  modulos: string[];
}

const FORM_VACÍO: FormState = {
  nombre: "",
  nit: "",
  ciudad: "",
  contacto: "",
  email: "",
  plan: "Esencial",
  estado: "activo",
  modulos: [],
};

interface OrgModalProps {
  open: boolean;
  onClose: () => void;
  onGuardar: (form: FormState) => void;
  inicial?: FormState;
  titulo: string;
}

function OrgModal({ open, onClose, onGuardar, inicial, titulo }: OrgModalProps) {
  const [form, setForm] = React.useState<FormState>(inicial ?? FORM_VACÍO);

  // Sincroniza cuando se abre con datos iniciales distintos (edición)
  React.useEffect(() => {
    if (open) setForm(inicial ?? FORM_VACÍO);
  }, [open, inicial]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleModulo = (key: string) =>
    set(
      "modulos",
      form.modulos.includes(key)
        ? form.modulos.filter((k) => k !== key)
        : [...form.modulos, key]
    );

  const puedeGuardar = form.nombre.trim() !== "" && form.email.trim() !== "";

  // Detecta si hay cambios comparando la forma actual con la inicial.
  const hayChangios = inicial ? JSON.stringify(form) !== JSON.stringify(inicial) : true;

  const footer = (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <Button variant="secondary" onClick={onClose}>
        Cancelar
      </Button>
      <Button
        variant="primary"
        disabled={!puedeGuardar || !hayChangios}
        onClick={() => { onGuardar(form); onClose(); }}
      >
        Guardar organización
      </Button>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={titulo} footer={footer}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Fila 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Nombre de la organización" htmlFor="org-nombre">
            <Input
              id="org-nombre"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Ej. Distribuidora Caribe S.A.S."
            />
          </Field>
          <Field label="NIT" htmlFor="org-nit">
            <Input
              id="org-nit"
              value={form.nit}
              onChange={(e) => set("nit", e.target.value)}
              placeholder="900.000.000-0"
            />
          </Field>
        </div>

        {/* Fila 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Ciudad" htmlFor="org-ciudad">
            <Input
              id="org-ciudad"
              value={form.ciudad}
              onChange={(e) => set("ciudad", e.target.value)}
              placeholder="Bogotá"
            />
          </Field>
          <Field label="Plan" htmlFor="org-plan">
            <Select
              id="org-plan"
              value={form.plan}
              onChange={(e) => set("plan", e.target.value as Plan)}
            >
              <option value="Esencial">Esencial</option>
              <option value="Profesional">Profesional</option>
              <option value="Empresarial">Empresarial</option>
              <option value="Personalizado">Personalizado</option>
            </Select>
          </Field>
        </div>

        {/* Fila 3 — contacto */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Contacto principal" htmlFor="org-contacto">
            <Input
              id="org-contacto"
              value={form.contacto}
              onChange={(e) => set("contacto", e.target.value)}
              placeholder="Nombre y apellido"
            />
          </Field>
          <Field label="Email de contacto" htmlFor="org-email">
            <Input
              id="org-email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="correo@empresa.co"
            />
          </Field>
        </div>

        {/* Estado */}
        <Field label="Estado inicial" htmlFor="org-estado">
          <Select
            id="org-estado"
            value={form.estado}
            onChange={(e) => set("estado", e.target.value as EstadoTenant)}
          >
            <option value="activo">Activo</option>
            <option value="prueba">En prueba</option>
            <option value="suspendido">Suspendido</option>
            <option value="cancelado">Cancelado</option>
          </Select>
        </Field>

        {/* Módulos */}
        <Field label="Módulos habilitados">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 8,
              marginTop: 4,
            }}
          >
            {MODULOS_DISPONIBLES.map((mod) => (
              <label
                key={mod.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                <Switch
                  checked={form.modulos.includes(mod.key)}
                  onChange={() => toggleModulo(mod.key)}
                />
                {mod.nombre}
              </label>
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */

export function TenantsView() {
  const [tenants, setTenants] = React.useState<Tenant[]>(TENANTS_DEMO);
  const [busqueda, setBusqueda] = React.useState("");
  const [filtroEstado, setFiltroEstado] = React.useState("todos");
  const [filtroPlan, setFiltroPlan] = React.useState("todos");

  // Modal nueva org
  const [modalNueva, setModalNueva] = React.useState(false);

  // Modal editar org
  const [editandoId, setEditandoId] = React.useState<string | null>(null);
  const tenantEditando = tenants.find((t) => t.id === editandoId) ?? null;

  // Confirm suspender / reactivar
  const [confirmSuspender, setConfirmSuspender] = React.useState<Tenant | null>(null);
  // Confirm cancelar
  const [confirmCancelar, setConfirmCancelar] = React.useState<Tenant | null>(null);

  /* Filtrado */
  const tenantsFiltrados = React.useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return tenants.filter((t) => {
      const matchQ =
        q === "" ||
        t.nombre.toLowerCase().includes(q) ||
        t.nit.includes(q) ||
        t.ciudad.toLowerCase().includes(q) ||
        t.contacto.toLowerCase().includes(q);
      const matchEstado = filtroEstado === "todos" || t.estado === filtroEstado;
      const matchPlan = filtroPlan === "todos" || t.plan === filtroPlan;
      return matchQ && matchEstado && matchPlan;
    });
  }, [tenants, busqueda, filtroEstado, filtroPlan]);

  /* KPIs */
  const totalActivos = tenants.filter((t) => t.estado === "activo").length;
  const totalEnPrueba = tenants.filter((t) => t.estado === "prueba").length;
  const totalUsuarios = tenants.reduce((s, t) => s + t.usuarios, 0);
  const totalModulos = tenants.reduce((s, t) => s + t.modulos.length, 0);

  /* Acciones CRUD */
  const crearOrg = (form: FormState) => {
    const nuevo: Tenant = {
      id: `t-${Date.now()}`,
      nombre: form.nombre,
      nit: form.nit,
      ciudad: form.ciudad,
      contacto: form.contacto,
      email: form.email,
      plan: form.plan,
      estado: form.estado,
      modulos: form.modulos,
      usuarios: 0,
      creadoEn: new Date().toISOString().slice(0, 10),
    };
    setTenants((prev) => [nuevo, ...prev]);
  };

  const editarOrg = (form: FormState) => {
    if (!editandoId) return;
    setTenants((prev) =>
      prev.map((t) =>
        t.id === editandoId
          ? { ...t, nombre: form.nombre, nit: form.nit, ciudad: form.ciudad,
              contacto: form.contacto, email: form.email, plan: form.plan,
              estado: form.estado, modulos: form.modulos }
          : t
      )
    );
    setEditandoId(null);
  };

  const toggleSuspender = (tenant: Tenant) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenant.id
          ? { ...t, estado: t.estado === "suspendido" ? "activo" : "suspendido" }
          : t
      )
    );
    setConfirmSuspender(null);
  };

  const cancelarOrg = (tenant: Tenant) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenant.id ? { ...t, estado: "cancelado" } : t))
    );
    setConfirmCancelar(null);
  };

  /* Columnas DataTable */
  const columnas: DataTableColumn<Tenant>[] = [
    {
      key: "nombre",
      header: "Organización",
      sortable: true,
      width: "22%",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{row.nombre}</div>
          <div style={{ color: "var(--c-text-muted)", fontSize: 12 }}>
            NIT {row.nit} · {row.ciudad}
          </div>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      sortable: true,
      width: "11%",
      render: (row) => <Badge tone={PLAN_TONE[row.plan]}>{row.plan}</Badge>,
    },
    {
      key: "modulos",
      header: "Módulos",
      width: "22%",
      render: (row) => <ModulosPills keys={row.modulos} />,
    },
    {
      key: "usuarios",
      header: "Usuarios",
      sortable: true,
      align: "right",
      width: "8%",
      render: (row) => (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{row.usuarios}</span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      sortable: true,
      width: "12%",
      render: (row) => <EstadoBadge estado={row.estado} />,
    },
    {
      key: "creadoEn",
      header: "Alta",
      sortable: true,
      width: "10%",
      render: (row) => (
        <span style={{ color: "var(--c-text-muted)", fontSize: 13 }}>
          {new Date(row.creadoEn).toLocaleDateString("es-CO", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "id",
      header: "",
      width: "52px",
      align: "right",
      render: (row) => (
        <DropdownMenu
          align="end"
          trigger={
            <Button variant="ghost" size="sm" aria-label={`Acciones para ${row.nombre}`}>
              <MoreHorizontal size={16} aria-hidden />
            </Button>
          }
        >
          <DropdownItem
            icon={<Pencil size={15} aria-hidden />}
            onSelect={() => setEditandoId(row.id)}
          >
            Editar organización
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem
            icon={row.estado === "suspendido" ? <Play size={15} aria-hidden /> : <Pause size={15} aria-hidden />}
            onSelect={() => setConfirmSuspender(row)}
          >
            {row.estado === "suspendido" ? "Reactivar" : "Suspender"}
          </DropdownItem>
          <DropdownItem
            icon={<Ban size={15} aria-hidden />}
            danger
            disabled={row.estado === "cancelado"}
            onSelect={() => setConfirmCancelar(row)}
          >
            Cancelar suscripción
          </DropdownItem>
        </DropdownMenu>
      ),
    },
  ];

  /* Opciones segmentado filtro estado */
  const opcionesEstado = [
    { label: "Todos", value: "todos" },
    { label: "Activos", value: "activo" },
    { label: "En prueba", value: "prueba" },
    { label: "Suspendidos", value: "suspendido" },
    { label: "Cancelados", value: "cancelado" },
  ];

  /* Formulario inicial para editar */
  const formEditar: FormState | undefined = tenantEditando
    ? {
        nombre: tenantEditando.nombre,
        nit: tenantEditando.nit,
        ciudad: tenantEditando.ciudad,
        contacto: tenantEditando.contacto,
        email: tenantEditando.email,
        plan: tenantEditando.plan,
        estado: tenantEditando.estado,
        modulos: tenantEditando.modulos,
      }
    : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Encabezado ────────────────────────────────────────────────────── */}
      <PageHeader
        title="Organizaciones"
        description="Gestión multi-tenant del ecosistema Prizma. Administra planes, módulos y estados por organización."
        icon={<Building2 size={22} aria-hidden />}
        bordered
        actions={
          <Button variant="primary" onClick={() => setModalNueva(true)}>
            + Nueva organización
          </Button>
        }
      />

      {/* ── KPIs ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        <StatCard
          label="Orgs. activas"
          value={totalActivos}
          delta={`+${totalActivos} activas`}
          trend="up"
          icon={<Building2 size={18} aria-hidden />}
        />
        <StatCard
          label="En periodo de prueba"
          value={totalEnPrueba}
          delta="Requieren seguimiento"
          trend="flat"
          icon={<FlaskConical size={18} aria-hidden />}
        />
        <StatCard
          label="Usuarios totales"
          value={totalUsuarios.toLocaleString("es-CO")}
          delta="+12 este mes"
          trend="up"
          icon={<Users size={18} aria-hidden />}
        />
        <StatCard
          label="Activaciones de módulos"
          value={totalModulos}
          delta={`${(totalModulos / tenants.length).toFixed(1)} por org.`}
          trend="flat"
          icon={<Puzzle size={18} aria-hidden />}
        />
      </div>

      {/* ── Filtros ───────────────────────────────────────────────────────── */}
      <Card>
        <CardBody>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div style={{ flex: "1 1 260px", minWidth: 220 }}>
              <SearchInput
                value={busqueda}
                onChange={setBusqueda}
                placeholder="Buscar por nombre, NIT, ciudad…"
              />
            </div>

            <div style={{ flex: "0 0 auto" }}>
              <Segmented
                value={filtroEstado}
                onChange={setFiltroEstado}
                options={opcionesEstado}
              />
            </div>

            <div style={{ flex: "0 0 auto", minWidth: 160 }}>
              <Select
                value={filtroPlan}
                onChange={(e) => setFiltroPlan(e.target.value)}
                aria-label="Filtrar por plan"
              >
                <option value="todos">Todos los planes</option>
                <option value="Esencial">Esencial</option>
                <option value="Profesional">Profesional</option>
                <option value="Empresarial">Empresarial</option>
                <option value="Personalizado">Personalizado</option>
              </Select>
            </div>

            {(busqueda || filtroEstado !== "todos" || filtroPlan !== "todos") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBusqueda("");
                  setFiltroEstado("todos");
                  setFiltroPlan("todos");
                }}
              >
                Limpiar filtros
              </Button>
            )}

            <span style={{ marginLeft: "auto", color: "var(--c-text-muted)", fontSize: 13 }}>
              {tenantsFiltrados.length} de {tenants.length} organizaciones
            </span>
          </div>
        </CardBody>
      </Card>

      {/* ── Tabla ─────────────────────────────────────────────────────────── */}
      <DataTable<Tenant>
        columns={columnas}
        rows={tenantsFiltrados}
        rowKey={(row) => row.id}
        sortable
        pageSize={8}
        ariaLabel="Tabla de organizaciones"
        empty={
          <span style={{ color: "var(--c-text-muted)", fontSize: 14 }}>
            No se encontraron organizaciones con los filtros actuales.
          </span>
        }
      />

      {/* ── Modal nueva organización ──────────────────────────────────────── */}
      <OrgModal
        open={modalNueva}
        onClose={() => setModalNueva(false)}
        onGuardar={crearOrg}
        titulo="Nueva organización"
      />

      {/* ── Modal editar organización ─────────────────────────────────────── */}
      <OrgModal
        open={editandoId !== null}
        onClose={() => setEditandoId(null)}
        onGuardar={editarOrg}
        inicial={formEditar}
        titulo={`Editar: ${tenantEditando?.nombre ?? ""}`}
      />

      {/* ── Confirm suspender/reactivar ───────────────────────────────────── */}
      <ConfirmDialog
        open={confirmSuspender !== null}
        onClose={() => setConfirmSuspender(null)}
        onConfirm={() => confirmSuspender && toggleSuspender(confirmSuspender)}
        title={
          confirmSuspender?.estado === "suspendido"
            ? `Reactivar "${confirmSuspender?.nombre}"`
            : `Suspender "${confirmSuspender?.nombre}"`
        }
        message={
          confirmSuspender?.estado === "suspendido"
            ? "La organización recuperará acceso a todos sus módulos habilitados."
            : "Los usuarios de esta organización perderán acceso al ecosistema hasta que sea reactivada."
        }
        confirmLabel={confirmSuspender?.estado === "suspendido" ? "Reactivar" : "Suspender"}
        tone={confirmSuspender?.estado === "suspendido" ? "primary" : "danger"}
      />

      {/* ── Confirm cancelar ──────────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmCancelar !== null}
        onClose={() => setConfirmCancelar(null)}
        onConfirm={() => confirmCancelar && cancelarOrg(confirmCancelar)}
        title={`Cancelar suscripción de "${confirmCancelar?.nombre}"`}
        message="Esta acción marcará la organización como cancelada. Los datos se conservarán pero el acceso quedará bloqueado permanentemente."
        confirmLabel="Cancelar suscripción"
        cancelLabel="Volver"
        tone="danger"
      />
    </div>
  );
}
