import { describe, expect, it } from "vitest";
import { BIBLIOTECA } from "@/data/biblioteca";
import { aplicable, sumaDivision } from "@/lib/motor/division";
import { ajustarMinutos, dameOtro, generarSesion, minutosTotales } from "@/lib/motor/generar";
import type { BloqueSesion, Ejercicio, Intensidad, Nivel, ParamsSesion, TipoSesion } from "@/lib/tipos";
import { esPausa } from "@/lib/tipos";

const porId = new Map(BIBLIOTECA.map((e) => [e.id, e]));
const ej = (id: string) => porId.get(id)!;
const bloques = (items: ReturnType<typeof generarSesion>["items"]) => items.filter((x): x is BloqueSesion => !esPausa(x));

const JUGADORES = [4, 7, 11, 13, 22, 30];
const ARQUEROS = [0, 1, 2] as const;
const TIPOS: TipoSesion[] = ["completa", "calor", "principal"];
const NIVELES: Nivel[] = ["inicial", "intermedio", "avanzado"];
const INTENSIDADES: Intensidad[] = [1, 2, 3];
const SEMILLAS = [11, 2024, 987654];
const DURACIONES: Record<TipoSesion, number[]> = { completa: [60, 75, 90, 120], calor: [15, 20, 25, 30], principal: [30, 45, 60] };

/** ¿Había en la biblioteca un aplicado de intensidad ≤ 2 que se pudiera usar? */
const habiaAlternativaSuave = (p: ParamsSesion, usados: Set<string>) =>
  BIBLIOTECA.some(
    (e) => e.fase === "aplicado" && e.intensidad <= 2 && e.niveles.includes(p.nivel) && aplicable(e, p.jugadores) && !(e.arqueros === "requerido" && p.arqueros === 0) && !usados.has(e.id),
  );

describe("motor de generación: matriz de la sección 5", () => {
  let casos = 0;
  for (const jugadores of JUGADORES)
    for (const arqueros of ARQUEROS)
      for (const tipo of TIPOS)
        for (const nivel of NIVELES)
          it(`${jugadores} + ${arqueros} arq · ${tipo} · ${nivel}`, () => {
            SEMILLAS.forEach((semilla, si) => {
              for (const intensidad of INTENSIDADES) {
                const duracion = DURACIONES[tipo][(si + intensidad) % DURACIONES[tipo].length];
                const params: ParamsSesion = { jugadores, arqueros, tipo, nivel, intensidad, duracion };
                const s = generarSesion(params, BIBLIOTECA, [], semilla);
                const bs = bloques(s.items);
                casos++;

                // 1. La suma de duraciones (con pausas) es la pedida.
                expect(minutosTotales(s)).toBe(duracion);
                for (const b of bs) {
                  const e = ej(b.ejercicioId);
                  // 2. La división suma exactamente los de campo.
                  expect(sumaDivision(b.division)).toBe(jugadores);
                  // 3. Arqueros sin uso → tarea de arquero.
                  if (arqueros > 0 && e.arqueros === "no") expect(b.tareaArqueroId, b.ejercicioId).toBeTruthy();
                  // 4. Nunca "requerido" con 0 arqueros (arco_chico es otro valor y sí puede).
                  if (arqueros === 0) expect(e.arqueros).not.toBe("requerido");
                  // 6. Soporta el nivel pedido.
                  expect(e.niveles).toContain(nivel);
                  // 8. Suave: bloques 3 y 4 con intensidad ≤ 2.
                  if (intensidad === 1 && (b.bloque === 3 || b.bloque === 4)) expect(e.intensidad).toBeLessThanOrEqual(2);
                }
                // 5. No se repite ningún ejercicio en la sesión.
                const ids = bs.map((b) => b.ejercicioId);
                expect(new Set(ids).size).toBe(ids.length);
                // 7. No hay un 3 pegado a la vuelta a la calma si había alternativa.
                const calma = s.items.findIndex((x) => !esPausa(x) && x.bloque === 5);
                if (calma > 0) {
                  const previo = s.items[calma - 1];
                  if (!esPausa(previo) && ej(previo.ejercicioId).intensidad === 3) {
                    expect(habiaAlternativaSuave(params, new Set(ids.filter((x) => x !== previo.ejercicioId)))).toBe(false);
                  }
                }
                // 9. "Dame otro" nunca repite: se pide hasta agotar en un bloque.
                const b0 = bs[(semilla + intensidad) % bs.length];
                let actual = s;
                const vistos = new Set(actual.mostrados);
                for (let k = 0; k < 40; k++) {
                  const r = dameOtro(actual, b0.id, BIBLIOTECA, []);
                  if (!r.ok) {
                    expect(r.motivo).toMatch(/^No tengo otro para \d+ en \w+\. ¿Aflojamos algo\?$/);
                    break;
                  }
                  expect(vistos.has(r.ejercicio.id), r.ejercicio.id).toBe(false);
                  vistos.add(r.ejercicio.id);
                  actual = r.sesion;
                  expect(minutosTotales(actual)).toBe(duracion);
                }
              }
            });
          });
  it("corrió la matriz completa", () => expect(casos).toBe(JUGADORES.length * ARQUEROS.length * TIPOS.length * NIVELES.length * SEMILLAS.length * INTENSIDADES.length));
});

