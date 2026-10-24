import { describe, expect, it } from "vitest";
import { planDeTiempos, proporcional } from "@/lib/motor/tiempos";

const minutos = (tipo: Parameters<typeof planDeTiempos>[0], d: number, i: 1 | 2 | 3 = 2) => planDeTiempos(tipo, d, i).map((h) => ("pausa" in h ? `P${h.minutos}` : h.minutos));

describe("tiempos de la sesión completa (tabla del prompt)", () => {
  it("60", () => expect(minutos("completa", 60)).toEqual([8, 10, "P2", 20, "P2", 13, 5]));
  it("75", () => expect(minutos("completa", 75)).toEqual([10, 10, "P2", 25, "P2", 20, 6]));
  it("90: dos ejercicios en el principal, la pausa va antes del primero", () => expect(minutos("completa", 90)).toEqual([10, 13, "P2", 15, 15, "P2", 26, 7]));
  it("120", () => expect(minutos("completa", 120)).toEqual([12, 16, "P2", 22, 23, "P2", 33, 10]));
  it("duraciones libres suman exacto", () => {
    for (let d = 30; d <= 150; d++) for (const i of [1, 2, 3] as const) expect(planDeTiempos("completa", d, i).reduce((s, h) => s + h.minutos, 0), `${d}`).toBe(d);
  });
  it("suave: el aplicado baja 20% y la calma se alarga", () => {
    expect(minutos("completa", 90, 1)).toEqual([10, 13, "P2", 15, 15, "P2", 21, 12]);
  });
  it("fuerte: la entrada en calor nunca baja de 15", () => {
    for (let d = 30; d <= 150; d++) {
      const p = planDeTiempos("completa", d, 3);
      const calor = p.filter((h) => !("pausa" in h) && h.bloque <= 2).reduce((s, h) => s + h.minutos, 0);
      expect(calor, `${d}`).toBeGreaterThanOrEqual(15);
    }
  });
  it("solo la sesión completa lleva pausas", () => {
    for (const d of [15, 20, 25, 30]) expect(planDeTiempos("calor", d, 2).some((h) => "pausa" in h)).toBe(false);
    for (const d of [30, 45, 60]) expect(planDeTiempos("principal", d, 2).some((h) => "pausa" in h)).toBe(false);
  });
  it("proporcional no pierde minutos", () => {
    expect(proporcional(7, [1, 1, 1]).reduce((s, x) => s + x, 0)).toBe(7);
  });
});
