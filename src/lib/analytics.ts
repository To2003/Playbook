import { track } from "@vercel/analytics";

/** Eventos de producto (Vercel Web Analytics: sin cookies ni datos personales). */
export type Evento =
  | { nombre: "sesion_generada"; datos: { jugadores: number; nivel: string; intensidad: number } }
  | { nombre: "modo_cancha_iniciado" }
  | { nombre: "modo_cancha_completado" }
  | { nombre: "dame_otro" }
  | { nombre: "ejercicio_creado" }
  | { nombre: "png_exportado" }
  | { nombre: "feedback_enviado"; datos: { via: "form" | "cola" | "whatsapp" | "portapapeles"; rapida: boolean } };

/** Fuera de Vercel no hay script de analytics y `track` no hace nada; igual nunca rompe la app. */
export function evento(e: Evento): void {
  try {
    track(e.nombre, "datos" in e ? e.datos : undefined);
  } catch {
    // Analytics nunca rompe la app.
  }
}
