/** Ids libres para copias: mismo prefijo de letras que el original y el primer número que no esté usado. */
export function idsLibres(originales: string[], existentes: string[]): string[] {
  const usados = new Set(existentes);
  return originales.map((id) => {
    const prefijo = id.replace(/\d+$/, "") || "e";
    let n = 1;
    while (usados.has(`${prefijo}${n}`)) n++;
    const nuevo = `${prefijo}${n}`;
    usados.add(nuevo);
    return nuevo;
  });
}

/** Flechas de pantalla → corrimiento en metros de cancha (la vista parada está rotada 90°). */
export function corrimiento(tecla: string, paso: number, vertical: boolean): { dx: number; dy: number } | null {
  const pantalla: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  const v = pantalla[tecla];
  if (!v) return null;
  const [sx, sy] = v;
  return vertical ? { dx: -sy * paso, dy: sx * paso } : { dx: sx * paso, dy: sy * paso };
}
