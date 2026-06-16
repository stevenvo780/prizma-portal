/**
 * UsersRolesView — Administración de usuarios, roles y permisos RBAC
 * Panel de administración de la suite Prizma.
 * Componente autocontenido: estado local, datos demo en español (es-CO).
 */
import * as React from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  SearchInput,
  Segmented,
  Select,
  StatusDot,
  Switch,
  Tabs,
} from "prizma-ui";
import type { DataTableColumn } from "prizma-ui";
import { Users, UserX } from "lucide-react";

/* ─── Tipos ─────────────────────────────────────────────────────────────── */

type Rol = "super_admin" | "admin" | "operador" | "comercial" | "viewer";
type Estado = "activo" | "inactivo" | "pendiente";

interface ModuloAcceso {
  key: string;
  nombre: string;
}

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  modulos: string[];
  estado: Estado;
  ultimoAcceso: string;
  avatar: string;
}

type PermisoKey = "leer" | "crear" | "editar" | "eliminar" | "exportar";

interface MatrizPermiso {
  rolKey: Rol;
  moduloKey: string;
  permisos: Record<PermisoKey, boolean>;
}

/* ─── Datos demo ─────────────────────────────────────────────────────────── */

const MODULOS: ModuloAcceso[] = [
  { key: "hermes", nombre: "Hermes (Graf)" },
  { key: "iris", nombre: "Iris (EMW)" },
  { key: "talaria", nombre: "Talaria (Logística)" },
  { key: "talanton", nombre: "Talanton (POS)" },
  { key: "pistis", nombre: "Pistis (Cartera)" },
  { key: "logos", nombre: "Logos (Facturación)" },
  { key: "peitho", nombre: "Peitho (Marketing)" },
  { key: "talos", nombre: "Talos (Automatización)" },
  { key: "nous", nombre: "Nous (HubCentral)" },
];

const ROLES: { key: Rol; label: string; descripcion: string }[] = [
  { key: "super_admin", label: "Super Admin", descripcion: "Acceso total a todos los módulos y configuración." },
  { key: "admin", label: "Administrador", descripcion: "Gestión de usuarios y acceso operativo completo." },
  { key: "operador", label: "Operador", descripcion: "Ejecución de flujos operativos: logística, POS y cartera." },
  { key: "comercial", label: "Comercial", descripcion: "Acceso a módulos de venta, mensajería y marketing." },
  { key: "viewer", label: "Solo lectura", descripcion: "Consulta sin modificar datos en ningún módulo." },
];

const ROL_TONE: Record<Rol, "danger" | "primary" | "warning" | "info" | "neutral"> = {
  super_admin: "danger",
  admin: "primary",
  operador: "warning",
  comercial: "info",
  viewer: "neutral",
};

const USUARIOS_DEMO: Usuario[] = [
  {
    id: "u1",
    nombre: "Valentina Torres Reyes",
    email: "vtorres@prizma.com.co",
    rol: "super_admin",
    modulos: MODULOS.map((m) => m.key),
    estado: "activo",
    ultimoAcceso: "hace 2 min",
    avatar: "VT",
  },
  {
    id: "u2",
    nombre: "Andrés Felipe Morales",
    email: "amorales@prizma.com.co",
    rol: "admin",
    modulos: ["hermes", "iris", "talaria", "talanton", "pistis", "logos", "peitho"],
    estado: "activo",
    ultimoAcceso: "hace 1 hora",
    avatar: "AF",
  },
  {
    id: "u3",
    nombre: "Catalina Ospina García",
    email: "cospina@prizma.com.co",
    rol: "operador",
    modulos: ["talaria", "talanton", "pistis"],
    estado: "activo",
    ultimoAcceso: "hace 3 horas",
    avatar: "CO",
  },
  {
    id: "u4",
    nombre: "Santiago Ríos Patiño",
    email: "srios@prizma.com.co",
    rol: "comercial",
    modulos: ["hermes", "iris", "peitho"],
    estado: "activo",
    ultimoAcceso: "ayer",
    avatar: "SR",
  },
  {
    id: "u5",
    nombre: "Luisa Fernanda Betancur",
    email: "lbetancur@prizma.com.co",
    rol: "comercial",
    modulos: ["hermes", "iris"],
    estado: "inactivo",
    ultimoAcceso: "hace 5 días",
    avatar: "LB",
  },
  {
    id: "u6",
    nombre: "Juan Camilo Herrera",
    email: "jcherrera@prizma.com.co",
    rol: "viewer",
    modulos: ["hermes", "logos"],
    estado: "pendiente",
    ultimoAcceso: "Nunca",
    avatar: "JC",
  },
  {
    id: "u7",
    nombre: "Mariana Quintero Salcedo",
    email: "mquintero@prizma.com.co",
    rol: "operador",
    modulos: ["talaria", "talos", "nous"],
    estado: "activo",
    ultimoAcceso: "hace 30 min",
    avatar: "MQ",
  },
  {
    id: "u8",
    nombre: "Esteban Cárdenas Vega",
    email: "ecardenas@prizma.com.co",
    rol: "admin",
    modulos: ["logos", "pistis", "nous"],
    estado: "activo",
    ultimoAcceso: "hace 2 horas",
    avatar: "EC",
  },
];

