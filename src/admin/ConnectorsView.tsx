/**
 * ConnectorsView — Panel de administración de conectores externos para la suite Prizma.
 *
 * Gestiona credenciales cifradas (SSOT) de los conectores del ecosistema:
 * Logos/Siigo, Mnemosyne/Soft-IA, Mercado Pago, WhatsApp Business y Firebase Auth.
 *
 * Principio de tolerancia a fallos: cada conector opera de forma independiente.
 * Si un conector cae, el resto del ecosistema sigue funcionando.
 */
import * as React from "react";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  Switch,
  Field,
  Input,
  PasswordInput,
  Select,
  Modal,
  ConfirmDialog,
  Tabs,
  StatCard,
  StatusDot,
  SearchInput,
  Segmented,
  InlineMessage,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableWrap,
  EmptyState,
} from "prizma-ui";
import {
  Calculator,
  BrainCircuit,
  ShoppingCart,
  MessageCircle,
  KeyRound,
  Plug,
  Activity,
  Zap,
  ShieldCheck,
} from "lucide-react";

/* ─── Tipos ─────────────────────────────────────────────────────────────────── */

type ConnectorStatus = "online" | "offline" | "idle";
type ConnectorCategory = "facturacion" | "crm" | "pagos" | "mensajeria" | "auth";

interface ConnectorField {
  key: string;
  label: string;
  type: "text" | "password" | "select";
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
}

interface Connector {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: ConnectorCategory;
  proveedor: string;
  version: string;
  estado: ConnectorStatus;
  activo: boolean;
  ultimaConexion: string;
  /** Icono de marca del conector (lucide-react). */
  logo: React.ReactNode;
  /** Qué módulo Prizma depende de este conector */
  moduloPrizma: string;
  /** Campos de configuración de credenciales */
  campos: ConnectorField[];
  /** Credenciales demo (valores enmascarados) */
  credenciales: Record<string, string>;
  /** Cuántos eventos procesó en las últimas 24h */
  eventos24h: number;
  toleranciaFallo: string;
}

/* ─── Datos demo ─────────────────────────────────────────────────────────────── */