describe("motor: propiedades puntuales", () => {
  const base: ParamsSesion = { jugadores: 13, arqueros: 2, tipo: "completa", nivel: "intermedio", intensidad: 2, duracion: 90 };

  it("es determinístico con la misma semilla", () => {
    expect(generarSesion(base, BIBLIOTECA, [], 7)).toEqual(generarSesion(base, BIBLIOTECA, [], 7));
  });

  it("cambiar nivel o intensidad cambia los ejercicios, no solo la etiqueta (criterio 3)", () => {
    const ids = (p: ParamsSesion) => bloques(generarSesion(p, BIBLIOTECA, [], 7).items).map((b) => b.ejercicioId).join();
    const variantes = [ids(base), ids({ ...base, nivel: "inicial" }), ids({ ...base, nivel: "avanzado" }), ids({ ...base, intensidad: 1 }), ids({ ...base, intensidad: 3 })];
    expect(new Set(variantes).size).toBeGreaterThan(1);
    expect(ids({ ...base, intensidad: 3 })).not.toBe(ids({ ...base, intensidad: 1 }));
  });

  it("evita lo de las últimas 3 sesiones cuando hay alternativa", () => {
    const primera = generarSesion(base, BIBLIOTECA, [], 3);
    const usados = bloques(primera.items).map((b) => b.ejercicioId);
    const segunda = generarSesion(base, BIBLIOTECA, [usados], 3);
    const repetidos = bloques(segunda.items).filter((b) => usados.includes(b.ejercicioId));
    expect(repetidos.length).toBeLessThan(usados.length);
  });

  it("prioriza el objetivo en los bloques 3 y 4", () => {
    const s = generarSesion({ ...base, objetivo: "definicion" }, BIBLIOTECA, [], 5);
    const b34 = bloques(s.items).filter((b) => b.bloque === 3 || b.bloque === 4);
    expect(b34.some((b) => ej(b.ejercicioId).objetivos.includes("definicion"))).toBe(true);
  });

  it("un ejercicio propio con fase y rango entra al motor (criterio 8)", () => {
    const propio: Ejercicio = {
      ...ej("rondo-3-contra-1"),
      id: "propio-rondo-del-profe",
      nombre: "Rondo del profe",
      autor: "usuario-1",
      estado: "borrador",
      favorito: true,
      intensidad: 2,
    };
    const lista = [...BIBLIOTECA, propio];
    const aparece = SEMILLAS.concat([1, 2, 3, 4, 5, 6, 7, 8]).some((sem) =>
      bloques(generarSesion({ ...base, objetivo: "posesion" }, lista, [], sem).items).some((b) => b.ejercicioId === propio.id),
    );
    expect(aparece).toBe(true);
  });

  it("un propio mal cargado no rompe el motor", () => {
    const roto = { ...ej("rondo-3-contra-1"), id: "roto", autor: "u", jugadores: { min: 20, max: 4 }, pizarra: { vista: "media", elementos: [], pasos: [] } } as Ejercicio;
    expect(() => generarSesion(base, [...BIBLIOTECA, roto], [], 1)).not.toThrow();
  });

  it("± minutos recalcula el total y nunca baja de 1", () => {
    const s = generarSesion(base, BIBLIOTECA, [], 1);
    const b = bloques(s.items)[0];
    expect(minutosTotales(ajustarMinutos(s, b.id, 3))).toBe(93);
    expect(bloques(ajustarMinutos(s, b.id, -100).items)[0].minutos).toBe(1);
  });

  it("genera en menos de 300 ms con 70 ejercicios", () => {
    const setenta: Ejercicio[] = [];
    for (let i = 0; setenta.length < 70; i++) for (const e of BIBLIOTECA) if (setenta.length < 70) setenta.push({ ...e, id: `${e.id}~${i}` });
    const t0 = performance.now();
    generarSesion({ ...base, jugadores: 22, duracion: 120 }, setenta, [], 99);
    const ms = performance.now() - t0;
    expect(ms).toBeLessThan(300);
  });
});
