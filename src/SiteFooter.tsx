/**
 * SiteFooter.tsx — pie del Portal con datos de contacto reales.
 *
 * Contacto = datos del owner (Steven Vallejo). El RUT queda como placeholder
 * marcado TODO: no se inventa el número.
 */
import { Mail, MapPin } from "lucide-react";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="pzl-footer" aria-label="Información de contacto">
      <div>
        <h3>Prizma</h3>
        <p style={{ margin: 0, lineHeight: 1.55 }}>
          Menos herramientas sueltas, más flujo continuo: de la venta al cobro y
          la entrega, en una sola suite.
        </p>
      </div>

      <div>
        <h3>Contacto</h3>
        <p style={{ margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <span>Steven Vallejo</span>
          <a
            href="mailto:stevenvallejo780@gmail.com"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Mail size={14} aria-hidden /> stevenvallejo780@gmail.com
          </a>
          <span
            className="pzl-footer__todo"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <MapPin size={14} aria-hidden /> RUT: {/* TODO: añadir el RUT real, no inventarlo */}
            <span>pendiente</span>
          </span>
        </p>
      </div>

      <div>
        <h3>Suite</h3>
        <p style={{ margin: 0, lineHeight: 1.7 }}>
          <a href="https://prisma-enterprice.cloud/">prisma-enterprice.cloud</a>
          <br />
          <span className="pzl-footer__todo">
            Diseño unificado con prizma-ui · eventos con prizma-contracts
          </span>
        </p>
      </div>

      <div style={{ gridColumn: "1 / -1", paddingTop: 8, borderTop: "1px solid var(--c-border)", color: "var(--c-text-subtle)" }}>
        © {year} Prizma — Steven Vallejo. Todos los derechos reservados.
      </div>
    </footer>
  );
}