const CONECTORES: Connector[] = [
  {
    id: "siigo",
    nombre: "Siigo",
    descripcion: "Facturación electrónica DIAN. Emite, anula y consulta facturas electrónicas en tiempo real.",
    categoria: "facturacion",
    proveedor: "Siigo S.A.S.",
    version: "v2.3.1",
    estado: "online",
    activo: true,
    ultimaConexion: "hace 2 min",
    logo: <Calculator size={24} aria-hidden />,
    moduloPrizma: "Logos (ApiSigo)",
    eventos24h: 342,
    toleranciaFallo: "Facturación en cola. Los pedidos siguen procesándose; la factura se emite al reconectar.",
    campos: [
      { key: "usuario", label: "Usuario Siigo", type: "text", placeholder: "usuario@empresa.com.co", help: "Correo registrado en el portal Siigo" },
      { key: "contrasena", label: "Contraseña", type: "password", placeholder: "••••••••", help: "Cifrada en reposo con AES-256 · nunca se transmite en texto plano" },
      { key: "nit", label: "NIT empresa", type: "text", placeholder: "900123456-1", help: "NIT con dígito de verificación" },
      { key: "ambiente", label: "Ambiente", type: "select", options: [{ value: "produccion", label: "Producción" }, { value: "habilitacion", label: "Habilitación (pruebas)" }] },
    ],
    credenciales: { usuario: "contabilidad@soydigital.co", contrasena: "••••••••••••", nit: "900987654-2", ambiente: "produccion" },
  },
  {
    id: "softia",
    nombre: "Soft-IA CRM",
    descripcion: "Sincronización bidireccional de clientes, historial de compras y segmentos con el CRM Soft-IA.",
    categoria: "crm",
    proveedor: "Soft-IA Colombia",
    version: "v1.8.0",
    estado: "online",
    activo: true,
    ultimaConexion: "hace 5 min",
    logo: <BrainCircuit size={24} aria-hidden />,
    moduloPrizma: "Mnemosyne (ApiSoftia)",
    eventos24h: 218,
    toleranciaFallo: "Actualizaciones de CRM en cola local. El historial de compras se sincroniza al reconectar.",
    campos: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "sk-••••••••••••••••", help: "Llave de integración · cifrada en reposo · no compartir" },
      { key: "baseUrl", label: "URL base", type: "text", placeholder: "https://api.soft-ia.co/v2", help: "Endpoint de producción del CRM" },
      { key: "tenantId", label: "Tenant ID", type: "text", placeholder: "tenant-xyz-001", help: "Identificador de la empresa en Soft-IA" },
      { key: "syncIntervalo", label: "Intervalo de sincronización", type: "select", options: [{ value: "rt", label: "Tiempo real" }, { value: "5m", label: "Cada 5 minutos" }, { value: "1h", label: "Cada hora" }] },
    ],
    credenciales: { apiKey: "sk-••••••••••••••••••••", baseUrl: "https://api.soft-ia.co/v2", tenantId: "tenant-soydigital-01", syncIntervalo: "rt" },
  },
  {
    id: "mercadopago",
    nombre: "Mercado Pago",
    descripcion: "Pasarela de pagos central de la suite Prizma. Procesa tarjetas, PSE, transferencias, billetera MP y pagos en efectivo. Configuración única para todo el ecosistema — no por tienda.",
    categoria: "pagos",
    proveedor: "Mercado Pago (MercadoLibre)",
    version: "API v1 (SDK v2)",
    estado: "online",
    activo: true,
    ultimaConexion: "hace 1 min",
    logo: <ShoppingCart size={24} aria-hidden />,
    moduloPrizma: "Hermes (Graf) · Talanton (Sinergia POS)",
    eventos24h: 87,
    toleranciaFallo: "Nuevos pagos se bloquean temporalmente. Otros medios de pago siguen disponibles. Los intentos fallidos se registran para reintento.",
    campos: [
      { key: "accessToken", label: "Access Token", type: "password", placeholder: "APP_USR-••••••••••••••••-••••••-••••••••••••••••••••••••••••••••-••••••••", help: "Token de acceso de producción · cifrado en reposo · nunca expuesto al frontend" },
      { key: "publicKey", label: "Public Key", type: "text", placeholder: "APP_USR-••••••••-••••-••••-••••-••••••••••••", help: "Clave pública para inicializar el SDK en el frontend (no es secreta)" },
      { key: "webhookSecret", label: "Webhook Secret", type: "password", placeholder: "••••••••••••••••••••••••••••••••", help: "Secret para validar la firma HMAC-SHA256 de los eventos · cifrado en reposo" },
      { key: "ambiente", label: "Ambiente", type: "select", options: [{ value: "produccion", label: "Producción" }, { value: "sandbox", label: "Sandbox (pruebas)" }] },
    ],
    credenciales: { accessToken: "APP_USR-••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••", publicKey: "APP_USR-••••••••-••••-••••-••••-••••••••••••", webhookSecret: "••••••••••••••••••••••••••••••••", ambiente: "produccion" },
  },
  {
    id: "whatsapp",
    nombre: "WhatsApp Business",
    descripcion: "Canal de mensajería para pedidos, notificaciones y campañas masivas vía WhatsApp Business API (Meta).",
    categoria: "mensajeria",
    proveedor: "Meta (Cloud API)",
    version: "v18.0",
    estado: "idle",
    activo: true,
    ultimaConexion: "hace 18 min",
    logo: <MessageCircle size={24} aria-hidden />,
    moduloPrizma: "Iris (EMW) · Hermes (Graf)",
    eventos24h: 531,
    toleranciaFallo: "Notificaciones en cola. El pedido se confirma; el mensaje se reintenta hasta 24h después.",
    campos: [
      { key: "phoneNumberId", label: "Phone Number ID", type: "text", placeholder: "1234567890123456", help: "ID del número registrado en Meta Business" },
      { key: "accessToken", label: "Access Token", type: "password", placeholder: "EAAb••••••••••••••••", help: "Token de larga duración · cifrado en reposo · rota cada 90 días" },
      { key: "wabaId", label: "WABA ID", type: "text", placeholder: "987654321098765", help: "WhatsApp Business Account ID" },
      { key: "webhook", label: "Verify Token Webhook", type: "password", placeholder: "verify_••••••••", help: "Token de verificación del webhook de Meta" },
    ],
    credenciales: { phoneNumberId: "1234567890123456", accessToken: "EAAb••••••••••••••••", wabaId: "987654321098765", webhook: "verify_••••••••" },
  },
  {
    id: "firebase",
    nombre: "Firebase Auth",
    descripcion: "Autenticación de usuarios del ecosistema Prizma. Gestiona sesiones, tokens JWT y social login.",
    categoria: "auth",
    proveedor: "Google Firebase",
    version: "Firebase Admin SDK 12",
    estado: "offline",
    activo: false,
    ultimaConexion: "hace 2 horas",
    logo: <KeyRound size={24} aria-hidden />,
    moduloPrizma: "Todos los módulos (autenticación central)",
    eventos24h: 0,
    toleranciaFallo: "CRÍTICO: sin Firebase Auth los usuarios no pueden iniciar sesión. Activar de inmediato o usar proveedor alternativo.",
    campos: [
      { key: "projectId", label: "Project ID", type: "text", placeholder: "prizma-prod-co", help: "Identificador del proyecto Firebase" },
      { key: "clientEmail", label: "Client Email (Service Account)", type: "text", placeholder: "firebase-adminsdk@prizma-prod.iam.gserviceaccount.com", help: "Correo de la cuenta de servicio" },
      { key: "privateKey", label: "Private Key (Service Account)", type: "password", placeholder: "-----BEGIN PRIVATE KEY-----\n••••••••\n-----END PRIVATE KEY-----", help: "Clave RSA privada · cifrada en reposo · nunca en el frontend" },
      { key: "storageBucket", label: "Storage Bucket", type: "text", placeholder: "prizma-prod-co.appspot.com", help: "Bucket predeterminado (opcional)" },
    ],
    credenciales: { projectId: "prizma-prod-co", clientEmail: "firebase-adminsdk@prizma-prod.iam.gserviceaccount.com", privateKey: "-----BEGIN PRIVATE KEY-----\n••••••••\n-----END PRIVATE KEY-----", storageBucket: "prizma-prod-co.appspot.com" },
  },
];