/* Matriz de permisos por defecto por rol y módulo */
function buildMatriz(): MatrizPermiso[] {
  const matriz: MatrizPermiso[] = [];
  for (const rol of ROLES) {
    for (const mod of MODULOS) {
      let permisos: Record<PermisoKey, boolean>;
      if (rol.key === "super_admin") {
        permisos = { leer: true, crear: true, editar: true, eliminar: true, exportar: true };
      } else if (rol.key === "admin") {
        permisos = {
          leer: true,
          crear: true,
          editar: true,
          eliminar: mod.key !== "nous",
          exportar: true,
        };
      } else if (rol.key === "operador") {
        const opModulos = ["talaria", "talanton", "pistis", "talos"];
        permisos = {
          leer: true,
          crear: opModulos.includes(mod.key),
          editar: opModulos.includes(mod.key),
          eliminar: false,
          exportar: opModulos.includes(mod.key),
        };
      } else if (rol.key === "comercial") {
        const comModulos = ["hermes", "iris", "peitho"];
        permisos = {
          leer: true,
          crear: comModulos.includes(mod.key),
          editar: comModulos.includes(mod.key),
          eliminar: false,
          exportar: comModulos.includes(mod.key),
        };
      } else {
        permisos = { leer: true, crear: false, editar: false, eliminar: false, exportar: false };
      }
      matriz.push({ rolKey: rol.key, moduloKey: mod.key, permisos });
    }
  }
  return matriz;
}

/* ─── Sub-componentes ────────────────────────────────────────────────────── */

function RolBadge({ rol }: { rol: Rol }) {
  const r = ROLES.find((r) => r.key === rol);
  return <Badge tone={ROL_TONE[rol]}>{r?.label ?? rol}</Badge>;
}

function EstadoBadge({ estado }: { estado: Estado }) {
  const cfg: Record<Estado, { label: string; status: "online" | "offline" | "idle" }> = {
    activo: { label: "Activo", status: "online" },
    inactivo: { label: "Inactivo", status: "offline" },
    pendiente: { label: "Pendiente", status: "idle" },
  };
  const { label, status } = cfg[estado];
  return <StatusDot status={status} label={label} />;
}

/* ─── Panel de invitación ────────────────────────────────────────────────── */

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  onInvite: (nombre: string, email: string, rol: Rol) => void;
}

