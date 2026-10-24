"use client";

import { IconoConduccion, IconoDesplazamiento, IconoMover, IconoPase, IconoTiro } from "@/components/iconos";
import type { Herramienta } from "./Lienzo";

export const HERRAMIENTAS: { h: Herramienta; nombre: string; tecla: string; Icono: typeof IconoMover }[] = [
  { h: "mover", nombre: "Mover", tecla: "V", Icono: IconoMover },
  { h: "desplazamiento", nombre: "Desplazamiento", tecla: "D", Icono: IconoDesplazamiento },
  { h: "conduccion", nombre: "Conducción", tecla: "C", Icono: IconoConduccion },
  { h: "pase", nombre: "Pase", tecla: "P", Icono: IconoPase },
  { h: "tiro", nombre: "Tiro", tecla: "T", Icono: IconoTiro },
];

/** Selector de herramienta. En los trazos se arrastra desde la ficha hasta el destino. */
export function Herramientas({ valor, onCambio, conTeclas }: { valor: Herramienta; onCambio: (h: Herramienta) => void; conTeclas?: boolean }) {
  return (
    <div role="radiogroup" aria-label="Herramienta" className="flex gap-1 rounded-card bg-surface p-1">
      {HERRAMIENTAS.map(({ h, nombre, tecla, Icono }) => {
        const on = valor === h;
        return (
          <button
            key={h}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onCambio(h)}
            title={conTeclas ? `${nombre} (${tecla})` : nombre}
            className={`pressable flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-[6px] px-2 text-meta font-semibold ${on ? "bg-ink text-ground" : "text-ink-muted"}`}
          >
            <Icono tam={20} />
            <span className={conTeclas ? "hidden xl:inline" : "sr-only"}>{nombre}</span>
          </button>
        );
      })}
    </div>
  );
}
