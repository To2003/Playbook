import { describe, expect, it } from "vitest";
import { dividir, sumaDivision } from "@/lib/motor/division";
import type { Formato } from "@/lib/tipos";

describe("dividir: casos del prompt", () => {
  it("11 en dos equipos → 5 v 5 + 1 comodín", () => {
    const d = dividir(11, { tipo: "dos_equipos" }, 30);
    expect(d.partes).toEqual([5, 5]);
    expect(d.comodines).toBe(1);
    expect(d.texto).toBe("11 → 5 contra 5 + 1 comodín que juega con el que ataca");
  });
  it("7 en parejas → 2 parejas + 1 terna", () => {
    const d = dividir(7, { tipo: "parejas" }, 30);
    expect(d.partes).toEqual([2, 2, 3]);
    expect(d.texto).toBe("7 → 2 parejas y 1 terna");
  });
  it("13 en grupos de 4 → 4, 4 y 5", () => {
    const d = dividir(13, { tipo: "grupos", k: 4 }, 30);
    expect(d.partes.slice().sort()).toEqual([4, 4, 5]);
  });
  it("22 en 3 v 2 → 4 células de 5 + 2 que rotan", () => {
    const d = dividir(22, { tipo: "superioridad", atacan: 3, defienden: 2 }, 30);
    expect(d.partes).toEqual([5, 5, 5, 5]);
    expect(d.rotan).toBe(2);
  });
  it("más que el máximo → estaciones", () => {
    const d = dividir(26, { tipo: "dos_equipos" }, 16);
    expect(d.estaciones).toBe(2);
    expect(d.partes).toEqual([6, 6, 6, 6]);
    expect(d.comodines).toBe(2);
  });
});

describe("dividir: nadie se pierde ni se duplica", () => {
  const formatos: Formato[] = [
    { tipo: "individual" },
    { tipo: "parejas" },
    { tipo: "grupos", k: 3 },
    { tipo: "grupos", k: 4 },
    { tipo: "grupos", k: 6 },
    { tipo: "dos_equipos" },
    { tipo: "superioridad", atacan: 2, defienden: 1 },
    { tipo: "superioridad", atacan: 3, defienden: 2 },
    { tipo: "superioridad", atacan: 4, defienden: 3 },
  ];
  for (const f of formatos) {
    it(`${JSON.stringify(f)} suma exacto de 4 a 30, con y sin estaciones`, () => {
      for (let n = 4; n <= 30; n++) {
        for (const max of [8, 16, 30]) {
          const d = dividir(n, f, max);
          expect(sumaDivision(d), `${n} max ${max}`).toBe(n);
          expect(d.partes.every((x) => x > 0)).toBe(true);
        }
      }
    });
  }
});
