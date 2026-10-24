"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Cabecera } from "@/components/Cabecera";
import { BotonExportar } from "@/components/exportar/BotonExportar";
import { Herramientas, HERRAMIENTAS } from "@/components/editor/Herramientas";
import { Lienzo, type Herramienta } from "@/components/editor/Lienzo";
import { LineaPasos } from "@/components/editor/LineaPasos";
import { PanelFicha } from "@/components/editor/PanelFicha";
import { Paleta, nuevoElemento, type TipoPaleta } from "@/components/editor/Paleta";
import { IconoDeshacer, IconoRehacer } from "@/components/iconos";
import { PizarraAnimada } from "@/components/pizarra/PizarraAnimada";
import { Segmentado } from "@/components/Segmentado";
import { corrimiento, idsLibres } from "@/lib/editor/ids";
import { useEditor } from "@/lib/editor/useEditor";
import { VISTAS, orientacionDe } from "@/lib/pizarra/geometria";
import type { Elemento, Pizarra, Punto } from "@/lib/tipos";

export default function Pagina() {
  return (
    <Suspense fallback={<main className="min-h-dvh" aria-busy="true" />}>
      <Editor />
    </Suspense>
  );
}

const VISTAS_OPCIONES: { valor: Pizarra["vista"]; etiqueta: string }[] = [
  { valor: "completa", etiqueta: "Completa" },
  { valor: "media", etiqueta: "Media" },
  { valor: "area", etiqueta: "Área" },
];

const esCampo = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

