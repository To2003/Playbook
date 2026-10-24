import type { Punto } from "./tipos";

/** Ubicaciones de las fichas del contador "¿Cuántos vinieron?", en el orden en que se suman. */
export function lugaresContador(): Punto[] {
  const filas = [79, 72.5, 66, 59.5, 53, 47.5];
  const cols = [7, 17, 27.5, 38, 48];
  const lugares: Punto[] = [];
  // Orden salteado para que la cancha se llene pareja y no fila por fila.
  const orden = [12, 7, 17, 2, 22, 11, 13, 6, 18, 8, 16, 1, 23, 3, 21, 10, 14, 5, 19, 0, 24, 9, 15, 4, 20, 27, 26, 28, 25, 29];
  for (const k of orden) {
    const f = Math.floor(k / 5);
    const c = k % 5;
    const jitterX = ((k * 37) % 7) / 7 - 0.5;
    const jitterY = ((k * 53) % 9) / 9 - 0.5;
    lugares.push({ x: filas[f] + jitterX * 2.4, y: cols[c] + jitterY * 3 + (f % 2 ? 2.5 : -2.5) });
  }
  return lugares;
}
