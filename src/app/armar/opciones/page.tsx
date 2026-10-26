"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarraPasos } from "@/components/BarraPasos";
import { DivisionFlip } from "@/components/flujo/DivisionFlip";
import { IconoSeguir, IconoVolver } from "@/components/iconos";
import { Segmentado } from "@/components/Segmentado";
import { DURACIONES } from "@/lib/duraciones";
import { useAjustes } from "@/lib/estado/ajustes";
import { cambiarArmado, cargarArmado, recordarArmado, useArmado } from "@/lib/estado/armado";
import { bibliotecaCompleta, guardarSesion, historialReciente } from "@/lib/estado/sesiones";
import { marcarRecienArmada } from "@/lib/estado/transicion";
import { useMovimientoReducido } from "@/lib/hooks/useMovimientoReducido";
import { SEMILLA_DEMO, esDemo } from "@/lib/demo";
import { generarSesion } from "@/lib/motor/generar";
import type { BloqueSesion, Ejercicio, Intensidad, Nivel, Objetivo, Sesion, TipoSesion } from "@/lib/tipos";
import { esPausa } from "@/lib/tipos";
import { vibrar } from "@/lib/vibrar";


const OBJETIVOS: [Objetivo, string][] = [
  ["conduccion", "Conducción"],
  ["pase_recepcion", "Pase y recepción"],
  ["definicion", "Definición"],
  ["quite_marca", "Quite y marca"],
  ["salida", "Salida"],
  ["presion", "Presión"],
  ["posesion", "Posesión"],
  ["transicion", "Transición"],
];

const MATERIALES: [string, string][] = [
  ["bochas", "Bochas"],
  ["conos", "Conos y platos"],
  ["vallas", "Vallas"],
  ["aros", "Aros"],
  ["arcosChicos", "Arcos chicos"],
  ["colores", "Petos de colores"],
];

/** Barritas de intensidad: se lee el nivel sin depender de la palabra. */
function Barras({ n }: { n: 1 | 2 | 3 }) {
  return (
    <span className="flex items-end gap-[3px]" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <span key={i} className={`w-[5px] rounded-[1px] bg-current ${i <= n ? "" : "opacity-25"}`} style={{ height: 6 + i * 4 }} />
      ))}
    </span>
  );
}

/** El bloque que mejor muestra la división: el juego aplicado, o el principal. */
function bloqueParaMostrar(s: Sesion): BloqueSesion {
  const bs = s.items.filter((x): x is BloqueSesion => !esPausa(x));
  return bs.find((b) => b.bloque === 4) ?? bs.find((b) => b.bloque === 3) ?? bs[0];
}

