import type { SupabaseClient } from "@supabase/supabase-js";
import type { Ejercicio } from "../tipos";

export type Tabla = "ejercicios" | "sesiones" | "ajustes";

/** Una fila tal como viaja a la nube: el registro entero va en `datos`. */
export interface FilaNube {
  id: string;
  datos: unknown;
  actualizado: number;
  borrado: boolean;
  compartido?: boolean;
}

/**
 * Lo único que el sincronizador necesita de la nube. En la app lo implementa Supabase;
 * en los tests, un doble en memoria.
 */
export interface Nube {
  /** Filas propias cambiadas después de `desde` (ms). */
  bajar(tabla: Tabla, desde: number): Promise<FilaNube[]>;
  subir(tabla: Tabla, filas: FilaNube[]): Promise<void>;
}

/** Implementación con supabase-js. RLS limita todo al usuario de la sesión. */
export function nubeSupabase(cliente: SupabaseClient, uid: string): Nube {
  return {
    async bajar(tabla, desde) {
      const columnas = tabla === "ejercicios" ? "id, datos, actualizado, borrado, compartido" : "id, datos, actualizado, borrado";
      // En ejercicios RLS también deja ver los compartidos de otros: se filtra por autor.
      const { data, error } = await cliente.from(tabla).select(columnas).eq("autor", uid).gt("actualizado", desde);
      if (error) throw new Error(`bajar ${tabla}: ${error.message}`);
      return (data ?? []) as unknown as FilaNube[];
    },
    async subir(tabla, filas) {
      if (!filas.length) return;
      const conAutor = filas.map((f) => {
        const { compartido, ...resto } = f;
        return tabla === "ejercicios" ? { ...resto, compartido: !!compartido, autor: uid } : { ...resto, autor: uid };
      });
      const { error } = await cliente.from(tabla).upsert(conAutor, { onConflict: tabla === "ajustes" ? "autor" : "id" });
      if (error) throw new Error(`subir ${tabla}: ${error.message}`);
    },
  };
}

/** Lee un ejercicio compartido (sin login: RLS solo deja ver los compartidos y no borrados). */
export async function leerCompartido(cliente: SupabaseClient, id: string): Promise<Ejercicio | null> {
  const { data, error } = await cliente.from("ejercicios").select("datos").eq("id", id).eq("compartido", true).eq("borrado", false).maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.datos as Ejercicio | undefined) ?? null;
}
