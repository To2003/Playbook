"use client";

import { Cabecera } from "@/components/Cabecera";
import { IconoMas, IconoMenos } from "@/components/iconos";
import { Segmentado } from "@/components/Segmentado";
import { DURACIONES } from "@/lib/duraciones";
import { guardarAjustes, useAjustes } from "@/lib/estado/ajustes";
import { NOMBRE_ESPACIO, NOMBRE_TIPO, hora } from "@/lib/nombres";
import { NUBE_ACTIVA, cerrarSesion, iniciarSesion, sincronizarAhora, useCuenta, useEstadoSync } from "@/lib/nube/cuenta";
import type { Ajustes, Espacio, Material, TipoSesion } from "@/lib/tipos";

const CORTO_ESPACIO: Record<Espacio, string> = { completa: "Completa", media: "Media", cuarto: "Cuarto", area: "Área" };

const MATERIALES: [keyof Material, string][] = [
  ["bochas", "Bochas"],
  ["conos", "Conos o platos"],
  ["vallas", "Vallas"],
  ["aros", "Aros"],
  ["arcosChicos", "Arcos chicos"],
  ["colores", "Juegos de petos"],
];

/** Mi club (SPEC 7): lo que se repite en cada entrenamiento, la cuenta y el tema. */
export default function MiClub() {
  const a = useAjustes();
  return (
    <div className="mx-auto min-h-dvh max-w-[480px] px-4 pb-16 pt-[max(env(safe-area-inset-top),12px)] lg:max-w-[720px]">
      <Cabecera />
      <h1 className="titular mt-1">Mi club</h1>
      <p className="mt-1 text-label text-ink-muted">Lo que cargues acá viene precargado cada vez que armás una sesión.</p>
      {a && (
        <div className="mt-6 flex flex-col gap-8">
          <Bloque titulo="Duración de cada sesión">
            {(Object.keys(DURACIONES) as TipoSesion[]).map((t) => (
              <Segmentado<number>
                key={t}
                leyenda={NOMBRE_TIPO[t]}
                nombre={`duracion-${t}`}
                alto="md"
                marcador
                valor={a.duracion[t]}
                onCambio={(d) => void guardarAjustes({ duracion: { ...a.duracion, [t]: d } })}
                opciones={DURACIONES[t].map((d) => ({ valor: d, etiqueta: d, nombre: `${d} minutos` }))}
              />
            ))}
          </Bloque>

          <Bloque titulo="Cancha y material">
            <Segmentado<Espacio>
              leyenda="Espacio habitual"
              nombre="espacio"
              alto="md"
              valor={a.espacio}
              onCambio={(v) => void guardarAjustes({ espacio: v })}
              opciones={(Object.keys(NOMBRE_ESPACIO) as Espacio[]).map((v) => ({ valor: v, etiqueta: CORTO_ESPACIO[v], nombre: NOMBRE_ESPACIO[v] }))}
            />
            <fieldset>
              <legend className="text-label font-semibold text-ink-muted">Material habitual</legend>
              <ul className="mt-2 flex flex-col divide-y divide-line rounded-card bg-surface">
                {MATERIALES.map(([k, t]) => (
                  <li key={k} className="flex items-center justify-between gap-3 py-1 pl-4 pr-1">
                    <span>{t}</span>
                    <Contador valor={a.material[k] ?? 0} etiqueta={t} onCambio={(n) => void guardarAjustes({ material: { ...a.material, [k]: n } })} />
                  </li>
                ))}
              </ul>
            </fieldset>
          </Bloque>

          <Bloque titulo="Categoría">
            <Segmentado<Ajustes["categoria"]>
              leyenda="Categoría habitual"
              nombre="categoria"
              ocultarLeyenda
              alto="md"
              valor={a.categoria}
              onCambio={(v) => void guardarAjustes({ categoria: v })}
              opciones={[
                { valor: "menores", etiqueta: "Menores" },
                { valor: "juveniles", etiqueta: "Juveniles" },
                { valor: "mayores", etiqueta: "Mayores" },
              ]}
            />
          </Bloque>

          <Bloque titulo="Cuenta">
            <Cuenta />
          </Bloque>

          <Bloque titulo="Tema">
            <Segmentado<Ajustes["tema"]>
              leyenda="Tema"
              nombre="tema"
              ocultarLeyenda
              alto="md"
              valor={a.tema}
              onCambio={(v) => void guardarAjustes({ tema: v })}
              opciones={[
                { valor: "oscuro", etiqueta: "Oscuro" },
                { valor: "claro", etiqueta: "Claro" },
              ]}
            />
            <p className="text-meta text-ink-muted">El modo cancha va siempre en alto contraste, y en el sol lo pasás a blanco desde ahí.</p>
          </Bloque>
        </div>
      )}
    </div>
  );
}

