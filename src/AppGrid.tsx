/**
 * AppGrid.tsx — lanzador de apps "image-forward" del Portal Prizma.
 *
 * Cada app es una card ANCHA en formato banner horizontal: la portada de marca
 * (public/covers/<key>.svg) es la PROTAGONISTA y ocupa la mayor parte de la card.
 * La portada YA trae el nombre/wordmark, así que NO se imprime un título encima:
 * la imagen habla. A su lado, un riel de texto con 1-2 líneas reales de
 * descripción y las acciones (Abrir = enlace real al subdominio, Detalle).
 *
 * Grid adaptable (auto-fit/minmax con mínimo "doble ancho"): con pocas apps las
 * cards crecen hasta ocupar el ancho; con varias se reacomodan en filas sin
 * dejar cards diminutas perdidas (ver launcher.css).
 *
 * RBAC: una app sin rol permitido se muestra inhabilitada (el usuario ve que
 * existe) salvo módulos internos, que se ocultan a roles no-admin.
 */
import { ArrowUpRight, Lock, Star } from "lucide-react";
import { PRODUCTS, type ModuleKey, type Product } from "./data";
import { useSession, type UserRole } from "./session";

/** Roles que pueden lanzar cada módulo (refleja el gating del Cockpit). */
const MODULE_ROLES: Partial<Record<ModuleKey, UserRole[]>> = {
  hermes: ["admin", "operador", "viewer"],
  iris: ["admin", "operador", "viewer"],
  talaria: ["admin", "operador", "viewer"],
  talanton: ["admin", "operador"],
  pistis: ["admin", "operador"],
  logos: ["admin", "operador"],
  mnemosyne: ["admin", "operador"],
  peitho: ["admin", "operador"],
  talos: ["admin"],
  nous: ["admin"],
};

function allowedFor(key: ModuleKey, role: UserRole): boolean {
  const roles = MODULE_ROLES[key];
  return !roles || roles.length === 0 || roles.includes(role);
}

interface AppCardProps {
  product: Product;
  allowed: boolean;
  onDetail: (key: ModuleKey) => void;
}

function AppCard({ product: p, allowed, onDetail }: AppCardProps) {
  // La portada YA contiene el nombre de la app: el <img> lleva alt descriptivo
  // (a11y) pero NO repetimos el título en texto visible. El riel de la derecha
  // queda para contexto + acciones, dejando respirar la imagen.
  return (
    <article className="pzl-card" data-module={p.key}>
      <div className="pzl-card__media">
        <img
          className="pzl-card__img"
          src={p.cover}
          alt={`${p.name} — ${p.tagline}`}
          loading="lazy"
          width={680}
          height={384}
        />
        {p.star ? (
          <span className="pzl-card__tag pzl-card__tag--star">
            <Star size={12} fill="currentColor" aria-hidden /> Estrella
          </span>
        ) : p.internal ? (
          <span className="pzl-card__tag">Interno</span>
        ) : (
          <span className="pzl-card__tag">{p.line}</span>
        )}
      </div>

      <div className="pzl-card__rail">
        {/* Eyebrow de contexto en lugar de título: la imagen ya nombra la app. */}
        <span className="pzl-card__eyebrow">
          {p.line}
          <span className="pzl-card__aka">ex-{p.aka}</span>
        </span>
        <p className="pzl-card__blurb">{p.blurb}</p>

        <div className="pzl-card__foot">
          {allowed ? (
            <a
              className="pzl-open"
              href={p.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Abrir ${p.name} en una pestaña nueva`}
            >
              Abrir {p.name} <ArrowUpRight size={16} aria-hidden />
            </a>
          ) : (
            <span
              className="pzl-detail pzl-detail--locked"
              aria-disabled="true"
              title="Tu rol no tiene acceso a este módulo"
            >
              <Lock size={14} aria-hidden /> Sin acceso
            </span>
          )}
          <button
            type="button"
            className="pzl-detail"
            onClick={() => onDetail(p.key)}
            aria-label={`Ver el detalle de ${p.name}`}
          >
            Detalle
          </button>
        </div>
      </div>
    </article>
  );
}

export interface AppGridProps {
  /** Abre la vista interna de detalle de un módulo. */
  onDetail: (key: ModuleKey) => void;
}

export function AppGrid({ onDetail }: AppGridProps) {
  const { user } = useSession();

  // Apps de cara al cliente (subdominios vivos): grid grande protagonista.
  const customer = PRODUCTS.filter((p) => p.customerFacing);
  // Conectores / internos / herramientas: lane secundaria, más compacta.
  // Ocultamos "nous" (interno) a quien no es admin.
  const support = PRODUCTS.filter(
    (p) => !p.customerFacing && !(p.internal && user.role !== "admin"),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <section aria-labelledby="pzl-apps-heading">
        <div className="pzl-sectionhead">
          <div>
            <h2 id="pzl-apps-heading">Las apps de tu negocio</h2>
            <p>
              Venta, mensajería, caja, crédito y entrega. Una sola sesión, un
              solo flujo: abre cualquiera y sigue trabajando.
            </p>
          </div>
        </div>
        <div
          className={`pzl-grid${customer.length <= 2 ? " pzl-grid--few" : ""}`}
        >
          {customer.map((p) => (
            <AppCard
              key={p.key}
              product={p}
              allowed={allowedFor(p.key, user.role)}
              onDetail={onDetail}
            />
          ))}
        </div>
      </section>

      {support.length > 0 && (
        <section aria-labelledby="pzl-support-heading">
          <div className="pzl-sectionhead">
            <div>
              <h2 id="pzl-support-heading">Conectores y herramientas</h2>
              <p>
                Piezas internas que enlazan facturación, CRM, marketing y
                automatización con el resto de la suite.
              </p>
            </div>
          </div>
          <div className="pzl-grid pzl-grid--secondary">
            {support.map((p) => (
              <AppCard
                key={p.key}
                product={p}
                allowed={allowedFor(p.key, user.role)}
                onDetail={onDetail}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
