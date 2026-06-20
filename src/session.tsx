/**
 * session.tsx — Contexto ligero de sesión para el Portal Prizma.
 *
 * Expone SessionProvider + useSession con:
 *   - user  : { name, email, role }   (role: "admin" | "operador" | "viewer")
 *   - tenant : Tenant activo
 *   - tenants: Tenant[] disponibles para el usuario
 *   - setTenant(id): cambia el tenant activo
 *
 * Datos demo en es-CO; sin dependencias externas.
 * Reemplazar la constante DEMO_SESSION con datos reales al integrar autenticación.
 */

import * as React from "react";

/* ─── tipos ───────────────────────────────────────────────────────────────────── */

export type UserRole = "admin" | "operador" | "viewer";

export interface SessionUser {
  name: string;
  email: string;
  role: UserRole;
}

export interface Tenant {
  id: string;
  /** Nombre visible en la UI */
  nombre: string;
  /** NIT o identificación fiscal (es-CO) */
  nit: string;
  /** Plan suscrito */
  plan: "starter" | "pro" | "enterprise";
  /** País ISO-3166 alpha-2 */
  pais: string;
}

export interface SessionValue {
  /** Usuario autenticado */
  user: SessionUser;
  /** Tenant actualmente seleccionado */
  tenant: Tenant;
  /** Todos los tenants disponibles para este usuario */
  tenants: Tenant[];
  /** Cambia el tenant activo por su id. Retorna true si el tenant existe y se cambió, false si no se encontró. */
  setTenant: (id: string) => boolean;
  /**
   * Cambia el rol del usuario actual. Solo para demostrar el gating por rol en
   * el portal; en producción el rol proviene del proveedor de identidad y este
   * método debería eliminarse o quedar restringido.
   */
  setRole: (role: UserRole) => void;
}

/* ─── datos demo (es-CO) ──────────────────────────────────────────────────────── */

const DEMO_TENANTS: Tenant[] = [
  {
    id: "ten-001",
    nombre: "Distribuidora Andina S.A.S.",
    nit: "900.123.456-7",
    plan: "enterprise",
    pais: "CO",
  },
  {
    id: "ten-002",
    nombre: "Comercializadora del Pacífico Ltda.",
    nit: "800.654.321-0",
    plan: "pro",
    pais: "CO",
  },
  {
    id: "ten-003",
    nombre: "Logística Rápida Express S.A.S.",
    nit: "901.234.567-3",
    plan: "starter",
    pais: "CO",
  },
];

const DEMO_SESSION: Omit<SessionValue, "setTenant" | "setRole"> = {
  user: {
    name: "Valentina Ríos",
    email: "v.rios@distribuidoraandina.com.co",
    role: "admin",
  },
  tenant: DEMO_TENANTS[0],
  tenants: DEMO_TENANTS,
};

/* ─── contexto ────────────────────────────────────────────────────────────────── */

const SessionContext = React.createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenantState] = React.useState<Tenant>(DEMO_SESSION.tenant);
  const [role, setRoleState] = React.useState<UserRole>(DEMO_SESSION.user.role);

  const setTenant = React.useCallback((id: string): boolean => {
    const found = DEMO_SESSION.tenants.find((t) => t.id === id);
    if (found) {
      setTenantState(found);
      return true;
    }
    // Tenant no encontrado: retorna false sin cambiar estado.
    return false;
  }, []);

  const setRole = React.useCallback((next: UserRole) => {
    setRoleState(next);
  }, []);

  const value: SessionValue = React.useMemo(
    () => ({
      user: { ...DEMO_SESSION.user, role },
      tenant,
      tenants: DEMO_SESSION.tenants,
      setTenant,
      setRole,
    }),
    [tenant, role, setTenant, setRole]
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * useSession — devuelve el contexto de sesión.
 * Lanza si se usa fuera de <SessionProvider>.
 *
 * @example
 * const { user, tenant, tenants, setTenant, setRole } = useSession();
 */
export function useSession(): SessionValue {
  const ctx = React.useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession debe usarse dentro de <SessionProvider>");
  }
  return ctx;
}