function Editor() {
  const id = useSearchParams().get("id");
  const router = useRouter();
  const ed = useEditor(id);
  const { ejercicio: e, despachar } = ed;
  const pz = e.pizarra;
  const [pasoElegido, setPaso] = useState(0);
  const paso = Math.min(pasoElegido, pz.pasos.length - 1);
  const [herramienta, setHerramienta] = useState<Herramienta>("mover");
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [trazoSel, setTrazoSel] = useState<number | null>(null);
  const [viendo, setViendo] = useState(false);
  const orientacion = orientacionDe(pz.vista);
  const vertical = orientacion === "vertical";
  const enPaso = pz.pasos[paso]?.posiciones ?? {};
  const selEnPaso = seleccion.filter((x) => enPaso[x]);

  const agregar = useCallback(
    (tipo: TipoPaleta, en?: Punto) => {
      const el = nuevoElemento(tipo, pz.elementos);
      const c = VISTAS[pz.vista];
      // Sin punto de destino cae en el centro de la vista, corrido para no tapar al anterior.
      const corrido = (pz.elementos.length % 6) * 2.5;
      despachar({ tipo: "agregar", elemento: el, en: en ?? { x: c.x + c.w / 2 + corrido, y: c.y + c.h / 2 - corrido } });
      setSeleccion([el.id]);
      setHerramienta("mover");
    },
    [despachar, pz.elementos, pz.vista],
  );

  const borrarSeleccion = useCallback(() => {
    if (trazoSel !== null) {
      despachar({ tipo: "borrarTrazo", paso, indice: trazoSel });
      setTrazoSel(null);
    } else if (seleccion.length) {
      despachar({ tipo: "borrar", ids: seleccion });
      setSeleccion([]);
    }
  }, [despachar, paso, seleccion, trazoSel]);

  const duplicarSeleccion = useCallback(() => {
    if (!selEnPaso.length) return;
    const nuevosIds = idsLibres(selEnPaso, pz.elementos.map((x) => x.id));
    despachar({ tipo: "duplicar", ids: selEnPaso, paso, nuevosIds });
    setSeleccion(nuevosIds);
  }, [despachar, paso, pz.elementos, selEnPaso]);

  const guardar = useCallback(async () => {
    const g = await ed.guardar();
    if (g.id !== id) router.replace(`/editor?id=${encodeURIComponent(g.id)}`);
  }, [ed, id, router]);

  // Atajos de teclado. No se disparan mientras se escribe en la ficha.
  const atajos = useRef<(ev: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    atajos.current = (ev: KeyboardEvent) => {
      const mod = ev.ctrlKey || ev.metaKey;
      if (mod && ev.key.toLowerCase() === "s") {
        ev.preventDefault();
        void guardar();
        return;
      }
      if (esCampo(ev.target)) return;
      const k = ev.key.toLowerCase();
      if (mod && k === "z") {
        ev.preventDefault();
        if (ev.shiftKey) ed.rehacer();
        else ed.deshacer();
      } else if (mod && k === "y") {
        ev.preventDefault();
        ed.rehacer();
      } else if (mod && k === "d") {
        ev.preventDefault();
        duplicarSeleccion();
      } else if (mod && k === "a") {
        ev.preventDefault();
        setSeleccion(Object.keys(enPaso));
      } else if (ev.key === "Delete" || ev.key === "Backspace") {
        ev.preventDefault();
        borrarSeleccion();
      } else if (ev.key === "Escape") {
        setSeleccion([]);
        setTrazoSel(null);
        setHerramienta("mover");
        setViendo(false);
      } else if (ev.key === "[") setPaso(Math.max(0, paso - 1));
      else if (ev.key === "]") setPaso(Math.min(pz.pasos.length - 1, paso + 1));
      else if (!mod && !ev.altKey) {
        const d = corrimiento(ev.key, ev.shiftKey ? 2 : 0.5, vertical);
        if (d && selEnPaso.length) {
          ev.preventDefault();
          despachar({ tipo: "mover", paso, posiciones: Object.fromEntries(selEnPaso.map((x) => [x, { x: enPaso[x].x + d.dx, y: enPaso[x].y + d.dy }])) });
          return;
        }
        const h = HERRAMIENTAS.find((x) => x.tecla.toLowerCase() === k);
        if (h) setHerramienta(h.h);
      }
    };
  });
  useEffect(() => {
    const f = (ev: KeyboardEvent) => atajos.current(ev);
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);

  const unElemento: Elemento | undefined = seleccion.length === 1 ? pz.elementos.find((x) => x.id === seleccion[0]) : undefined;

  return (
    <>
      {/* En el celu, el editor completo no entra: se ofrece el boceto. */}
      <div className="mx-auto min-h-dvh max-w-[480px] px-4 pt-[max(env(safe-area-inset-top),12px)] lg:hidden">
        <Cabecera volver="/mis-ejercicios" etiquetaVolver="Volver a mis ejercicios" />
        <h1 className="titular mt-4">El editor completo es para la compu</h1>
        <p className="mt-2 text-ink-muted">En el celu podés hacer un boceto rápido: fichas en la cancha, nombre y fase. Después lo terminás en la compu.</p>
        <Link href={id ? `/boceto?id=${encodeURIComponent(id)}` : "/boceto"} className="pressable btn-primary mt-6 flex h-14 items-center justify-center">
          Hacer un boceto
        </Link>
      </div>

      <div className="hidden h-dvh grid-cols-[208px_minmax(0,1fr)_380px] grid-rows-[auto_minmax(0,1fr)_auto] gap-x-4 gap-y-3 p-4 lg:grid">
        <header className="col-span-3 flex items-center gap-3">
          <Link href="/mis-ejercicios" aria-label="Volver a mis ejercicios" className="pressable grid size-11 place-items-center rounded-card">
            <span aria-hidden="true" className="text-[1.5rem] leading-none">
              ←
            </span>
          </Link>
          <label className="min-w-0 flex-1">
            <span className="sr-only">Nombre del ejercicio</span>
            <input
              value={e.nombre}
              onChange={(ev) => despachar({ tipo: "ficha", cambios: { nombre: ev.target.value } })}
              placeholder="Nombre del ejercicio"
              className="h-12 w-full rounded-card bg-transparent px-2 text-[1.5rem] font-bold text-ink placeholder:text-ink-faint hover:bg-surface focus:bg-surface"
            />
          </label>
          <Herramientas valor={herramienta} onCambio={setHerramienta} conTeclas />
          <div className="flex gap-1">
            <button type="button" onClick={ed.deshacer} disabled={!ed.puedeDeshacer} title="Deshacer (Ctrl+Z)" aria-label="Deshacer" className="pressable grid size-11 place-items-center rounded-card bg-raised disabled:opacity-35">
              <IconoDeshacer tam={20} />
            </button>
            <button type="button" onClick={ed.rehacer} disabled={!ed.puedeRehacer} title="Rehacer (Ctrl+Shift+Z)" aria-label="Rehacer" className="pressable grid size-11 place-items-center rounded-card bg-raised disabled:opacity-35">
              <IconoRehacer tam={20} />
            </button>
          </div>
          <span className="w-[9ch] text-right text-meta text-ink-muted" aria-live="polite">
            {ed.guardado === "guardando" ? "Guardando…" : ed.guardado === "guardado" ? "Guardado" : ed.guardado === "cambios" ? "Sin guardar" : ""}
          </span>
          <button type="button" onClick={() => void guardar()} title="Guardar (Ctrl+S)" className="pressable btn-primary h-12 px-5">
            Guardar
          </button>
        </header>

        <aside className="row-span-2 flex flex-col gap-4 overflow-y-auto" aria-label="Elementos">
          <Paleta onAgregar={(t) => agregar(t)} />
          <div className="flex flex-col gap-1">
            <h2 className="text-meta font-semibold text-ink-muted">Selección {selEnPaso.length ? `(${selEnPaso.length})` : ""}</h2>
            <BotonLado onClick={duplicarSeleccion} disabled={!selEnPaso.length} atajo="Ctrl+D">
              Duplicar
            </BotonLado>
            <BotonLado onClick={() => despachar({ tipo: "alinear", ids: selEnPaso, paso, eje: vertical ? "y" : "x" })} disabled={selEnPaso.length < 2}>
              Alinear en columna
            </BotonLado>
            <BotonLado onClick={() => despachar({ tipo: "alinear", ids: selEnPaso, paso, eje: vertical ? "x" : "y" })} disabled={selEnPaso.length < 2}>
              Alinear en fila
            </BotonLado>
            <BotonLado onClick={borrarSeleccion} disabled={!seleccion.length && trazoSel === null} atajo="Supr" peligro>
              {trazoSel !== null ? "Borrar trazo" : "Borrar"}
            </BotonLado>
          </div>
          {unElemento && (unElemento.tipo === "jugador" || unElemento.tipo === "texto" || unElemento.tipo === "zona") && (
            <div className="flex flex-col gap-2 rounded-card bg-surface p-2">
              <label className="flex flex-col gap-1">
                <span className="text-meta font-semibold text-ink-muted">{unElemento.tipo === "texto" ? "Texto" : "Etiqueta"}</span>
                <input
                  value={unElemento.etiqueta ?? ""}
                  maxLength={unElemento.tipo === "jugador" ? 2 : 24}
                  onChange={(ev) => despachar({ tipo: "elemento", id: unElemento.id, cambios: { etiqueta: ev.target.value } })}
                  className="h-10 rounded-card bg-raised px-2 text-body"
                />
              </label>
              {unElemento.tipo === "zona" && (
                <button
                  type="button"
                  aria-pressed={unElemento.forma === "elipse"}
                  onClick={() => despachar({ tipo: "elemento", id: unElemento.id, cambios: { forma: unElemento.forma === "elipse" ? undefined : "elipse" } })}
                  className="pressable h-10 rounded-card bg-raised text-label font-semibold"
                >
                  {unElemento.forma === "elipse" ? "Pasar a rectángulo" : "Pasar a elipse"}
                </button>
              )}
              {unElemento.tipo === "zona" && unElemento.tam && (
                <div className="grid grid-cols-2 gap-1">
                  {(["w", "h"] as const).map((k) => (
                    <label key={k} className="flex flex-col gap-1">
                      <span className="text-meta font-semibold text-ink-muted">{k === "w" ? "Largo (m)" : "Ancho (m)"}</span>
                      <input
                        type="number"
                        min={2}
                        max={91}
                        value={unElemento.tam![k]}
                        onChange={(ev) => despachar({ tipo: "elemento", id: unElemento.id, cambios: { tam: { ...unElemento.tam!, [k]: Number(ev.target.value) } } })}
                        className="h-10 rounded-card bg-raised px-2 text-body"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          <p className="mt-auto text-meta text-ink-faint">
            Arrastrá con la herramienta Mover; con Desplazamiento, Conducción, Pase o Tiro arrastrá desde la ficha hasta el destino. Tocá un trazo para curvarlo con la manija.
          </p>
        </aside>

        <section className="relative flex min-h-0 flex-col gap-2" aria-label="Pizarra">
          <div className="flex items-center justify-between gap-3">
            <Segmentado leyenda="Vista" nombre="vista" ocultarLeyenda alto="md" opciones={VISTAS_OPCIONES} valor={pz.vista} onCambio={(v) => despachar({ tipo: "vista", vista: v })} />
            <div className="flex items-center gap-2">
              <BotonExportar e={e} className="pressable h-11 rounded-card bg-raised px-4 text-label font-semibold" />
              <button type="button" aria-pressed={viendo} onClick={() => setViendo((v) => !v)} className={`pressable h-11 rounded-card px-4 text-label font-semibold ${viendo ? "bg-ink text-ground" : "bg-raised"}`}>
                {viendo ? "Volver a editar" : "Ver animación"}
              </button>
            </div>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-card bg-[var(--turf-runoff)]">
            {viendo ? (
              <PizarraAnimada pizarra={pz} controles soloVisible={false} className="h-full" titulo={e.nombre || "Ejercicio sin nombre"} />
            ) : (
              ed.cargado && (
                <Lienzo
                  ejercicio={e}
                  paso={paso}
                  orientacion={orientacion}
                  herramienta={herramienta}
                  seleccion={seleccion}
                  onSeleccion={setSeleccion}
                  trazoSel={trazoSel}
                  onTrazoSel={setTrazoSel}
                  despachar={despachar}
                  onSoltar={(t, en) => agregar(t as TipoPaleta, en)}
                  className="h-full w-full"
                />
              )
            )}
          </div>
        </section>

        <aside className="row-span-2 flex min-h-0 flex-col gap-3 overflow-y-auto pr-1" aria-label="Ficha">
          <EstadoListo faltantes={ed.faltantes} />
          <PanelFicha e={e} despachar={despachar} />
        </aside>

        <section aria-label="Pasos">
          <LineaPasos pasos={pz.pasos} actual={paso} onElegir={setPaso} despachar={despachar} />
        </section>
      </div>
    </>
  );
}

function EstadoListo({ faltantes }: { faltantes: string[] }) {
  if (!faltantes.length)
    return (
      <p className="rounded-card bg-surface p-3 text-label">
        <strong className="text-lime">Listo.</strong> La ficha está completa y entra en las sesiones que arma Playbook.
      </p>
    );
  return (
    <div className="rounded-card bg-surface p-3 text-label">
      <p>
        <strong>Se guarda como borrador.</strong> Ya entra en las sesiones; para completar la ficha te falta:
      </p>
      <ul className="mt-1 list-disc pl-5 text-ink-muted">
        {faltantes.slice(0, 4).map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </div>
  );
}

function BotonLado({ onClick, disabled, atajo, peligro, children }: { onClick: () => void; disabled?: boolean; atajo?: string; peligro?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`pressable flex h-10 items-center justify-between rounded-card bg-raised px-3 text-label font-semibold disabled:opacity-35 ${peligro ? "text-danger" : ""}`}>
      {children}
      {atajo && <kbd className="text-meta font-normal text-ink-faint">{atajo}</kbd>}
    </button>
  );
}
