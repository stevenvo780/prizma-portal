import * as React from "react";
import {
  AppShell,
  PrizmaRoot,
  Nav,
  NavGroup,
  NavItem,
  Button,
  Card,
  CardBody,
  Badge,
  Modal,
  Select,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  PrizmaTour,
  usePrizmaTour,
  useTheme,
  type TourStep,
} from "prizma-ui";
import {
  LogIn,
  Sun,
  Moon,
  Compass,
  Building2,
  Users,
  Puzzle,
  Plug,
  Satellite,
  ScrollText,
  Wallet,
  Check,
  ChevronDown,
  Home,
  Activity,
  Star,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { Gallery } from "./Gallery";
import { SystemStatus } from "./SystemStatus";
import { CockpitView } from "./CockpitView";
import { AppGrid } from "./AppGrid";
import { SiteFooter } from "./SiteFooter";
import { useSession, type UserRole } from "./session";
import "./launcher.css";
import { TenantsView } from "./admin/TenantsView";
import { UsersRolesView } from "./admin/UsersRolesView";
import { ModulesView } from "./admin/ModulesView";
import { ConnectorsView } from "./admin/ConnectorsView";
import { EventMonitorView } from "./admin/EventMonitorView";
import { AuditView } from "./admin/AuditView";
import { BillingView } from "./admin/BillingView";
import {
  PRODUCTS,
  FLOW,
  KPIS,
  NAV_GROUPS,
  PRODUCT_BY_KEY,
  externalHref,
  type ModuleKey,
} from "./data";

/* ------------------------------------------------------------------ brand -- */

function Symbol({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-label="Prizma">
      <defs>
        <linearGradient id="c" x1="8" y1="88" x2="88" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0A1622" /><stop offset="0.58" stopColor="#0B8A8F" /><stop offset="1" stopColor="#2DCBD1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="92" height="92" rx="24" fill="url(#c)" />
      <circle cx="68" cy="32" r="8" fill="#FF5A2B" />
      <path d="M60 44 L88 74 L40 74 Z" fill="#fff" opacity="0.55" />
      <path d="M34 28 L72 74 L6 74 Z" fill="#fff" opacity="0.95" />
    </svg>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label="Cambiar tema"
      leftIcon={theme === "dark" ? <Sun size={15} aria-hidden /> : <Moon size={15} aria-hidden />}
    >
      {theme === "dark" ? "Claro" : "Oscuro"}
    </Button>
  );
}

/**
 * LoginShell — punto de entrada al acceso centralizado (SSO de la suite).
 * Aún NO hay auth real: en lugar de fingir un login, abrimos un aviso honesto
 * de "en integración". Cuando exista el proveedor de identidad, este botón
 * disparará el flujo real.
 */
function LoginShell() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        type="button"
        className="pzl-login"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span className="pzl-login__dot" aria-hidden />
        <LogIn size={15} aria-hidden />
        Iniciar sesión
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Acceso a Prizma"
        footer={
          <Button variant="primary" onClick={() => setOpen(false)}>
            Entendido
          </Button>
        }
      >
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          El acceso unificado (una sola cuenta para toda la suite) está{" "}
          <strong>en integración</strong>. Aún no hay inicio de sesión real: este
          portal funciona en modo demostración. Cuando el proveedor de identidad
          esté conectado, desde aquí entrarás con tu cuenta a todos los módulos.
        </p>
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ views -- */

/** Admin panel view keys (prefixed to avoid colliding with product ModuleKeys). */
type AdminView =
  | "admin:tenants"
  | "admin:users"
  | "admin:modules"
  | "admin:connectors"
  | "admin:monitor"
  | "admin:audit"
  | "admin:billing";

/**
 * A view is the cockpit (home), the legacy landing, the status panel, a product
 * key, or an admin view. "home" is now the unified Cockpit dashboard; the old
 * marketing landing lives on as the "landing" subview.
 */
type View = "home" | "landing" | "status" | ModuleKey | AdminView;

/** Admin section nav definition — rendered as its own NavGroup in the Sidebar. */
const ADMIN_NAV: { key: AdminView; label: string; icon: LucideIcon }[] = [
  { key: "admin:tenants", label: "Organizaciones", icon: Building2 },
  { key: "admin:users", label: "Usuarios y roles", icon: Users },
  { key: "admin:modules", label: "Módulos", icon: Puzzle },
  { key: "admin:connectors", label: "Conectores", icon: Plug },
  { key: "admin:monitor", label: "Monitor del Hub", icon: Satellite },
  { key: "admin:audit", label: "Auditoría", icon: ScrollText },
  { key: "admin:billing", label: "Billing", icon: Wallet },
];

/** es-CO labels for each demo role used by the role selector. */
const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  operador: "Operador",
  viewer: "Solo lectura",
};

