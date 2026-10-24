import { describe, expect, it } from "vitest";
import { BIBLIOTECA, EJERCICIOS_BASE, TAREAS_ARQUERO } from "@/data/biblioteca";
import { validarBiblioteca } from "@/lib/validador";

// Corre en `prebuild`: si un ejercicio rompe el tipo o las reglas de 5.2 del SPEC, el build falla.
describe("biblioteca base", () => {
  it("cumple las reglas de cada ficha y la cobertura de 4 a 30 en cada fase y nivel", () => {
    const completa = EJERCICIOS_BASE.length >= 60;
    expect(validarBiblioteca(BIBLIOTECA, { completa })).toEqual([]);
  });
  it("tiene la cantidad esperada", () => {
    expect(EJERCICIOS_BASE.length).toBeGreaterThanOrEqual(20);
    expect(TAREAS_ARQUERO.length).toBeGreaterThanOrEqual(4);
  });
});
