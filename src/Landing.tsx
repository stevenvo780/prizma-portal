/**
 * Landing.tsx — Landing PÚBLICA de captación de clientes (ruta "/").
 *
 * NO es el cockpit ni una demo: es la cara comercial de la suite Prizma. Cero
 * datos mock. Presenta la propuesta de valor, cada producto de cara al cliente
 * con su portada de marca y descripción real, los beneficios y un contacto
 * funcional (Steven Vallejo · stevenvallejo780@gmail.com).
 *
 * La FIRMA visual es el prisma: un haz blanco entra y sale como el espectro de
 * productos. La refracción es la tesis — un solo sistema, cinco capacidades.
 *
 * 0 emojis: toda iconografía es lucide-react. Identidad Cloud Atlas.
 */
import * as React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  ArrowUpRight,
  ArrowRight,
  Network,
  ShieldCheck,
  Workflow,
  PlugZap,
  Star,
  Play,
} from "lucide-react";
import { PRODUCTS, externalHref, type Product } from "./data";
import "./landing.css";

const CONTACT_EMAIL = "stevenvallejo780@gmail.com";
const MAILTO_DEMO =
  "mailto:stevenvallejo780@gmail.com" +
  "?subject=" +
  encodeURIComponent("Quiero una demo de Prizma") +
  "&body=" +
  encodeURIComponent(
    "Hola Steven,\n\nMe interesa conocer la suite Prizma para mi negocio. " +
      "Estos son mis datos:\n\nNombre:\nNegocio:\nTeléfono:\n\nGracias.",
  );

