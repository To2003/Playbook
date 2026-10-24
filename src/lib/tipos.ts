// Tipos del dominio. El bloque de arriba es el contrato del prompt de construcción, tal cual.

export type Fase = 'calor_sin_bocha' | 'calor_con_bocha' | 'principal' | 'aplicado' | 'vuelta_calma' | 'arquero';
export type Nivel = 'inicial' | 'intermedio' | 'avanzado';
export type Intensidad = 1 | 2 | 3;
export type Objetivo = 'conduccion' | 'pase_recepcion' | 'definicion' | 'quite_marca' | 'salida' | 'presion' | 'posesion' | 'transicion';
export type Espacio = 'completa' | 'media' | 'cuarto' | 'area';
export type Formato =
  | { tipo: 'individual' }
  | { tipo: 'parejas' }
  | { tipo: 'grupos'; k: number }
  | { tipo: 'dos_equipos' }
  | { tipo: 'superioridad'; atacan: number; defienden: number };

export type Punto = { x: number; y: number }; // metros
export type Elemento = {
  id: string;
  tipo: 'jugador' | 'arquero' | 'bocha' | 'cono' | 'valla' | 'aro' | 'arco_chico' | 'zona' | 'texto';
  equipo?: 'A' | 'B' | 'C'; // C = comodín
  etiqueta?: string;
  tam?: { w: number; h: number }; // zonas
};
export type Trazo = {
  tipo: 'desplazamiento' | 'conduccion' | 'pase' | 'tiro';
  elementoId: string; // en 'pase' y 'tiro' es la bocha
  desde: Punto;
  hasta: Punto;
  control?: Punto; // curva cuadrática opcional
};
export type Paso = { duracionMs: number; posiciones: Record<string, Punto>; trazos: Trazo[] }; // trazos del paso i llevan al paso i+1
export type Pizarra = {
  vista: 'completa' | 'media' | 'area';
  encuadre?: { x: number; y: number; w: number; h: number }; // zoom de la miniatura
  elementos: Elemento[];
  pasos: Paso[]; // máximo 12
};

export type Ejercicio = {
  id: string;
  nombre: string;
  fase: Fase;
  jugadores: { min: number; max: number };
  formato: Formato;
  niveles: Nivel[];
  intensidad: Intensidad;
  arqueros: 'no' | 'opcional' | 'requerido' | 'arco_chico';
  objetivos: Objetivo[];
  categorias: ('menores' | 'juveniles' | 'mayores')[];
  espacio: Espacio;
  material: { bochas?: number; conos?: number; vallas?: number; aros?: number; arcosChicos?: number; colores?: number };
  duracion: { min: number; max: number };
  organizacion: string;
  consigna: string;
  puntosClave: string[]; // exactamente 3
  errores: { error: string; correccion: string }[]; // al menos 2
  variantes: Partial<Record<Nivel, string>>;
  progresion?: { masFacil?: string; masDificil?: string };
  pizarra: Pizarra;
  autor: 'base' | string;
  estado: 'borrador' | 'listo';
  favorito?: boolean;
  compartido?: boolean;
  actualizado: number;
};

// ---------------------------------------------------------------------------
// Sesión, motor y ajustes.

export type TipoSesion = 'completa' | 'calor' | 'principal';
export type Material = Ejercicio['material'];

export interface ParamsSesion {
  jugadores: number;
  arqueros: 0 | 1 | 2;
  tipo: TipoSesion;
  nivel: Nivel;
  intensidad: Intensidad;
  duracion: number;
  objetivo?: Objetivo;
  espacio?: Espacio;
  /** Lo que hay hoy. Si falta, no se filtra por material. */
  material?: Material;
}

/** Cómo queda el grupo. Invariante: suma(partes) + comodines + rotan === jugadores. */
export interface Division {
  partes: number[];
  comodines: number;
  rotan: number;
  /** Más de 1 cuando el grupo supera el máximo del ejercicio y se arma en estaciones. */
  estaciones: number;
  texto: string;
}

export interface BloqueSesion {
  id: string;
  /** 1 a 5, según la tabla de 4.1 del SPEC. */
  bloque: 1 | 2 | 3 | 4 | 5;
  fase: Exclude<Fase, 'arquero'>;
  minutos: number;
  ejercicioId: string;
  division: Division;
  /** Tarea paralela si hay arqueros y el ejercicio no los usa. */
  tareaArqueroId?: string;
}

export interface PausaSesion {
  id: string;
  pausa: true;
  minutos: number;
}

export type ItemSesion = BloqueSesion | PausaSesion;

export interface Sesion {
  id: string;
  fecha: number;
  params: ParamsSesion;
  semilla: number;
  items: ItemSesion[];
  /** Todos los ejercicios que se mostraron en esta sesión (para "dame otro"). */
  mostrados: string[];
  guardada?: boolean;
  actualizado: number;
}

export interface Ajustes {
  duracion: Record<TipoSesion, number>;
  espacio: Espacio;
  material: Material;
  categoria: 'menores' | 'juveniles' | 'mayores';
  tema: 'oscuro' | 'claro';
  modoSol: boolean;
  /** Valores del último armado, para precargar la pantalla 1. */
  ultimo: { jugadores: number; arqueros: 0 | 1 | 2; tipo: TipoSesion; nivel: Nivel; intensidad: Intensidad };
}

export const esPausa = (i: ItemSesion): i is PausaSesion => 'pausa' in i;
