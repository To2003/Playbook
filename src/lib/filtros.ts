import { aplicable } from "./motor/division";
import type { Ejercicio, Fase, Nivel, Objetivo } from "./tipos";

export interface Filtros {
  texto?: string;
  fase?: Fase;
  nivel?: Nivel;
  objetivo?: Objetivo;
  /** Ejercicios que se pueden hacer con esta cantidad de jugadores de campo. */
  jugadores?: number;
  intensidadMax?: 1 | 2 | 3;
  soloFavoritos?: boolean;
}

/** Sin acentos ni mayúsculas, para buscar "conduccion" y encontrar "Conducción". */
export const normalizar = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function filtrarEjercicios(lista: Ejercicio[], f: Filtros): Ejercicio[] {
  const q = f.texto ? normalizar(f.texto.trim()) : "";
  return lista.filter((e) => {
    if (f.fase && e.fase !== f.fase) return false;
    if (f.nivel && !e.niveles.includes(f.nivel)) return false;
    if (f.objetivo && !e.objetivos.includes(f.objetivo)) return false;
    if (f.jugadores && e.fase !== "arquero" && !aplicable(e, f.jugadores)) return false;
    if (f.intensidadMax && e.intensidad > f.intensidadMax) return false;
    if (f.soloFavoritos && !e.favorito) return false;
    if (q && !normalizar(`${e.nombre} ${e.consigna} ${e.organizacion}`).includes(q)) return false;
    return true;
  });
}
