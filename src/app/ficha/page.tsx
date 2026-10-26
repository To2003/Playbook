"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Cabecera } from "@/components/Cabecera";
import { BotonExportar } from "@/components/exportar/BotonExportar";
import { AccionesFicha } from "@/components/ficha/AccionesFicha";
import { BotonCompartir } from "@/components/nube/BotonCompartir";
import { abrirFeedback } from "@/lib/feedback/cliente";
import { FichaEjercicio } from "@/components/ficha/FichaEjercicio";
import { useBiblioteca } from "@/lib/estado/sesiones";

export default function Pagina() {
  return (
    <Suspense fallback={<main className="min-h-dvh" aria-busy="true" />}>
      <Ficha />
    </Suspense>
  );
}

function Ficha() {
  const id = useSearchParams().get("id");
  const router = useRouter();
  const biblioteca = useBiblioteca();
  const e = biblioteca.find((x) => x.id === id);

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] px-4 pb-16 pt-[max(env(safe-area-inset-top),12px)] lg:max-w-[1200px] lg:px-8">
      <Cabecera volver="/biblioteca" etiquetaVolver="Volver a la biblioteca" />
      {e ? (
        <FichaEjercicio e={e} acciones={<AccionesFicha e={e} onBorrado={() => router.push("/mis-ejercicios")} extra={
                <>
                  <BotonExportar e={e} />
                  <BotonCompartir e={e} />
                  <button type="button" onClick={() => abrirFeedback({ origen: "ficha", ejercicioId: e.id })} className="pressable h-12 rounded-card px-3 text-label font-semibold text-ink-muted underline-offset-4 hover:underline">
                    Este ejercicio está flojo
                  </button>
                </>
              } />} />
      ) : (
        <div className="mt-8">
          <h1 className="titular">No encontré ese ejercicio</h1>
          <p className="mt-2 text-ink-muted">Puede que lo hayas borrado o que el link esté mal.</p>
          <Link href="/biblioteca" className="pressable btn-secondary mt-4 inline-flex h-12 items-center px-4">
            Ir a la biblioteca
          </Link>
        </div>
      )}
    </div>
  );
}
