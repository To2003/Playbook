"use client";

import { useEffect, useRef, useState } from "react";
import { evento } from "@/lib/analytics";
import { compartirODescargar, svgAPng } from "@/lib/exportar/png";
import type { Ejercicio } from "@/lib/tipos";
import { Poster } from "./Poster";

type Estado = "quieto" | "armando" | "compartido" | "descargado" | "error";

/** "Exportar PNG": arma el póster fuera de pantalla, lo pasa a PNG y lo comparte o lo descarga. */
export function BotonExportar({ e, className }: { e: Ejercicio; className?: string }) {
  const [estado, setEstado] = useState<Estado>("quieto");
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (estado !== "armando" || !svg.current) return;
    let vivo = true;
    (async () => {
      try {
        await document.fonts.ready;
        const png = await svgAPng(svg.current!);
        const r = await compartirODescargar(png, e.nombre, e.nombre);
        if (r !== "cancelado") evento({ nombre: "png_exportado" });
        if (vivo) setEstado(r === "cancelado" ? "quieto" : r);
      } catch (err) {
        console.warn("Exportar PNG:", err);
        if (vivo) setEstado("error");
      }
    })();
    return () => {
      vivo = false;
    };
  }, [estado, e.nombre]);

  return (
    <>
      <button type="button" onClick={() => setEstado("armando")} disabled={estado === "armando"} className={className ?? "pressable btn-secondary h-12 px-4"}>
        {estado === "armando" ? "Armando la imagen…" : "Exportar PNG"}
      </button>
      <span className="sr-only" aria-live="polite">
        {estado === "descargado" ? "Imagen descargada." : estado === "compartido" ? "Imagen compartida." : ""}
      </span>
      {estado === "descargado" && <span className="self-center text-meta text-ink-muted">Se descargó la imagen.</span>}
      {estado === "error" && (
        <span role="alert" className="self-center text-meta text-danger">
          No pude armar la imagen. Probá de nuevo.
        </span>
      )}
      {estado === "armando" && (
        <div data-poster aria-hidden="true" style={{ position: "fixed", left: -20000, top: 0, pointerEvents: "none" }}>
          <Poster e={e} svgRef={svg} />
        </div>
      )}
    </>
  );
}
