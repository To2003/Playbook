"use client";

import { useEffect, useRef, useState } from "react";
import { IconoCerrar } from "@/components/iconos";
import { Segmentado } from "@/components/Segmentado";
import { useBiblioteca } from "@/lib/estado/sesiones";
import { cerrarFeedback, mandarFeedback, tecnicoActual, useFeedbackAbierto, type Apertura } from "@/lib/feedback/cliente";
import type { Resultado } from "@/lib/feedback/envio";
import { CATEGORIAS, ESCALA, SEGUIRIA, USOS, faltantes, respuestaVacia, textoFeedback, type Respuesta } from "@/lib/feedback/modelo";
import { NOMBRE_FASE } from "@/lib/nombres";
import type { Fase } from "@/lib/tipos";

/** Montada una sola vez (en Proveedores): se abre desde cualquier pantalla con `abrirFeedback`. */
export function Feedback() {
  const apertura = useFeedbackAbierto();
  if (!apertura) return null;
  // La key reinicia el formulario cada vez que se abre.
  return <Hoja key={`${apertura.origen}-${apertura.ejercicioId ?? ""}-${apertura.calificacion ?? ""}`} apertura={apertura} />;
}

type Pregunta = "categorias" | "usos" | "tal_cual" | "seguiria";
const campo = "w-full rounded-card bg-raised px-3 text-body text-ink placeholder:text-ink-faint";

