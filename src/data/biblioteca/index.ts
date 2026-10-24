import { APLICADO } from "./aplicado";
import { APLICADO_2 } from "./aplicado-2";
import { TAREAS_ARQUERO_BASE } from "./arqueros";
import { TAREAS_ARQUERO_2 } from "./arqueros-2";
import { CALOR_CON_BOCHA } from "./calor-con-bocha";
import { CALOR_CON_BOCHA_2 } from "./calor-con-bocha-2";
import { CALOR_SIN_BOCHA } from "./calor-sin-bocha";
import { CALOR_SIN_BOCHA_2 } from "./calor-sin-bocha-2";
import { PRINCIPAL } from "./principal";
import { PRINCIPAL_2 } from "./principal-2";
import { VUELTA_CALMA } from "./vuelta-calma";
import { VUELTA_CALMA_2 } from "./vuelta-calma-2";
import type { Ejercicio } from "@/lib/tipos";

/** Biblioteca base: viaja empaquetada en la app y anda offline desde la primera carga. */
export const EJERCICIOS_BASE: Ejercicio[] = [...CALOR_SIN_BOCHA, ...CALOR_SIN_BOCHA_2, ...CALOR_CON_BOCHA, ...CALOR_CON_BOCHA_2, ...PRINCIPAL, ...PRINCIPAL_2, ...APLICADO, ...APLICADO_2, ...VUELTA_CALMA, ...VUELTA_CALMA_2];
export const TAREAS_ARQUERO: Ejercicio[] = [...TAREAS_ARQUERO_BASE, ...TAREAS_ARQUERO_2];
export const BIBLIOTECA: Ejercicio[] = [...EJERCICIOS_BASE, ...TAREAS_ARQUERO];

const porId = new Map(BIBLIOTECA.map((e) => [e.id, e]));
export const ejercicioBase = (id: string) => porId.get(id);
