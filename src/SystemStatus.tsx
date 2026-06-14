import * as React from "react";
import { Badge, Button, Card, CardBody, CardHeader, Spinner } from "@olympo/ui";
import { SERVICE_HEALTH, type ServiceHealthDef } from "./data";

type Health = "up" | "down" | "checking";

interface ServiceState {
  def: ServiceHealthDef;
  status: Health;
  latencyMs?: number;
}

/** Build the dev health URL for a service from its port + healthPath. */
function healthUrl(def: ServiceHealthDef): string {
  return `http://localhost:${def.port}${def.healthPath}`;
}

/**
 * Probe a single service's /health. Tolerant by design: any network/CORS error,
 * timeout, or non-OK response is reported as "down" instead of throwing.
 *
 * We use `mode: "no-cors"` so a reachable-but-CORS-restricted backend still
 * resolves (as an opaque response) and counts as "up" — we only need to know
 * the socket answered, not read the body.
 */
async function probe(def: ServiceHealthDef, timeoutMs = 3000): Promise<{ status: Health; latencyMs: number }> {
  const url = healthUrl(def);
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
    // Opaque (no-cors) responses have status 0 but mean the server answered.
    const ok = res.type === "opaque" || res.ok;
    return { status: ok ? "up" : "down", latencyMs };
  } catch {
    return { status: "down", latencyMs: Math.round(performance.now() - started) };
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
  const down = states.filter((s) => s.status === "down").length;
  const total = states.length;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="cui-row cui-row--between cui-row--wrap" style={{ gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24 }}>Estado del sistema</h2>
          <p style={{ color: "var(--c-text-muted)" }}>
            Salud de cada servicio del ecosistema (sondeo a <code>/health</code> vía{" "}
            <code>@olympo/contracts</code>). Tolerante a CORS y errores de red.
          </p>
        </div>
        <div className="cui-row" style={{ gap: 8 }}>
          <Badge tone="success">{up} arriba</Badge>
          {down > 0 && <Badge tone="danger">{down} caídos</Badge>}
          <Button variant="secondary" size="sm" onClick={runScan} disabled={scanning}>
            {scanning ? "Sondeando…" : "↻ Re-escanear"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Servicios backend"
          subtitle={`${total} servicios registrados · puertos de @olympo/contracts SERVICES`}
          action={scanning ? <Spinner size={18} /> : undefined}
        />
        <CardBody style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
                    <code>localhost:{def.port}{def.healthPath}</code>
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

function StatusBadge({ status }: { status: Health }) {
  if (status === "checking") return <Badge tone="neutral" dot>…</Badge>;
  if (status === "up") return <Badge tone="success" dot>UP</Badge>;
  return <Badge tone="danger" dot>down</Badge>;
}
