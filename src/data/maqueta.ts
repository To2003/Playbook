/**
 * Sesión de muestra de las maquetas. Se borra cuando el flujo use el motor (M4).
 */
import { ejercicioBase } from "./biblioteca";
import type { Ejercicio, Fase } from "@/lib/tipos";

export const NOMBRE_FASE: Record<Fase, string> = {
  calor_sin_bocha: "Entrada en calor sin bocha",
  calor_con_bocha: "Entrada en calor con bocha",
  principal: "Principal técnico/táctico",
  aplicado: "Juego aplicado",
  vuelta_calma: "Vuelta a la calma",
  arquero: "Arqueros",
};

export interface BloqueMaqueta {
  id: string;
  fase: Fase;
  minutos: number;
  ejercicio: string;
  division: string;
  arqueros?: string;
  pizarra: Ejercicio["pizarra"];
  puntosClave: string[];
}

export interface PausaMaqueta {
  id: string;
  pausa: true;
  minutos: number;
}

const b = (id: string, ejId: string, minutos: number, division: string, arqueros?: string): BloqueMaqueta => {
  const e = ejercicioBase(ejId)!;
  return { id, fase: e.fase, minutos, ejercicio: e.nombre, division, arqueros, pizarra: e.pizarra, puntosClave: e.puntosClave };
};

export const sesionMaqueta: { jugadores: number; arqueros: number; nivel: string; intensidad: string; items: (BloqueMaqueta | PausaMaqueta)[] } = {
  jugadores: 14,
  arqueros: 2,
  nivel: "Intermedio",
  intensidad: "Media",
  items: [
    b("b1", "activacion-cambios-ritmo", 10, "14 → 3 grupos: 4, 5 y 5", "Arqueros: desplazamientos laterales entre platos"),
    b("b2", "conduccion-cuadrado-derecho-reves", 13, "14 → todos a la vez, cada uno con su bocha", "Arqueros: reacción a pases rasantes"),
    { id: "h1", pausa: true, minutos: 2 },
    b("b3", "push-recepcion-orientada-triangulos", 15, "14 → 4 grupos: 3, 3, 4 y 4", "Arqueros: despeje con el pie desde el borde del área"),
    b("b4", "quite-marca-carriles-1v1", 15, "14 → 7 parejas", "Arqueros: achique y bloqueo en el 1 contra 1"),
    { id: "h2", pausa: true, minutos: 2 },
    b("b5", "reducido-salida-por-costados", 26, "14 → 7 contra 7"),
    b("b6", "elongacion-en-ronda", 7, "14 → todos a la vez"),
  ],
};
