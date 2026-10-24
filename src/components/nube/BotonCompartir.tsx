"use client";

import Link from "next/link";
import { useState } from "react";
import { NUBE_ACTIVA, useCuenta } from "@/lib/nube/cuenta";
import { linkParaCompartir, mandarLink } from "@/lib/nube/compartir";
import type { Ejercicio } from "@/lib/tipos";

type Estado = { t: "quieto" } | { t: "subiendo" } | { t: "listo"; url: string; como: "compartido" | "copiado" | "manual" } | { t: "login" } | { t: "error"; msj: string };

/** "Compartir link" (SPEC 8): pide login porque el ejercicio tiene que estar en la nube. */
export function BotonCompartir({ e }: { e: Ejercicio }) {
  const cuenta = useCuenta();
  const [estado, setEstado] = useState<Estado>({ t: "quieto" });

  const compartir = async () => {
    if (cuenta.estado !== "adentro") {
      setEstado({ t: "login" });
      return;
    }
    setEstado({ t: "subiendo" });
    try {
      const url = await linkParaCompartir(e);
      const como = await mandarLink(url, e.nombre);
      setEstado(como === "cancelado" ? { t: "quieto" } : { t: "listo", url, como });
    } catch (err) {
      setEstado({ t: "error", msj: err instanceof Error ? err.message : "No se pudo subir el ejercicio." });
    }
  };

  return (
    <>
      <button type="button" onClick={compartir} disabled={estado.t === "subiendo"} className="pressable btn-secondary h-12 px-4">
        {estado.t === "subiendo" ? "Subiendo…" : "Compartir link"}
      </button>
      <span role="status" className="flex basis-full flex-wrap items-center gap-2 text-meta text-ink-muted empty:hidden">
        {estado.t === "login" &&
          (NUBE_ACTIVA ? (
            <>
              Iniciá sesión para compartir.
              <Link href="/mi-club" className="font-semibold text-ink underline underline-offset-2">
                Ir a Mi club
              </Link>
            </>
          ) : (
            "Iniciá sesión para compartir. (La cuenta todavía no está activada en esta instalación.)"
          ))}
        {estado.t === "listo" && (
          <>
            {estado.como === "copiado" ? "Link copiado." : estado.como === "compartido" ? "Listo." : "Copiá el link:"}
            <input readOnly value={estado.url} onFocus={(ev) => ev.currentTarget.select()} aria-label="Link para compartir" className="h-9 min-w-0 flex-1 rounded-chip bg-raised px-2 text-ink" />
          </>
        )}
        {estado.t === "error" && <span className="text-danger">{estado.msj}</span>}
      </span>
    </>
  );
}