function Cuenta() {
  const c = useCuenta();
  const s = useEstadoSync();
  if (!NUBE_ACTIVA || c.estado === "sin-nube")
    return (
      <p className="rounded-card bg-surface p-4 text-label text-ink-muted">
        Todo queda guardado en este dispositivo y anda sin señal. La cuenta con Google para sincronizar y compartir todavía no está activada en esta instalación.
      </p>
    );
  if (c.estado === "cargando") return <p className="text-label text-ink-muted">Fijándome si ya entraste…</p>;
  if (c.estado === "afuera")
    return (
      <div className="flex flex-col gap-2 rounded-card bg-surface p-4">
        <p className="text-label text-ink-muted">Sin cuenta todo queda en este dispositivo. Con tu cuenta de Google se sincroniza entre el celu y la compu, y podés compartir ejercicios por link.</p>
        <button type="button" onClick={() => void iniciarSesion()} className="pressable btn-primary h-12 px-4">
          Entrar con Google
        </button>
      </div>
    );
  const texto =
    s.fase === "sincronizando"
      ? "Sincronizando…"
      : s.fase === "sin-senal"
        ? "Sin señal: lo nuevo se sube cuando vuelva."
        : s.fase === "error"
          ? `No se pudo sincronizar: ${s.mensaje ?? "probá de nuevo"}.`
          : s.ultimo
            ? `Sincronizado a las ${hora(s.ultimo)}.`
            : "Listo para sincronizar.";
  return (
    <div className="flex flex-col gap-3 rounded-card bg-surface p-4">
      <p className="text-label">
        Entraste como <strong className="font-semibold">{c.email}</strong>
      </p>
      <p role="status" className={`text-label ${s.fase === "error" ? "text-danger" : "text-ink-muted"}`}>
        {texto}
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void sincronizarAhora().catch(() => {})} disabled={s.fase === "sincronizando"} className="pressable btn-secondary h-12 px-4">
          Sincronizar ahora
        </button>
        <button type="button" onClick={() => void cerrarSesion()} className="pressable h-12 rounded-card px-4 font-semibold text-ink-muted">
          Salir
        </button>
      </div>
    </div>
  );
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4" aria-label={titulo}>
      <h2 className="text-title font-[650]">{titulo}</h2>
      {children}
    </section>
  );
}

function Contador({ valor, etiqueta, onCambio }: { valor: number; etiqueta: string; onCambio: (n: number) => void }) {
  return (
    <span className="flex items-center gap-1">
      <button type="button" aria-label={`Menos ${etiqueta.toLowerCase()}`} onClick={() => onCambio(Math.max(0, valor - 1))} disabled={valor === 0} className="pressable grid size-12 place-items-center rounded-card disabled:opacity-35">
        <IconoMenos tam={20} />
      </button>
      <span className="marcador w-[2.5ch] text-center text-[1.5rem]" aria-live="polite">
        {valor}
      </span>
      <button type="button" aria-label={`Más ${etiqueta.toLowerCase()}`} onClick={() => onCambio(Math.min(99, valor + 1))} className="pressable grid size-12 place-items-center rounded-card">
        <IconoMas tam={20} />
      </button>
    </span>
  );
}