/* Brand symbol (mismo del portal, reutilizado para la marca de la landing). */
function Symbol({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lp-sym" x1="8" y1="88" x2="88" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0A1622" />
          <stop offset="0.58" stopColor="#0B8A8F" />
          <stop offset="1" stopColor="#2DCBD1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="92" height="92" rx="24" fill="url(#lp-sym)" />
      <circle cx="68" cy="32" r="8" fill="#FF5A2B" />
      <path d="M60 44 L88 74 L40 74 Z" fill="#fff" opacity="0.55" />
      <path d="M34 28 L72 74 L6 74 Z" fill="#fff" opacity="0.95" />
    </svg>
  );
}

/* ---------------------------------------------------------------- HERO --- */

/** Color de cada rayo del espectro (orden del prisma, de arriba a abajo). */
const SPECTRUM: { key: Product["key"]; label: string; color: string }[] = [
  { key: "hermes", label: "Hermes", color: "#22A45A" },
  { key: "iris", label: "Iris", color: "#2DCBD1" },
  { key: "talanton", label: "Talanton", color: "#67E2E6" },
  { key: "pistis", label: "Pistis", color: "#e0a85e" },
  { key: "talaria", label: "Talaria", color: "#FF5A2B" },
];

/**
 * PrismHero — la firma. Un haz blanco entra por la izquierda, atraviesa un
 * prisma translúcido y se refracta en cinco rayos, cada uno etiquetado con un
 * producto. Los rayos se "encienden" en cascada al cargar; el haz late.
 */
function PrismDiagram() {
  return (
    <div className="lp-prism" aria-hidden="true">
      <svg viewBox="0 0 520 520" role="presentation">
        <defs>
          {SPECTRUM.map((s) => (
            <linearGradient key={s.key} id={`lp-ray-${s.key}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={s.color} stopOpacity="0.15" />
              <stop offset="1" stopColor={s.color} stopOpacity="0.95" />
            </linearGradient>
          ))}
          <radialGradient id="lp-prism-glow" cx="0.34" cy="0.5" r="0.6">
            <stop offset="0" stopColor="#2DCBD1" stopOpacity="0.28" />
            <stop offset="1" stopColor="#2DCBD1" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="260" r="210" fill="url(#lp-prism-glow)" />

        {/* Haz de entrada (blanco) */}
        <line
          className="lp-prism__beam"
          x1="-10"
          y1="260"
          x2="176"
          y2="260"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* El prisma: triángulo translúcido */}
        <g transform="translate(206 260)">
          <path d="M0 -78 L70 78 L-70 78 Z" fill="#fff" fillOpacity="0.05" />
          <path
            d="M0 -78 L70 78 L-70 78 Z"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.28"
            strokeWidth="2.2"
          />
          <circle cx="-2" cy="-54" r="6" fill="#FF5A2B" />
        </g>

        {/* Espectro refractado: un rayo + chip por producto */}
        {SPECTRUM.map((s, i) => {
          const y = 196 + i * 32;
          const delay = 360 + i * 130;
          return (
            <g key={s.key}>
              <line
                className="lp-prism__ray"
                x1="226"
                y1="260"
                x2="496"
                y2={y}
                stroke={`url(#lp-ray-${s.key})`}
                strokeWidth="4"
                strokeLinecap="round"
                style={{ animationDelay: `${delay}ms` }}
              />
              <g
                className="lp-prism__chip"
                style={{ animationDelay: `${delay + 220}ms` }}
                transform={`translate(498 ${y})`}
              >
                <circle cx="2" cy="0" r="4.5" fill={s.color} />
                <text x="14" y="4.5" fill={s.color}>
                  {s.label}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Hero() {
  return (
    <header className="lp-shell lp-hero">
      <div className="lp-hero__copy">
        <span className="lp-eyebrow">Suite empresarial Prizma</span>
        <h1>
          Un solo prisma para <em>vender, operar y crecer.</em>
        </h1>
        <p className="lp-hero__lede">
          Prizma reúne tu comercio por WhatsApp, tu punto de venta, el crédito a
          clientes y las entregas en una sola suite conectada. Del primer mensaje
          al cobro y la entrega, todo trazable.
        </p>
        <div className="lp-hero__actions">
          <a className="lp-cta lp-cta--solid lp-cta--lg" href={MAILTO_DEMO}>
            Solicita una demo <ArrowRight size={18} aria-hidden />
          </a>
          <Link className="lp-cta lp-cta--ghost lp-cta--lg" to="/demo">
            <Play size={16} aria-hidden /> Ver demo en vivo
          </Link>
        </div>
        <div className="lp-hero__trust">
          <span>
            <Network size={15} aria-hidden /> 5 apps conectadas
          </span>
          <span>
            <ShieldCheck size={15} aria-hidden /> Facturación electrónica DIAN
          </span>
          <span>
            <Workflow size={15} aria-hidden /> Orquestado por eventos
          </span>
        </div>
      </div>
      <PrismDiagram />
    </header>
  );
}

/* ------------------------------------------------------------ PRODUCTOS --- */

function ProductCard({ p }: { p: Product }) {
  const href = externalHref(p);
  const body = (
    <>
      <div className="lp-product__media">
        <img
          src={p.cover}
          alt={`${p.name} — ${p.tagline}`}
          loading="lazy"
          width={680}
          height={320}
        />
        {p.star ? (
          <span className="lp-product__tag lp-product__tag--star">
            <Star size={11} fill="currentColor" aria-hidden /> Estrella
          </span>
        ) : (
          <span className="lp-product__tag">{p.line}</span>
        )}
      </div>
      <div className="lp-product__body">
        <span className="lp-product__name">
          {p.name}
          <span className="lp-product__role">{p.tagline}</span>
        </span>
        <p className="lp-product__desc">{p.blurb}</p>
        {href ? (
          <span className="lp-product__open">
            Abrir {p.name} <ArrowUpRight size={15} aria-hidden />
          </span>
        ) : (
          <span className="lp-product__open lp-product__open--muted">
            Dentro de la suite
          </span>
        )}
      </div>
    </>
  );

  // Apps con subdominio vivo → enlace externo real. El resto, tarjeta estática.
  if (href) {
    return (
      <a className="lp-product" href={href} target="_blank" rel="noreferrer">
        {body}
      </a>
    );
  }
  return <article className="lp-product">{body}</article>;
}

function Products() {
  const customer = PRODUCTS.filter((p) => p.customerFacing);
  return (
    <section className="lp-section lp-section--alt" id="productos">
      <div className="lp-shell">
        <div className="lp-section__head lp-reveal">
          <span className="lp-eyebrow">El espectro</span>
          <h2>Cinco productos, una sola operación</h2>
          <p>
            Cada app resuelve una parte de tu negocio y comparte clientes, stock
            y pagos con las demás. Empieza por la que más te urge y suma el resto
            cuando quieras.
          </p>
        </div>
        <div className="lp-products lp-reveal">
          {customer.map((p) => (
            <ProductCard key={p.key} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ BENEFICIOS -- */

const BENEFITS = [
  {
    icon: Network,
    title: "Una sola fuente de verdad",
    body: "Clientes, inventario y pagos viven en un mismo lugar. Lo que vendes por WhatsApp descuenta stock del POS y queda en la cartera, sin recapturar nada.",
  },
  {
    icon: Workflow,
    title: "El flujo se automatiza",
    body: "Una venta dispara la factura, la entrega y la notificación al cliente por sí sola. Tu equipo deja de copiar datos entre herramientas sueltas.",
  },
  {
    icon: ShieldCheck,
    title: "Trazable de punta a punta",
    body: "Cada pedido, abono y entrega queda registrado y firmado. Sabes qué pasó, cuándo y con qué cliente, con facturación electrónica DIAN incluida.",
  },
  {
    icon: PlugZap,
    title: "Crece por módulos",
    body: "No tienes que comprarlo todo de una. Activa el comercio por WhatsApp hoy y suma crédito, logística o POS cuando tu negocio lo pida.",
  },
];

function Benefits() {
  const flow = [
    { label: "Cliente compra" },
    { label: "Hermes", event: "pedido.pagado" },
    { label: "Nous orquesta" },
    { label: "Factura DIAN", event: "invoice.create" },
    { label: "Talaria entrega", event: "delivery.create" },
    { label: "Iris avisa", event: "whatsapp" },
  ];
  return (
    <section className="lp-section" id="beneficios">
      <div className="lp-shell">
        <div className="lp-section__head lp-reveal">
          <span className="lp-eyebrow">Por qué Prizma</span>
          <h2>Menos herramientas sueltas, más flujo continuo</h2>
          <p>
            La mayoría de las pymes pega con cinta cinco programas que no se
            hablan. Prizma los reemplaza por una suite donde todo está conectado
            desde el primer día.
          </p>
        </div>

        <div className="lp-benefits lp-reveal">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div className="lp-benefit" key={b.title}>
                <span className="lp-benefit__icon">
                  <Icon size={21} aria-hidden />
                </span>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </div>
            );
          })}
        </div>

        <div className="lp-flow lp-reveal" style={{ marginTop: 28 }} aria-label="Flujo de una venta">
          {flow.map((s, i) => (
            <React.Fragment key={s.label}>
              <span className="lp-flow__step">
                {s.label}
                {s.event ? <code>{s.event}</code> : null}
              </span>
              {i < flow.length - 1 && (
                <ArrowRight className="lp-flow__arrow" size={16} aria-hidden />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- CONTACTO -- */

function Contact() {
  return (
    <section className="lp-section" id="contacto">
      <div className="lp-shell">
        <div className="lp-contact lp-reveal">
          <div className="lp-contact__grid">
            <div>
              <span className="lp-eyebrow">Hablemos</span>
              <h2>Cuéntanos cómo vendes y te mostramos Prizma</h2>
              <p>
                Una demo guiada, sin compromiso. Vemos tu operación actual y te
                enseñamos cómo quedaría con la suite conectada.
              </p>
              <div className="lp-contact__actions">
                <a
                  className="lp-cta lp-cta--solid lp-cta--lg"
                  href={MAILTO_DEMO}
                >
                  Solicita una demo <ArrowRight size={18} aria-hidden />
                </a>
                <a
                  className="lp-cta lp-cta--ghost lp-cta--lg"
                  href={`mailto:${CONTACT_EMAIL}`}
                >
                  <Mail size={16} aria-hidden /> Escríbenos
                </a>
              </div>
            </div>

            <div className="lp-contact__card">
              <dl>
                <div className="lp-contact__row">
                  <Mail size={18} aria-hidden />
                  <div>
                    <dt>Correo</dt>
                    <dd>
                      <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                    </dd>
                  </div>
                </div>
                <div className="lp-contact__row">
                  <MapPin size={18} aria-hidden />
                  <div>
                    <dt>Responsable</dt>
                    <dd>Steven Vallejo</dd>
                  </div>
                </div>
                <div className="lp-contact__row">
                  <Network size={18} aria-hidden />
                  <div>
                    <dt>Suite</dt>
                    <dd>
                      <a
                        href="https://prisma-enterprice.cloud"
                        target="_blank"
                        rel="noreferrer"
                      >
                        prisma-enterprice.cloud
                      </a>
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- LANDING -- */

/** Reveal progresivo de las secciones marcadas con .lp-reveal al hacer scroll. */
function useScrollReveal() {
  React.useEffect(() => {
    const reduce =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".lp-reveal"));
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    // Red de seguridad: si el observer no dispara (anclaje profundo, bots,
    // motores de SEO sin scroll), revela todo a los 1.4s para no dejar
    // contenido invisible nunca.
    const safety = window.setTimeout(
      () => els.forEach((el) => el.classList.add("is-in")),
      1400,
    );
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);
}

export function Landing() {
  useScrollReveal();
  React.useEffect(() => {
    document.title = "Prizma — La suite que conecta tu negocio";
  }, []);

  return (
    <div className="lp">
      <nav className="lp-top">
        <div className="lp-shell" style={{ display: "flex", alignItems: "center", gap: 16, width: "100%" }}>
          <a className="lp-brand" href="#top" aria-label="Prizma — inicio">
            <Symbol size={30} />
            <span className="lp-brand__word">Prizma</span>
          </a>
          <span className="lp-top__spacer" />
          <div className="lp-top__links">
            <a className="lp-navlink lp-navlink--hideable" href="#productos">
              Productos
            </a>
            <a className="lp-navlink lp-navlink--hideable" href="#beneficios">
              Beneficios
            </a>
            <Link className="lp-navlink" to="/demo">
              Ver demo
            </Link>
            <a className="lp-cta lp-cta--solid" href="#contacto">
              Solicita una demo
            </a>
          </div>
        </div>
      </nav>

      <main id="top">
        <Hero />
        <Products />
        <Benefits />
        <Contact />
      </main>

      <footer className="lp-shell lp-foot">
        <span>© {new Date().getFullYear()} Prizma — Steven Vallejo.</span>
        <span className="lp-foot__spacer" />
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <Link to="/demo">Ver demo</Link>
      </footer>
    </div>
  );
}
