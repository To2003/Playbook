"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { alternarFavorito, borrarPropio, duplicar, rutaDeEdicion } from "@/lib/estado/propios";
import type { Ejercicio } from "@/lib/tipos";

/** Acciones de la ficha: duplicar y editar, favorito y borrar (propios). Compartir y exportar se suman en sus módulos. */
export function AccionesFicha({ e, onBorrado, extra }: { e: Ejercicio; onBorrado: () => void; extra?: React.ReactNode }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const propio = e.autor !== "base";

  return (
    <>
      {propio ? (
        <button type="button" onClick={() => router.push(rutaDeEdicion(e.id))} className="pressable btn-secondary h-12 px-4">
          Editar
        </button>
      ) : null}
      <button
        type="button"
        onClick={async () => {
          const copia = await duplicar(e);
          router.push(rutaDeEdicion(copia.id));
        }}
        className="pressable btn-secondary h-12 px-4"
      >
        Duplicar y editar
      </button>
      {propio && (
        <button type="button" aria-pressed={!!e.favorito} onClick={() => void alternarFavorito(e)} className={`pressable h-12 rounded-card px-4 font-semibold ${e.favorito ? "bg-ink text-ground" : "bg-raised"}`}>
          {e.favorito ? "Favorito" : "Marcar favorito"}
        </button>
      )}
      {extra}
      {propio &&
        (confirmando ? (
          <span className="flex items-center gap-2" role="alert">
            <span className="text-label">¿Borrar “{e.nombre}”?</span>
            <button
              type="button"
              onClick={async () => {
                await borrarPropio(e.id);
                onBorrado();
              }}
              className="pressable h-12 rounded-card bg-danger px-4 font-semibold text-on-lime"
            >
              Sí, borrar
            </button>
            <button type="button" onClick={() => setConfirmando(false)} className="pressable h-12 rounded-card px-3 text-ink-muted">
              No
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmando(true)} className="pressable h-12 rounded-card px-4 font-semibold text-danger">
            Borrar
          </button>
        ))}
    </>
  );
}
