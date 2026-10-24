import { A, E, K, bocha, conduce, cono, corre, ejercicio, muchos, p, pasa, pegada, pizarra } from "./armar";
import type { Ejercicio } from "@/lib/tipos";

/** Base común de las tareas de arquero: trabajo paralelo simple, uno o dos arqueros. */
const tarea = {
  fase: "arquero" as const,
  jugadores: { min: 1, max: 2 },
  formato: { tipo: "individual" as const },
  arqueros: "requerido" as const,
  objetivos: [],
  espacio: "area" as const,
};

export const TAREAS_ARQUERO_BASE: Ejercicio[] = [
  ejercicio({
    ...tarea,
    id: "arq-desplazamientos-laterales",
    nombre: "Desplazamientos laterales entre platos",
    intensidad: 2,
    material: { conos: 5 },
    duracion: { min: 5, max: 15 },
    organizacion: "Cinco platos en semicírculo a un metro de la línea de gol, de palo a palo.",
    consigna: "Desplazamiento lateral tocando cada plato con el palo, sin cruzar los pies. Ida y vuelta, 30 segundos de trabajo y 30 de pausa.",
    puntosClave: ["Pasos cortos, sin cruzar los pies", "Peso en la parte de adelante del pie", "Palo y guante listos a la altura de la rodilla"],
    errores: [
      { error: "Se paran derechos entre plato y plato", correccion: "Que mantengan las rodillas flexionadas: la cabeza no sube ni baja" },
      { error: "Cruzan los pies para llegar antes", correccion: "Acercá los platos: primero bien, después rápido" },
    ],
    variantes: { inicial: "Tres platos.", intermedio: "Cinco platos.", avanzado: "Cinco platos y una bocha al final que tiene que despejar." },
    progresion: { masFacil: "Caminando.", masDificil: "El compañero señala el plato al azar." },
    pizarra: pizarra(
      "area",
      [K("k"), ...muchos(cono, "c", 5)],
      {
        k: p(89.6, 27.5),
        c1: p(89.4, 22.5), c2: p(87.6, 24.8), c3: p(87, 27.5), c4: p(87.6, 30.2), c5: p(89.4, 32.5),
      },
      [
        { ms: 900, movs: [corre("k", p(89.4, 23.6))] },
        { ms: 1300, movs: [corre("k", p(89.4, 31.4), p(87.4, 27.5))] },
        { ms: 900, movs: [corre("k", p(89.6, 27.5))] },
      ],
    ),
  }),

  ejercicio({
    ...tarea,
    id: "arq-reaccion-pases-rasantes",
    nombre: "Reacción a pases rasantes",
    intensidad: 2,
    material: { bochas: 10 },
    duracion: { min: 5, max: 15 },
    organizacion: "Un compañero o el entrenador a 8 metros con varias bochas. El arquero en el centro del arco.",
    consigna: "Pases rasantes a un lado y al otro, cada vez más rápido. El arquero para con el pie y despeja hacia el costado.",
    puntosClave: ["Despejá siempre hacia afuera, nunca al medio", "Paso al costado antes de parar", "Volvé al centro después de cada despeje"],
    errores: [
      { error: "Despeja al medio, hacia el punto penal", correccion: "Dos conos en los costados del área: el despeje tiene que ir hacia ellos" },
      { error: "Se queda pegado a la línea", correccion: "Marcá su posición de partida un metro adelante de la línea" },
    ],
    variantes: { inicial: "Pases lentos y avisados.", intermedio: "Pases a ritmo de juego.", avanzado: "Pases sin aviso y desde distintos ángulos." },
    progresion: { masFacil: "Solo parar, sin despejar.", masDificil: "Dos pasadores alternados." },
    pizarra: pizarra(
      "area",
      [K("k"), E(), bocha("o")],
      { k: p(89.6, 27.5), e: p(81, 27.5), o: pegada(p(81, 27.5), 1.2, -0.6) },
      [
        { ms: 800, movs: [pasa("o", p(88.6, 24.4)), corre("k", p(89.2, 25))] },
        { ms: 900, movs: [pasa("o", p(84, 14), p(87, 18))] },
        { ms: 800, movs: [corre("k", p(89.6, 27.5))] },
      ],
    ),
  }),

  ejercicio({
    ...tarea,
    id: "arq-despeje-borde-area",
    nombre: "Despeje con el pie desde el borde del área",
    intensidad: 2,
    material: { bochas: 10, conos: 4 },
    duracion: { min: 5, max: 15 },
    organizacion: "Bochas en el borde del área. Dos puertas de conos en los costados, a la altura de la línea punteada.",
    consigna: "El arquero sale, llega a la bocha y despeja con el pie hacia una de las puertas. Vuelve al arco caminando hacia atrás.",
    puntosClave: ["Llegá con el pie de despeje adelantado", "Cuerpo de costado a la bocha", "Despeje fuerte y rasante"],
    errores: [
      { error: "Despeja con la punta del pie y la bocha sale para cualquier lado", correccion: "Que pegue con la cara interna del pie, como un pase" },
      { error: "Sale tarde y llega frenado", correccion: "Que arranque al silbato y llegue con el último paso corto" },
    ],
    variantes: { inicial: "Bocha quieta.", intermedio: "Bocha que rueda hacia él.", avanzado: "Bocha que rueda y puerta que elige el entrenador al último momento." },
    progresion: { masFacil: "Bochas más cerca del arco.", masDificil: "Un delantero sale a presionar." },
    pizarra: pizarra(
      "area",
      [K("k"), bocha("o"), ...muchos(cono, "c", 4)],
      { k: p(89.6, 27.5), o: p(78, 27.5), c1: p(72.5, 8), c2: p(72.5, 11), c3: p(72.5, 44), c4: p(72.5, 47) },
      [
        { ms: 1000, movs: [corre("k", p(79.4, 26.6))] },
        { ms: 900, movs: [pasa("o", p(72.5, 9.5), p(76, 16))] },
        { ms: 1100, movs: [corre("k", p(89.6, 27.5))] },
      ],
    ),
  }),

  ejercicio({
    ...tarea,
    id: "arq-achique-1v1",
    nombre: "Achique y bloqueo en el 1 contra 1",
    intensidad: 2,
    jugadores: { min: 1, max: 2 },
    material: { bochas: 10 },
    duracion: { min: 5, max: 15 },
    organizacion: "Un atacante sale conduciendo desde la línea punteada. El arquero arranca en la línea de gol.",
    consigna: "El arquero achica el ángulo saliendo en línea con la bocha y bloquea con el cuerpo de costado cuando el atacante define.",
    puntosClave: ["Salí en línea entre la bocha y el centro del arco", "Frená antes del contacto: llegá parado", "Bloqueo con el cuerpo de costado, palo abajo"],
    errores: [
      { error: "Sale de frente y lo pasan por el costado", correccion: "Que salga en diagonal, cerrando el palo más cercano" },
      { error: "Se tira antes de tiempo", correccion: "Que espere el último toque del atacante para bloquear" },
    ],
    variantes: { inicial: "Atacante caminando.", intermedio: "Atacante a ritmo de juego.", avanzado: "Atacante que puede amagar y cambiar de lado." },
    progresion: { masFacil: "Atacante que solo puede tirar al primer palo.", masDificil: "Dos atacantes alternados sin pausa." },
    pizarra: pizarra(
      "area",
      [K("k"), A(1), bocha("o")],
      { k: p(89.8, 27.5), a1: p(72, 20), o: pegada(p(72, 20), 1.3, 0.8) },
      [
        { ms: 1600, movs: [conduce("a1", p(81, 24), p(77, 21)), corre("k", p(86.4, 26.4))] },
        { ms: 900, movs: [pasa("o", p(85.6, 26.2)), corre("k", p(85.8, 26))] },
      ],
    ),
  }),
];
