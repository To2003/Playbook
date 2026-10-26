import Dexie, { type EntityTable } from "dexie";
import type { Ajustes, Ejercicio, Sesion } from "./tipos";

/** Un cambio local pendiente de subir a la nube (módulo de sync). */
export interface CambioPendiente {
  id?: number;
  tabla: "ejercicios" | "sesiones" | "ajustes";
  claveId: string;
  op: "upsert" | "borrar";
  creado: number;
}

/** Fila de ajustes: una sola, con clave fija. */
export interface FilaAjustes extends Ajustes {
  clave: "yo";
  /** Último cambio (ms), para resolver contra la nube. */
  actualizado?: number;
}

/** Una respuesta de feedback que no se pudo mandar (sin señal): se manda sola cuando vuelve. */
export interface FeedbackPendiente {
  id?: number;
  url: string;
  /** El body ya armado (URLSearchParams como texto). */
  cuerpo: string;
  creado: number;
}

/** Datos internos del dispositivo: marcas de sincronización y contadores de uso. */
export interface FilaMeta {
  clave: string;
  valor: number;
}

/**
 * IndexedDB local-first. La biblioteca base no vive acá: viaja empaquetada en la app.
 * Acá van los ejercicios propios, las sesiones, los ajustes y la cola de sync.
 */
export class PlaybookDB extends Dexie {
  ejercicios!: EntityTable<Ejercicio, "id">;
  sesiones!: EntityTable<Sesion, "id">;
  ajustes!: EntityTable<FilaAjustes, "clave">;
  cola!: EntityTable<CambioPendiente, "id">;
  meta!: EntityTable<FilaMeta, "clave">;
  feedback!: EntityTable<FeedbackPendiente, "id">;

  constructor(nombre = "playbook") {
    super(nombre);
    this.version(1).stores({
      ejercicios: "id, fase, estado, actualizado, favorito",
      sesiones: "id, fecha, actualizado",
      ajustes: "clave",
      cola: "++id, tabla, claveId",
    });
    this.version(2).stores({ meta: "clave" });
    this.version(3).stores({ feedback: "++id, creado" });
  }
}

let instancia: PlaybookDB | null = null;

/** La base solo existe en el navegador. */
export function db(): PlaybookDB {
  if (!instancia) instancia = new PlaybookDB();
  return instancia;
}

export const AJUSTES_POR_DEFECTO: Ajustes = {
  duracion: { completa: 90, calor: 20, principal: 45 },
  espacio: "media",
  material: { bochas: 20, conos: 30, vallas: 6, aros: 8, arcosChicos: 4, colores: 3 },
  categoria: "mayores",
  tema: "oscuro",
  modoSol: false,
  ultimo: { jugadores: 14, arqueros: 1, tipo: "completa", nivel: "intermedio", intensidad: 2 },
};
