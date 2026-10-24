import { describe, expect, it } from "vitest";
import { nombreArchivo, partirTitulo, resolverVariables } from "@/lib/exportar/png";

describe("exportar PNG", () => {
  it("resuelve las variables CSS y deja las desconocidas", () => {
    const valores: Record<string, string> = { "--chalk": " #eef3f1", "--turf": "#1d5daa" };
    const r = resolverVariables('<rect fill="var(--turf)" stroke="var(--chalk)" style="color:var(--nada)"/>', (n) => valores[n] ?? "");
    expect(r).toBe('<rect fill="#1d5daa" stroke="#eef3f1" style="color:var(--nada)"/>');
  });

  it("parte el título sin cortar palabras y achica si es largo", () => {
    expect(partirTitulo("Rondo 3 contra 1", 20)).toEqual({ lineas: ["Rondo 3 contra 1"], escala: 1 });
    const largo = partirTitulo("Push y recepción orientada en triángulos con cambio de frente", 20);
    expect(largo.escala).toBeLessThan(1);
    expect(largo.lineas.length).toBeLessThanOrEqual(3);
    expect(largo.lineas.join(" ")).toBe("Push y recepción orientada en triángulos con cambio de frente");
  });

  it("arma un nombre de archivo limpio", () => {
    expect(nombreArchivo("Salida por la izquierda: 3 vs 2 ¡ya!")).toBe("playbook-salida-por-la-izquierda-3-vs-2-ya.png");
    expect(nombreArchivo("   ")).toBe("playbook-ejercicio.png");
    expect(nombreArchivo("Quite y marca – ñandú")).toBe("playbook-quite-y-marca-nandu.png");
  });
});