export default function QueArmamos() {
  const router = useRouter();
  const armado = useArmado();
  const ajustes = useAjustes();
  const reducido = useMovimientoReducido();
  const [cambiandoDuracion, setCambiandoDuracion] = useState(false);
  const [armando, setArmando] = useState<{ sesion: Sesion; bloque: BloqueSesion; ejercicio: Ejercicio } | null>(null);

  useEffect(() => {
    void cargarArmado();
  }, []);

  const material = armado.material ?? (ajustes?.material as Record<string, number> | undefined) ?? {};

  const cambiarTipo = (t: TipoSesion) => {
    cambiarArmado({ tipo: t, duracion: ajustes?.duracion[t] ?? DURACIONES[t][1] });
    setCambiandoDuracion(false);
  };

  async function armar() {
    vibrar(10);
    const a = armado;
    const demo = esDemo();
    const [biblioteca, historial] = await Promise.all([bibliotecaCompleta(), demo ? [] : historialReciente()]);
    const semilla = demo ? SEMILLA_DEMO : (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
    const sesion: Sesion = {
      ...generarSesion(
        { jugadores: a.jugadores, arqueros: a.arqueros, tipo: a.tipo, nivel: a.nivel, intensidad: a.intensidad, duracion: a.duracion, objetivo: a.objetivo, espacio: a.espacio, material },
        biblioteca,
        historial,
        semilla,
        Date.now(),
      ),
      id: crypto.randomUUID(),
    };
    await Promise.all([guardarSesion(sesion), recordarArmado(a)]);
    marcarRecienArmada(sesion.id);
    if (reducido) {
      router.push("/sesion");
      return;
    }
    const bloque = bloqueParaMostrar(sesion);
    const ejercicio = biblioteca.find((e) => e.id === bloque.ejercicioId)!;
    setArmando({ sesion, bloque, ejercicio });
  }

  const arqueros = armado.arqueros;

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
            <span className="marcador text-[1.75rem] text-ink">
              {armado.jugadores} + {arqueros}
            </span>
            <span className="text-label">{arqueros === 1 ? "arquero" : "arqueros"} · cambiar</span>
          </Link>
          <h1 className="titular mt-1">¿Qué armamos?</h1>
        </div>

        <Segmentado<TipoSesion>
          leyenda="Tipo"
          nombre="tipo"
          valor={armado.tipo}
          onCambio={cambiarTipo}
          opciones={[
            { valor: "completa", etiqueta: "Sesión completa" },
            { valor: "calor", etiqueta: "Entrada en calor" },
            { valor: "principal", etiqueta: "Principal" },
          ]}
        />
        <Segmentado<Nivel>
          leyenda="Nivel"
          nombre="nivel"
          valor={armado.nivel}
          onCambio={(nivel) => cambiarArmado({ nivel })}
          opciones={[
            { valor: "inicial", etiqueta: "Inicial" },
            { valor: "intermedio", etiqueta: "Intermedio" },
            { valor: "avanzado", etiqueta: "Avanzado" },
          ]}
        />
        <Segmentado<Intensidad>
          leyenda="Intensidad"
          nombre="intensidad"
          valor={armado.intensidad}
          onCambio={(intensidad) => cambiarArmado({ intensidad })}
          opciones={(
            [
              [1, "Suave"],
              [2, "Media"],
              [3, "Fuerte"],
            ] as const
          ).map(([v, t]) => ({
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
              valor={armado.duracion}
              onCambio={(d) => {
                cambiarArmado({ duracion: d });
                setCambiandoDuracion(false);
              }}
              opciones={DURACIONES[armado.tipo].map((d) => ({ valor: d, etiqueta: d, nombre: `${d} minutos` }))}
            />
          ) : (
            <button
              type="button"
              onClick={() => setCambiandoDuracion(true)}
              className="pressable pressable-raised flex h-14 w-full items-center justify-between rounded-card bg-surface px-4"
            >
              <span className="text-label font-semibold text-ink-muted">Duración</span>
              <span className="flex items-baseline gap-2">
                <span className="marcador text-[2rem]">{armado.duracion}</span>
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
                    aria-pressed={armado.objetivo === v}
                    onClick={() => cambiarArmado({ objetivo: armado.objetivo === v ? undefined : v })}
                    className={`pressable h-12 rounded-chip px-3 text-label font-semibold ${armado.objetivo === v ? "bg-ink text-ground" : "bg-raised text-ink"}`}
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
              valor={armado.espacio ?? "media"}
              onCambio={(espacio) => cambiarArmado({ espacio })}
              opciones={[
                { valor: "completa", etiqueta: "Completa" },
                { valor: "media", etiqueta: "Media" },
                { valor: "cuarto", etiqueta: "Cuarto" },
              ]}
            />
            <fieldset>
              <legend className="text-label font-semibold text-ink-muted">Material de hoy (pisa el de Mi club)</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {MATERIALES.map(([k, t]) => {
                  const hay = (material[k] ?? 0) > 0;
                  return (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={hay}
                      onClick={() => cambiarArmado({ material: { ...material, [k]: hay ? 0 : 20 } })}
                      className={`pressable h-12 rounded-chip px-3 text-label font-semibold ${hay ? "bg-ink text-ground" : "bg-raised text-ink-muted line-through decoration-2"}`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </details>
      </main>

      <div className="fixed inset-x-0 bottom-0 bg-ground">
        <div className="mx-auto max-w-[480px] px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
          <button type="button" onClick={armar} disabled={!!armando} className="pressable btn-primary flex h-16 w-full items-center justify-center text-title">
            Armame la sesión
          </button>
        </div>
      </div>

      {armando && (
        <DivisionFlip
          jugadores={armando.sesion.params.jugadores}
          arqueros={armando.sesion.params.arqueros}
          division={armando.bloque.division}
          formato={armando.ejercicio.formato}
          ejercicio={armando.ejercicio.nombre}
          onFin={() => router.push("/sesion")}
        />
      )}
    </div>
  );
}