function InviteModal({ open, onClose, onInvite }: InviteModalProps) {
  const [nombre, setNombre] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [rol, setRol] = React.useState<Rol>("comercial");
  const [error, setError] = React.useState<string | null>(null);

  const reset = () => {
    setNombre("");
    setEmail("");
    setRol("comercial");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) { setError("El nombre es requerido."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Ingresa un correo válido."); return; }
    onInvite(nombre.trim(), email.trim(), rol);
    reset();
    onClose();
  };

  const footer = (
    <div className="cui-row" style={{ justifyContent: "flex-end", gap: 8 }}>
      <Button variant="secondary" onClick={handleClose} type="button">
        Cancelar
      </Button>
      <Button variant="primary" type="submit" form="invite-form">
        Enviar invitación
      </Button>
    </div>
  );

  return (
    <Modal open={open} onClose={handleClose} title="Invitar usuario" footer={footer}>
      <form id="invite-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {error && (
          <div style={{ color: "var(--c-danger)", fontSize: 13, padding: "8px 12px", background: "var(--c-danger-subtle, rgba(220,50,50,.08))", borderRadius: 6 }}>
            {error}
          </div>
        )}
        <Field label="Nombre completo" htmlFor="inv-nombre">
          <Input
            id="inv-nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. María Alejandra Londoño"
            autoFocus
          />
        </Field>
        <Field label="Correo electrónico" htmlFor="inv-email">
          <Input
            id="inv-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@empresa.com.co"
          />
        </Field>
        <Field label="Rol asignado" htmlFor="inv-rol">
          <Select
            id="inv-rol"
            value={rol}
            onChange={(e) => setRol(e.target.value as Rol)}
          >
            {ROLES.map((r) => (
              <option key={r.key} value={r.key}>{r.label} — {r.descripcion}</option>
            ))}
          </Select>
        </Field>
        <p style={{ fontSize: 13, color: "var(--c-text-muted)", margin: 0 }}>
          Se enviará un correo de activación con un enlace válido por 48 horas.
        </p>
      </form>
    </Modal>
  );
}

/* ─── Tabla de usuarios ──────────────────────────────────────────────────── */

interface UsersTableProps {
  usuarios: Usuario[];
  busqueda: string;
  onBusqueda: (v: string) => void;
  filtroEstado: string;
  onFiltroEstado: (v: string) => void;
  onToggleEstado: (id: string) => void;
  onEliminar: (id: string) => void;
}

