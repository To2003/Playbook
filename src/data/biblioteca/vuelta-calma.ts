import { A, bocha, cono, corre, ejercicio, equipo, muchos, p, pasa, pegada, pizarra } from "./armar";
import type { Ejercicio, Punto } from "@/lib/tipos";

const ronda = (n: number, radio: number, cx = 68, cy = 27.5): Punto[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return p(cx + Math.cos(a) * radio, cy + Math.sin(a) * radio);
  });

export const VUELTA_CALMA: Ejercicio[] = [
  ejercicio({
    id: "elongacion-en-ronda",
    nombre: "Elongación en ronda y cierre",
    fase: "vuelta_calma",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "individual" },
    intensidad: 1,
    arqueros: "opcional",
    objetivos: [],
    espacio: "media",
    duracion: { min: 5, max: 12 },
    organizacion: "Todos en ronda, arqueros incluidos, caminando hacia el centro desde donde terminó el último ejercicio.",
    consigna: "Elongación estática de 20 a 30 segundos por posición: gemelos, isquiotibiales, cuádriceps, aductores, cadera y espalda. Cierre con dos cosas que salieron bien y una para mejorar.",
    puntosClave: ["Respirá largo en cada posición", "Nada de rebotes al elongar", "Si algo duele de verdad, avisale al cuerpo médico o a un profesional"],
    errores: [
      { error: "Elongan con rebotes", correccion: "Que cuenten despacio hasta 20 sin moverse" },
      { error: "La ronda se vuelve charla y nadie elonga", correccion: "El entrenador marca cada posición en voz alta y la hace con ellos" },
    ],
    variantes: {
      inicial: "Seis posiciones guiadas.",
      intermedio: "Seis posiciones; cada uno elige una más.",
      avanzado: "Posiciones en parejas, con el compañero asistiendo.",
    },
    progresion: { masFacil: "Menos posiciones, más tiempo de charla.", masDificil: "Sumá movilidad de cadera en el piso." },
    pizarra: (() => {
      const lejos = ronda(10, 19);
      const cerca = ronda(10, 9);
      return pizarra(
        "media",
        equipo(A, 10),
        Object.fromEntries(lejos.map((q, i) => [`a${i + 1}`, p(q.x + (i % 3) - 1, q.y + ((i * 7) % 5) - 2)])),
        [{ ms: 2400, movs: cerca.map((q, i) => corre(`a${i + 1}`, q)) }],
      );
    })(),
  }),

  ejercicio({
    id: "pases-precision-puertas",
    nombre: "Pases de precisión a las puertas",
    fase: "vuelta_calma",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "parejas" },
    intensidad: 1,
    arqueros: "no",
    objetivos: ["pase_recepcion"],
    espacio: "cuarto",
    material: { bochas: 1, conos: 4 },
    duracion: { min: 5, max: 10 },
    organizacion: "Parejas a 12 metros con una puerta de conos de 1 metro en el medio.",
    consigna: "Push suave que pase por la puerta. Cada pase que entra es un punto; la primera pareja en llegar a 15 elige la música del vestuario.",
    puntosClave: ["Bajá el ritmo: es para bajar pulsaciones", "Apuntá el pie de adelante a la puerta", "Recibí y acomodá antes de devolver"],
    errores: [
      { error: "Se aceleran para ganar", correccion: "Si el pase va fuerte y sale de la cancha, resta un punto" },
      { error: "Pasan con la bocha en movimiento y fallan", correccion: "Control, bocha quieta, pase" },
    ],
    variantes: {
      inicial: "Puerta de 2 metros.",
      intermedio: "Puerta de 1 metro.",
      avanzado: "Puerta de 1 metro, alternando derecho y revés.",
    },
    progresion: { masFacil: "Distancia de 8 metros.", masDificil: "Pase con la mano no hábil más adelante en el palo." },
    pizarra: pizarra(
      "media",
      [A(1), A(2), A(3), A(4), bocha("o1"), bocha("o2"), ...muchos(cono, "c", 4)],
      {
        a1: p(58, 18), a2: p(76, 18), a3: p(58, 37), a4: p(76, 37),
        o1: pegada(p(58, 18), 1.3, 0.6), o2: pegada(p(76, 37), -1.3, 0.6),
        c1: p(67, 17.4), c2: p(67, 19.6), c3: p(67, 36.4), c4: p(67, 38.6),
      },
      [
        { ms: 1500, movs: [pasa("o1", p(74.7, 18.6)), pasa("o2", p(59.3, 37.6))] },
        { ms: 1500, movs: [pasa("o1", p(59.3, 18.6)), pasa("o2", p(74.7, 37.6))] },
      ],
    ),
  }),

  ejercicio({
    id: "caminata-respiracion-cierre",
    nombre: "Caminata con respiración y charla de cierre",
    fase: "vuelta_calma",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "individual" },
    intensidad: 1,
    arqueros: "opcional",
    objetivos: [],
    espacio: "media",
    duracion: { min: 4, max: 8 },
    organizacion: "Todos caminando por el perímetro de media cancha, arqueros incluidos.",
    consigna: "Una vuelta caminando con respiración guiada: cuatro tiempos para inhalar, seis para exhalar. Al llegar al banco, charla de dos minutos sobre la sesión.",
    puntosClave: ["Exhalá más largo de lo que inhalás", "Hombros sueltos y caminata tranquila", "Un aprendizaje del día en una frase"],
    errores: [
      { error: "Caminan rápido y charlando", correccion: "El entrenador marca el ritmo de la respiración en voz alta" },
      { error: "La charla se alarga y se enfrían", correccion: "Dos minutos con reloj; lo demás, en el vestuario" },
    ],
    variantes: {
      inicial: "Media vuelta y charla guiada.",
      intermedio: "Una vuelta y charla.",
      avanzado: "Una vuelta y cada uno dice algo que mejoró del compañero.",
    },
    progresion: { masFacil: "Solo la charla.", masDificil: "Sumá movilidad articular mientras caminan." },
    pizarra: pizarra(
      "media",
      equipo(A, 6),
      Object.fromEntries([1, 2, 3, 4, 5, 6].map((i) => [`a${i}`, p(50 + i * 5, 3)])),
      [
        { ms: 2600, movs: [1, 2, 3, 4, 5, 6].map((i) => corre(`a${i}`, p(88, 8 + i * 4), p(88, 3))) },
        { ms: 2600, movs: [1, 2, 3, 4, 5, 6].map((i) => corre(`a${i}`, p(78 - i * 4, 52), p(88, 52))) },
      ],
    ),
  }),
];
