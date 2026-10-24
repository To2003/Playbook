"use client";

import { guardarPropio } from "../estado/propios";
import type { Ejercicio } from "../tipos";
import { sincronizarAhora } from "./cuenta";

/**
 * Link público de un ejercicio (SPEC 8). Los base se leen de la app empaquetada; los propios
 * se marcan como compartidos y se suben antes de dar el link, para que abra en otro celu.
 */
export async function linkParaCompartir(e: Ejercicio, origen = location.origin): Promise<string> {
  const url = `${origen}/e/${encodeURIComponent(e.id)}`;
  if (e.autor === "base") return url;
  if (!e.compartido) await guardarPropio({ ...e, compartido: true });
  await sincronizarAhora();
  return url;
}

/** En el celu abre el menú de compartir; en la compu copia el link. */
export async function mandarLink(url: string, titulo: string): Promise<"compartido" | "copiado" | "cancelado" | "manual"> {
  const tactil = window.matchMedia("(pointer: coarse)").matches;
  if (tactil && navigator.share) {
    try {
      await navigator.share({ title: titulo, text: `${titulo} · Playbook`, url });
      return "compartido";
    } catch (err) {
      if ((err as DOMException).name === "AbortError") return "cancelado";
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copiado";
  } catch {
    return "manual";
  }
}
