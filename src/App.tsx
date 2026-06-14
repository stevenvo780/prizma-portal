import * as React from "react";
import {
  AppShell,
  OlympoRoot,
  Nav,
  NavGroup,
  NavItem,
  Button,
  Card,
  CardBody,
  Badge,
  useTheme,
} from "@olympo/ui";
import { Gallery } from "./Gallery";
import { SystemStatus } from "./SystemStatus";
import {
  PRODUCTS,
  FLOW,
  KPIS,
  NAV_GROUPS,
  PRODUCT_BY_KEY,
  type ModuleKey,
} from "./data";

/* ------------------------------------------------------------------ brand -- */

function Symbol({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-label="Olympo">
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
    <Button variant="ghost" size="sm" onClick={toggle} aria-label="Cambiar tema">
      {theme === "dark" ? "☀ Claro" : "☾ Oscuro"}
    </Button>
  );
}

/* ------------------------------------------------------------------ views -- */

/** A view is either the cockpit, the status panel, or a single product key. */
type View = "home" | "status" | ModuleKey;

function Topbar() {
  return (
    <>
      <div className="cui-row" style={{ gap: 12 }}>
        <Symbol />
        <strong style={{ fontFamily: "var(--c-font-display)", fontSize: 22, letterSpacing: "-0.02em" }}>
          olympo
        </strong>
        <Badge tone="primary">ecosistema</Badge>
      </div>
      <div className="cui-spacer" />
      <ThemeToggle />
      <Button variant="accent" size="sm">Conectar mi negocio</Button>
    </>
  );
}

