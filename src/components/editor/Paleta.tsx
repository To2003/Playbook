"use client";

import type { Elemento } from "@/lib/tipos";

export type TipoPaleta = "A" | "B" | "C" | "K" | "bocha" | "cono" | "valla" | "aro" | "arco_chico" | "zona" | "texto";

export const ITEMS_PALETA: { tipo: TipoPaleta; nombre: string }[] = [
  { tipo: "A", nombre: "Equipo A" },
  { tipo: "B", nombre: "Equipo B" },
  { tipo: "C", nombre: "Comodín" },
  { tipo: "K", nombre: "Arquero" },
  { tipo: "bocha", nombre: "Bocha" },
  { tipo: "cono", nombre: "Cono" },
  { tipo: "valla", nombre: "Valla" },
  { tipo: "aro", nombre: "Aro" },
  { tipo: "arco_chico", nombre: "Arco chico" },
  { tipo: "zona", nombre: "Zona" },
  { tipo: "texto", nombre: "Texto" },
];

const PREFIJO: Record<TipoPaleta, string> = { A: "a", B: "b", C: "c", K: "k", bocha: "o", cono: "n", valla: "v", aro: "r", arco_chico: "g", zona: "z", texto: "t" };

/** Crea el elemento con un id libre y, en los jugadores, el número siguiente de su equipo. */
export function nuevoElemento(tipo: TipoPaleta, existentes: Elemento[]): Elemento {
  const ids = new Set(existentes.map((e) => e.id));
  let n = 1;
  while (ids.has(`${PREFIJO[tipo]}${n}`)) n++;
  const id = `${PREFIJO[tipo]}${n}`;
  switch (tipo) {
    case "A":
    case "B":
    case "C": {
      const delEquipo = existentes.filter((e) => e.tipo === "jugador" && e.equipo === tipo).length;
      return { id, tipo: "jugador", equipo: tipo, etiqueta: tipo === "C" ? "C" : String(delEquipo + 1) };
    }
    case "K":
      return { id, tipo: "arquero" };
    case "zona":
      return { id, tipo: "zona", tam: { w: 12, h: 10 } };
    case "texto":
      return { id, tipo: "texto", etiqueta: "Texto" };
    default:
      return { id, tipo };
  }
}

function Muestra({ tipo }: { tipo: TipoPaleta }) {
  switch (tipo) {
    case "A":
      return <circle cx="12" cy="12" r="8" fill="var(--lime)" />;
    case "B":
      return <rect x="4.5" y="4.5" width="15" height="15" rx="2" fill="var(--coral)" />;
    case "C":
      return <path d="M12 2.5L21.5 12 12 21.5 2.5 12z" fill="var(--wildcard)" />;
    case "K":
      return (
        <>
          <circle cx="12" cy="12" r="10" fill="none" stroke="var(--keeper)" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="7" fill="var(--keeper)" stroke="var(--keeper-edge)" strokeWidth="2.5" />
        </>
      );
    case "bocha":
      return <circle cx="12" cy="12" r="5" fill="#fff" stroke="var(--keeper-edge)" strokeWidth="1.5" />;
    case "cono":
      return <path d="M12 4l8 14H4z" fill="var(--cone)" />;
    case "valla":
      return <rect x="10" y="3" width="4" height="18" fill="var(--wildcard)" />;
    case "aro":
      return <circle cx="12" cy="12" r="7.5" fill="none" stroke="var(--cone)" strokeWidth="2.5" />;
    case "arco_chico":
      return <path d="M6 4h10v16H6" fill="none" stroke="var(--chalk)" strokeWidth="2.5" />;
    case "zona":
      return <rect x="3" y="5" width="18" height="14" fill="var(--chalk)" fillOpacity="0.15" stroke="var(--chalk)" strokeDasharray="3 2" />;
    case "texto":
      return (
        <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--chalk)">
          Aa
        </text>
      );
  }
}

/** Paleta de elementos: se arrastran a la cancha o se tocan para sumarlos en el centro. */
export function Paleta({ onAgregar, compacta }: { onAgregar: (t: TipoPaleta) => void; compacta?: boolean }) {
  const items = compacta ? ITEMS_PALETA.filter((i) => ["A", "B", "C", "K", "bocha", "cono"].includes(i.tipo)) : ITEMS_PALETA;
  return (
    <ul className={compacta ? "flex gap-1 overflow-x-auto [scrollbar-width:none]" : "grid grid-cols-2 gap-1"} aria-label="Elementos para agregar">
      {items.map((i) => (
        <li key={i.tipo}>
          <button
            type="button"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/playbook", i.tipo);
              e.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => onAgregar(i.tipo)}
            title={`${i.nombre}: arrastralo a la cancha o tocalo`}
            className={`pressable pressable-raised flex items-center gap-2 rounded-card bg-raised text-label font-semibold ${compacta ? "h-12 w-14 justify-center" : "h-12 w-full px-2"}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 rounded-[3px] bg-turf p-0.5">
              <Muestra tipo={i.tipo} />
            </svg>
            <span className={compacta ? "sr-only" : undefined}>{i.nombre}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
