import * as React from "react";
import { Badge, Button, Card, CardBody, CardHeader, Spinner } from "prizma-ui";
import { RefreshCw } from "lucide-react";
import { SERVICE_HEALTH, PRODUCT_BY_KEY, type ServiceHealthDef } from "./data";

/**
 * "checking" = sondeo en curso · "up" = el host respondió · "unknown" = no
 * verificable cross-origin (conector sin dominio público). NUNCA usamos un
 * estado "down" en rojo por una comprobación que el navegador no puede hacer.
 */
type Health = "up" | "unknown" | "checking";

interface ServiceState {
  def: ServiceHealthDef;
  status: Health;
  latencyMs?: number;
}

/**
 * URL pública del /health del servicio. Solo las apps de cara al cliente tienen
 * subdominio verificable; los conectores internos devuelven null -> "unknown".
 */
function publicHealthUrl(def: ServiceHealthDef): string | null {
  const product = PRODUCT_BY_KEY[def.key];
  if (!product?.url || !product.customerFacing) return null;
  try {
    const base = new URL(product.url);
    return `${base.origin}${def.healthPath}`;
  } catch {
    return null;
  }
}

/**
 * Sonda tolerante. Con `mode:"no-cors"` la respuesta es opaca: si llega, el
 * host respondió -> "up". Si no hay URL pública o no responde, devolvemos
 * "unknown" (neutro), no "caído": no podemos afirmar una caída que no medimos.
 */
async function probe(def: ServiceHealthDef, timeoutMs = 4000): Promise<{ status: Health; latencyMs?: number }> {
  const url = publicHealthUrl(def);
  if (!url) return { status: "unknown" };
  const started = performance.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      signal: ctrl.signal,
    });
    const latencyMs = Math.round(performance.now() - started);
    const answered = res.type === "opaque" || res.ok;
    return answered ? { status: "up", latencyMs } : { status: "unknown", latencyMs };
  } catch {
    return { status: "unknown" };
  } finally {
    clearTimeout(timer);
  }
}

const SERVICE_LIST = SERVICE_HEALTH;

export function SystemStatus() {
  const [states, setStates] = React.useState<ServiceState[]>(() =>
    SERVICE_LIST.map((def) => ({ def, status: "checking" as Health }))
  );
  const [scanning, setScanning] = React.useState(false);

  const runScan = React.useCallback(async () => {
    setScanning(true);
    setStates((prev) => prev.map((s) => ({ ...s, status: "checking" })));
    const results = await Promise.all(
      SERVICE_LIST.map(async (def) => {
        const { status, latencyMs } = await probe(def);
        return { def, status, latencyMs } satisfies ServiceState;
      })
    );
    setStates(results);
    setScanning(false);
  }, []);

  React.useEffect(() => {
    runScan();
  }, [runScan]);

  const up = states.filter((s) => s.status === "up").length;
  const unknown = states.filter((s) => s.status === "unknown").length;
  const total = states.length;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="cui-row cui-row--between cui-row--wrap" style={{ gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24 }}>Estado del sistema</h2>
          <p style={{ color: "var(--c-text-muted)" }}>
            Salud de cada servicio del ecosistema. Las apps con dominio público se
            sondean en vivo a <code>/health</code>; los conectores internos no son
            verificables desde el navegador y se muestran en estado neutro.
          </p>
        </div>
        <div className="cui-row" style={{ gap: 8 }}>
          <Badge tone={up > 0 ? "success" : "neutral"}>{up} verificado{up !== 1 ? "s" : ""}</Badge>
          {unknown > 0 && <Badge tone="neutral">{unknown} sin verificar</Badge>}
          <Button
            variant="secondary"
            size="sm"
            onClick={runScan}
            disabled={scanning}
            leftIcon={<RefreshCw size={14} aria-hidden className={scanning ? "pzl-spin" : undefined} />}
          >
            {scanning ? "Sondeando…" : "Re-escanear"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Servicios backend"
          subtitle={`${total} servicios registrados · puertos de prizma-contracts SERVICES`}
          action={scanning ? <Spinner size={18} /> : undefined}
        />
        {/* A11Y-06: aria-live para anunciar resultados de re-escaneo a AT */}
        <CardBody style={{ display: "flex", flexDirection: "column", gap: 4 }} aria-live="polite" aria-atomic="false">
          {states.map(({ def, status, latencyMs }) => (
            <div
              key={def.key}
              className="cui-row cui-row--between"
              style={{
                padding: "12px 4px",
                borderBottom: "1px solid var(--c-border)",
                gap: 12,
              }}
            >
              <div className="cui-row" style={{ gap: 12, minWidth: 0 }}>
                <span className="cui-avatar" aria-hidden style={{ width: 32, height: 32 }}>
                  {def.name.slice(0, 2)}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{def.name}</div>
                  <div style={{ fontSize: 12, color: "var(--c-text-subtle)" }}>
                    <code>{endpointLabel(def)}</code>
                  </div>
                </div>
              </div>
              <div className="cui-row" style={{ gap: 10 }}>
                {status === "up" && latencyMs != null && (
                  <span style={{ fontSize: 12, color: "var(--c-text-subtle)" }}>{latencyMs} ms</span>
                )}
                <StatusBadge status={status} />
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </section>
  );
}

/** Endpoint legible: host público si lo hay, si no, etiqueta neutra. */
function endpointLabel(def: ServiceHealthDef): string {
  const url = publicHealthUrl(def);
  if (!url) return "conector interno · sin endpoint público";
  try {
    return new URL(url).host;
  } catch {
    return "endpoint no disponible";
  }
}

function StatusBadge({ status }: { status: Health }) {
  if (status === "checking") return <Badge tone="info" dot>Comprobando</Badge>;
  if (status === "up") return <Badge tone="success" dot>Operativo</Badge>;
  return <Badge tone="neutral" dot>Sin verificar</Badge>;
}