/** Tenant switcher — DropdownMenu that calls setTenant on selection. */
function TenantSwitcher() {
  const { tenant, tenants, setTenant } = useSession();
  return (
    <DropdownMenu
      aria-label="Cambiar organización"
      trigger={
        <Button
          variant="ghost"
          size="sm"
          id="topbar-tenant"
          leftIcon={<Building2 size={15} aria-hidden />}
          rightIcon={<ChevronDown size={14} aria-hidden />}
        >
          {tenant.nombre}
        </Button>
      }
    >
      <DropdownSeparator label="Organizaciones" />
      {tenants.map((t) => (
        <DropdownItem
          key={t.id}
          onSelect={() => setTenant(t.id)}
          icon={
            t.id === tenant.id ? (
              <Check size={14} aria-hidden />
            ) : (
              <span style={{ width: 14, display: "inline-block" }} />
            )
          }
        >
          {t.nombre}
          <span style={{ color: "var(--c-text-subtle)", fontSize: 12, marginLeft: 8 }}>
            {t.plan}
          </span>
        </DropdownItem>
      ))}
    </DropdownMenu>
  );
}

/** Demo role selector — lets you switch role to showcase the gating. */
function RoleSelector() {
  const { user, setRole } = useSession();
  return (
    <label className="cui-row" style={{ gap: 6, fontSize: 13 }} id="topbar-role">
      <span style={{ color: "var(--c-text-subtle)" }}>Rol:</span>
      <Select
        aria-label="Rol de demostración"
        value={user.role}
        onChange={(e) => setRole(e.target.value as UserRole)}
        style={{ width: "auto", minWidth: 150 }}
      >
        {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </Select>
    </label>
  );
}

function Topbar({
  onNavigate,
  onStartTour,
}: {
  onNavigate: (v: View) => void;
  onStartTour: () => void;
}) {
  const { user, tenant } = useSession();
  return (
    <>
      <button
        type="button"
        className="pzl-brand"
        onClick={() => onNavigate("home")}
        aria-label="Ir al inicio de Prizma"
      >
        <Symbol size={30} />
        <span className="pzl-brand__word">Prizma</span>
        <Badge tone="primary">ecosistema</Badge>
      </button>
      <div className="cui-spacer" />
      {/* Controles de demo: se ocultan en móvil para que el topbar no desborde. */}
      <span className="pzl-topbar-secondary"><TenantSwitcher /></span>
      <span className="pzl-topbar-secondary"><RoleSelector /></span>
      <span className="pzl-topbar-secondary">
        <Button
          variant="ghost"
          size="sm"
          onClick={onStartTour}
          id="topbar-tour"
          leftIcon={<Compass size={15} aria-hidden />}
        >
          Ver tutorial
        </Button>
      </span>
      <ThemeToggle />
      <LoginShell />
      {/* Usuario + tenant activo — el texto se oculta en móvil, queda el avatar. */}
      <div className="cui-row" style={{ gap: 8 }} aria-label="Sesión activa">
        <span className="cui-avatar" aria-hidden style={{ width: 32, height: 32 }}>
          {user.name.slice(0, 2)}
        </span>
        <div className="pzl-topbar-secondary" style={{ lineHeight: 1.2, fontSize: 12 }}>
          <div style={{ fontWeight: 600 }}>{user.name}</div>
          <div style={{ color: "var(--c-text-subtle)" }}>
            {ROLE_LABELS[user.role]} · {tenant.nit}
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarNav({ view, onNavigate }: { view: View; onNavigate: (v: View) => void }) {
  const { user } = useSession();
  const isAdmin = user.role === "admin";
  return (
    <Nav>
      <NavGroup label="General">
        <NavItem icon={<Satellite size={17} aria-hidden />} active={view === "home"} onClick={() => onNavigate("home")}>
          Cockpit
        </NavItem>
        <NavItem icon={<Home size={17} aria-hidden />} active={view === "landing"} onClick={() => onNavigate("landing")}>
          Bienvenida
        </NavItem>
        <NavItem icon={<Activity size={17} aria-hidden />} active={view === "status"} onClick={() => onNavigate("status")}>
          Estado del sistema
        </NavItem>
      </NavGroup>

      {NAV_GROUPS.map((group) => (
        <NavGroup key={group.label} label={group.label}>
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <NavItem
                key={item.key}
                icon={<Icon size={17} aria-hidden />}
                active={view === item.key}
                onClick={() => onNavigate(item.key)}
              >
                {item.label}
              </NavItem>
            );
          })}
        </NavGroup>
      ))}

      {/* Gating: la sección Administración solo se renderiza para role==='admin' */}
      {isAdmin && (
        <div id="sidebar-admin">
          <NavGroup label="Administración">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <NavItem
                  key={item.key}
                  icon={<Icon size={17} aria-hidden />}
                  active={view === item.key}
                  onClick={() => onNavigate(item.key)}
                >
                  {item.label}
                </NavItem>
              );
            })}
          </NavGroup>
        </div>
      )}
    </Nav>
  );
}

