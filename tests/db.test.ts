import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { AJUSTES_POR_DEFECTO, PlaybookDB } from "@/lib/db";

describe("PlaybookDB", () => {
  it("guarda y lee ajustes, sesiones y ejercicios propios", async () => {
    const base = new PlaybookDB("prueba-db");
    await base.ajustes.put({ ...AJUSTES_POR_DEFECTO, modoSol: true, clave: "yo" });
    expect((await base.ajustes.get("yo"))?.modoSol).toBe(true);
    expect(base.tables.map((t) => t.name).sort()).toEqual(["ajustes", "cola", "ejercicios", "feedback", "meta", "sesiones"]);
    await base.delete();
  });
});
