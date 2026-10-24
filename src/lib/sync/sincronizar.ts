import type { CambioPendiente, FilaAjustes, PlaybookDB } from "../db";
import type { Ejercicio, Sesion } from "../tipos";
import { AUTOR_LOCAL } from "../estado/propios";
import type { FilaNube, Nube, Tabla } from "./nube";

const TABLAS: Tabla[] = ["ejercicios", "sesiones", "ajustes"];
/** Se baja con una semana de solapamiento: tolera relojes de dispositivos desfasados. */
const SOLAPE_MS = 7 * 24 * 3600 * 1000;

export interface ResultadoSync {
  subidos: number;
  bajados: number;
}

/**
 * Sincroniza IndexedDB con la nube (SPEC 9.1, local-first):
 * 1. La primera vez de cada usuario en el dispositivo, adopta lo local (ejercicios sin cuenta,
 *    sesiones y ajustes) y lo anota en la cola: al hacer login se fusiona con la nube.
 * 2. Baja lo cambiado en otros dispositivos. Gana el cambio más nuevo; lo que tiene un cambio
 *    local pendiente no se pisa (se sube en el paso 3).
 * 3. Sube la cola. Un cambio que se volvió a tocar mientras se subía queda para la próxima.
 */
export async function sincronizar(base: PlaybookDB, nube: Nube, uid: string, ahora = Date.now()): Promise<ResultadoSync> {
  await adoptar(base, uid, ahora);
  let bajados = 0;
  for (const tabla of TABLAS) bajados += await bajar(base, nube, uid, tabla);
  const subidos = await subir(base, nube, ahora);
  return { subidos, bajados };
}

async function adoptar(base: PlaybookDB, uid: string, ahora: number) {
  const clave = `adoptado:${uid}`;
  if (await base.meta.get(clave)) return;
  const sinCuenta = await base.ejercicios.where("id").startsWith("p-").filter((e) => e.autor === AUTOR_LOCAL || e.autor === uid).toArray();
  const sesiones = await base.sesiones.toCollection().primaryKeys();
  const ajustes = await base.ajustes.get("yo");
  await base.transaction("rw", base.ejercicios, base.cola, base.meta, async () => {
    for (const e of sinCuenta) if (e.autor === AUTOR_LOCAL) await base.ejercicios.put({ ...e, autor: uid });
    const cambios: Omit<CambioPendiente, "id">[] = [
      ...sinCuenta.map((e) => ({ tabla: "ejercicios" as const, claveId: e.id, op: "upsert" as const, creado: ahora })),
      ...sesiones.map((id) => ({ tabla: "sesiones" as const, claveId: id, op: "upsert" as const, creado: ahora })),
      ...(ajustes ? [{ tabla: "ajustes" as const, claveId: "yo", op: "upsert" as const, creado: ahora }] : []),
    ];
    for (const c of cambios) {
      const previo = await base.cola.where("claveId").equals(c.claveId).and((x) => x.tabla === c.tabla).first();
      if (!previo) await base.cola.add(c);
    }
    await base.meta.put({ clave, valor: ahora });
  });
}

async function bajar(base: PlaybookDB, nube: Nube, uid: string, tabla: Tabla): Promise<number> {
  const claveMarca = `bajado:${uid}:${tabla}`;
  const marca = (await base.meta.get(claveMarca))?.valor ?? 0;
  const filas = await nube.bajar(tabla, Math.max(0, marca - SOLAPE_MS));
  if (!filas.length) return 0;
  const pendientes = new Set((await base.cola.where("tabla").equals(tabla).toArray()).map((c) => c.claveId));
  let cambiados = 0;
  await base.transaction("rw", base.ejercicios, base.sesiones, base.ajustes, base.meta, async () => {
    for (const f of filas) {
      if (pendientes.has(f.id)) continue;
      const local = await leerLocal(base, tabla, f.id);
      if (f.borrado) {
        if (local) {
          await borrarLocal(base, tabla, f.id);
          cambiados++;
        }
        continue;
      }
      if (local && (local.actualizado ?? 0) >= f.actualizado) continue;
      await escribirLocal(base, tabla, f, uid);
      cambiados++;
    }
    await base.meta.put({ clave: claveMarca, valor: Math.max(marca, ...filas.map((f) => f.actualizado)) });
  });
  return cambiados;
}

async function subir(base: PlaybookDB, nube: Nube, ahora: number): Promise<number> {
  const cola = await base.cola.orderBy("id").toArray();
  let subidos = 0;
  for (const tabla of TABLAS) {
    const deLaTabla = cola.filter((c) => c.tabla === tabla);
    if (!deLaTabla.length) continue;
    const filas: FilaNube[] = [];
    for (const c of deLaTabla) {
      const local = c.op === "borrar" ? undefined : await leerLocal(base, tabla, c.claveId);
      if (!local) {
        // Borrado (o ya no existe): se marca en la nube para que los otros dispositivos se enteren.
        filas.push({ id: c.claveId, datos: {}, actualizado: ahora, borrado: true });
        continue;
      }
      const { datos, actualizado, compartido } = aFila(tabla, local);
      filas.push({ id: c.claveId, datos, actualizado, borrado: false, ...(tabla === "ejercicios" ? { compartido } : {}) });
    }
    await nube.subir(tabla, filas);
    // Se saca de la cola solo lo que no se volvió a tocar mientras subía.
    await base.transaction("rw", base.cola, async () => {
      for (const c of deLaTabla) {
        const ahoraEnCola = await base.cola.get(c.id!);
        if (ahoraEnCola && ahoraEnCola.creado === c.creado && ahoraEnCola.op === c.op) await base.cola.delete(c.id!);
      }
    });
    subidos += filas.length;
  }
  return subidos;
}

type Registro = Ejercicio | Sesion | FilaAjustes;

function leerLocal(base: PlaybookDB, tabla: Tabla, id: string): Promise<Registro | undefined> {
  if (tabla === "ejercicios") return base.ejercicios.get(id);
  if (tabla === "sesiones") return base.sesiones.get(id);
  return base.ajustes.get("yo");
}

async function borrarLocal(base: PlaybookDB, tabla: Tabla, id: string) {
  if (tabla === "ejercicios") await base.ejercicios.delete(id);
  else if (tabla === "sesiones") await base.sesiones.delete(id);
  // Los ajustes no se borran: siempre hay unos.
}

async function escribirLocal(base: PlaybookDB, tabla: Tabla, f: FilaNube, uid: string) {
  if (tabla === "ejercicios") await base.ejercicios.put({ ...(f.datos as Ejercicio), id: f.id, autor: uid, compartido: !!f.compartido, actualizado: f.actualizado });
  else if (tabla === "sesiones") await base.sesiones.put({ ...(f.datos as Sesion), id: f.id, actualizado: f.actualizado });
  else await base.ajustes.put({ ...(f.datos as FilaAjustes), clave: "yo", actualizado: f.actualizado });
}

function aFila(tabla: Tabla, r: Registro): { datos: unknown; actualizado: number; compartido?: boolean } {
  if (tabla === "ajustes") {
    const { clave: _c, actualizado, ...datos } = r as FilaAjustes;
    void _c;
    return { datos, actualizado: actualizado ?? 0 };
  }
  const e = r as Ejercicio | Sesion;
  return { datos: e, actualizado: e.actualizado ?? 0, compartido: "compartido" in e ? !!e.compartido : undefined };
}
