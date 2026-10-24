import { aplicable } from "./motor/division";
import type { Ejercicio, Fase, Nivel } from "./tipos";

const FASES: Fase[] = ["calor_sin_bocha", "calor_con_bocha", "principal", "aplicado", "vuelta_calma", "arquero"];
const NIVELES: Nivel[] = ["inicial", "intermedio", "avanzado"];
const TIPOS_ELEMENTO = new Set(["jugador", "arquero", "bocha", "cono", "valla", "aro", "arco_chico", "zona", "texto"]);
const TIPOS_TRAZO = new Set(["desplazamiento", "conduccion", "pase", "tiro"]);

const dentroDeLaCancha = (x: number, y: number) => x >= -3 && x <= 94.4 && y >= -3 && y <= 58;

/**
 * Reglas de 5.1 y 5.2 del SPEC. `propio` relaja lo que un borrador del celu todavía no tiene.
 * Devuelve la lista de problemas (vacía si está bien).
 */
export function validarEjercicio(e: Ejercicio, opciones: { base?: boolean } = {}): string[] {
  const base = opciones.base ?? e.autor === "base";
  const err: string[] = [];
  const di = (m: string) => err.push(`${e.id || "(sin id)"}: ${m}`);

  if (!e.id) di("falta el id");
  if (!e.nombre?.trim()) di("falta el nombre");
  if (!FASES.includes(e.fase)) di(`fase inválida: ${e.fase}`);
  if (!(e.jugadores?.min >= 1) || !(e.jugadores.max >= e.jugadores.min) || e.jugadores.max > 30) di(`rango de jugadores inválido: ${JSON.stringify(e.jugadores)}`);
  if (!e.formato) di("falta el formato");
  else if (e.formato.tipo === "grupos" && !(e.formato.k >= 2)) di("grupos con k < 2");
  else if (e.formato.tipo === "superioridad" && !(e.formato.atacan > e.formato.defienden && e.formato.defienden >= 1)) di("superioridad mal armada");
  if (!e.niveles?.length || e.niveles.some((n) => !NIVELES.includes(n))) di("niveles inválidos");
  if (![1, 2, 3].includes(e.intensidad)) di("intensidad fuera de 1–3");
  if (!["no", "opcional", "requerido", "arco_chico"].includes(e.arqueros)) di("arqueros inválido");

  // Pizarra
  const pz = e.pizarra;
  if (!pz?.pasos?.length) di("la pizarra no tiene pasos");
  else {
    if (pz.pasos.length > 12) di("más de 12 pasos");
    const ids = new Set<string>();
    for (const el of pz.elementos) {
      if (ids.has(el.id)) di(`elemento repetido: ${el.id}`);
      ids.add(el.id);
      if (!TIPOS_ELEMENTO.has(el.tipo)) di(`tipo de elemento inválido: ${el.tipo}`);
      if (el.tipo === "zona" && !el.tam) di(`zona sin tamaño: ${el.id}`);
    }
    pz.pasos.forEach((paso, i) => {
      for (const id of ids) if (!paso.posiciones[id]) di(`paso ${i + 1}: ${id} no tiene posición`);
      for (const [id, q] of Object.entries(paso.posiciones)) {
        if (!ids.has(id)) di(`paso ${i + 1}: posición de un elemento que no existe (${id})`);
        if (!dentroDeLaCancha(q.x, q.y)) di(`paso ${i + 1}: ${id} fuera de la cancha`);
      }
      for (const t of paso.trazos) {
        if (!TIPOS_TRAZO.has(t.tipo)) di(`paso ${i + 1}: trazo inválido`);
        if (!ids.has(t.elementoId)) di(`paso ${i + 1}: trazo de un elemento que no existe (${t.elementoId})`);
        const el = pz.elementos.find((x) => x.id === t.elementoId);
        if (el && (t.tipo === "pase" || t.tipo === "tiro") && el.tipo !== "bocha") di(`paso ${i + 1}: un ${t.tipo} tiene que mover la bocha`);
        if (el && (t.tipo === "desplazamiento" || t.tipo === "conduccion") && el.tipo !== "jugador" && el.tipo !== "arquero") di(`paso ${i + 1}: ${t.tipo} de algo que no es un jugador`);
      }
      if (i === pz.pasos.length - 1 && paso.trazos.length) di("el último paso no lleva trazos (no hay paso siguiente)");
    });
  }

  if (!base) return err;

  // Ficha completa (biblioteca base)
  if (!e.organizacion?.trim()) di("falta la organización");
  if (!e.consigna?.trim()) di("falta la consigna");
  if (e.puntosClave?.length !== 3) di(`tiene que tener exactamente 3 puntos clave (tiene ${e.puntosClave?.length ?? 0})`);
  if (!(e.errores?.length >= 2) || e.errores.some((x) => !x.error?.trim() || !x.correccion?.trim())) di("al menos 2 errores comunes, cada uno con su corrección");
  if (!(e.duracion?.min >= 1) || !(e.duracion.max >= e.duracion.min)) di("duración sugerida inválida");
  if (!e.categorias?.length) di("faltan categorías");
  if (pz && (pz.pasos.length < 2 || pz.pasos.length > 6)) di(`la pizarra base va de 2 a 6 pasos (tiene ${pz.pasos.length})`);
  if (pz && !pz.pasos.some((x) => x.trazos.length)) di("la pizarra no anima nada (ningún trazo)");
  if (e.fase === "arquero" && e.arqueros !== "requerido") di("una tarea de arquero los requiere");
  if (e.fase !== "arquero" && !e.objetivos) di("faltan objetivos");

  // Sin consejos médicos: si habla de dolor o lesión, deriva a un profesional.
  const texto = [e.organizacion, e.consigna, ...e.puntosClave, ...e.errores.flatMap((x) => [x.error, x.correccion])].join(" ").toLowerCase();
  if (/(dolor|lesi[oó]n|molestia)/.test(texto) && !/(profesional|m[eé]dic|kinesi)/.test(texto)) di("habla de dolor o lesión sin derivar a un profesional");

  return err;
}

