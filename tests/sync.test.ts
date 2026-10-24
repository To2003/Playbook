import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { BIBLIOTECA } from "@/data/biblioteca";
import { AJUSTES_POR_DEFECTO, PlaybookDB } from "@/lib/db";
import type { FilaNube, Nube, Tabla } from "@/lib/sync/nube";
import { nubeSupabase } from "@/lib/sync/nube";
import { sincronizar } from "@/lib/sync/sincronizar";
import type { Ejercicio, Sesion } from "@/lib/tipos";

/** Nube en memoria, con las mismas reglas que la tabla real (una fila por id y por usuario). */
function nubeFalsa() {
  const tablas: Record<Tabla, Map<string, FilaNube>> = { ejercicios: new Map(), sesiones: new Map(), ajustes: new Map() };
  let caida = false;
  const nube: Nube = {
    async bajar(tabla, desde) {
      if (caida) throw new Error("sin señal");
      return [...tablas[tabla].values()].filter((f) => f.actualizado > desde).map((f) => structuredClone(f));
    },
    async subir(tabla, filas) {
      if (caida) throw new Error("sin señal");
      for (const f of filas) tablas[tabla].set(f.id, structuredClone(f));
    },
  };
  return { nube, tablas, cortar: (v: boolean) => (caida = v) };
}

const UID = "11111111-1111-1111-1111-111111111111";
const propio = (id: string, nombre: string, actualizado: number, extra: Partial<Ejercicio> = {}): Ejercicio => ({
  ...BIBLIOTECA[0],
  id,
  nombre,
  autor: "local",
  estado: "listo",
  actualizado,
  ...extra,
});
const sesion = (id: string, actualizado: number): Sesion => ({ id, fecha: actualizado, params: {} as Sesion["params"], semilla: 1, items: [], mostrados: [], actualizado });

const bases: PlaybookDB[] = [];
const nuevaBase = (n: string) => {
  const b = new PlaybookDB(`sync-${n}-${Math.random()}`);
  bases.push(b);
  return b;
};
afterEach(async () => {
  await Promise.all(bases.splice(0).map((b) => b.delete()));
});

describe("sincronización local-first", () => {
  it("al iniciar sesión sube lo que se hizo sin cuenta y lo pasa a nombre del usuario", async () => {
    const { nube, tablas } = nubeFalsa();
    const celu = nuevaBase("celu");
    await celu.ejercicios.put(propio("p-1", "Rondo del profe", 100));
    await celu.sesiones.put(sesion("s-1", 100));
    await celu.ajustes.put({ ...AJUSTES_POR_DEFECTO, tema: "claro", clave: "yo", actualizado: 100 });

    const r = await sincronizar(celu, nube, UID, 1000);
    expect(r.subidos).toBe(3);
    expect(tablas.ejercicios.get("p-1")?.datos).toMatchObject({ nombre: "Rondo del profe", autor: UID });
    expect(tablas.sesiones.has("s-1")).toBe(true);
    expect(tablas.ajustes.get("yo")?.datos).toMatchObject({ tema: "claro" });
    expect((await celu.ejercicios.get("p-1"))?.autor).toBe(UID);
    expect(await celu.cola.count()).toBe(0);
  });

  it("criterio 7: lo creado en la compu aparece en el celu después de sincronizar", async () => {
    const { nube } = nubeFalsa();
    const compu = nuevaBase("compu");
    const celu = nuevaBase("celu");
    const cincoPasos = { ...BIBLIOTECA[0].pizarra, pasos: Array.from({ length: 5 }, (_, i) => ({ ...BIBLIOTECA[0].pizarra.pasos[0], duracionMs: 1000 + i })) };
    await compu.ejercicios.put(propio("p-compu", "Salida de 5 pasos", 200, { autor: UID, pizarra: cincoPasos }));
    await compu.cola.add({ tabla: "ejercicios", claveId: "p-compu", op: "upsert", creado: 200 });
    await sincronizar(compu, nube, UID, 300);

    const r = await sincronizar(celu, nube, UID, 400);
    expect(r.bajados).toBe(1);
    const enCelu = await celu.ejercicios.get("p-compu");
    expect(enCelu?.nombre).toBe("Salida de 5 pasos");
    expect(enCelu?.pizarra.pasos).toHaveLength(5);
  });

  it("gana el cambio más nuevo y un cambio local pendiente no se pisa", async () => {
    const { nube, tablas } = nubeFalsa();
    const celu = nuevaBase("celu");
    tablas.ejercicios.set("p-1", { id: "p-1", datos: propio("p-1", "Versión nube", 500, { autor: UID }), actualizado: 500, borrado: false });
    tablas.ejercicios.set("p-2", { id: "p-2", datos: propio("p-2", "Vieja en la nube", 100, { autor: UID }), actualizado: 100, borrado: false });
    await celu.ejercicios.put(propio("p-1", "Versión vieja local", 300, { autor: UID }));
    await celu.ejercicios.put(propio("p-2", "Editada en el celu", 600, { autor: UID }));
    await celu.cola.add({ tabla: "ejercicios", claveId: "p-2", op: "upsert", creado: 600 });
    await celu.meta.put({ clave: `adoptado:${UID}`, valor: 1 });

    await sincronizar(celu, nube, UID, 700);
    expect((await celu.ejercicios.get("p-1"))?.nombre).toBe("Versión nube");
    expect((await celu.ejercicios.get("p-2"))?.nombre).toBe("Editada en el celu");
    expect((tablas.ejercicios.get("p-2")?.datos as Ejercicio).nombre).toBe("Editada en el celu");
  });

  it("un borrado viaja como marca y se borra en el otro dispositivo", async () => {
    const { nube, tablas } = nubeFalsa();
    const compu = nuevaBase("compu");
    const celu = nuevaBase("celu");
    await compu.ejercicios.put(propio("p-x", "Para borrar", 100, { autor: UID }));
    await sincronizar(compu, nube, UID, 200);
    await sincronizar(celu, nube, UID, 300);
    expect(await celu.ejercicios.get("p-x")).toBeDefined();

    await compu.ejercicios.delete("p-x");
    await compu.cola.add({ tabla: "ejercicios", claveId: "p-x", op: "borrar", creado: 400 });
    await sincronizar(compu, nube, UID, 500);
    expect(tablas.ejercicios.get("p-x")?.borrado).toBe(true);

    await sincronizar(celu, nube, UID, 600);
    expect(await celu.ejercicios.get("p-x")).toBeUndefined();
  });

  it("sin señal la cola queda intacta y se sube cuando vuelve", async () => {
    const { nube, tablas, cortar } = nubeFalsa();
    const celu = nuevaBase("celu");
    await celu.ejercicios.put(propio("p-1", "Hecho en la cancha", 100));
    cortar(true);
    await expect(sincronizar(celu, nube, UID, 200)).rejects.toThrow("sin señal");
    expect(await celu.cola.count()).toBe(1);
    cortar(false);
    await sincronizar(celu, nube, UID, 300);
    expect(tablas.ejercicios.has("p-1")).toBe(true);
    expect(await celu.cola.count()).toBe(0);
  });

  it("un cambio hecho mientras subía queda en la cola para la próxima", async () => {
    const { nube } = nubeFalsa();
    const celu = nuevaBase("celu");
    await celu.meta.put({ clave: `adoptado:${UID}`, valor: 1 });
    await celu.ejercicios.put(propio("p-1", "Uno", 100, { autor: UID }));
    await celu.cola.add({ tabla: "ejercicios", claveId: "p-1", op: "upsert", creado: 100 });
    const lenta: Nube = {
      bajar: nube.bajar,
      async subir(t, f) {
        // Mientras sube, el entrenador lo vuelve a editar.
        const c = await celu.cola.where("claveId").equals("p-1").first();
        await celu.cola.update(c!.id!, { creado: 150 });
        return nube.subir(t, f);
      },
    };
    await sincronizar(celu, lenta, UID, 200);
    expect(await celu.cola.count()).toBe(1);
  });

  it("los compartidos viajan con su marca", async () => {
    const { nube, tablas } = nubeFalsa();
    const celu = nuevaBase("celu");
    await celu.ejercicios.put(propio("p-1", "Para el grupo", 100, { compartido: true }));
    await sincronizar(celu, nube, UID, 200);
    expect(tablas.ejercicios.get("p-1")?.compartido).toBe(true);
  });
});

