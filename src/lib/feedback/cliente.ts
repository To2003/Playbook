"use client";

import { useSyncExternalStore } from "react";
import { evento } from "../analytics";
import { db } from "../db";
import { leerContadores, sumarContador, type Contador } from "./contadores";
import { enviarFeedback, vaciarCola, type Deps, type Resultado } from "./envio";
import { leerConfig, resumirUA, type Origen, type Respuesta, type Tecnico } from "./modelo";

/** Las variables se leen al compilar (NEXT_PUBLIC). Sin Form, el envío cae a WhatsApp o al portapapeles. */
export const CONFIG_FEEDBACK = leerConfig({
  url: process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL,
  entries: process.env.NEXT_PUBLIC_FEEDBACK_ENTRIES,
  whatsapp: process.env.NEXT_PUBLIC_FEEDBACK_WHATSAPP,
});

function deps(): Deps {
  return {
    base: db(),
    fetch: (...a) => window.fetch(...a),
    online: () => navigator.onLine,
    abrir: (url) => void window.open(url, "_blank", "noopener"),
    copiar: (texto) => navigator.clipboard.writeText(texto),
  };
}

export async function tecnicoActual(): Promise<Tecnico> {
  const c = await leerContadores(db()).catch(() => ({ sesiones: 0, cancha: 0, propios: 0 }));
  const pwa = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return { version: process.env.NEXT_PUBLIC_APP_VERSION || "dev", dispositivo: resumirUA(navigator.userAgent), pwa, ...c };
}

export async function mandarFeedback(r: Respuesta, nombreEjercicio?: string): Promise<Resultado> {
  const res = await enviarFeedback(r, await tecnicoActual(), CONFIG_FEEDBACK, deps(), nombreEjercicio);
  const via = res === "enviado" ? "form" : res === "pendiente" ? "cola" : res === "whatsapp" ? "whatsapp" : "portapapeles";
  evento({ nombre: "feedback_enviado", datos: { via, rapida: !!r.calificacion && !r.seguiria } });
  return res;
}

/** Suma un contador de uso. Nunca rompe lo que se estaba haciendo. */
export function contar(c: Contador): void {
  void sumarContador(db(), c).catch(() => {});
}

/** Manda lo que quedó en la cola al volver la señal (y una vez al arrancar), sin recargar. */
export function iniciarColaFeedback(): () => void {
  const vaciar = () => void vaciarCola(db(), deps().fetch, () => navigator.onLine).catch(() => {});
  vaciar();
  window.addEventListener("online", vaciar);
  return () => window.removeEventListener("online", vaciar);
}

// --- Qué formulario está abierto ----------------------------------------------------
export interface Apertura {
  origen: Origen;
  ejercicioId?: string;
  calificacion?: number;
}
let abierto: Apertura | null = null;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());

export function abrirFeedback(a: Apertura): void {
  abierto = a;
  avisar();
}
export function cerrarFeedback(): void {
  abierto = null;
  avisar();
}
export function useFeedbackAbierto(): Apertura | null {
  return useSyncExternalStore(
    (f) => {
      oyentes.add(f);
      return () => oyentes.delete(f);
    },
    () => abierto,
    () => null,
  );
}
