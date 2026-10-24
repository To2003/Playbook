"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FichaEjercicio } from "@/components/ficha/FichaEjercicio";
import { ejercicioBase } from "@/data/biblioteca";
import { duplicar } from "@/lib/estado/propios";
import { clienteNube } from "@/lib/nube/cuenta";
import { leerCompartido } from "@/lib/sync/nube";
import type { Ejercicio } from "@/lib/tipos";

type Carga = { t: "cargando" } | { t: "listo"; e: Ejercicio } | { t: "no-esta" } | { t: "sin-senal" };

/**
 * Página pública de un ejercicio compartido (SPEC 8): se abre sin login, muestra la pizarra
 * animada y la ficha en solo lectura, y "Usalo en Playbook" lo copia a la biblioteca de quien lo abre.
 */
export default function Compartido() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const base = ejercicioBase(decodeURIComponent(id));
  const sinNube = !base && !clienteNube();
  const [carga, setCarga] = useState<Carga>(base ? { t: "listo", e: base } : sinNube ? { t: "no-esta" } : { t: "cargando" });
  const [copiando, setCopiando] = useState(false);

  useEffect(() => {
    const c = base ? null : clienteNube();
    if (!c) return;
    let vivo = true;
    c.then((cliente) => leerCompartido(cliente, decodeURIComponent(id)))
      .then((e) => vivo && setCarga(e ? { t: "listo", e } : { t: "no-esta" }))
      .catch(() => vivo && setCarga({ t: navigator.onLine ? "no-esta" : "sin-senal" }));
    return () => {
      vivo = false;
    };
  }, [id, base]);

  const usar = async (e: Ejercicio) => {
    setCopiando(true);
    const copia = await duplicar({ ...e, nombre: e.nombre, compartido: false });
    router.push(`/ficha?id=${encodeURIComponent(copia.id)}`);
  };

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] px-4 pb-16 pt-[max(env(safe-area-inset-top),16px)] lg:max-w-[1200px] lg:px-8">
      <header className="flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-label font-extrabold tracking-[0.18em]">
          <span aria-hidden="true" className="size-3.5 rounded-[3px] bg-lime" />
          PLAYBOOK
        </Link>
        <span className="text-meta text-ink-muted">Ejercicio compartido</span>
      </header>
      {carga.t === "cargando" && <p className="mt-8 text-ink-muted" aria-busy="true">Cargando el ejercicio…</p>}
      {carga.t === "sin-senal" && (
        <div className="mt-8">
          <h1 className="titular">Sin señal</h1>
          <p className="mt-2 text-ink-muted">Este ejercicio está en la nube. Abrí el link cuando tengas conexión.</p>
        </div>
      )}
      {carga.t === "no-esta" && (
        <div className="mt-8">
          <h1 className="titular">Este ejercicio ya no está compartido</h1>
          <p className="mt-2 text-ink-muted">Puede que quien lo compartió lo haya borrado o que el link esté mal.</p>
          <Link href="/biblioteca" className="pressable btn-secondary mt-4 inline-flex h-12 items-center px-4">
            Ver la biblioteca de Playbook
          </Link>
        </div>
      )}
      {carga.t === "listo" && (
        <FichaEjercicio
          e={carga.e}
          publica
          acciones={
            <button type="button" onClick={() => usar(carga.e)} disabled={copiando} className="pressable btn-primary h-14 flex-1 px-5">
              {copiando ? "Copiando…" : "Usalo en Playbook"}
            </button>
          }
        />
      )}
    </div>
  );
}