/** Doble de supabase-js: registra la cadena de llamadas de cada consulta. */
function clienteFalso(respuesta: { data?: unknown; error?: { message: string } | null } = {}) {
  const llamadas: unknown[][] = [];
  const consulta: Record<string, unknown> = {};
  for (const m of ["select", "eq", "gt", "upsert"]) {
    consulta[m] = (...args: unknown[]) => {
      llamadas.push([m, ...args]);
      return consulta;
    };
  }
  consulta.then = (ok: (v: unknown) => unknown) => ok({ data: respuesta.data ?? [], error: respuesta.error ?? null });
  const cliente = {
    from: (t: string) => {
      llamadas.push(["from", t]);
      return consulta;
    },
  };
  return { cliente: cliente as never, llamadas };
}

describe("nube con supabase-js (cliente simulado)", () => {
  it("baja solo lo propio y lo cambiado desde la marca", async () => {
    const { cliente, llamadas } = clienteFalso({ data: [{ id: "p-1", datos: {}, actualizado: 5, borrado: false }] });
    const filas = await nubeSupabase(cliente, UID).bajar("ejercicios", 3);
    expect(filas).toHaveLength(1);
    expect(llamadas).toContainEqual(["from", "ejercicios"]);
    expect(llamadas).toContainEqual(["eq", "autor", UID]);
    expect(llamadas).toContainEqual(["gt", "actualizado", 3]);
  });

  it("sube con autor y resuelve conflictos por id (por autor en ajustes)", async () => {
    const { cliente, llamadas } = clienteFalso();
    const nube = nubeSupabase(cliente, UID);
    await nube.subir("sesiones", [{ id: "s-1", datos: {}, actualizado: 1, borrado: false, compartido: true }]);
    await nube.subir("ajustes", [{ id: "yo", datos: {}, actualizado: 1, borrado: false }]);
    const upserts = llamadas.filter((l) => l[0] === "upsert");
    expect(upserts[0][1]).toEqual([{ id: "s-1", datos: {}, actualizado: 1, borrado: false, autor: UID }]);
    expect(upserts[0][2]).toEqual({ onConflict: "id" });
    expect(upserts[1][2]).toEqual({ onConflict: "autor" });
  });

  it("un error de la API se convierte en excepción (la cola no se toca)", async () => {
    const { cliente } = clienteFalso({ error: { message: "JWT expired" } });
    await expect(nubeSupabase(cliente, UID).subir("ejercicios", [{ id: "p", datos: {}, actualizado: 1, borrado: false }])).rejects.toThrow("JWT expired");
  });
});
