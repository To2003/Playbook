import { APLICADO } from "./aplicado";
import { TAREAS_ARQUERO_BASE } from "./arqueros";
import { CALOR_CON_BOCHA } from "./calor-con-bocha";
import { CALOR_SIN_BOCHA } from "./calor-sin-bocha";
import { PRINCIPAL } from "./principal";
import { VUELTA_CALMA } from "./vuelta-calma";
import type { Ejercicio } from "@/lib/tipos";

/** Biblioteca base: viaja empaquetada en la app y anda offline desde la primera carga. */
export const EJERCICIOS_BASE: Ejercicio[] = [...CALOR_SIN_BOCHA, ...CALOR_CON_BOCHA, ...PRINCIPAL, ...APLICADO, ...VUELTA_CALMA];
export const TAREAS_ARQUERO: Ejercicio[] = TAREAS_ARQUERO_BASE;
export const BIBLIOTECA: Ejercicio[] = [...EJERCICIOS_BASE, ...TAREAS_ARQUERO];

const porId = new Map(BIBLIOTECA.map((e) => [e.id, e]));
export const ejercicioBase = (id: string) => porId.get(id);
