"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useSyncExternalStore } from "react";
import { db } from "../db";
import { alEncolar } from "../sync/cola";
import { nubeSupabase } from "../sync/nube";
import { sincronizar } from "../sync/sincronizar";

/**
 * La nube (Supabase) es opcional: sin `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 * la app anda 100 % local, sin login. Las variables se leen al compilar.
 */
const URL_NUBE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLAVE_NUBE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const NUBE_ACTIVA = Boolean(URL_NUBE && CLAVE_NUBE);

export type Cuenta = { estado: "sin-nube" } | { estado: "cargando" } | { estado: "afuera" } | { estado: "adentro"; uid: string; email: string };
export type EstadoSync = { fase: "quieto" | "sincronizando" | "error" | "sin-senal"; ultimo?: number; mensaje?: string };

let cliente: Promise<SupabaseClient> | null = null;
/** Cliente de Supabase, cargado recién cuando hace falta (no pesa si la nube está apagada). */
export function clienteNube(): Promise<SupabaseClient> | null {
  if (!NUBE_ACTIVA) return null;
  cliente ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(URL_NUBE!, CLAVE_NUBE!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" } }),
  );
  return cliente;
}

// --- Store mínimo (useSyncExternalStore) -----------------------------------------
let cuenta: Cuenta = NUBE_ACTIVA ? { estado: "cargando" } : { estado: "sin-nube" };
const SYNC_INICIAL: EstadoSync = { fase: "quieto" };
let sync: EstadoSync = SYNC_INICIAL;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());
const suscribir = (f: () => void) => {
  oyentes.add(f);
  return () => oyentes.delete(f);
};
const INICIAL: Cuenta = cuenta;

export function useCuenta(): Cuenta {
  return useSyncExternalStore(suscribir, () => cuenta, () => INICIAL);
}
export function useEstadoSync(): EstadoSync {
  return useSyncExternalStore(suscribir, () => sync, () => SYNC_INICIAL);
}

function ponerCuenta(c: Cuenta) {
  cuenta = c;
  avisar();
}
function ponerSync(s: EstadoSync) {
  sync = s;
  avisar();
}

// --- Login con Google ------------------------------------------------------------
export async function iniciarSesion(): Promise<void> {
  const c = await clienteNube();
  if (!c) return;
  const { error } = await c.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/mi-club` } });
  if (error) ponerSync({ ...sync, fase: "error", mensaje: "No se pudo abrir el login de Google." });
}

/** Cierra la sesión en este dispositivo. Lo local queda (local-first). */
export async function cerrarSesion(): Promise<void> {
  const c = await clienteNube();
  if (!c) return;
  await c.auth.signOut({ scope: "local" });
}

// --- Sincronización --------------------------------------------------------------
let corriendo: Promise<void> | null = null;
let otraVez = false;

/** Sincroniza ya. Si ya estaba sincronizando, encadena otra vuelta al terminar. Tira si falla. */
export async function sincronizarAhora(): Promise<void> {
  if (cuenta.estado !== "adentro") throw new Error("Iniciá sesión para sincronizar.");
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    ponerSync({ ...sync, fase: "sin-senal" });
    throw new Error("Sin señal: se sube cuando vuelva.");
  }
  if (corriendo) {
    otraVez = true;
    return corriendo;
  }
  const { uid } = cuenta;
  corriendo = (async () => {
    ponerSync({ ...sync, fase: "sincronizando" });
    try {
      const c = (await clienteNube())!;
      do {
        otraVez = false;
        await sincronizar(db(), nubeSupabase(c, uid), uid);
      } while (otraVez);
      ponerSync({ fase: "quieto", ultimo: Date.now() });
    } catch (e) {
      ponerSync({ ...sync, fase: navigator.onLine ? "error" : "sin-senal", mensaje: e instanceof Error ? e.message : String(e) });
      throw e;
    } finally {
      corriendo = null;
    }
  })();
  return corriendo;
}

const enSilencio = () => void sincronizarAhora().catch(() => {});

let iniciada = false;
/** Arranca la nube una vez: sesión, cambios de cuenta y disparadores de sync. */
export function iniciarNube(): () => void {
  if (!NUBE_ACTIVA || iniciada) return () => {};
  iniciada = true;
  let espera: ReturnType<typeof setTimeout> | undefined;
  const limpiar: (() => void)[] = [];
  void clienteNube()!.then((c) => {
    const { data } = c.auth.onAuthStateChange((_evento, sesion) => {
      const antes = cuenta.estado === "adentro" ? cuenta.uid : null;
      if (sesion?.user) {
        ponerCuenta({ estado: "adentro", uid: sesion.user.id, email: sesion.user.email ?? "" });
        if (antes !== sesion.user.id) setTimeout(enSilencio, 0);
      } else ponerCuenta({ estado: "afuera" });
    });
    limpiar.push(() => data.subscription.unsubscribe());
  });
  // Cada cambio local se sube a los 2 s (agrupa ráfagas de edición); y al volver la señal o la app.
  limpiar.push(
    alEncolar(() => {
      clearTimeout(espera);
      espera = setTimeout(() => cuenta.estado === "adentro" && enSilencio(), 2000);
    }),
  );
  const alVolver = () => cuenta.estado === "adentro" && enSilencio();
  const alVerse = () => document.visibilityState === "visible" && alVolver();
  window.addEventListener("online", alVolver);
  document.addEventListener("visibilitychange", alVerse);
  limpiar.push(() => {
    window.removeEventListener("online", alVolver);
    document.removeEventListener("visibilitychange", alVerse);
  });
  return () => {
    clearTimeout(espera);
    limpiar.forEach((f) => f());
    iniciada = false;
  };
}