function UsersTable({
  usuarios,
  busqueda,
  onBusqueda,
  filtroEstado,
  onFiltroEstado,
  onToggleEstado,
  onEliminar,
}: UsersTableProps) {
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  const usuariosFiltrados = React.useMemo(() => {
    let list = usuarios;
    if (filtroEstado !== "todos") list = list.filter((u) => u.estado === filtroEstado);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      list = list.filter(
        (u) =>
          u.nombre.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          ROLES.find((r) => r.key === u.rol)?.label.toLowerCase().includes(q)
      );
    }
    return list;
  }, [usuarios, busqueda, filtroEstado]);

  const columnas: DataTableColumn<Usuario>[] = [
    {
      key: "nombre",
      header: "Usuario",
      sortable: true,
      render: (row) => (
        <div className="cui-row" style={{ gap: 10, alignItems: "center" }}>
          <span
            className="cui-avatar"
            aria-hidden
            style={{ width: 34, height: 34, fontSize: 13, flexShrink: 0 }}
          >
            {row.avatar}
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{row.nombre}</div>
            <div style={{ color: "var(--c-text-muted)", fontSize: 12 }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "rol",
      header: "Rol",
      sortable: true,
      render: (row) => <RolBadge rol={row.rol} />,
    },
    {
      key: "modulos",
      header: "Módulos",
      render: (row) => (
        <div className="cui-row cui-row--wrap" style={{ gap: 4 }}>
          {row.modulos.slice(0, 3).map((m) => {
            const mod = MODULOS.find((x) => x.key === m);
            return (
              <Badge key={m} tone="neutral" style={{ fontSize: 11 }}>
                {mod?.nombre.split(" ")[0] ?? m}
              </Badge>
            );
          })}
          {row.modulos.length > 3 && (
            <Badge tone="neutral" style={{ fontSize: 11 }}>
              +{row.modulos.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      sortable: true,
      render: (row) => <EstadoBadge estado={row.estado} />,
    },
    {
      key: "ultimoAcceso",
      header: "Último acceso",
      render: (row) => (
        <span style={{ color: "var(--c-text-muted)", fontSize: 13 }}>{row.ultimoAcceso}</span>
      ),
    },
    {
      key: "id",
      header: "Activo",
      align: "center",
      render: (row) => (
        <Switch
          checked={row.estado === "activo"}
          onChange={() => onToggleEstado(row.id)}
          aria-label={`${row.estado === "activo" ? "Desactivar" : "Activar"} ${row.nombre}`}
        />
      ),
    },
    {
      key: "id",
      header: "",
      align: "right",
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirmId(row.id)}
          style={{ color: "var(--c-danger)" }}
        >
          Revocar
        </Button>
      ),
    },
  ] as DataTableColumn<Usuario>[];

  const usuarioAEliminar = confirmId ? usuarios.find((u) => u.id === confirmId) : null;

  return (
    <>
      <div
        className="cui-row cui-row--wrap"
        style={{ gap: 12, marginBottom: 16, alignItems: "center" }}
      >
        <SearchInput
          value={busqueda}
          onChange={onBusqueda}
          placeholder="Buscar por nombre, correo o rol…"
          style={{ maxWidth: 340 }}
        />
        <Segmented
          value={filtroEstado}
          onChange={onFiltroEstado}
          options={[
            { value: "todos", label: "Todos" },
            { value: "activo", label: "Activos" },
            { value: "inactivo", label: "Inactivos" },
            { value: "pendiente", label: "Pendientes" },
          ]}
        />
        <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--c-text-muted)" }}>
          {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      <DataTable<Usuario>
        columns={columnas}
        rows={usuariosFiltrados}
        rowKey={(row) => row.id}
        sortable
        pageSize={6}
        ariaLabel="Tabla de usuarios"
        empty={
          <EmptyState
            icon={<UserX size={32} aria-hidden />}
            title="Sin resultados"
            description="No se encontraron usuarios con los filtros actuales."
          />
        }
      />

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) onEliminar(confirmId);
          setConfirmId(null);
        }}
        tone="danger"
        title="Revocar acceso"
        message={
          usuarioAEliminar
            ? `¿Confirmas que deseas revocar el acceso de ${usuarioAEliminar.nombre}? Esta acción desvincula al usuario de todos los módulos.`
            : "¿Confirmas que deseas revocar el acceso de este usuario?"
        }
        confirmLabel="Sí, revocar"
        cancelLabel="Cancelar"
      />
    </>
  );
}

/* ─── Matriz de permisos ─────────────────────────────────────────────────── */

const PERMISOS: { key: PermisoKey; label: string }[] = [
  { key: "leer", label: "Leer" },
  { key: "crear", label: "Crear" },
  { key: "editar", label: "Editar" },
  { key: "eliminar", label: "Eliminar" },
  { key: "exportar", label: "Exportar" },
];

interface MatrizProps {
  matriz: MatrizPermiso[];
  onToggle: (rolKey: Rol, moduloKey: string, permisoKey: PermisoKey) => void;
  rolSeleccionado: Rol;
  onRolSeleccionado: (r: Rol) => void;
}

