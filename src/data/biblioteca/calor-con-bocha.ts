import { A, bocha, conduce, cono, corre, ejercicio, equipo, muchos, p, pasa, pegada, pizarra, zona } from "./armar";
import type { Ejercicio, Punto } from "@/lib/tipos";

const enRonda = (centro: Punto, grados: number, radio: number): Punto => ({
  x: centro.x + Math.cos((grados * Math.PI) / 180) * radio,
  y: centro.y + Math.sin((grados * Math.PI) / 180) * radio,
});

const centro = p(68, 27.5);
const angulos = [0, 60, 120, 180, 240, 300];

export const CALOR_CON_BOCHA: Ejercicio[] = [
  ejercicio({
    id: "conduccion-cuadrado-derecho-reves",
    nombre: "Conducción en el cuadrado con derecho y revés",
    fase: "calor_con_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "individual" },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["conduccion"],
    espacio: "cuarto",
    material: { bochas: 1, conos: 4 },
    duracion: { min: 8, max: 15 },
    organizacion: "Cuadrado de 22 × 22 metros (más grande si son más de 16). Cada uno con su bocha adentro.",
    consigna: "Conducen libres por el cuadrado sin chocarse. Al silbato cambian de derecho a revés; a dos silbatos, giro de 180° con la bocha y salen para el otro lado.",
    puntosClave: ["Bocha adelante y a la derecha del cuerpo", "Cambiá a revés antes de chocar, no encima", "Levantá la vista cada tres toques"],
    errores: [
      { error: "Conducen mirando la bocha todo el tiempo", correccion: "Levantá los dedos de una mano: tienen que decir cuántos ves sin perder la bocha" },
      { error: "La bocha se les va lejos en el revés", correccion: "Toques más cortos y palo apoyado; que el revés sea un toque, no un golpe" },
    ],
    variantes: {
      inicial: "Solo derecho; el revés se agrega al final.",
      intermedio: "Derecho, revés y giro al silbato.",
      avanzado: "Cuadrado más chico y conducción a velocidad alta.",
    },
    progresion: { masFacil: "Más espacio por jugador.", masDificil: "Dos jugadores sin bocha intentan robar." },
    pizarra: (() => {
      const salida = angulos.map((g) => enRonda(centro, g, 7.5));
      const llegada1 = angulos.map((g) => enRonda(centro, g + 55, 7.5));
      const llegada2 = angulos.map((g) => enRonda(centro, g + 110, 7.5));
      return pizarra(
        "media",
        [zona("z", 22, 22), ...muchos(cono, "c", 4), ...equipo(A, 6), ...muchos(bocha, "o", 6)],
        {
          z: centro,
          c1: p(57, 16.5), c2: p(79, 16.5), c3: p(79, 38.5), c4: p(57, 38.5),
          ...Object.fromEntries(salida.map((q, i) => [`a${i + 1}`, q])),
          ...Object.fromEntries(salida.map((q, i) => [`o${i + 1}`, enRonda(centro, angulos[i] + 14, 7.6)])),
        },
        [
          { ms: 2400, movs: salida.map((_, i) => conduce(`a${i + 1}`, llegada1[i], enRonda(centro, angulos[i] + 27, 9.5))) },
          { ms: 2400, movs: salida.map((_, i) => conduce(`a${i + 1}`, llegada2[i], enRonda(centro, angulos[i] + 82, 5.5))) },
        ],
      );
    })(),
  }),

  ejercicio({
    id: "pase-recepcion-parejas-movimiento",
    nombre: "Pase y recepción en parejas, en movimiento",
    fase: "calor_con_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "parejas" },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["pase_recepcion"],
    espacio: "media",
    material: { bochas: 1 },
    duracion: { min: 8, max: 15 },
    organizacion: "Parejas a 8–10 metros, una bocha por pareja, todas avanzando hacia el mismo lado de la cancha.",
    consigna: "Avanzan trotando en paralelo pasándose push. El que recibe controla adelante y devuelve en el segundo toque. Al llegar al fondo vuelven con revés.",
    puntosClave: ["Recibí con la bocha adelante del cuerpo, no en los pies", "Pasá adelante del compañero, al espacio", "Palo apoyado en el piso antes de recibir"],
    errores: [
      { error: "El pase va a los pies del compañero", correccion: "Que apunten un metro adelante: el compañero llega corriendo" },
      { error: "Reciben parados", correccion: "Pedí que el que recibe esté siempre trotando; si frena, se repite" },
    ],
    variantes: {
      inicial: "Parejas quietas a 6 metros, después en movimiento.",
      intermedio: "En movimiento, dos toques.",
      avanzado: "Un toque y recepción orientada de revés.",
    },
    progresion: { masFacil: "Distancia de 6 metros y caminando.", masDificil: "Pase de primera alternando derecho y revés." },
    pizarra: (() => {
      const filas = [12, 27.5, 43];
      const els = filas.flatMap((_, i) => [A(i * 2 + 1), A(i * 2 + 2), bocha(`o${i + 1}`)]);
      const ini: Record<string, Punto> = {};
      filas.forEach((y, i) => {
        ini[`a${i * 2 + 1}`] = p(52, y - 4);
        ini[`a${i * 2 + 2}`] = p(52, y + 4);
        ini[`o${i + 1}`] = pegada(p(52, y - 4), 1.4, 0.6);
      });
      return pizarra("media", els, ini, [
        {
          ms: 1300,
          movs: filas.flatMap((y, i) => [pasa(`o${i + 1}`, p(61.5, y + 4.6)), corre(`a${i * 2 + 1}`, p(60, y - 4)), corre(`a${i * 2 + 2}`, p(60, y + 4))]),
        },
        {
          ms: 1300,
          movs: filas.flatMap((y, i) => [pasa(`o${i + 1}`, p(69.5, y - 3.4)), corre(`a${i * 2 + 1}`, p(68, y - 4)), corre(`a${i * 2 + 2}`, p(68, y + 4))]),
        },
        {
          ms: 1300,
          movs: filas.flatMap((y, i) => [pasa(`o${i + 1}`, p(77.5, y + 4.6)), corre(`a${i * 2 + 1}`, p(76, y - 4)), corre(`a${i * 2 + 2}`, p(76, y + 4))]),
        },
      ]);
    })(),
  }),

  ejercicio({
    id: "rombo-pases-cambio-frente",
    nombre: "Rombo de pases con cambio de frente",
    fase: "calor_con_bocha",
    jugadores: { min: 5, max: 30 },
    formato: { tipo: "grupos", k: 5 },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["pase_recepcion", "posesion"],
    espacio: "cuarto",
    material: { bochas: 2, conos: 4 },
    duracion: { min: 8, max: 15 },
    organizacion: "Rombo de conos a 12 metros por lado, uno o dos jugadores por cono. Dos bochas por rombo.",
    consigna: "Pase y sigo: el que pasa sale corriendo al cono al que pasó. Cada tanto, el del vértice de abajo cambia de frente con un pase cruzado al vértice opuesto.",
    puntosClave: ["Perfilate antes de recibir para salir hacia el próximo cono", "Pase firme y rasante", "Avisá con la voz a quién le das"],
    errores: [
      { error: "Reciben de frente y tienen que girar con la bocha", correccion: "Que abran el pie de adelante hacia donde van a pasar antes de que llegue la bocha" },
      { error: "Se olvidan de seguir el pase", correccion: "Si no sigue el pase, ese grupo hace 5 sentadillas: en dos vueltas se acuerdan" },
    ],
    variantes: {
      inicial: "Una sola bocha y sin cambio de frente.",
      intermedio: "Dos bochas a la vez.",
      avanzado: "Dos bochas, recepción de revés obligatoria y cambio de frente de primera.",
    },
    progresion: { masFacil: "Rombo de 8 metros.", masDificil: "Pases de primera en todos los vértices." },
    pizarra: pizarra(
      "media",
      [...muchos(cono, "c", 4), ...equipo(A, 5), bocha("o")],
      {
        c1: p(56, 27.5), c2: p(68, 16), c3: p(80, 27.5), c4: p(68, 39),
        a1: p(56, 25.5), a5: p(56, 30), a2: p(68, 14), a3: p(80, 25.5), a4: p(68, 41),
        o: pegada(p(56, 25.5), 1.2, 0.8),
      },
      [
        { ms: 1200, movs: [pasa("o", p(68, 15.5)), corre("a1", p(66, 16))] },
        { ms: 1200, movs: [pasa("o", p(79, 26.5)), corre("a2", p(78.5, 23.5))] },
        { ms: 1200, movs: [pasa("o", p(68.5, 39.5)), corre("a3", p(70, 41))] },
        { ms: 1400, movs: [pasa("o", p(56, 28.5), p(60, 38)), corre("a4", p(57.5, 32))] },
      ],
    ),
  }),

  ejercicio({
    id: "slalom-conos-pase",
    nombre: "Slalom entre conos y pase al compañero",
    fase: "calor_con_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "grupos", k: 4 },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["conduccion", "pase_recepcion"],
    espacio: "media",
    material: { bochas: 2, conos: 12 },
    duracion: { min: 8, max: 12 },
    organizacion: "Estaciones de 4: dos de cada lado de una fila de 5 conos separados 2 metros.",
    consigna: "Conducción en slalom entre los conos (derecho, revés), al salir push al compañero de enfrente y se pasa a la cola de esa fila.",
    puntosClave: ["Palo cerca de la bocha en cada cambio", "Bajá el centro de gravedad en el slalom", "Pase al salir del último cono, sin frenar"],
    errores: [
      { error: "Tocan los conos con la bocha", correccion: "Abrí la distancia entre conos y pedí precisión antes que velocidad" },
      { error: "Frenan para pasar", correccion: "El pase sale en el mismo paso en el que dejan el último cono" },
    ],
    variantes: {
      inicial: "Conos a 3 metros y solo derecho.",
      intermedio: "Conos a 2 metros, derecho y revés.",
      avanzado: "Conos a 1,5 metros y pase de revés al salir.",
    },
    progresion: { masFacil: "Menos conos.", masDificil: "Un defensor pasivo espera a la salida del slalom." },
    pizarra: pizarra(
      "media",
      [...muchos(cono, "c", 5), A(1), A(2), A(3), A(4), bocha("o"), bocha("q")],
      {
        ...Object.fromEntries([1, 2, 3, 4, 5].map((i) => [`c${i}`, p(56 + i * 3.5, 27.5)])),
        a1: p(54, 27.5), a2: p(52, 27.5), a3: p(82, 30), a4: p(85, 30),
        o: pegada(p(54, 27.5), 1.3, 0.9), q: pegada(p(85, 30), 1.3, 0.9),
      },
      [
        { ms: 2400, movs: [conduce("a1", p(66, 25), p(61.5, 31)), corre("a2", p(54, 27.5))] },
        { ms: 1600, movs: [conduce("a1", p(76, 25), p(71.5, 22))] },
        { ms: 1200, movs: [pasa("o", p(81.5, 31.2)), corre("a1", p(79, 25))] },
      ],
    ),
  }),
];
