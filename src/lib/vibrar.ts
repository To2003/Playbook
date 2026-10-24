/** Vibración donde exista (Android). En iOS no hay API y cae en silencio. */
export function vibrar(patron: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(patron);
  } catch {
    // Sin vibración: no pasa nada.
  }
}
