"use client";

import { db } from "../db";
import { evento } from "../analytics";
import { contar } from "../feedback/cliente";
import { encolar } from "../sync/cola";
import type { Ejercicio } from "../tipos";

/** Autor de los ejercicios creados sin cuenta. Al iniciar sesión se reemplaza por el id del usuario. */
export const AUTOR_LOCAL = "local";

export function nuevoId(): string {
  return `p-${crypto.randomUUID()}`;
}

export async function guardarPropio(e: Ejercicio): Promise<Ejercicio> {
  const guardado = { ...e, autor: e.autor === "base" ? AUTOR_LOCAL : e.autor, actualizado: Date.now() };
  const nuevo = !(await db().ejercicios.get(e.id));
  await db().ejercicios.put(guardado);
  if (nuevo) {
    contar("propios");
    evento({ nombre: "ejercicio_creado" });
  }
  await encolar("ejercicios", guardado.id);
  return guardado;
}

/** Duplica un ejercicio (base o propio) a "Mis ejercicios". */
export async function duplicar(e: Ejercicio): Promise<Ejercicio> {
  const copia: Ejercicio = structuredClone({ ...e, id: nuevoId(), nombre: `${e.nombre} (copia)`, autor: AUTOR_LOCAL, favorito: false, compartido: false });
  return guardarPropio(copia);
}

export async function borrarPropio(id: string): Promise<void> {
  await db().ejercicios.delete(id);
  await encolar("ejercicios", id, "borrar");
}

export async function alternarFavorito(e: Ejercicio): Promise<void> {
  await guardarPropio({ ...e, favorito: !e.favorito });
}

/** En compu se edita en el editor completo; en el celu, en el boceto. */
export function rutaDeEdicion(id: string): string {
  const compu = typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
  return compu ? `/editor?id=${encodeURIComponent(id)}` : `/boceto?id=${encodeURIComponent(id)}`;
}
