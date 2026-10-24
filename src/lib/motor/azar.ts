/** Generador determinístico (mulberry32): la misma semilla da la misma sesión. */
export function crearAzar(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mezcla un texto en una semilla (para derivar sub-semillas estables). */
export function semillaDe(...partes: (string | number)[]): number {
  let h = 2166136261;
  for (const ch of partes.join("|")) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
