import { db, type CambioPendiente } from "../db";

type Oyente = () => void;
const oyentes = new Set<Oyente>();

/** Avisa cada vez que hay algo nuevo para subir (el sincronizador se cuelga de acá). */
export function alEncolar(f: Oyente): () => void {
  oyentes.add(f);
  return () => oyentes.delete(f);
}

/** Anota un cambio local para subirlo cuando haya cuenta y señal. Si ya estaba anotado, no lo duplica. */
export async function encolar(tabla: CambioPendiente["tabla"], claveId: string, op: CambioPendiente["op"] = "upsert"): Promise<void> {
  const base = db();
  await base.transaction("rw", base.cola, async () => {
    const previo = await base.cola.where("claveId").equals(claveId).and((c) => c.tabla === tabla).first();
    if (previo?.id) await base.cola.update(previo.id, { op, creado: Date.now() });
    else await base.cola.add({ tabla, claveId, op, creado: Date.now() });
  });
  oyentes.forEach((f) => f());
}
