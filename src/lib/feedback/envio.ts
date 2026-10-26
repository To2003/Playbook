import type { PlaybookDB } from "../db";
import { armarCuerpo, textoFeedback, type ConfigFeedback, type Respuesta, type Tecnico } from "./modelo";

export type Resultado = "enviado" | "pendiente" | "whatsapp" | "copiado" | "manual";

/** Lo que el envío necesita del navegador (en los tests, dobles). */
export interface Deps {
  base: PlaybookDB;
  fetch: typeof fetch;
  online: () => boolean;
  abrir: (url: string) => void;
  copiar: (texto: string) => Promise<void>;
}

/** POST al Google Form. Con `no-cors` la respuesta es opaca: si no tira error, se cuenta como enviado. */
function postear(f: typeof fetch, url: string, cuerpo: string) {
  return f(url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }, body: cuerpo });
}

/**
 * Manda una respuesta por el mejor camino disponible:
 * Google Form → (sin señal) cola local → (sin Form) WhatsApp → (sin WhatsApp) portapapeles.
 */
export async function enviarFeedback(r: Respuesta, t: Tecnico, config: ConfigFeedback, deps: Deps, nombreEjercicio?: string): Promise<Resultado> {
  if (config.form) {
    const cuerpo = armarCuerpo(r, t, config.form.entries, nombreEjercicio).toString();
    if (!deps.online()) {
      await encolar(deps.base, config.form.url, cuerpo);
      return "pendiente";
    }
    try {
      await postear(deps.fetch, config.form.url, cuerpo);
      return "enviado";
    } catch {
      await encolar(deps.base, config.form.url, cuerpo);
      return "pendiente";
    }
  }
  const texto = textoFeedback(r, t, nombreEjercicio);
  if (config.whatsapp) {
    deps.abrir(`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(texto)}`);
    return "whatsapp";
  }
  try {
    await deps.copiar(texto);
    return "copiado";
  } catch {
    return "manual";
  }
}

export async function encolar(base: PlaybookDB, url: string, cuerpo: string): Promise<void> {
  await base.feedback.add({ url, cuerpo, creado: Date.now() });
}

let vaciando: Promise<number> | null = null;

/**
 * Manda lo pendiente, en orden. Se borra de la cola solo lo que salió; ante el primer error
 * (se fue la señal de nuevo) corta y queda para la próxima. Devuelve cuántas salieron.
 */
export function vaciarCola(base: PlaybookDB, f: typeof fetch, online: () => boolean): Promise<number> {
  vaciando ??= (async () => {
    let enviadas = 0;
    try {
      const pendientes = await base.feedback.orderBy("id").toArray();
      for (const p of pendientes) {
        if (!online()) break;
        try {
          await postear(f, p.url, p.cuerpo);
        } catch {
          break;
        }
        await base.feedback.delete(p.id!);
        enviadas++;
      }
    } finally {
      vaciando = null;
    }
    return enviadas;
  })();
  return vaciando;
}
