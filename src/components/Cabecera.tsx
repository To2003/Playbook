import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { IconoVolver } from "./iconos";

/** Barra superior de las pantallas secundarias: volver y, a la derecha, lo que haga falta. */
export function Cabecera({
  volver = "/",
  etiquetaVolver = "Volver al inicio",
  alVolver,
  children,
}: {
  volver?: string;
  etiquetaVolver?: string;
  /** Para frenar la salida (por ejemplo, con cambios sin guardar). */
  alVolver?: (ev: MouseEvent<HTMLAnchorElement>) => void;
  children?: ReactNode;
}) {
  return (
    <header className="flex h-14 items-center gap-3">
      <Link href={volver} aria-label={etiquetaVolver} onClick={alVolver} className="pressable -ml-3 grid size-12 place-items-center rounded-card">
        <IconoVolver />
      </Link>
      <div className="flex flex-1 items-center justify-end gap-1">{children}</div>
    </header>
  );
}
