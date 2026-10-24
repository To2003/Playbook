"use client";

import Link from "next/link";
import { useState } from "react";
import { BarraPasos } from "@/components/BarraPasos";
import { IconoSeguir, IconoVolver } from "@/components/iconos";
import { Segmentado } from "@/components/Segmentado";

type Tipo = "completa" | "calor" | "principal";
const DURACIONES: Record<Tipo, number[]> = { completa: [60, 75, 90, 120], calor: [15, 20, 25, 30], principal: [30, 45, 60] };
const POR_DEFECTO: Record<Tipo, number> = { completa: 90, calor: 20, principal: 45 };

const OBJETIVOS = [
  ["conduccion", "Conducción"],
  ["pase_recepcion", "Pase y recepción"],
  ["definicion", "Definición"],
  ["quite_marca", "Quite y marca"],
  ["salida", "Salida"],
  ["presion", "Presión"],
  ["posesion", "Posesión"],
  ["transicion", "Transición"],
] as const;

/** Barritas de intensidad: se lee el nivel sin depender de la palabra. */
function Barras({ n }: { n: 1 | 2 | 3 }) {
  return (
    <span className="flex items-end gap-[3px]" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <span key={i} className={`w-[5px] rounded-[1px] ${i <= n ? "bg-current" : "bg-current opacity-25"}`} style={{ height: 6 + i * 4 }} />
      ))}
    </span>
  );
}

export default function QueArmamos() {
  const [tipo, setTipo] = useState<Tipo>("completa");
  const [nivel, setNivel] = useState("intermedio");
  const [intensidad, setIntensidad] = useState<1 | 2 | 3>(2);
  const [duracion, setDuracion] = useState(90);
  const [cambiandoDuracion, setCambiandoDuracion] = useState(false);
  const [objetivo, setObjetivo] = useState<string | null>(null);
  const [espacio, setEspacio] = useState("media");

  const cambiarTipo = (t: Tipo) => {
    setTipo(t);
    setDuracion(POR_DEFECTO[t]);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-4 pt-[max(env(safe-area-inset-top),12px)]">
      <header className="flex h-14 items-center gap-3">
        <Link href="/armar" aria-label="Volver a ¿Cuántos vinieron?" className="pressable -ml-3 grid size-12 place-items-center rounded-card">
          <IconoVolver />
        </Link>
        <BarraPasos actual={2} />
      </header>

      <main className="flex flex-1 flex-col gap-5 pb-[calc(104px+env(safe-area-inset-bottom))]">
        <div>
          <Link href="/armar" className="pressable inline-flex items-baseline gap-2 rounded-card py-1 text-ink-muted">
            <span className="marcador text-[1.75rem] text-ink">11 + 1</span>
            <span className="text-label">arquero · cambiar</span>
          </Link>
          <h1 className="titular mt-1">¿Qué armamos?</h1>
        </div>

        <Segmentado<Tipo>
          leyenda="Tipo"
          nombre="tipo"
          valor={tipo}
          onCambio={cambiarTipo}
          opciones={[
            { valor: "completa", etiqueta: "Sesión completa" },
            { valor: "calor", etiqueta: "Entrada en calor" },
            { valor: "principal", etiqueta: "Principal" },
          ]}
        />
        <Segmentado
          leyenda="Nivel"
          nombre="nivel"
          valor={nivel}
          onCambio={setNivel}
          opciones={[
            { valor: "inicial", etiqueta: "Inicial" },
            { valor: "intermedio", etiqueta: "Intermedio" },
            { valor: "avanzado", etiqueta: "Avanzado" },
          ]}
        />
        <Segmentado<1 | 2 | 3>
          leyenda="Intensidad"
          nombre="intensidad"
          valor={intensidad}
          onCambio={setIntensidad}
          opciones={([
            [1, "Suave"],
            [2, "Media"],
            [3, "Fuerte"],
          ] as const).map(([v, t]) => ({
            valor: v,
            etiqueta: (
              <span className="flex items-center gap-2">
                <Barras n={v} />
                {t}
              </span>
            ),
          }))}
        />

        <div>
          {cambiandoDuracion ? (
            <Segmentado
              leyenda="Duración, en minutos"
              nombre="duracion"
              marcador
              valor={duracion}
              onCambio={(d) => {
                setDuracion(d);
                setCambiandoDuracion(false);
              }}
              opciones={DURACIONES[tipo].map((d) => ({ valor: d, etiqueta: d, nombre: `${d} minutos` }))}
            />
          ) : (
            <button
              type="button"
              onClick={() => setCambiandoDuracion(true)}
              className="pressable pressable-raised flex h-14 w-full items-center justify-between rounded-card bg-surface px-4"
            >
              <span className="text-label font-semibold text-ink-muted">Duración</span>
              <span className="flex items-baseline gap-2">
                <span className="marcador text-[2rem]">{duracion}</span>
                <span className="text-label text-ink-muted">min · cambiar</span>
              </span>
            </button>
          )}
        </div>

        <details className="group rounded-card bg-surface">
          <summary className="flex h-14 cursor-pointer list-none items-center justify-between px-4 text-body font-semibold [&::-webkit-details-marker]:hidden">
            Más opciones
            <IconoSeguir tam={20} className="text-ink-faint transition-transform duration-200 ease-[var(--ease-out)] group-open:rotate-90 motion-reduce:transition-none" />
          </summary>
          <div className="flex flex-col gap-5 px-4 pb-4">
            <fieldset>
              <legend className="text-label font-semibold text-ink-muted">Objetivo del día</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {OBJETIVOS.map(([v, t]) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={objetivo === v}
                    onClick={() => setObjetivo(objetivo === v ? null : v)}
                    className={`pressable h-12 rounded-chip px-3 text-label font-semibold ${objetivo === v ? "bg-ink text-ground" : "bg-raised text-ink"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>
            <Segmentado
              leyenda="Espacio disponible"
              nombre="espacio"
              alto="md"
              valor={espacio}
              onCambio={setEspacio}
              opciones={[
                { valor: "completa", etiqueta: "Completa" },
                { valor: "media", etiqueta: "Media" },
                { valor: "cuarto", etiqueta: "Cuarto" },
              ]}
            />
          </div>
        </details>
      </main>

      <div className="fixed inset-x-0 bottom-0 bg-ground">
        <div className="mx-auto max-w-[480px] px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
          <Link href="/sesion" className="pressable btn-primary flex h-16 items-center justify-center text-title">
            Armame la sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