function MatrizPermisos({ matriz, onToggle, rolSeleccionado, onRolSeleccionado }: MatrizProps) {
  const entradas = matriz.filter((m) => m.rolKey === rolSeleccionado);
  const isSuperAdmin = rolSeleccionado === "super_admin";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Selector de rol */}
      <div className="cui-row cui-row--wrap" style={{ gap: 8 }}>
        {ROLES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => onRolSeleccionado(r.key)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid var(--c-border)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: rolSeleccionado === r.key ? 700 : 400,
              background:
                rolSeleccionado === r.key
                  ? "var(--c-primary)"
                  : "var(--c-surface)",
              color:
                rolSeleccionado === r.key
                  ? "#fff"
                  : "var(--c-text)",
              transition: "all .15s",
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Descripción del rol */}
      {ROLES.find((r) => r.key === rolSeleccionado) && (
        <p style={{ fontSize: 13, color: "var(--c-text-muted)", margin: 0 }}>
          {ROLES.find((r) => r.key === rolSeleccionado)?.descripcion}
          {isSuperAdmin && (
            <> <Badge tone="danger" style={{ marginLeft: 8, fontSize: 11 }}>Permisos bloqueados — acceso total</Badge></>
          )}
        </p>
      )}

      {/* Tabla de permisos */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
          }}
          aria-label={`Permisos del rol ${ROLES.find((r) => r.key === rolSeleccionado)?.label}`}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px 12px",
                  color: "var(--c-text-muted)",
                  fontWeight: 600,
                  borderBottom: "1px solid var(--c-border)",
                  minWidth: 160,
                }}
              >
                Módulo
              </th>
              {PERMISOS.map((p) => (
                <th
                  key={p.key}
                  style={{
                    padding: "8px 12px",
                    color: "var(--c-text-muted)",
                    fontWeight: 600,
                    borderBottom: "1px solid var(--c-border)",
                    textAlign: "center",
                    minWidth: 72,
                  }}
                >
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entradas.map((entrada, idx) => {
              const mod = MODULOS.find((m) => m.key === entrada.moduloKey);
              return (
                <tr
                  key={entrada.moduloKey}
                  style={{
                    background:
                      idx % 2 === 0 ? "transparent" : "var(--c-surface-raised, rgba(0,0,0,.02))",
                  }}
                >
                  <td
                    style={{
                      padding: "10px 12px",
                      fontWeight: 500,
                      borderBottom: "1px solid var(--c-border)",
                    }}
                  >
                    {mod?.nombre ?? entrada.moduloKey}
                  </td>
                  {PERMISOS.map((p) => (
                    <td
                      key={p.key}
                      style={{
                        textAlign: "center",
                        padding: "10px 12px",
                        borderBottom: "1px solid var(--c-border)",
                      }}
                    >
                      <Switch
                        checked={entrada.permisos[p.key]}
                        disabled={isSuperAdmin}
                        onChange={() => onToggle(entrada.rolKey, entrada.moduloKey, p.key)}
                        aria-label={`${p.label} en ${mod?.nombre ?? entrada.moduloKey} para ${rolSeleccionado}`}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Tarjetas resumen de roles ──────────────────────────────────────────── */

function RolesResumen({ usuarios }: { usuarios: Usuario[] }) {
  const conteo = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const u of usuarios) {
      map[u.rol] = (map[u.rol] ?? 0) + 1;
    }
    return map;
  }, [usuarios]);

  return (
    <div
      className="cui-grid"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}
    >
      {ROLES.map((r) => (
        <Card key={r.key}>
          <CardBody
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              padding: "14px 16px",
            }}
          >
            <RolBadge rol={r.key} />
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
              {conteo[r.key] ?? 0}
            </div>
            <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>
              usuario{(conteo[r.key] ?? 0) !== 1 ? "s" : ""}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

/* ─── Vista principal ────────────────────────────────────────────────────── */

export function UsersRolesView() {
  /* Estado usuarios */
  const [usuarios, setUsuarios] = React.useState<Usuario[]>(USUARIOS_DEMO);
  const [busqueda, setBusqueda] = React.useState("");
  const [filtroEstado, setFiltroEstado] = React.useState("todos");

  /* Invitación */
  const [inviteOpen, setInviteOpen] = React.useState(false);

  /* Matriz de permisos */
  const [matriz, setMatriz] = React.useState<MatrizPermiso[]>(buildMatriz);
  const [rolSeleccionado, setRolSeleccionado] = React.useState<Rol>("admin");

  /* Acciones usuarios */
  const handleToggleEstado = React.useCallback((id: string) => {
    setUsuarios((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const siguiente: Estado = u.estado === "activo" ? "inactivo" : "activo";
        return { ...u, estado: siguiente };
      })
    );
  }, []);

  const handleEliminar = React.useCallback((id: string) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const handleInvitar = React.useCallback(
    (nombre: string, email: string, rol: Rol) => {
      const nuevo: Usuario = {
        id: `u${Date.now()}`,
        nombre,
        email,
        rol,
        modulos:
          rol === "super_admin" || rol === "admin"
            ? MODULOS.map((m) => m.key)
            : rol === "operador"
            ? ["talaria", "talanton", "pistis"]
            : rol === "comercial"
            ? ["hermes", "iris", "peitho"]
            : ["hermes"],
        estado: "pendiente",
        ultimoAcceso: "Nunca",
        avatar: nombre
          .split(" ")
          .slice(0, 2)
          .map((p) => p[0])
          .join("")
          .toUpperCase(),
      };
      setUsuarios((prev) => [nuevo, ...prev]);
    },
    []
  );

  /* Toggle permiso en la matriz */
  const handleTogglePermiso = React.useCallback(
    (rolKey: Rol, moduloKey: string, permisoKey: PermisoKey) => {
      setMatriz((prev) =>
        prev.map((m) => {
          if (m.rolKey !== rolKey || m.moduloKey !== moduloKey) return m;
          return {
            ...m,
            permisos: { ...m.permisos, [permisoKey]: !m.permisos[permisoKey] },
          };
        })
      );
    },
    []
  );

  /* Estadísticas rápidas */
  const totalActivos = usuarios.filter((u) => u.estado === "activo").length;
  const totalPendientes = usuarios.filter((u) => u.estado === "pendiente").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Encabezado */}
      <PageHeader
        title="Usuarios y roles"
        description="Gestiona los usuarios del ecosistema Prizma, sus roles y permisos por módulo (RBAC)."
        icon={<Users size={22} aria-hidden />}
        bordered
        actions={
          <Button
            variant="primary"
            onClick={() => setInviteOpen(true)}
            leftIcon={<span aria-hidden>+</span>}
          >
            Invitar usuario
          </Button>
        }
      />

      {/* Métricas rápidas */}
      <div
        className="cui-grid"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}
      >
        {[
          { label: "Total usuarios", value: usuarios.length, tone: "neutral" as const },
          {
            label: "Activos",
            value: totalActivos,
            tone: "success" as const,
          },
          {
            label: "Pendientes",
            value: totalPendientes,
            tone: "warning" as const,
          },
          {
            label: "Módulos",
            value: MODULOS.length,
            tone: "primary" as const,
          },
          {
            label: "Roles definidos",
            value: ROLES.length,
            tone: "info" as const,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 12, color: "var(--c-text-muted)", marginBottom: 4 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
                {stat.value}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Tabs principales */}
      <Tabs
        defaultValue="usuarios"
        tabs={[
          {
            key: "usuarios",
            label: "Usuarios",
            content: (
              <div style={{ paddingTop: 20 }}>
                <Card>
                  <CardHeader
                    title="Directorio de usuarios"
                    subtitle="Activa, desactiva o revoca el acceso de cada miembro."
                  />
                  <CardBody>
                    <UsersTable
                      usuarios={usuarios}
                      busqueda={busqueda}
                      onBusqueda={setBusqueda}
                      filtroEstado={filtroEstado}
                      onFiltroEstado={setFiltroEstado}
                      onToggleEstado={handleToggleEstado}
                      onEliminar={handleEliminar}
                    />
                  </CardBody>
                </Card>
              </div>
            ),
          },
          {
            key: "roles",
            label: "Roles",
            content: (
              <div style={{ paddingTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                <Card>
                  <CardHeader
                    title="Distribución por rol"
                    subtitle="Usuarios actualmente asignados a cada perfil de acceso."
                  />
                  <CardBody>
                    <RolesResumen usuarios={usuarios} />
                  </CardBody>
                </Card>
              </div>
            ),
          },
          {
            key: "permisos",
            label: "Matriz de permisos",
            content: (
              <div style={{ paddingTop: 20 }}>
                <Card>
                  <CardHeader
                    title="Permisos por rol y módulo"
                    subtitle="Configura qué operaciones puede ejecutar cada rol en cada módulo del ecosistema."
                  />
                  <CardBody>
                    <MatrizPermisos
                      matriz={matriz}
                      onToggle={handleTogglePermiso}
                      rolSeleccionado={rolSeleccionado}
                      onRolSeleccionado={setRolSeleccionado}
                    />
                  </CardBody>
                </Card>
              </div>
            ),
          },
        ]}
      />

      {/* Modal invitar usuario */}
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvitar}
      />
    </div>
  );
}
