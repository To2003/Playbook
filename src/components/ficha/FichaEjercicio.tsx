import type { ReactNode } from "react";
import { Barras } from "@/components/Barras";
import { PizarraAnimada } from "@/components/pizarra/PizarraAnimada";
import { NOMBRE_ESPACIO, NOMBRE_FASE, NOMBRE_FORMATO, NOMBRE_NIVEL, NOMBRE_OBJETIVO } from "@/lib/nombres";
import type { Ejercicio, Nivel } from "@/lib/tipos";

const ARQUEROS: Record<Ejercicio["arqueros"], string> = {
  no: "No los usa (se les da una tarea aparte)",
  opcional: "Pueden jugar",
  requerido: "Los necesita",
  arco_chico: "Con arqueros o con arcos chicos",
};

const MATERIAL: Record<string, string> = { bochas: "bochas", conos: "conos o platos", vallas: "vallas", aros: "aros", arcosChicos: "arcos chicos", colores: "petos de colores" };

/** Ficha completa (SPEC 5.1): pizarra animada con controles y todos los campos. */
export function FichaEjercicio({ e, acciones, publica }: { e: Ejercicio; acciones?: ReactNode; /** Página pública: el ejercicio no es de quien la mira. */ publica?: boolean }) {
  const material = Object.entries(e.material)
    .filter(([, v]) => v)
    .map(([k]) => MATERIAL[k] ?? k);
  return (
    <article className="lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
      <div className="lg:sticky lg:top-6">
        <p className="text-label text-ink-muted">{NOMBRE_FASE[e.fase]}</p>
        <h1 className="titular mt-1">{e.nombre}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-label text-ink-muted">
          <span className="flex items-center gap-1.5">
            <Barras n={e.intensidad} /> Intensidad {e.intensidad}
          </span>
          <span>{e.niveles.map((n) => NOMBRE_NIVEL[n]).join(" · ")}</span>
          {e.autor !== "base" && !publica && <span className="rounded-chip bg-raised px-1.5 py-0.5 font-semibold text-ink">{e.estado === "borrador" ? "Borrador" : "Mío"}</span>}
        </div>
        <div className="mt-4 overflow-hidden rounded-pitch">
          <PizarraAnimada pizarra={e.pizarra} aspecto={16 / 10} controles soloVisible={false} titulo={`Pizarra: ${e.nombre}`} />
        </div>
        {acciones && <div className="mt-4 flex flex-wrap gap-2">{acciones}</div>}
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:mt-0">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-card bg-surface p-4 text-label">
          <Dato t="Jugadores de campo" v={e.jugadores.min === e.jugadores.max ? `${e.jugadores.min}` : `${e.jugadores.min} a ${e.jugadores.max}`} num />
          <Dato t="Formato" v={NOMBRE_FORMATO(e.formato)} />
          <Dato t="Arqueros" v={ARQUEROS[e.arqueros]} />
          <Dato t="Espacio" v={NOMBRE_ESPACIO[e.espacio]} />
          <Dato t="Duración sugerida" v={`${e.duracion.min} a ${e.duracion.max} min`} num />
          <Dato t="Material" v={material.length ? material.join(", ") : "Nada"} />
          {e.objetivos.length > 0 && <Dato t="Objetivos" v={e.objetivos.map((o) => NOMBRE_OBJETIVO[o]).join(", ")} ancho />}
        </dl>

        {e.organizacion && <Seccion t="Organización">{e.organizacion}</Seccion>}
        {e.consigna && <Seccion t="Consigna">{e.consigna}</Seccion>}

        {e.puntosClave.length > 0 && (
          <section>
            <h2 className="text-title font-[650]">Puntos clave</h2>
            <ul className="mt-2 flex flex-col gap-2">
              {e.puntosClave.map((p) => (
                <li key={p} className="flex gap-3 text-body">
                  <span aria-hidden="true" className="mt-[0.5em] size-2 shrink-0 bg-ink" />
                  {p}
                </li>
              ))}
            </ul>
          </section>
        )}

        {e.errores.length > 0 && (
          <section>
            <h2 className="text-title font-[650]">Errores comunes y cómo corregirlos</h2>
            <ul className="mt-2 flex flex-col gap-3">
              {e.errores.map((x) => (
                <li key={x.error} className="rounded-card bg-surface p-3">
                  <p className="font-semibold">{x.error}</p>
                  <p className="mt-1 text-ink-muted">
                    <span className="font-semibold text-ink">Corrección:</span> {x.correccion}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {Object.keys(e.variantes).length > 0 && (
          <section>
            <h2 className="text-title font-[650]">Variantes por nivel</h2>
            <dl className="mt-2 flex flex-col gap-2">
              {(["inicial", "intermedio", "avanzado"] as Nivel[])
                .filter((n) => e.variantes[n])
                .map((n) => (
                  <div key={n} className="grid grid-cols-[96px_1fr] gap-3">
                    <dt className="font-semibold">{NOMBRE_NIVEL[n]}</dt>
                    <dd className="text-ink-muted">{e.variantes[n]}</dd>
                  </div>
                ))}
            </dl>
          </section>
        )}

        {e.progresion && (
          <section>
            <h2 className="text-title font-[650]">Progresión</h2>
            <dl className="mt-2 flex flex-col gap-2">
              {e.progresion.masFacil && (
                <div className="grid grid-cols-[96px_1fr] gap-3">
                  <dt className="font-semibold">Más fácil</dt>
                  <dd className="text-ink-muted">{e.progresion.masFacil}</dd>
                </div>
              )}
              {e.progresion.masDificil && (
                <div className="grid grid-cols-[96px_1fr] gap-3">
                  <dt className="font-semibold">Más difícil</dt>
                  <dd className="text-ink-muted">{e.progresion.masDificil}</dd>
                </div>
              )}
            </dl>
          </section>
        )}
      </div>
    </article>
  );
}

function Dato({ t, v, num, ancho }: { t: string; v: string; num?: boolean; ancho?: boolean }) {
  return (
    <div className={ancho ? "col-span-2" : undefined}>
      <dt className="text-meta text-ink-faint">{t}</dt>
      <dd className={`mt-0.5 font-semibold ${num ? "num" : ""}`}>{v}</dd>
    </div>
  );
}

function Seccion({ t, children }: { t: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-title font-[650]">{t}</h2>
      <p className="mt-2 max-w-[65ch] text-body">{children}</p>
    </section>
  );
}
