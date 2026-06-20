/**
 * config.ts — Configuración centralizada del portal (emails, títulos, etc.).
 *
 * Variables que pueden variar según el entorno o el dueño del dominio.
 * Mejor externalizar aquí que repartidas por el código.
 */

/** Email de contacto del responsable de la plataforma. */
export const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL ?? "stevenvallejo780@gmail.com";

/** Nombre del responsable. */
export const CONTACT_OWNER =
  import.meta.env.VITE_CONTACT_OWNER ?? "Steven Vallejo";

/** URL de la suite (dominio público). */
export const SUITE_URL =
  import.meta.env.VITE_SUITE_URL ?? "https://prisma-enterprice.cloud";
