import type { TipoSesion } from "./tipos";

/** Duraciones que se ofrecen por tipo de sesión (las de la tabla de tiempos). */
export const DURACIONES: Record<TipoSesion, number[]> = { completa: [60, 75, 90, 120], calor: [15, 20, 25, 30], principal: [30, 45, 60] };
