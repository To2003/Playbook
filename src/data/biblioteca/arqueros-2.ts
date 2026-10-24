import { E, K, asignar, bocha, cono, corre, ejercicio, muchos, p, pasa, pegada, pizarra } from "./armar";
import type { Ejercicio } from "@/lib/tipos";

const tarea = {
  fase: "arquero" as const,
  jugadores: { min: 1, max: 2 },
  formato: { tipo: "individual" as const },
  arqueros: "requerido" as const,
  objetivos: [],
  espacio: "area" as const,
};

export const TAREAS_ARQUERO_2: Ejercicio[] = [
  ejercicio({
    ...tarea,
    id: "arq-paradas-guante-media-altura",
    nombre: "Paradas con el guante a media altura",
    intensidad: 2,
    material: { bochas: 10 },
    duracion: { min: 5, max: 15 },
    organizacion: "Un compañero o el entrenador a 8 metros levanta la bocha con flick suave, a un lado y al otro del arquero.",
    consigna: "El arquero para con el guante izquierdo o con el palo-guante derecho y deja la bocha muerta adelante. Diez de cada lado.",
    puntosClave: ["Guante adelante del cuerpo, no al costado", "Amortiguá: la mano cede al recibir", "Bocha muerta adelante, nunca rebote al medio"],
    errores: [
      { error: "Rechaza hacia el punto penal", correccion: "Que deje la bocha a un metro, adelante y al costado" },
      { error: "Espera con las manos abajo", correccion: "Posición de base con guantes a la altura de la cintura" },
    ],
    variantes: { inicial: "Flick lento y avisado.", intermedio: "Flick a ritmo.", avanzado: "Flick sin aviso de lado." },
    progresion: { masFacil: "Bocha rodando.", masDificil: "Dos pasadores alternados." },
    pizarra: pizarra(
      "area",
      [K(), E(), bocha("o")],
      { k: p(89.6, 27.5), e: p(81, 27.5), o: pegada(p(81, 27.5), 1.2, 0.6) },
      [
        { ms: 900, movs: [pasa("o", p(88.4, 25.8), p(86, 24)), corre("k", p(89.4, 26.4))] },
        { ms: 800, movs: [pasa("o", p(87.2, 25.2))] },
        { ms: 900, movs: [corre("k", p(89.6, 27.5))] },
      ],
    ),
  }),

  ejercicio({
    ...tarea,
    id: "arq-bloqueo-bajo-salida-pies",
    nombre: "Bloqueo bajo en la salida a los pies",
    intensidad: 2,
    material: { bochas: 8, conos: 2 },
    duracion: { min: 5, max: 15 },
    organizacion: "Bochas quietas a 5 metros del arco, en distintos ángulos.",
    consigna: "A la señal, el arquero sale a la bocha y hace el bloqueo bajo de costado, con las piernas juntas y el palo apoyado. Vuelve al arco caminando hacia atrás.",
    puntosClave: ["Salí rápido, frená corto", "Cuerpo de costado y piernas juntas", "Palo apoyado cerrando el hueco de abajo"],
    errores: [
      { error: "Deja hueco entre las piernas", correccion: "Que caiga sobre el costado con las rodillas pegadas" },
      { error: "Llega tarde y se tira de lejos", correccion: "Bochas más cerca hasta que el tiempo de salida sea bueno" },
    ],
    variantes: { inicial: "Bocha quieta.", intermedio: "Bocha que rueda despacio.", avanzado: "Atacante que conduce y define." },
    progresion: { masFacil: "Sin caída: solo la salida.", masDificil: "Bloqueo y levantarse para un segundo tiro." },
    pizarra: pizarra(
      "area",
      [K(), bocha("o"), ...muchos(cono, "c", 2)],
      { k: p(89.6, 27.5), o: p(84.5, 23), c1: p(84.5, 20.5), c2: p(84.5, 34.5) },
      [
        { ms: 900, movs: [corre("k", p(85.8, 23.6))] },
        { ms: 1200, movs: [corre("k", p(89.6, 27.5))] },
      ],
    ),
  }),

  ejercicio({
    ...tarea,
    id: "arq-paradas-palo-lejano",
    nombre: "Paradas de palo en el palo lejano",
    intensidad: 2,
    material: { bochas: 10, conos: 2 },
    duracion: { min: 5, max: 15 },
    organizacion: "El pasador en el costado del área tira rasante al palo lejano. Un cono marca el palo.",
    consigna: "El arquero se desplaza con el tiro y para con el palo abajo, estirado, sin perder el equilibrio. Recupera la posición y sigue.",
    puntosClave: ["Desplazamiento lateral antes de estirarte", "Palo apoyado en todo su largo", "Recuperá la posición enseguida"],
    errores: [
      { error: "Se tira sin desplazarse", correccion: "Dos pasos laterales antes de estirarse" },
      { error: "El palo queda en el aire", correccion: "Que el palo toque el pasto en toda su longitud" },
    ],
    variantes: { inicial: "Tiro lento.", intermedio: "Tiro a ritmo.", avanzado: "Tiro a cualquier palo sin aviso." },
    progresion: { masFacil: "Más cerca del palo.", masDificil: "Tiro desviado por un segundo jugador." },
    pizarra: pizarra(
      "area",
      [K(), E(), bocha("o"), cono("c")],
      { k: p(89.4, 26.5), e: p(78, 12), o: pegada(p(78, 12), 1.3, 1), c: p(91, 30.5) },
      [
        { ms: 900, movs: [pasa("o", p(89, 29.4)), corre("k", p(89.4, 28.4))] },
        { ms: 900, movs: [corre("k", p(89.6, 27.5))] },
      ],
    ),
  }),

  ejercicio({
    ...tarea,
    id: "arq-despeje-palo-costados",
    nombre: "Despeje con el palo hacia los costados",
    intensidad: 2,
    material: { bochas: 10, conos: 4 },
    duracion: { min: 5, max: 15 },
    organizacion: "El pasador mete bochas rasantes desde el frente. Dos puertas de conos en los costados del área.",
    consigna: "El arquero despeja con el palo de revés o de derecho hacia una de las puertas, nunca al medio.",
    puntosClave: ["Despejá hacia afuera, siempre", "Palo firme, golpe corto", "Volvé al centro del arco"],
    errores: [
      { error: "El despeje sale al medio", correccion: "Solo cuenta si pasa por una puerta" },
      { error: "Golpea con el brazo estirado y pierde control", correccion: "Golpe corto con el palo cerca del cuerpo" },
    ],
    variantes: { inicial: "Bocha lenta.", intermedio: "Bocha a ritmo.", avanzado: "Puerta que elige el entrenador en el momento." },
    progresion: { masFacil: "Puertas más anchas.", masDificil: "Un delantero presiona el rebote." },
    pizarra: pizarra(
      "area",
      [K(), E(), bocha("o"), ...muchos(cono, "c", 4)],
      { k: p(89.6, 27.5), e: p(80, 27.5), o: pegada(p(80, 27.5), 1.3, 0.6), ...asignar(muchos(cono, "c", 4), [p(78, 8), p(78, 11), p(78, 44), p(78, 47)]) },
      [
        { ms: 800, movs: [pasa("o", p(88.2, 27.8))] },
        { ms: 1000, movs: [pasa("o", p(78, 9.5), p(84, 14))] },
      ],
    ),
  }),
];
