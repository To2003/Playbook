import type { Espacio, Fase, Intensidad, Nivel, Objetivo, TipoSesion } from "./tipos";

export const NOMBRE_FASE: Record<Fase, string> = {
  calor_sin_bocha: "Entrada en calor sin bocha",
  calor_con_bocha: "Entrada en calor con bocha",
  principal: "Principal técnico/táctico",
  aplicado: "Juego aplicado",
  vuelta_calma: "Vuelta a la calma",
  arquero: "Tareas de arquero",
};

export const NOMBRE_NIVEL: Record<Nivel, string> = { inicial: "Inicial", intermedio: "Intermedio", avanzado: "Avanzado" };
export const NOMBRE_INTENSIDAD: Record<Intensidad, string> = { 1: "Suave", 2: "Media", 3: "Fuerte" };
export const NOMBRE_TIPO: Record<TipoSesion, string> = { completa: "Sesión completa", calor: "Entrada en calor", principal: "Principal" };
export const NOMBRE_ESPACIO: Record<Espacio, string> = { completa: "Cancha completa", media: "Media cancha", cuarto: "Cuarto de cancha", area: "Área" };
export const NOMBRE_OBJETIVO: Record<Objetivo, string> = {
  conduccion: "Conducción",
  pase_recepcion: "Pase y recepción",
  definicion: "Definición",
  quite_marca: "Quite y marca",
  salida: "Salida",
  presion: "Presión",
  posesion: "Posesión",
  transicion: "Transición",
};
export const NOMBRE_FORMATO = (f: import("./tipos").Formato): string => {
  switch (f.tipo) {
    case "individual":
      return "Individual con bocha";
    case "parejas":
      return "Parejas";
    case "grupos":
      return `Grupos de ${f.k}`;
    case "dos_equipos":
      return "Dos equipos";
    case "superioridad":
      return `Superioridad ${f.atacan} contra ${f.defienden}`;
  }
};

/** "Jueves 23 de octubre" */
export function fechaLarga(ms: number): string {
  const s = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long" }).format(ms);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function hora(ms: number): string {
  return new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(ms);
}
