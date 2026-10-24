"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { ejercicioBase } from "@/data/biblioteca";
import { db } from "../db";
import { AUTOR_LOCAL, guardarPropio, nuevoId } from "../estado/propios";
import type { Ejercicio } from "../tipos";
import { validarEjercicio } from "../validador";
import { conHistorial, ejercicioVacio, type Accion, type Historial } from "./estado";

const VACIO: Historial = { pasado: [], presente: ejercicioVacio("", AUTOR_LOCAL), futuro: [] };

export type EstadoGuardado = "sin-cambios" | "cambios" | "guardando" | "guardado";

/**
 * Carga el ejercicio a editar (propio, o copia de uno base) y expone el reducer con historial
 * y el guardado: queda "listo" si pasa el validador; si no, como borrador con la lista de faltantes.
 */
export function useEditor(id: string | null, inicial?: Partial<Ejercicio>) {
  const [h, despacharH] = useReducer(conHistorial, VACIO);
  const [cargado, setCargado] = useState(false);
  const [guardado, setGuardado] = useState<EstadoGuardado>("sin-cambios");
  const [base, setBase] = useState<Ejercicio | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      let e: Ejercicio | undefined = id ? await db().ejercicios.get(id) : undefined;
      if (!e && id) {
        const b = ejercicioBase(id);
        // Un ejercicio base no se edita: se trabaja sobre una copia propia.
        if (b) e = structuredClone({ ...b, id: nuevoId(), nombre: `${b.nombre} (copia)`, autor: AUTOR_LOCAL, estado: "borrador" as const });
      }
      e ??= { ...ejercicioVacio(nuevoId(), AUTOR_LOCAL), ...inicial };
      if (!vivo) return;
      despacharH({ tipo: "cargar", ejercicio: e });
      setBase(e);
      setCargado(true);
    })();
    return () => {
      vivo = false;
    };
    // `inicial` solo se usa al crear: no recarga si cambia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const despachar = useCallback((a: Accion | { tipo: "deshacer" } | { tipo: "rehacer" }) => {
    despacharH(a);
    setGuardado("cambios");
  }, []);

  const faltantes = cargado ? faltantesParaListo(h.presente) : [];

  const guardar = useCallback(
    async (forzarBorrador = false) => {
      setGuardado("guardando");
      const listo = !forzarBorrador && faltantesParaListo(h.presente).length === 0;
      const e = await guardarPropio({ ...h.presente, nombre: h.presente.nombre.trim() || "Ejercicio sin nombre", estado: listo ? "listo" : "borrador" });
      setBase(e);
      setGuardado("guardado");
      return e;
    },
    [h.presente],
  );

  return {
    ejercicio: h.presente,
    cargado,
    despachar,
    deshacer: () => despachar({ tipo: "deshacer" }),
    rehacer: () => despachar({ tipo: "rehacer" }),
    puedeDeshacer: h.pasado.length > 0,
    puedeRehacer: h.futuro.length > 0,
    guardar,
    guardado,
    faltantes,
    nuevo: base !== null && !base.actualizado,
  };
}

/**
 * Qué le falta a un propio para quedar "listo" y entrar al generador. Lo estructural lo dice
 * el validador; además pide nombre, consigna y algo dibujado en la pizarra.
 */
export function faltantesParaListo(e: Ejercicio): string[] {
  const f: string[] = [];
  if (!e.nombre.trim()) f.push("Ponele un nombre.");
  if (!e.consigna.trim()) f.push("Escribí la consigna.");
  if (!e.pizarra.elementos.length) f.push("Poné al menos una ficha en la cancha.");
  if (!e.niveles.length) f.push("Elegí al menos un nivel.");
  if (e.jugadores.max < e.jugadores.min) f.push("El máximo de jugadores tiene que ser mayor que el mínimo.");
  if (e.duracion.max < e.duracion.min) f.push("La duración máxima tiene que ser mayor que la mínima.");
  const tecnicos = validarEjercicio(e, { base: false }).map((m) => m.replace(/^[^:]+: /, ""));
  return [...f, ...tecnicos.filter((m) => !m.startsWith("falta el nombre") && !m.startsWith("rango de jugadores") && !(m === "niveles inválidos" && !e.niveles.length))];
}