function Hoja({ apertura }: { apertura: Apertura }) {
  const biblioteca = useBiblioteca();
  const [r, setR] = useState<Respuesta>(() => ({ ...respuestaVacia(apertura.origen), ejercicioId: apertura.ejercicioId, calificacion: apertura.calificacion }));
  const [errores, setErrores] = useState<Pregunta[]>([]);
  const [estado, setEstado] = useState<"llenando" | "mandando" | Resultado>("llenando");
  const [visible, setVisible] = useState(false);
  const [textoCopiar, setTextoCopiar] = useState<string>();
  const hoja = useRef<HTMLDivElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const previo = useRef<Element | null>(null);
  const cambiar = (c: Partial<Respuesta>) => {
    setR((x) => ({ ...x, ...c }));
    setErrores([]);
  };
  const nombreEjercicio = r.ejercicioId ? biblioteca.find((e) => e.id === r.ejercicioId)?.nombre : undefined;

  // Al abrir: entra la hoja, el foco va al título y la página de atrás no scrollea. Al cerrar, el foco vuelve.
  useEffect(() => {
    previo.current = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => setVisible(true));
    titulo.current?.focus();
    const tecla = (ev: KeyboardEvent) => ev.key === "Escape" && cerrarFeedback();
    window.addEventListener("keydown", tecla);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", tecla);
      (previo.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  // Si viene de la ficha, la pregunta 4 queda a la vista.
  useEffect(() => {
    if (apertura.ejercicioId) document.getElementById("fb-ejercicio-elegido")?.scrollIntoView({ block: "center" });
  }, [apertura.ejercicioId]);

  const mandar = async () => {
    const f = faltantes(r);
    if (f.length) {
      setErrores(f);
      requestAnimationFrame(() => document.getElementById(`fb-p-${f[0]}`)?.focus());
      return;
    }
    setEstado("mandando");
    const res = await mandarFeedback(r, nombreEjercicio);
    if (res === "manual") setTextoCopiar(textoFeedback(r, await tecnicoActual(), nombreEjercicio));
    setEstado(res);
  };

  const fases = Object.keys(NOMBRE_FASE) as Fase[];
  const falta = (p: Pregunta) => errores.includes(p);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center lg:items-center" role="presentation">
      <div
        aria-hidden="true"
        onClick={cerrarFeedback}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-[var(--dur-base)] ease-[var(--ease-out)] ${visible ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={hoja}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fb-titulo"
        className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[14px] border-t border-line bg-ground lg:border transition-[transform,opacity] duration-[var(--dur-slow)] ease-[var(--ease-out)] motion-reduce:transition-opacity lg:max-h-[86dvh] lg:max-w-[560px] lg:rounded-card ${
          visible ? "translate-y-0 opacity-100 lg:scale-100" : "translate-y-full opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-0 lg:translate-y-0 lg:scale-[.97] lg:opacity-0"
        }`}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line lg:hidden" aria-hidden="true" />
        <header className="flex shrink-0 items-start justify-between gap-3 px-4 pb-2 pt-3 lg:px-6 lg:pt-5">
          <div>
            <h2 id="fb-titulo" ref={titulo} tabIndex={-1} className="titular outline-none">
              Contanos qué onda
            </h2>
            {estado === "llenando" && <p className="mt-1 text-label text-ink-muted">Es un minuto y nos ayudás un montón.</p>}
          </div>
          <button type="button" onClick={cerrarFeedback} aria-label="Cerrar" className="pressable -mr-2 grid size-12 shrink-0 place-items-center rounded-card">
            <IconoCerrar />
          </button>
        </header>

        {estado === "llenando" || estado === "mandando" ? (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(ev) => {
              ev.preventDefault();
              void mandar();
            }}
            noValidate
          >
            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-4 lg:px-6">
              {apertura.calificacion && (
                <p className="rounded-card bg-raised px-3 py-2 text-label">
                  Le pusiste <strong className="marcador text-[1.25rem]">{apertura.calificacion}</strong> a la sesión. Contanos el resto:
                </p>
              )}

              <Pregunta n={1} id="categorias" titulo="¿Qué categoría entrenás?" nota="Podés marcar varias." falta={falta("categorias")}>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS.map((c) => {
                    const on = r.categorias.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={on}
                        onClick={() => cambiar({ categorias: on ? r.categorias.filter((x) => x !== c) : [...r.categorias, c] })}
                        className={`pressable h-12 rounded-chip px-4 text-label font-semibold ${on ? "bg-ink text-ground" : "bg-raised text-ink"}`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </Pregunta>

              <Pregunta n={2} id="usos" titulo="¿Cuántas veces la usaste en la cancha?" falta={falta("usos")}>
                <Segmentado leyenda="Veces en la cancha" nombre="fb-usos" ocultarLeyenda alto="md" valor={r.usos ?? ""} onCambio={(v) => cambiar({ usos: v })} opciones={USOS.map((u) => ({ valor: u, etiqueta: u, nombre: u === "4 o más" ? "4 o más veces" : `${u} veces` }))} />
              </Pregunta>

              <Pregunta n={3} id="tal_cual" titulo="¿La sesión que te armó la usarías tal cual?" falta={falta("tal_cual")}>
                <Segmentado
                  leyenda="Tal cual"
                  nombre="fb-tal-cual"
                  ocultarLeyenda
                  alto="md"
                  marcador
                  valor={r.talCual ?? 0}
                  onCambio={(v) => cambiar({ talCual: v })}
                  opciones={([1, 2, 3, 4, 5] as const).map((n) => ({ valor: n, etiqueta: n, nombre: `${n}: ${ESCALA[n]}` }))}
                />
                <div className="mt-1 flex justify-between text-meta text-ink-muted" aria-hidden="true">
                  <span>Ni loco</span>
                  <span>Tal cual</span>
                </div>
              </Pregunta>

              <Pregunta n={4} id="ejercicio" titulo="¿Algún ejercicio te pareció malo o mal explicado?" nota="Opcional.">
                <label className="sr-only" htmlFor="fb-ejercicio-elegido">
                  Ejercicio
                </label>
                <select id="fb-ejercicio-elegido" value={r.ejercicioId ?? ""} onChange={(ev) => cambiar({ ejercicioId: ev.target.value || undefined })} className={`${campo} h-12`}>
                  <option value="">Elegí el ejercicio (opcional)</option>
                  {fases.map((f) => (
                    <optgroup key={f} label={NOMBRE_FASE[f]}>
                      {biblioteca
                        .filter((e) => e.fase === f)
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.nombre}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                <label className="sr-only" htmlFor="fb-ejercicio-malo">
                  Qué tenía de malo
                </label>
                <textarea id="fb-ejercicio-malo" name="ejercicio_malo" value={r.ejercicioMalo} onChange={(ev) => cambiar({ ejercicioMalo: ev.target.value })} placeholder="Qué tenía de malo: no se entiende, no sale con mi grupo…" className={`${campo} mt-2 min-h-20 py-2`} />
              </Pregunta>

              <Pregunta n={5} id="falto" titulo="¿Qué te faltó?" nota="Opcional.">
                <label className="sr-only" htmlFor="fb-falto">
                  Qué te faltó
                </label>
                <textarea id="fb-falto" name="falto" value={r.falto} onChange={(ev) => cambiar({ falto: ev.target.value })} placeholder="Un ejercicio, una opción, algo que no encontraste…" className={`${campo} min-h-20 py-2`} />
              </Pregunta>

              <Pregunta n={6} id="seguiria" titulo="¿La seguirías usando?" falta={falta("seguiria")}>
                <Segmentado leyenda="La seguirías usando" nombre="fb-seguiria" ocultarLeyenda alto="md" valor={r.seguiria ?? ""} onCambio={(v) => cambiar({ seguiria: v })} opciones={SEGUIRIA.map((s) => ({ valor: s, etiqueta: s }))} />
                <label className="sr-only" htmlFor="fb-por-que">
                  Por qué
                </label>
                <textarea id="fb-por-que" name="por_que" value={r.porQue} onChange={(ev) => cambiar({ porQue: ev.target.value })} placeholder="¿Por qué? (opcional)…" className={`${campo} mt-2 min-h-16 py-2`} />
              </Pregunta>

              <Pregunta n={7} id="contacto" titulo="Tu nombre o apodo y club" nota="Solo si querés que te escribamos.">
                <label className="sr-only" htmlFor="fb-contacto">
                  Nombre o apodo y club
                </label>
                <input id="fb-contacto" name="contacto" autoComplete="off" value={r.contacto} onChange={(ev) => cambiar({ contacto: ev.target.value })} placeholder="Ej.: Caro, Club Atlético…" className={`${campo} h-12`} />
              </Pregunta>
            </div>

            <div className="shrink-0 border-t border-line px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 lg:px-6 lg:pb-5">
              {errores.length > 0 && (
                <p role="alert" className="mb-2 text-label font-semibold text-danger">
                  Te faltan {errores.length === 1 ? "una pregunta" : `${errores.length} preguntas`} de las que tienen *.
                </p>
              )}
              <button type="submit" disabled={estado === "mandando"} className="pressable btn-primary h-14 w-full text-title">
                {estado === "mandando" ? "Mandando…" : "Mandar"}
              </button>
              <p className="mt-2 text-center text-meta text-ink-muted">Se adjunta info técnica de la app, nada personal.</p>
            </div>
          </form>
        ) : (
          <Gracias resultado={estado} texto={textoCopiar} />
        )}
      </div>
    </div>
  );
}

function Pregunta({ n, id, titulo, nota, falta, children }: { n: number; id: string; titulo: string; nota?: string; falta?: boolean; children: React.ReactNode }) {
  const obligatoria = nota === undefined || nota.startsWith("Podés");
  return (
    <fieldset id={`fb-p-${id}`} tabIndex={-1} aria-invalid={falta || undefined} className="scroll-mt-4 outline-none">
      <legend className="flex w-full items-baseline gap-2 text-body font-semibold">
        <span className="marcador text-[1.25rem] text-ink-faint">{n}</span>
        <span className="flex-1">
          {titulo}
          {obligatoria && (
            <span className="text-ink-muted" aria-label="obligatoria">
              {" "}
              *
            </span>
          )}
        </span>
      </legend>
      {nota && <p className="-mt-0.5 mb-2 pl-6 text-meta text-ink-muted">{nota}</p>}
      <div className={nota ? "" : "mt-2"}>{children}</div>
      {falta && <p className="mt-1 text-meta font-semibold text-danger">Falta esta.</p>}
    </fieldset>
  );
}

export function Gracias({ resultado, texto, compacto }: { resultado: Resultado; texto?: string; compacto?: boolean }) {
  const extra =
    resultado === "pendiente"
      ? "Lo mandamos cuando vuelva la señal."
      : resultado === "whatsapp"
        ? "Te abrimos WhatsApp con tus respuestas: mandá el mensaje desde ahí."
        : resultado === "copiado"
          ? "Copiamos tus respuestas: pegalas en un mensaje y mandánoslas."
          : resultado === "manual"
            ? "Copiá tus respuestas y mandánoslas por mensaje:"
            : undefined;
  return (
    <div role="status" className={compacto ? "" : "flex flex-col gap-3 px-4 pb-[max(env(safe-area-inset-bottom),20px)] pt-2 lg:px-6 lg:pb-6"}>
      <p className={`marcador ${compacto ? "text-[2rem]" : "text-[2.75rem]"} leading-none`}>¡Gracias, crack!</p>
      <p className="text-title font-semibold">Lo leemos todo.</p>
      {extra && <p className="text-body text-ink-muted">{extra}</p>}
      {texto && <textarea readOnly value={texto} onFocus={(ev) => ev.currentTarget.select()} aria-label="Tus respuestas" className={`${campo} min-h-40 py-2 text-label`} />}
      {!compacto && (
        <button type="button" onClick={cerrarFeedback} className="pressable btn-secondary mt-2 h-12">
          Listo
        </button>
      )}
    </div>
  );
}
