"use client";

import type { Accion } from "@/lib/editor/estado";
import { NOMBRE_ESPACIO, NOMBRE_FASE, NOMBRE_NIVEL, NOMBRE_OBJETIVO } from "@/lib/nombres";
import type { Ejercicio, Espacio, Fase, Formato, Nivel, Objetivo } from "@/lib/tipos";

const campo = "h-10 w-full rounded-card bg-raised px-3 text-body text-ink placeholder:text-ink-faint";
const area = "min-h-20 w-full rounded-card bg-raised px-3 py-2 text-body text-ink placeholder:text-ink-faint";
const etiqueta = "text-meta font-semibold text-ink-muted";

const MATERIALES: [keyof Ejercicio["material"], string][] = [
  ["bochas", "Bochas"],
  ["conos", "Conos"],
  ["vallas", "Vallas"],
  ["aros", "Aros"],
  ["arcosChicos", "Arcos chicos"],
  ["colores", "Petos"],
];

/** Panel lateral con la ficha completa (SPEC 5.1). Cada cambio es una acción deshacible. */
export function PanelFicha({ e, despachar }: { e: Ejercicio; despachar: (a: Accion) => void }) {
  const set = (cambios: Partial<Ejercicio>) => despachar({ tipo: "ficha", cambios });
  const formatoTipo = e.formato.tipo;
  const listaFija = (arr: string[], n: number) => Array.from({ length: n }, (_, i) => arr[i] ?? "");

  return (
    <form className="flex flex-col gap-4" onSubmit={(ev) => ev.preventDefault()} aria-label="Ficha del ejercicio">
      <Fila t="Fase">
        <select className={campo} value={e.fase} onChange={(ev) => set({ fase: ev.target.value as Fase })}>
          {(Object.keys(NOMBRE_FASE) as Fase[]).map((f) => (
            <option key={f} value={f}>
              {NOMBRE_FASE[f]}
            </option>
          ))}
        </select>
      </Fila>
      <div className="grid grid-cols-2 gap-2">
        <Fila t="Jugadores mín.">
          <input type="number" min={1} max={30} className={campo} value={e.jugadores.min} onChange={(ev) => set({ jugadores: { ...e.jugadores, min: Number(ev.target.value) } })} />
        </Fila>
        <Fila t="Jugadores máx.">
          <input type="number" min={1} max={30} className={campo} value={e.jugadores.max} onChange={(ev) => set({ jugadores: { ...e.jugadores, max: Number(ev.target.value) } })} />
        </Fila>
      </div>
      <div className="grid grid-cols-[1fr_auto_auto] gap-2">
        <Fila t="Formato">
          <select
            className={campo}
            value={formatoTipo}
            onChange={(ev) => {
              const t = ev.target.value as Formato["tipo"];
              const f: Formato = t === "grupos" ? { tipo: t, k: 4 } : t === "superioridad" ? { tipo: t, atacan: 3, defienden: 2 } : { tipo: t };
              set({ formato: f });
            }}
          >
            <option value="individual">Individual con bocha</option>
            <option value="parejas">Parejas</option>
            <option value="grupos">Grupos de k</option>
            <option value="dos_equipos">Dos equipos</option>
            <option value="superioridad">Superioridad</option>
          </select>
        </Fila>
        {e.formato.tipo === "grupos" && (
          <Fila t="k">
            <input type="number" min={2} max={10} className={`${campo} w-16`} value={e.formato.k} onChange={(ev) => set({ formato: { tipo: "grupos", k: Number(ev.target.value) } })} />
          </Fila>
        )}
        {e.formato.tipo === "superioridad" && (
          <>
            <Fila t="Atacan">
              <input type="number" min={2} max={8} className={`${campo} w-16`} value={e.formato.atacan} onChange={(ev) => set({ formato: { tipo: "superioridad", atacan: Number(ev.target.value), defienden: (e.formato as { defienden: number }).defienden } })} />
            </Fila>
            <Fila t="Defienden">
              <input type="number" min={1} max={7} className={`${campo} w-16`} value={e.formato.defienden} onChange={(ev) => set({ formato: { tipo: "superioridad", atacan: (e.formato as { atacan: number }).atacan, defienden: Number(ev.target.value) } })} />
            </Fila>
          </>
        )}
      </div>
      <fieldset>
        <legend className={etiqueta}>Niveles</legend>
        <div className="mt-1 flex gap-1">
          {(Object.keys(NOMBRE_NIVEL) as Nivel[]).map((n) => {
            const on = e.niveles.includes(n);
            return (
              <button key={n} type="button" aria-pressed={on} onClick={() => set({ niveles: on ? e.niveles.filter((x) => x !== n) : [...e.niveles, n] })} className={`h-10 flex-1 rounded-card text-label font-semibold ${on ? "bg-ink text-ground" : "bg-raised"}`}>
                {NOMBRE_NIVEL[n]}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="grid grid-cols-2 gap-2">
        <Fila t="Intensidad">
          <select className={campo} value={e.intensidad} onChange={(ev) => set({ intensidad: Number(ev.target.value) as 1 | 2 | 3 })}>
            <option value={1}>1 · Suave</option>
            <option value={2}>2 · Media</option>
            <option value={3}>3 · Fuerte</option>
          </select>
        </Fila>
        <Fila t="Arqueros">
          <select className={campo} value={e.arqueros} onChange={(ev) => set({ arqueros: ev.target.value as Ejercicio["arqueros"] })}>
            <option value="no">No los usa</option>
            <option value="opcional">Opcional</option>
            <option value="requerido">Los necesita</option>
            <option value="arco_chico">Admite arco chico</option>
          </select>
        </Fila>
        <Fila t="Espacio">
          <select className={campo} value={e.espacio} onChange={(ev) => set({ espacio: ev.target.value as Espacio })}>
            {(Object.keys(NOMBRE_ESPACIO) as Espacio[]).map((x) => (
              <option key={x} value={x}>
                {NOMBRE_ESPACIO[x]}
              </option>
            ))}
          </select>
        </Fila>
        <div className="grid grid-cols-2 gap-1">
          <Fila t="Dura mín.">
            <input type="number" min={1} className={campo} value={e.duracion.min} onChange={(ev) => set({ duracion: { ...e.duracion, min: Number(ev.target.value) } })} />
          </Fila>
          <Fila t="máx.">
            <input type="number" min={1} className={campo} value={e.duracion.max} onChange={(ev) => set({ duracion: { ...e.duracion, max: Number(ev.target.value) } })} />
          </Fila>
        </div>
      </div>
      <fieldset>
        <legend className={etiqueta}>Objetivos</legend>
        <div className="mt-1 flex flex-wrap gap-1">
          {(Object.keys(NOMBRE_OBJETIVO) as Objetivo[]).map((o) => {
            const on = e.objetivos.includes(o);
            return (
              <button key={o} type="button" aria-pressed={on} onClick={() => set({ objetivos: on ? e.objetivos.filter((x) => x !== o) : [...e.objetivos, o] })} className={`h-9 rounded-chip px-2 text-meta font-semibold ${on ? "bg-ink text-ground" : "bg-raised"}`}>
                {NOMBRE_OBJETIVO[o]}
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className={etiqueta}>Material</legend>
        <div className="mt-1 flex flex-wrap gap-1">
          {MATERIALES.map(([k, t]) => {
            const on = !!e.material[k];
            return (
              <button key={k} type="button" aria-pressed={on} onClick={() => set({ material: { ...e.material, [k]: on ? 0 : 1 } })} className={`h-9 rounded-chip px-2 text-meta font-semibold ${on ? "bg-ink text-ground" : "bg-raised"}`}>
                {t}
              </button>
            );
          })}
        </div>
      </fieldset>
      <Fila t="Organización">
        <textarea className={area} value={e.organizacion} onChange={(ev) => set({ organizacion: ev.target.value })} placeholder="Cómo se arma: espacio, filas, material." />
      </Fila>
      <Fila t="Consigna">
        <textarea className={area} value={e.consigna} onChange={(ev) => set({ consigna: ev.target.value })} placeholder="Qué tienen que hacer." />
      </Fila>
      <fieldset className="flex flex-col gap-1">
        <legend className={etiqueta}>Puntos clave (hasta 3)</legend>
        {listaFija(e.puntosClave, 3).map((v, i) => (
          <input
            key={i}
            className={campo}
            value={v}
            placeholder={`Punto clave ${i + 1}`}
            onChange={(ev) => {
              const l = listaFija(e.puntosClave, 3);
              l[i] = ev.target.value;
              set({ puntosClave: l.filter((x, k) => x.trim() || k < l.findLastIndex((y) => y.trim())) });
            }}
          />
        ))}
      </fieldset>
      <fieldset className="flex flex-col gap-2">
        <legend className={etiqueta}>Errores comunes y cómo corregirlos</legend>
        {e.errores.map((x, i) => (
          <div key={i} className="flex flex-col gap-1 rounded-card bg-surface p-2">
            <input className={campo} value={x.error} placeholder="Error" onChange={(ev) => set({ errores: e.errores.map((y, k) => (k === i ? { ...y, error: ev.target.value } : y)) })} />
            <input className={campo} value={x.correccion} placeholder="Cómo corregirlo" onChange={(ev) => set({ errores: e.errores.map((y, k) => (k === i ? { ...y, correccion: ev.target.value } : y)) })} />
            <button type="button" onClick={() => set({ errores: e.errores.filter((_, k) => k !== i) })} className="self-end text-meta font-semibold text-danger">
              Sacar
            </button>
          </div>
        ))}
        <button type="button" onClick={() => set({ errores: [...e.errores, { error: "", correccion: "" }] })} className="h-10 rounded-card bg-raised text-label font-semibold">
          + Error común
        </button>
      </fieldset>
      <fieldset className="flex flex-col gap-1">
        <legend className={etiqueta}>Variantes por nivel</legend>
        {(Object.keys(NOMBRE_NIVEL) as Nivel[]).map((n) => (
          <input key={n} className={campo} value={e.variantes[n] ?? ""} placeholder={NOMBRE_NIVEL[n]} onChange={(ev) => set({ variantes: { ...e.variantes, [n]: ev.target.value || undefined } })} />
        ))}
      </fieldset>
      <fieldset className="flex flex-col gap-1">
        <legend className={etiqueta}>Progresión</legend>
        <input className={campo} value={e.progresion?.masFacil ?? ""} placeholder="Más fácil" onChange={(ev) => set({ progresion: { ...e.progresion, masFacil: ev.target.value } })} />
        <input className={campo} value={e.progresion?.masDificil ?? ""} placeholder="Más difícil" onChange={(ev) => set({ progresion: { ...e.progresion, masDificil: ev.target.value } })} />
      </fieldset>
    </form>
  );
}

function Fila({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className={etiqueta}>{t}</span>
      {children}
    </label>
  );
}