const CATEGORIA_LABELS: Record<ConnectorCategory, string> = {
  facturacion: "Facturación",
  crm: "CRM",
  pagos: "Pagos",
  mensajeria: "Mensajería",
  auth: "Autenticación",
};

const CATEGORIA_TONES: Record<ConnectorCategory, "primary" | "success" | "warning" | "info" | "danger" | "neutral"> = {
  facturacion: "primary",
  crm: "info",
  pagos: "success",
  mensajeria: "warning",
  auth: "danger",
};

/* ─── Subcomponentes ─────────────────────────────────────────────────────────── */

/** Fila de configuración de credencial */
function CredentialField({ campo, value, onChange }: {
  campo: ConnectorField;
  value: string;
  onChange: (v: string) => void;
}) {
  if (campo.type === "select") {
    return (
      <Field label={campo.label} help={campo.help} htmlFor={campo.key}>
        <Select
          id={campo.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {(campo.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </Field>
    );
  }
  if (campo.type === "password") {
    return (
      <Field label={campo.label} help={campo.help} htmlFor={campo.key}>
        <PasswordInput
          id={campo.key}
          value={value}
          placeholder={campo.placeholder}
          onChange={(e) => onChange(e.target.value)}
          showLabel="Mostrar credencial"
          hideLabel="Ocultar credencial"
        />
      </Field>
    );
  }
  return (
    <Field label={campo.label} help={campo.help} htmlFor={campo.key}>
      <Input
        id={campo.key}
        value={value}
        placeholder={campo.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

/** Modal de configuración de un conector */
function ConnectorConfigModal({ conector, open, onClose, onSave }: {
  conector: Connector;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, credenciales: Record<string, string>) => void;
}) {
  const [creds, setCreds] = React.useState<Record<string, string>>(conector.credenciales);
  const [saving, setSaving] = React.useState(false);

  // Reset al abrir
  React.useEffect(() => {
    if (open) setCreds(conector.credenciales);
  }, [open, conector.credenciales]);

  const handleSave = () => {
    setSaving(true);
    // Simula latencia de guardado
    setTimeout(() => {
      onSave(conector.id, creds);
      setSaving(false);
      onClose();
    }, 900);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="cui-row" style={{ gap: 10, alignItems: "center" }}>
          <span style={{ display: "inline-flex", color: "var(--c-primary)" }}>{conector.logo}</span>
          <div>
            <div style={{ fontWeight: 600 }}>Configurar {conector.nombre}</div>
            <div style={{ fontSize: 13, color: "var(--c-text-muted)", fontWeight: 400 }}>
              {conector.proveedor} · {conector.version}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="cui-row" style={{ gap: 8, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Guardar credenciales
          </Button>
        </div>
      }
      style={{ maxWidth: 540, width: "100%" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <InlineMessage tone="info">
          Cifrado en reposo con AES-256. Las credenciales nunca se transmiten en texto plano
          ni se exponen al frontend. Principio SSOT: un solo origen de verdad por conector.
        </InlineMessage>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {conector.campos.map((campo) => (
            <CredentialField
              key={campo.key}
              campo={campo}
              value={creds[campo.key] ?? ""}
              onChange={(v) => setCreds((prev) => ({ ...prev, [campo.key]: v }))}
            />
          ))}
        </div>

        {conector.estado === "offline" && (
          <InlineMessage tone="warning">
            {conector.toleranciaFallo}
          </InlineMessage>
        )}

        <div style={{ borderTop: "1px solid var(--c-border)", paddingTop: 12 }}>
          <div style={{ fontSize: 12, color: "var(--c-text-subtle)" }}>
            Módulo Prizma asociado: <strong>{conector.moduloPrizma}</strong>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/** Tarjeta de resumen de un conector */
function ConnectorCard({ conector, onToggle, onConfigure }: {
  conector: Connector;
  onToggle: (id: string) => void;
  onConfigure: (id: string) => void;
}) {
  const statusLabel: Record<ConnectorStatus, string> = {
    online: "Conectado",
    offline: "Sin conexión",
    idle: "En espera",
  };

  return (
    <Card style={{ height: "100%" }}>
      <CardBody style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Cabecera conector */}
        <div className="cui-row cui-row--between" style={{ alignItems: "flex-start", gap: 8 }}>
          <div className="cui-row" style={{ gap: 10, alignItems: "center" }}>
            <span style={{ display: "inline-flex", color: "var(--c-primary)" }}>{conector.logo}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{conector.nombre}</div>
              <div style={{ fontSize: 12, color: "var(--c-text-subtle)" }}>{conector.proveedor}</div>
            </div>
          </div>
          <Switch
            checked={conector.activo}
            onChange={() => onToggle(conector.id)}
            aria-label={`${conector.activo ? "Desactivar" : "Activar"} ${conector.nombre}`}
          />
        </div>

        {/* Badges de estado */}
        <div className="cui-row" style={{ gap: 8, flexWrap: "wrap" }}>
          <Badge tone={CATEGORIA_TONES[conector.categoria]}>
            {CATEGORIA_LABELS[conector.categoria]}
          </Badge>
          <Badge tone={conector.activo ? "success" : "neutral"}>
            {conector.activo ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        {/* Descripción */}
        <p style={{ color: "var(--c-text-muted)", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
          {conector.descripcion}
        </p>

        {/* Estado de conexión */}
        <div className="cui-row" style={{ gap: 8, alignItems: "center" }}>
          <StatusDot
            status={conector.estado}
            pulse={conector.estado === "online"}
            size="sm"
          />
          <span style={{ fontSize: 13, color: "var(--c-text-muted)" }}>
            {statusLabel[conector.estado]} · {conector.ultimaConexion}
          </span>
        </div>

        {/* Módulo Prizma */}
        <div style={{ fontSize: 12, color: "var(--c-text-subtle)" }}>
          Módulo: <span style={{ color: "var(--c-text-default)" }}>{conector.moduloPrizma}</span>
        </div>

        {/* Eventos 24h */}
        <div style={{ fontSize: 12, color: "var(--c-text-subtle)" }}>
          Eventos (24h):{" "}
          <strong style={{ color: conector.eventos24h > 0 ? "var(--c-success)" : "var(--c-text-subtle)" }}>
            {conector.eventos24h.toLocaleString("es-CO")}
          </strong>
        </div>

        {/* Tolerancia a fallo */}
        {conector.estado !== "online" && (
          <InlineMessage tone={conector.estado === "offline" ? "warning" : "neutral"}>
            {conector.toleranciaFallo}
          </InlineMessage>
        )}

        {/* Acción */}
        <Button
          variant="secondary"
          size="sm"
          block
          style={{ marginTop: 4 }}
          onClick={() => onConfigure(conector.id)}
        >
          Configurar credenciales
        </Button>
      </CardBody>
    </Card>
  );
}

/* ─── Vista principal ────────────────────────────────────────────────────────── */

export function ConnectorsView() {
  /* --- Estado local --- */
  const [conectores, setConectores] = React.useState<Connector[]>(CONECTORES);
  const [busqueda, setBusqueda] = React.useState("");
  const [filtroCategoria, setFiltroCategoria] = React.useState("todos");
  const [vistaActiva, setVistaActiva] = React.useState("tarjetas");
  const [modalAbierto, setModalAbierto] = React.useState<string | null>(null);
  const [confirmDesactivar, setConfirmDesactivar] = React.useState<string | null>(null);

  /* --- Filtros --- */
  const conectoresFiltrados = React.useMemo(() => {
    let lista = conectores;
    if (filtroCategoria !== "todos") {
      lista = lista.filter((c) => c.categoria === filtroCategoria);
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (c) =>
          c.nombre.toLowerCase().includes(q) ||
          c.descripcion.toLowerCase().includes(q) ||
          c.proveedor.toLowerCase().includes(q) ||
          c.moduloPrizma.toLowerCase().includes(q)
      );
    }
    return lista;
  }, [conectores, filtroCategoria, busqueda]);

  /* --- Métricas resumen --- */
  const totalActivos = conectores.filter((c) => c.activo).length;
  const totalOnline = conectores.filter((c) => c.estado === "online").length;
  const totalOffline = conectores.filter((c) => c.estado === "offline").length;
  const totalEventos24h = conectores.reduce((sum, c) => sum + c.eventos24h, 0);

  /* --- Handlers --- */
  const abrirModal = (id: string) => setModalAbierto(id);
  const cerrarModal = () => setModalAbierto(null);

  const handleToggle = (id: string) => {
    const conector = conectores.find((c) => c.id === id);
    if (!conector) return;
    if (conector.activo) {
      // Pedir confirmación al desactivar
      setConfirmDesactivar(id);
    } else {
      setConectores((prev) =>
        prev.map((c) => (c.id === id ? { ...c, activo: true } : c))
      );
    }
  };

  const confirmarDesactivar = () => {
    if (!confirmDesactivar) return;
    setConectores((prev) =>
      prev.map((c) => (c.id === confirmDesactivar ? { ...c, activo: false } : c))
    );
    setConfirmDesactivar(null);
  };

  const handleSaveCredenciales = (id: string, credenciales: Record<string, string>) => {
    setConectores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, credenciales } : c))
    );
  };

  /* --- Conector activo en modal --- */
  const conectorEnModal = modalAbierto ? conectores.find((c) => c.id === modalAbierto) : null;
  const conectorParaDesactivar = confirmDesactivar ? conectores.find((c) => c.id === confirmDesactivar) : null;

  /* --- Opciones de filtro de categoría --- */
  const CATEGORIAS_SEGMENTED = [
    { value: "todos", label: "Todos" },
    { value: "facturacion", label: "Facturación" },
    { value: "crm", label: "CRM" },
    { value: "pagos", label: "Pagos" },
    { value: "mensajeria", label: "Mensajería" },
    { value: "auth", label: "Auth" },
  ];

  /* --- Tabs de vista (tarjetas / tabla) --- */
  const tabsTarjetas = (
    <div
      className="cui-grid"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}
    >
      {conectoresFiltrados.length === 0 ? (
        <div style={{ gridColumn: "1 / -1" }}>
          <EmptyState
            icon={<Plug size={32} aria-hidden />}
            title="Sin conectores para mostrar"
            description="Ajusta el filtro o el término de búsqueda para ver los conectores disponibles."
            action={
              <Button variant="secondary" size="sm" onClick={() => { setBusqueda(""); setFiltroCategoria("todos"); }}>
                Limpiar filtros
              </Button>
            }
          />
        </div>
      ) : (
        conectoresFiltrados.map((c) => (
          <ConnectorCard
            key={c.id}
            conector={c}
            onToggle={handleToggle}
            onConfigure={abrirModal}
          />
        ))
      )}
    </div>
  );

  const statusLabel: Record<ConnectorStatus, string> = {
    online: "Conectado",
    offline: "Sin conexión",
    idle: "En espera",
  };

  const tabsTabla = (
    <TableWrap>
      <Table>
        <Thead>
          <Tr>
            <Th>Conector</Th>
            <Th>Categoría</Th>
            <Th>Estado</Th>
            <Th>Eventos (24h)</Th>
            <Th>Módulo Prizma</Th>
            <Th>Activo</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {conectoresFiltrados.length === 0 ? (
            <Tr>
              <Td colSpan={7} style={{ textAlign: "center", color: "var(--c-text-muted)", padding: "32px 0" }}>
                Sin conectores para mostrar. Ajusta los filtros.
              </Td>
            </Tr>
          ) : (
            conectoresFiltrados.map((c) => (
              <Tr key={c.id}>
                <Td>
                  <div className="cui-row" style={{ gap: 8, alignItems: "center" }}>
                    <span style={{ display: "inline-flex", color: "var(--c-primary)" }}>{c.logo}</span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{c.nombre}</div>
                      <div style={{ fontSize: 12, color: "var(--c-text-subtle)" }}>{c.proveedor}</div>
                    </div>
                  </div>
                </Td>
                <Td>
                  <Badge tone={CATEGORIA_TONES[c.categoria]}>
                    {CATEGORIA_LABELS[c.categoria]}
                  </Badge>
                </Td>
                <Td>
                  <StatusDot
                    status={c.estado}
                    label={statusLabel[c.estado]}
                    pulse={c.estado === "online"}
                    size="sm"
                  />
                </Td>
                <Td>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {c.eventos24h.toLocaleString("es-CO")}
                  </span>
                </Td>
                <Td style={{ fontSize: 13, color: "var(--c-text-muted)" }}>
                  {c.moduloPrizma}
                </Td>
                <Td>
                  <Switch
                    checked={c.activo}
                    onChange={() => handleToggle(c.id)}
                    aria-label={`${c.activo ? "Desactivar" : "Activar"} ${c.nombre}`}
                  />
                </Td>
                <Td>
                  {/* A11Y-07: aria-label identifica el conector en contexto */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => abrirModal(c.id)}
                    aria-label={`Configurar ${c.nombre}`}
                  >
                    Configurar
                  </Button>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </TableWrap>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Encabezado ── */}
      <PageHeader
        title="Conectores y credenciales"
        description="Gestiona las integraciones externas del ecosistema Prizma. Las credenciales se cifran en reposo (AES-256) y siguen el principio SSOT."
        icon={<Plug size={22} aria-hidden />}
        bordered
        actions={
          <div className="cui-row" style={{ gap: 8 }}>
            <Badge tone={totalOffline > 0 ? "danger" : "success"}>
              {totalOffline > 0 ? `${totalOffline} sin conexión` : "Todos operativos"}
            </Badge>
            {/* UX-01: disabled hasta implementar handler de prueba masiva */}
            <Button
              variant="secondary"
              size="sm"
              disabled
              title="Próximamente: probar la conexión de todos los conectores"
            >
              Probar todos
            </Button>
          </div>
        }
      />

      {/* ── Métricas resumen ── */}
      <div
        className="cui-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}
      >
        <StatCard
          label="Conectores activos"
          value={`${totalActivos} / ${conectores.length}`}
          delta={`${conectores.length - totalActivos} inactivo${conectores.length - totalActivos !== 1 ? "s" : ""}`}
          trend={totalActivos === conectores.length ? "up" : "down"}
          icon={<Plug size={18} aria-hidden />}
        />
        <StatCard
          label="En línea ahora"
          value={`${totalOnline}`}
          delta={totalOffline > 0 ? `${totalOffline} caído${totalOffline !== 1 ? "s" : ""}` : "Sin caídas"}
          trend={totalOffline > 0 ? "down" : "up"}
          icon={<Activity size={18} aria-hidden />}
        />
        <StatCard
          label="Eventos (últimas 24h)"
          value={totalEventos24h.toLocaleString("es-CO")}
          delta="+12% vs. ayer"
          trend="up"
          icon={<Zap size={18} aria-hidden />}
        />
        <StatCard
          label="Tolerancia a fallos"
          value="Activa"
          delta="Cada conector es independiente"
          trend="flat"
          icon={<ShieldCheck size={18} aria-hidden />}
        />
      </div>

      {/* ── Aviso de Firebase caído ── */}
      {conectores.find((c) => c.id === "firebase" && c.estado === "offline") && (
        <InlineMessage tone="danger">
          Firebase Auth está sin conexión. Los usuarios no pueden autenticarse. Revisa las credenciales o activa el conector de inmediato.
        </InlineMessage>
      )}

      {/* ── Filtros y controles ── */}
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
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <SearchInput
                value={busqueda}
                onChange={setBusqueda}
                placeholder="Buscar conector, proveedor o módulo…"
                aria-label="Buscar conectores"
              />
            </div>
            <div style={{ flex: "0 0 auto" }}>
              <Segmented
                options={CATEGORIAS_SEGMENTED}
                value={filtroCategoria}
                onChange={setFiltroCategoria}
              />
            </div>
            <div style={{ flex: "0 0 auto", marginLeft: "auto" }}>
              <Segmented
                options={[{ value: "tarjetas", label: "Tarjetas" }, { value: "tabla", label: "Tabla" }]}
                value={vistaActiva}
                onChange={setVistaActiva}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Lista de conectores (tarjetas o tabla) ── */}
      {vistaActiva === "tarjetas" ? tabsTarjetas : tabsTabla}

      {/* ── Nota de arquitectura ── */}
      <Card>
        <CardHeader
          title="Principio de tolerancia a fallos"
          subtitle="Arquitectura del ecosistema Prizma"
        />
        <CardBody>
          <Tabs
            defaultValue="concepto"
            tabs={[
              {
                key: "concepto",
                label: "Concepto",
                content: (
                  <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    <p style={{ color: "var(--c-text-muted)", fontSize: 14, lineHeight: 1.6 }}>
                      Cada conector del ecosistema Prizma opera de forma <strong>independiente</strong>.
                      Si un conector externo falla (ej. Siigo, Mercado Pago, WhatsApp), el resto del flujo
                      comercial continúa sin interrupción.
                    </p>
                    <p style={{ color: "var(--c-text-muted)", fontSize: 14, lineHeight: 1.6 }}>
                      Los eventos que no pueden procesarse se encolan localmente y se reintentan
                      automáticamente cuando el conector vuelve a estar en línea.
                    </p>
                  </div>
                ),
              },
              {
                key: "impacto",
                label: "Impacto por conector",
                content: (
                  <TableWrap style={{ paddingTop: 16 }}>
                    <Table compact>
                      <Thead>
                        <Tr>
                          <Th>Conector</Th>
                          <Th>Si cae…</Th>
                          <Th>Impacto</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {CONECTORES.map((c) => (
                          <Tr key={c.id}>
                            <Td>
                              <div className="cui-row" style={{ gap: 6, alignItems: "center" }}>
                                <span style={{ display: "inline-flex", color: "var(--c-primary)" }}>{c.logo}</span>
                                <strong>{c.nombre}</strong>
                              </div>
                            </Td>
                            <Td style={{ fontSize: 13, color: "var(--c-text-muted)" }}>
                              {c.toleranciaFallo}
                            </Td>
                            <Td>
                              <Badge tone={c.id === "firebase" ? "danger" : c.id === "mercadopago" ? "warning" : "info"}>
                                {c.id === "firebase" ? "Crítico" : c.id === "mercadopago" ? "Alto" : "Medio"}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableWrap>
                ),
              },
              {
                key: "ssot",
                label: "SSOT de credenciales",
                content: (
                  <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    <InlineMessage tone="success">
                      Single Source of Truth: las credenciales de cada conector se almacenan
                      en un único lugar seguro, cifradas con AES-256.
                    </InlineMessage>
                    <p style={{ color: "var(--c-text-muted)", fontSize: 14, lineHeight: 1.6 }}>
                      Ningún módulo del ecosistema guarda credenciales propias. Todos consultan
                      el gestor central de secretos. Esto garantiza rotación unificada y auditoría
                      centralizada de acceso.
                    </p>
                    <div style={{ fontSize: 13, color: "var(--c-text-subtle)" }}>
                      Rotación recomendada: cada 90 días · Auditoría: cada acceso queda registrado
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </CardBody>
      </Card>

      {/* ── Modales ── */}

      {conectorEnModal && (
        <ConnectorConfigModal
          conector={conectorEnModal}
          open={!!modalAbierto}
          onClose={cerrarModal}
          onSave={handleSaveCredenciales}
        />
      )}

      <ConfirmDialog
        open={!!confirmDesactivar}
        onClose={() => setConfirmDesactivar(null)}
        onConfirm={confirmarDesactivar}
        title="¿Desactivar conector?"
        message={
          conectorParaDesactivar
            ? `Al desactivar ${conectorParaDesactivar.nombre}, el módulo ${conectorParaDesactivar.moduloPrizma} quedará sin esta integración. ${conectorParaDesactivar.toleranciaFallo}`
            : "Esta acción afecta la integración del ecosistema."
        }
        confirmLabel="Sí, desactivar"
        cancelLabel="Mantener activo"
        tone="danger"
      />
    </div>
  );
}