function SidebarNav({ view, onNavigate }: { view: View; onNavigate: (v: View) => void }) {
  return (
    <Nav>
      <NavGroup label="General">
        <NavItem icon="🏠" active={view === "home"} onClick={() => onNavigate("home")}>
          Inicio
        </NavItem>
        <NavItem icon="💓" active={view === "status"} onClick={() => onNavigate("status")}>
          Estado del sistema
        </NavItem>
      </NavGroup>

      {NAV_GROUPS.map((group) => (
        <NavGroup key={group.label} label={group.label}>
          {group.items.map((item) => (
            <NavItem
              key={item.key}
              icon={item.icon}
              active={view === item.key}
              onClick={() => onNavigate(item.key)}
            >
              {item.label}
            </NavItem>
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}

/* ------------------------------------------------------------- cockpit -- */

function Cockpit({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {/* Hero */}
      <section className="cui-hero">
        <div style={{ position: "relative", zIndex: 1, maxWidth: 720 }}>
          <Badge tone="module" style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}>
            El Olimpo de tu negocio
          </Badge>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#fff", marginTop: 16, lineHeight: 1.05 }}>
            Menos herramientas sueltas.<br />Más flujo continuo.
          </h1>
          <p style={{ color: "rgba(255,255,255,.85)", fontSize: 18, marginTop: 16, maxWidth: 560 }}>
            Vender, operar, entregar, financiar y crecer — en un solo Olimpo. Desde el primer
            contacto comercial hasta la entrega y el seguimiento, todo conectado y trazable.
          </p>
          <div className="cui-row" style={{ marginTop: 24, gap: 12 }}>
            <Button variant="accent" size="lg" onClick={() => onNavigate("status")}>
              Ver estado del sistema
            </Button>
            <Button
              variant="secondary"
              size="lg"
              style={{ background: "rgba(255,255,255,.12)", color: "#fff", borderColor: "rgba(255,255,255,.3)" }}
              onClick={() => onNavigate("graf")}
            >
              Explorar productos
            </Button>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="cui-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {KPIS.map((k) => (
          <div key={k.label} className="cui-stat">
            <div className="cui-stat__label">{k.label}</div>
            <div className="cui-stat__value">{k.value}</div>
            <div className={`cui-stat__delta cui-stat__delta--${k.up ? "up" : "down"}`}>▲ {k.delta}</div>
          </div>
        ))}
      </section>

      {/* App launcher */}
      <section>
        <div className="cui-row cui-row--between" style={{ marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 24 }}>Tu panteón</h2>
            <p style={{ color: "var(--c-text-muted)" }}>
              Cada dios cumple su función en el mismo Olimpo. Un solo diseño, una sola sesión.
            </p>
          </div>
        </div>
        <div className="cui-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}>
          {PRODUCTS.map((p) => (
            <div key={p.key} data-module={p.key as ModuleKey}>
              <Card interactive style={{ height: "100%", cursor: "pointer" }} onClick={() => onNavigate(p.key)}>
                <CardBody>
                  <div className="cui-row cui-row--between">
                    <span className="cui-avatar" aria-hidden>{p.name.slice(0, 2)}</span>
                    {p.star ? <Badge tone="module">⭐ estrella</Badge> : p.internal ? <Badge tone="neutral">interno</Badge> : <Badge tone="module">{p.line}</Badge>}
                  </div>
                  <h3 style={{ marginTop: 14, fontSize: 19 }}>{p.name} <span style={{ color: "var(--c-text-subtle)", fontWeight: 400, fontSize: 13 }}>· ex-{p.aka}</span></h3>
                  <p style={{ color: "var(--c-text-muted)", fontSize: 14, marginTop: 6, minHeight: 40 }}>{p.tagline}</p>
                  <Button
                    variant="module"
                    size="sm"
                    block
                    style={{ marginTop: 14 }}
                    onClick={(e) => { e.stopPropagation(); onNavigate(p.key); }}
                  >
                    Abrir {p.name} →
                  </Button>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Flow */}
      <section>
        <h2 style={{ fontSize: 24, marginBottom: 4 }}>El flujo (venta e-commerce)</h2>
        <p style={{ color: "var(--c-text-muted)", marginBottom: 16 }}>
          Un evento, orquestado por HubCentral, activa todo el ecosistema.
        </p>
        <Card><CardBody>
          <div className="cui-row cui-row--wrap" style={{ gap: 8 }}>
            {FLOW.map((s, i) => (
              <div key={i} className="cui-row" style={{ gap: 8 }}>
                <div data-module={s.module === "cliente" ? "portal" : s.module}>
                  <span className="cui-badge cui-badge--module" style={{ padding: "8px 14px", fontSize: 14 }}>
                    {s.label}{s.event ? <code style={{ marginLeft: 6, opacity: .8, fontSize: 12 }}>{s.event}</code> : null}
                  </span>
                </div>
                {i < FLOW.length - 1 && <span style={{ color: "var(--c-text-subtle)" }}>→</span>}
              </div>
            ))}
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
  return (
    <div data-module={moduleKey} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760 }}>
      <div className="cui-row" style={{ gap: 12 }}>
        <span className="cui-avatar" aria-hidden style={{ width: 56, height: 56, fontSize: 20 }}>
          {p.name.slice(0, 2)}
        </span>
        <div>
          <div className="cui-row" style={{ gap: 8 }}>
            <h1 style={{ fontSize: 28 }}>{p.name}</h1>
            {p.star ? <Badge tone="module">⭐ estrella</Badge> : p.internal ? <Badge tone="neutral">interno</Badge> : <Badge tone="module">{p.line}</Badge>}
          </div>
          <p style={{ color: "var(--c-text-muted)", marginTop: 4 }}>{p.tagline}</p>
        </div>
      </div>

      <Card><CardBody style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="cui-row cui-row--between cui-row--wrap" style={{ gap: 8 }}>
          <span style={{ color: "var(--c-text-muted)" }}>Línea de negocio</span>
          <Badge tone="primary">{p.line}</Badge>
        </div>
        <div className="cui-row cui-row--between cui-row--wrap" style={{ gap: 8 }}>
          <span style={{ color: "var(--c-text-muted)" }}>URL de desarrollo</span>
          <code style={{ fontSize: 13 }}>{p.url}</code>
        </div>
        <div className="cui-row" style={{ gap: 12, marginTop: 8 }}>
          <a href={p.url} target="_blank" rel="noreferrer">
            <Button variant="module" size="md">Abrir {p.name} →</Button>
          </a>
          <Button variant="ghost" size="md" onClick={() => onNavigate("status")}>Ver estado</Button>
        </div>
      </CardBody></Card>
    </div>
  );
}

/* -------------------------------------------------------------------- app -- */

export function App() {
  if (typeof location !== "undefined" && location.search.includes("gallery")) {
    return <Gallery />;
  }

  const [view, setView] = React.useState<View>("home");

  let content: React.ReactNode;
  if (view === "home") content = <Cockpit onNavigate={setView} />;
  else if (view === "status") content = <SystemStatus />;
  else content = <ProductView moduleKey={view} onNavigate={setView} />;

  return (
    <OlympoRoot module="portal">
      <AppShell topbar={<Topbar />} sidebar={<SidebarNav view={view} onNavigate={setView} />}>
        {content}
        <footer style={{ borderTop: "1px solid var(--c-border)", marginTop: 40, paddingTop: 24, color: "var(--c-text-subtle)", fontSize: 14 }}>
          <div className="cui-row cui-row--between cui-row--wrap">
            <span>© Olympo — el Olimpo de tu negocio.</span>
            <span>Diseño unificado con <code>@olympo/ui</code> · servicios con <code>@olympo/contracts</code></span>
          </div>
        </footer>
      </AppShell>
    </OlympoRoot>
  );
}
