"use client";

import Link from "next/link";
import { FilaEjercicio } from "@/components/biblioteca/FilaEjercicio";
import { Cabecera } from "@/components/Cabecera";
import { IconoMas } from "@/components/iconos";
import { useBiblioteca } from "@/lib/estado/sesiones";
import type { Ejercicio } from "@/lib/tipos";

const orden = (a: Ejercicio, b: Ejercicio) => Number(!!b.favorito) - Number(!!a.favorito) || b.actualizado - a.actualizado;

export default function MisEjercicios() {
  const todos = useBiblioteca();
  const propios = todos.filter((e) => e.autor !== "base");
  const borradores = propios.filter((e) => e.estado === "borrador").sort(orden);
  const listos = propios.filter((e) => e.estado !== "borrador").sort(orden);

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] px-4 pb-16 pt-[max(env(safe-area-inset-top),12px)] lg:max-w-[1200px] lg:px-8">
      <Cabecera />
      <div className="mt-1 flex items-end justify-between gap-3">
        <div>
          <h1 className="titular">Mis ejercicios</h1>
          <p className="mt-1 text-label text-ink-muted">
            {propios.length ? `${listos.length} ${listos.length === 1 ? "listo" : "listos"} · ${borradores.length} ${borradores.length === 1 ? "borrador" : "borradores"}` : "Los que armes entran en las sesiones que arma Playbook."}
          </p>
        </div>
        {/* Desde la compu se arma en el editor completo; desde el celu, un boceto. */}
        <Link href="/editor" className="pressable btn-primary hidden h-12 items-center gap-2 px-4 lg:flex">
          <IconoMas tam={20} /> Nuevo ejercicio
        </Link>
      </div>
      <Link href="/boceto" className="pressable btn-primary mt-4 flex h-14 items-center justify-center gap-2 lg:hidden">
        <IconoMas tam={20} /> Hacer un boceto
      </Link>

      {propios.length === 0 ? (
        <div className="mt-6 rounded-card bg-surface p-4">
          <p className="text-title font-[650]">Todavía no armaste ninguno</p>
          <p className="mt-1 text-ink-muted">Empezá con un boceto o duplicá uno de la biblioteca y cambialo a tu gusto.</p>
          <Link href="/biblioteca" className="pressable btn-secondary mt-3 inline-flex h-12 items-center px-4">
            Ir a la biblioteca
          </Link>
        </div>
      ) : (
        <>
          <Seccion titulo="Borradores" nota="Ya entran en las sesiones. Terminalos en la compu para que la ficha quede completa." lista={borradores} />
          <Seccion titulo="Listos" lista={listos} />
        </>
      )}
    </div>
  );
}

function Seccion({ titulo, nota, lista }: { titulo: string; nota?: string; lista: Ejercicio[] }) {
  if (!lista.length) return null;
  const id = `s-${titulo.toLowerCase()}`;
  return (
    <section className="mt-6" aria-labelledby={id}>
      <h2 id={id} className="flex items-baseline gap-2 text-title font-[650]">
        {titulo} <span className="marcador text-[1.25rem] text-ink-faint">{lista.length}</span>
      </h2>
      {nota && <p className="text-meta text-ink-muted">{nota}</p>}
      <ul className="mt-2 flex flex-col lg:grid lg:grid-cols-3 lg:gap-4">
        {lista.map((e) => (
          <li key={e.id} className="border-t border-line first:border-t-0 lg:border-t-0">
            <FilaEjercicio e={e} />
          </li>
        ))}
      </ul>
    </section>
  );
}
