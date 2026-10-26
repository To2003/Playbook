"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

const CLAVE = "bienvenida-beta";

/**
 * Cartel único de la beta: aparece en el inicio la primera vez y, con "Dale", no vuelve
 * (queda anotado en IndexedDB). Va dentro de la página, sin tapar nada.
 */
export function Bienvenida() {
  // undefined mientras IndexedDB responde: no se muestra nada para no parpadear.
  const vista = useLiveQuery(async () => (await db().meta.get(CLAVE)) !== undefined, []);
  if (vista !== false) return null;
  return (
    <section aria-labelledby="beta" className="flex items-center gap-3 rounded-card bg-raised p-4">
      <div className="min-w-0 flex-1">
        <p className="text-meta font-semibold uppercase tracking-[0.14em] text-ink-muted">Beta</p>
        <h2 id="beta" className="mt-0.5 text-title font-[650]">
          Esto es una beta. Rompela y contanos.
        </h2>
      </div>
      <button type="button" onClick={() => void db().meta.put({ clave: CLAVE, valor: Date.now() })} className="pressable btn-secondary h-12 shrink-0 px-5">
        Dale
      </button>
    </section>
  );
}