/* --------------------------------------------------------- landing (legacy) -- */

/**
 * LandingView — "Bienvenida": hero image-forward + lanzador de apps protagonista.
 * El Cockpit sigue siendo la vista de inicio por defecto; esta es la cara
 * comercial/launcher de la suite.
 */
function LandingView({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="pzl-page" style={{ display: "flex", flexDirection: "column", gap: 44, minWidth: 0 }}>
      {/* Hero — el prisma que refracta: un haz se convierte en el espectro de apps */}
      <section className="pzl-hero">
        <img
          className="pzl-hero__media"
          src="/covers/prizma.svg"
          alt=""
          aria-hidden="true"
        />
        <div className="pzl-hero__scrim" />
        <div className="pzl-hero__body">
          <span className="pzl-hero__kicker">Suite Prizma</span>
          <h1>
            Un solo prisma para <em>vender, operar y crecer.</em>
          </h1>
          <p className="pzl-hero__lede">
            Hermes, Iris, Talanton, Pistis y Talaria trabajan como una sola
            herramienta: del primer mensaje de WhatsApp al cobro y la entrega,
            todo conectado y trazable.
          </p>
          <div className="pzl-hero__actions">
            <Button variant="accent" size="lg" onClick={() => onNavigate("hermes")}>
              Explorar las apps
            </Button>
            <Button
              variant="secondary"
              size="lg"
              style={{ background: "rgba(255,255,255,.10)", color: "#fff", borderColor: "rgba(255,255,255,.28)" }}
              onClick={() => onNavigate("status")}
            >
              Estado del sistema
            </Button>
          </div>
        </div>
      </section>

      {/* KPIs de la suite */}
      <section
        className="cui-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))" }}
        aria-label="Indicadores de la suite"
      >
        {KPIS.map((k) => (
          <div key={k.label} className="cui-stat">
            <div className="cui-stat__label">{k.label}</div>
            <div className="cui-stat__value">{k.value}</div>
            {/* A11Y-09: ícono condicional según la dirección real del KPI */}
            <div
              className={`cui-stat__delta cui-stat__delta--${k.up ? "up" : "down"}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              {k.up ? <TrendingUp size={14} aria-hidden /> : <TrendingDown size={14} aria-hidden />}
              {k.delta}
            </div>
          </div>
        ))}
      </section>

      {/* Lanzador image-forward: cada app con su portada de marca y link real */}
      <AppGrid onDetail={(key) => onNavigate(key)} />

      {/* El flujo de negocio orquestado por Nous */}
      <section>
        <div className="pzl-sectionhead">
          <div>
            <h2>El flujo, de punta a punta</h2>
            <p>Un evento de venta, orquestado por Nous, activa toda la suite.</p>
          </div>
        </div>
        <Card><CardBody>
          {/* RESPONSIVE-01: overflow-x evita desbordamiento en móvil */}
          <div style={{ overflowX: "auto" }}>
          <div className="cui-row cui-row--wrap" style={{ gap: 8 }}>
            {FLOW.map((s, i) => (
              <div key={i} className="cui-row" style={{ gap: 8 }}>
                <div data-module={s.module === "cliente" ? "portal" : s.module}>
                  <span className="cui-badge cui-badge--module" style={{ padding: "8px 14px", fontSize: 14 }}>
                    {s.label}{s.event ? <code style={{ marginLeft: 6, opacity: .8, fontSize: 12 }}>{s.event}</code> : null}
                  </span>
                </div>
                {i < FLOW.length - 1 && (
                  <ArrowRight size={16} aria-hidden style={{ color: "var(--c-text-subtle)", flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
          </div>
        </CardBody></Card>
      </section>
    </div>
  );
}

/* --------------------------------------------------------- product view -- */

function ProductView({ moduleKey, onNavigate }: { moduleKey: ModuleKey; onNavigate: (v: View) => void }) {
  const p = PRODUCT_BY_KEY[moduleKey];
  if (!p) {
    return (
      <Card><CardBody>
        Producto no encontrado.{" "}
        <Button variant="ghost" size="sm" onClick={() => onNavigate("home")}>Volver a Inicio</Button>
      </CardBody></Card>
    );
  }
  const externalUrl = externalHref(p);
  return (
    <div data-module={moduleKey} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 820 }}>
      {/* Portada de marca como protagonista */}
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 6",
          borderRadius: "var(--c-radius-xl)",
          overflow: "hidden",
          border: "1px solid var(--c-border)",
        }}
      >
        <img
          src={p.cover}
          alt={`Portada de marca de ${p.name}`}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      <div>
        <div className="cui-row" style={{ gap: 8 }}>
          <h1 style={{ fontSize: 30 }}>
            {p.name}
            {p.aka ? <span style={{ color: "var(--c-text-subtle)", fontWeight: 400, fontSize: 16 }}> · ex-{p.aka}</span> : null}
          </h1>
          {p.star ? (
            <Badge tone="module">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Star size={12} fill="currentColor" aria-hidden /> estrella
              </span>
            </Badge>
          ) : p.internal ? (
            <Badge tone="neutral">interno</Badge>
          ) : (
            <Badge tone="module">{p.line}</Badge>
          )}
        </div>
        <p style={{ color: "var(--c-text-muted)", marginTop: 8, maxWidth: "60ch", lineHeight: 1.55 }}>{p.blurb}</p>
      </div>

      <Card><CardBody style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="cui-row cui-row--between cui-row--wrap" style={{ gap: 8 }}>
          <span style={{ color: "var(--c-text-muted)" }}>Línea de negocio</span>
          <Badge tone="primary">{p.line}</Badge>
        </div>
        {externalUrl && (
          <div className="cui-row cui-row--between cui-row--wrap" style={{ gap: 8 }}>
            <span style={{ color: "var(--c-text-muted)" }}>Dirección de la app</span>
            <code style={{ fontSize: 13 }}>{externalUrl}</code>
          </div>
        )}
        {!externalUrl && (
          <p style={{ color: "var(--c-text-muted)", margin: 0, fontSize: 14, lineHeight: 1.55 }}>
            {p.internal || p.line === "Conector"
              ? "Pieza interna del ecosistema: opera dentro de la suite a través de Nous y no expone una interfaz pública propia."
              : "Frontend público en preparación: este módulo aún no tiene una dirección pública para abrir."}
          </p>
        )}
        <div className="cui-row" style={{ gap: 12, marginTop: 8 }}>
          {externalUrl && (
            /* A11Y-02: usar <a> directamente con estilos de botón — evita <button> dentro de <a> */
            <a
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
              className="cui-btn cui-btn--module cui-btn--md"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              Abrir {p.name} <ArrowUpRight size={16} aria-hidden />
            </a>
          )}
          <Button variant="ghost" size="md" onClick={() => onNavigate("status")}>Ver estado</Button>
        </div>
      </CardBody></Card>
    </div>
  );
}

/* -------------------------------------------------------------------- app -- */

/** UX-03: mapa de títulos de documento por vista (WCAG 2.4.2). */
const VIEW_TITLES: Record<string, string> = {
  home: "Cockpit — Prizma",
  landing: "Bienvenida — Prizma",
  status: "Estado del sistema — Prizma",
  "admin:tenants": "Organizaciones — Prizma",
  "admin:users": "Usuarios y roles — Prizma",
  "admin:modules": "Módulos — Prizma",
  "admin:connectors": "Conectores — Prizma",
  "admin:monitor": "Monitor del Hub — Prizma",
  "admin:audit": "Auditoría — Prizma",
  "admin:billing": "Facturación — Prizma",
};

function useDocumentTitle(view: View) {
  React.useEffect(() => {
    const product = PRODUCT_BY_KEY[view as ModuleKey];
    const title = product
      ? `${product.name} — Prizma`
      : (VIEW_TITLES[view] ?? "Prizma");
    document.title = title;
  }, [view]);
}

/** Admin views are gated: only role==='admin' may render them. */
const ADMIN_VIEWS: ReadonlySet<string> = new Set(ADMIN_NAV.map((n) => n.key));

/* ---------------------------------------------------------------- tour -- */

/**
 * Recorrido guiado de la suite. Apunta a ids estables del Cockpit y del
 * Sidebar: Cockpit, salud, KPIs, launcher, checklist, administración.
 */
const SUITE_TOUR_STEPS: TourStep[] = [
  {
    title: "Bienvenido al Cockpit",
    body: "Este es el centro de mando de tu suite Prizma. Desde aquí ves la salud, los indicadores y la operación de todos los módulos en un solo lugar.",
    target: "#cockpit-header",
    placement: "bottom",
  },
  {
    title: "Salud de la suite",
    body: "Cada tarjeta muestra el estado (arriba, degradado o caído) de un servicio. Se sondea en vivo y se anuncia a lectores de pantalla.",
    target: "#cockpit-health",
    placement: "bottom",
  },
  {
    title: "Indicadores cross-módulo",
    body: "KPIs en tiempo real: pedidos, ventas en pesos, mensajes de Iris y crédito de Pistis. El delta sube o baja según el periodo anterior.",
    target: "#cockpit-kpis",
    placement: "bottom",
  },
  {
    title: "Abre cualquier módulo",
    body: "El lanzador te lleva a cada dios del panteón. Solo verás (o podrás abrir) los módulos que tu rol permite.",
    target: "#cockpit-launcher",
    placement: "top",
  },
  {
    title: "Pon en marcha tu suite",
    body: "Sigue la lista de puesta en marcha: conectar facturación, sincronizar clientes, invitar a tu equipo. El progreso se guarda por organización.",
    target: "#cockpit-onboarding",
    placement: "top",
  },
  {
    title: "Administración",
    body: "Si eres administrador, aquí gestionas organizaciones, usuarios, conectores y facturación de toda la suite.",
    target: "#sidebar-admin",
    placement: "right",
  },
  {
    title: "Cambia de organización o rol",
    body: "Desde la barra superior puedes cambiar de organización y, en esta demo, alternar el rol para ver cómo cambia lo que se muestra.",
    target: "#topbar-tenant",
    placement: "bottom",
  },
];

export function App() {
  if (typeof location !== "undefined" && location.search.includes("gallery")) {
    return <Gallery />;
  }

  const { user } = useSession();
  // Permite enlazar directamente a una vista vía ?view=landing|status|home (deep-link).
  const initialView = ((): View => {
    if (typeof location === "undefined") return "home";
    const v = new URLSearchParams(location.search).get("view");
    return v === "landing" || v === "status" ? v : "home";
  })();
  const [view, setView] = React.useState<View>(initialView);
  const tour = usePrizmaTour({ runKey: "portal-suite-v1", total: SUITE_TOUR_STEPS.length });

  // UX-03: actualizar <title> al navegar entre vistas (WCAG 2.4.2)
  useDocumentTitle(view);

  // Auto-start del tour la primera vez (cuando aún no se ha visto este runKey).
  // El componente está en modo controlado vía tour.tourProps, así que el
  // disparo automático lo gobernamos aquí en lugar de con la prop `autoStart`.
  const autoStarted = React.useRef(false);
  React.useEffect(() => {
    if (!autoStarted.current && !tour.hasSeen) {
      autoStarted.current = true;
      tour.start(0);
    }
  }, [tour]);

  // Gating de seguridad: un usuario no-admin nunca debe quedar en una vista de
  // administración (p. ej. tras bajar su rol con el selector de demo).
  React.useEffect(() => {
    if (user.role !== "admin" && ADMIN_VIEWS.has(view)) {
      setView("home");
    }
  }, [user.role, view]);

  // Al iniciar el tutorial, vuelve al Cockpit para que los anclajes existan.
  const startTour = React.useCallback(() => {
    setView("home");
    tour.start(0);
  }, [tour]);

  const isAdminView = ADMIN_VIEWS.has(view);

  let content: React.ReactNode;
  if (view === "home") content = <CockpitView onNavigate={setView} onOpenStatus={() => setView("status")} />;
  else if (view === "landing") content = <LandingView onNavigate={setView} />;
  else if (view === "status") content = <SystemStatus />;
  else if (isAdminView && user.role !== "admin") {
    // Defensa en profundidad: aunque el sidebar oculta admin, bloqueamos el render.
    content = (
      <Card><CardBody>
        No tienes permisos para ver esta sección.{" "}
        <Button variant="ghost" size="sm" onClick={() => setView("home")}>Volver al Cockpit</Button>
      </CardBody></Card>
    );
  }
  else if (view === "admin:tenants") content = <TenantsView />;
  else if (view === "admin:users") content = <UsersRolesView />;
  else if (view === "admin:modules") content = <ModulesView />;
  else if (view === "admin:connectors") content = <ConnectorsView />;
  else if (view === "admin:monitor") content = <EventMonitorView />;
  else if (view === "admin:audit") content = <AuditView />;
  else if (view === "admin:billing") content = <BillingView />;
  else content = <ProductView moduleKey={view} onNavigate={setView} />;

  return (
    <PrizmaRoot module="portal">
      <AppShell topbar={<Topbar onNavigate={setView} onStartTour={startTour} />} sidebar={<SidebarNav view={view} onNavigate={setView} />}>
        {content}
        {/* Tour de la suite — controlado por usePrizmaTour. Se auto-inicia la
            primera vez (ver efecto arriba) y se relanza desde "Ver tutorial". */}
        <PrizmaTour
          steps={SUITE_TOUR_STEPS}
          runKey="portal-suite-v1"
          {...tour.tourProps}
        />
        <SiteFooter />
      </AppShell>
    </PrizmaRoot>
  );
}
