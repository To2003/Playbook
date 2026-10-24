"use client";

import type { ReactNode } from "react";

export interface Opcion<T extends string | number> {
  valor: T;
  etiqueta: ReactNode;
  /** Nombre accesible si la etiqueta no es texto. */
  nombre?: string;
}

interface Props<T extends string | number> {
  leyenda: string;
  nombre: string;
  opciones: Opcion<T>[];
  valor: T;
  onCambio: (v: T) => void;
  /** Voz de marcador para opciones numéricas. */
  marcador?: boolean;
  alto?: "md" | "lg";
  ocultarLeyenda?: boolean;
}

/**
 * Segmentos táctiles (radios nativos): la opción elegida se invierte a tinta.
 * El lima queda reservado para la acción principal de la pantalla.
 */
export function Segmentado<T extends string | number>({ leyenda, nombre, opciones, valor, onCambio, marcador, alto = "lg", ocultarLeyenda }: Props<T>) {
  return (
    <fieldset>
      <legend className={ocultarLeyenda ? "sr-only" : "text-label font-semibold text-ink-muted"}>{leyenda}</legend>
      <div
        className={`grid gap-1 rounded-card bg-surface p-1 ${ocultarLeyenda ? "" : "mt-2"}`}
        style={{ gridTemplateColumns: `repeat(${opciones.length}, minmax(0, 1fr))` }}
      >
        {opciones.map((o) => {
          const activo = o.valor === valor;
          return (
            <label
              key={String(o.valor)}
              className={`pressable relative grid cursor-pointer place-items-center rounded-[6px] px-1 text-center leading-tight transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${
                alto === "lg" ? "min-h-14" : "min-h-12"
              } ${marcador ? "marcador text-[2rem]" : "text-body font-semibold"} ${activo ? "bg-ink text-ground" : "text-ink-muted pressable-raised"}`}
            >
              <input
                type="radio"
                name={nombre}
                value={String(o.valor)}
                checked={activo}
                onChange={() => onCambio(o.valor)}
                className="sr-only"
                aria-label={o.nombre}
              />
              {o.etiqueta}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
