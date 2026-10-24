import { describe, expect, it } from "vitest";
import { BIBLIOTECA } from "@/data/biblioteca";
import { filtrarEjercicios } from "@/lib/filtros";

describe("filtros de la biblioteca", () => {
  it("busca sin importar acentos ni mayúsculas", () => {
    const r = filtrarEjercicios(BIBLIOTECA, { texto: "CONDUCCION" });
    expect(r.some((e) => e.id === "conduccion-cuadrado-derecho-reves")).toBe(true);
  });
  it("combina fase, nivel y jugadores", () => {
    const r = filtrarEjercicios(BIBLIOTECA, { fase: "aplicado", nivel: "inicial", jugadores: 4 });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((e) => e.fase === "aplicado" && e.niveles.includes("inicial") && e.jugadores.min <= 4)).toBe(true);
  });
  it("filtra por objetivo", () => {
    expect(filtrarEjercicios(BIBLIOTECA, { objetivo: "definicion" }).every((e) => e.objetivos.includes("definicion"))).toBe(true);
  });
});