/**
 * Cobertura de la biblioteca (SPEC 5.2): en cada fase, para cada nivel y cada cantidad
 * de 4 a 30, tiene que haber con qué armar el bloque (2 opciones en principal y aplicado,
 * que pueden llevar dos ejercicios), también con 0 arqueros.
 */
export function validarBiblioteca(lista: Ejercicio[], opciones: { completa?: boolean } = {}): string[] {
  const err = lista.flatMap((e) => validarEjercicio(e, { base: true }));
  const ids = new Set<string>();
  for (const e of lista) {
    if (ids.has(e.id)) err.push(`id repetido: ${e.id}`);
    ids.add(e.id);
  }
  const fases: Fase[] = ["calor_sin_bocha", "calor_con_bocha", "principal", "aplicado", "vuelta_calma"];
  for (const fase of fases) {
    const necesarios = fase === "principal" || fase === "aplicado" ? 2 : 1;
    for (const nivel of NIVELES) {
      for (let n = 4; n <= 30; n++) {
        for (const conArqueros of [false, true]) {
          const sirven = lista.filter(
            (e) => e.fase === fase && e.niveles.includes(nivel) && aplicable(e, n) && (conArqueros || e.arqueros !== "requerido"),
          );
          if (sirven.length < necesarios) err.push(`cobertura: ${fase}/${nivel} con ${n} ${conArqueros ? "con" : "sin"} arqueros tiene ${sirven.length}`);
          // Con intensidad suave, los bloques 3 y 4 piden intensidad ≤ 2.
          if ((fase === "principal" || fase === "aplicado") && sirven.filter((e) => e.intensidad <= 2).length < necesarios)
            err.push(`cobertura suave: ${fase}/${nivel} con ${n} ${conArqueros ? "con" : "sin"} arqueros`);
        }
      }
    }
  }
  const tareas = lista.filter((e) => e.fase === "arquero");
  if (tareas.length < 4) err.push(`faltan tareas de arquero (hay ${tareas.length})`);
  if (opciones.completa) {
    const objetivo: Record<Fase, number> = { calor_sin_bocha: 10, calor_con_bocha: 14, principal: 14, aplicado: 14, vuelta_calma: 8, arquero: 8 };
    for (const f of FASES) {
      const hay = lista.filter((e) => e.fase === f).length;
      if (hay < objetivo[f]) err.push(`distribución 5.2: ${f} tiene ${hay}, se esperan ${objetivo[f]}`);
    }
  }
  return err;
}
