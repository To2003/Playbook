/**
 * Todo lo que se cambia sin tocar el montaje: el link del cierre y los textos.
 * Después de editar, volvé a renderizar (ver README.md).
 */
export const TRAILER_LINK = "playbook.vercel.app";

export const FPS = 30;

/** Escenas en orden. `segundos` es la duración; los cortes caen en los golpes de la música. */
export const ESCENAS = [
  { id: "lineas", segundos: 3, texto: "Llegás a la cancha…" },
  { id: "fichas", segundos: 3, texto: "…y vinieron 11, no 18." },
  { id: "cuantos", segundos: 4, texto: "Poné cuántos vinieron." },
  { id: "queArmamos", segundos: 3, texto: "Elegí nivel e intensidad." },
  { id: "sesion", segundos: 4, texto: "En segundos, tu sesión." },
  { id: "dameOtro", segundos: 3, texto: "¿No te gusta? Dame otro." },
  { id: "pizarra", segundos: 4, texto: "Cada ejercicio, animado." },
  { id: "cancha", segundos: 3, texto: "Y en la cancha, el celu te marca los tiempos." },
  { id: "logo", segundos: 3, texto: "Beta para entrenadores" },
] as const;

export type IdEscena = (typeof ESCENAS)[number]["id"];

/** Texto chico del cierre, debajo del link. */
export const TEXTO_ACCESO = "Pedí acceso:";
