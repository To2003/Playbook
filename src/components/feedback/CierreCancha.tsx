"use client";

import { useState } from "react";
import { CONFIG_FEEDBACK, abrirFeedback, mandarFeedback } from "@/lib/feedback/cliente";
import type { Resultado } from "@/lib/feedback/envio";
import { respuestaVacia } from "@/lib/feedback/modelo";
import { vibrar } from "@/lib/vibrar";

/**
 * Cierre del modo cancha: "¡Terminó el entrenamiento!" con una calificación rápida (1 a 5),
 * "Contame más" para el formulario completo y "Saltear" para irse con un toque.
 * Sigue en alto contraste: se usa en la cancha, al sol.
 */
export function CierreCancha({ sol, onInicio }: { sol: boolean; onInicio: () => void }) {
  const [nota, setNota] = useState<number>();
  const [resultado, setResultado] = useState<Resultado | "anotado">();

  const calificar = async (n: number) => {
    vibrar(10);
    setNota(n);
    // La calificación sola viaja por el Google Form (o su cola). Sin Form no tiene sentido abrir
    // WhatsApp por un número: queda anotada y viaja si se abre "Contame más".
    setResultado(CONFIG_FEEDBACK.form ? await mandarFeedback({ ...respuestaVacia("cierre"), calificacion: n }) : "anotado");
  };

  return (
    <div data-mode="cancha" data-sol={sol} className="grid min-h-dvh place-items-center bg-ground p-6 pb-[max(env(safe-area-inset-bottom),24px)]">
      <div className="w-full max-w-[480px]">
        <h1 className="marcador text-[3.75rem] leading-[0.95]">¡Terminó el entrenamiento!</h1>
        <p className="mt-2 text-[1.25rem] font-semibold">Buen entrenamiento. Elongá y a la ducha.</p>

        <fieldset className="mt-8">
          <legend className="text-[1.5rem] font-semibold">¿Cómo te fue con la sesión?</legend>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={nota === n}
                aria-label={`${n} de 5`}
                disabled={resultado !== undefined && nota !== n}
                onClick={() => void calificar(n)}
                className={`pressable marcador h-[72px] rounded-card text-[2.25rem] disabled:opacity-40 ${nota === n ? "bg-ink text-ground" : "bg-raised"}`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-label text-ink-muted" aria-hidden="true">
            <span>Mal</span>
            <span>Bárbaro</span>
          </div>
        </fieldset>

        <p role="status" className="mt-4 min-h-[1.5em] text-[1.125rem] font-semibold">
          {resultado === "pendiente" ? "¡Gracias, crack! Lo mandamos cuando vuelva la señal." : resultado === "anotado" ? "Anotado. Si querés, contanos más." : resultado ? "¡Gracias, crack! Lo leemos todo." : ""}
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {resultado ? (
            <button type="button" onClick={onInicio} className="pressable btn-primary h-[80px] w-full text-[1.5rem]">
              Volver al inicio
            </button>
          ) : null}
          <button type="button" onClick={() => abrirFeedback({ origen: "cierre", calificacion: nota })} className="pressable btn-secondary h-16 w-full text-title">
            Contame más
          </button>
          {!resultado && (
            <button type="button" onClick={onInicio} className="pressable h-14 w-full rounded-card text-title font-semibold text-ink-muted">
              Saltear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
