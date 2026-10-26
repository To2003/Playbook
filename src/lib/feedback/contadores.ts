import type { PlaybookDB } from "../db";

/** Contadores de uso para la info técnica del feedback. Viven en la tabla `meta` de Dexie. */
export type Contador = "sesiones" | "cancha" | "propios";
const clave = (c: Contador) => `contador:${c}`;

export async function sumarContador(base: PlaybookDB, c: Contador): Promise<number> {
  return base.transaction("rw", base.meta, async () => {
    const valor = ((await base.meta.get(clave(c)))?.valor ?? 0) + 1;
    await base.meta.put({ clave: clave(c), valor });
    return valor;
  });
}

export async function leerContadores(base: PlaybookDB): Promise<Record<Contador, number>> {
  const [sesiones, cancha, propios] = await Promise.all((["sesiones", "cancha", "propios"] as const).map(async (c) => (await base.meta.get(clave(c)))?.valor ?? 0));
  return { sesiones, cancha, propios };
}
