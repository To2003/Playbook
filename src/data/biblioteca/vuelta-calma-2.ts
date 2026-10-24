import { A, B, asignar, bocha, cono, corre, ejercicio, enLinea, enRonda, equipo, muchos, p, pasa, pegada, pizarra } from "./armar";
import type { Ejercicio } from "@/lib/tipos";

export const VUELTA_CALMA_2: Ejercicio[] = [
  ejercicio({
    id: "punteria-conos-trios",
    nombre: "Puntería a los conos en tríos",
    fase: "vuelta_calma",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "grupos", k: 3 },
    intensidad: 1,
    arqueros: "no",
    objetivos: ["pase_recepcion"],
    espacio: "cuarto",
    material: { bochas: 3, conos: 6 },
    duracion: { min: 5, max: 10 },
    organizacion: "Tríos detrás de una línea, con un cono a 8, otro a 12 y otro a 16 metros.",
    consigna: "Push suave para voltear o tocar cada cono, del más cerca al más lejos. El que lo toca va a buscar las bochas caminando.",
    puntosClave: ["Bajá las pulsaciones: todo despacio", "Precisión antes que fuerza", "Respirá entre tiro y tiro"],
    errores: [
      { error: "Tiran fuerte para llegar", correccion: "Que cuente solo si la bocha queda a menos de un metro del cono" },
      { error: "Se apuran a buscar las bochas corriendo", correccion: "Se va caminando: es la vuelta a la calma" },
    ],
    variantes: { inicial: "Conos a 6, 8 y 10 metros.", intermedio: "A 8, 12 y 16.", avanzado: "Con revés." },
    progresion: { masFacil: "Un solo cono.", masDificil: "Cono más chico y más lejos." },
    pizarra: (() => {
      const gente = equipo(A, 3);
      const conos = muchos(cono, "c", 3);
      return pizarra(
        "media",
        [...gente, ...conos, bocha("o")],
        { ...asignar(gente, enLinea(3, p(56, 23), p(56, 32))), ...asignar(conos, [p(64, 27.5), p(68, 24), p(72, 31)]), o: pegada(p(56, 27.5), 1.3, 0.5) },
        [
          { ms: 1500, movs: [pasa("o", p(63.2, 27.9))] },
          { ms: 1800, movs: [corre("a2", p(62, 27.5))] },
        ],
      );
    })(),
  }),

  ejercicio({
    id: "movilidad-articular-guiada",
    nombre: "Movilidad articular guiada",
    fase: "vuelta_calma",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "individual" },
    intensidad: 1,
    arqueros: "opcional",
    objetivos: [],
    espacio: "media",
    duracion: { min: 4, max: 8 },
    organizacion: "Todos en dos filas mirando al entrenador, con espacio para abrir los brazos.",
    consigna: "Movilidad de abajo hacia arriba: tobillos, rodillas, cadera, columna, hombros y cuello. Diez repeticiones lentas de cada una.",
    puntosClave: ["Movimientos lentos y amplios", "Respirá en cada repetición", "Si una articulación molesta, no la fuerces y avisá al cuerpo médico"],
    errores: [
      { error: "Lo hacen rápido para terminar", correccion: "El entrenador cuenta en voz alta y lento" },
      { error: "Movimientos chicos", correccion: "Pedí el rango completo: lo más grande posible sin dolor" },
    ],
    variantes: { inicial: "Cuatro articulaciones.", intermedio: "Seis articulaciones.", avanzado: "Seis articulaciones y equilibrio en un pie." },
    progresion: { masFacil: "Sentados.", masDificil: "Con el palo como apoyo para la movilidad de hombros." },
    pizarra: (() => {
      const g = equipo(A, 8);
      const filas = [...enLinea(4, p(66, 16), p(66, 39)), ...enLinea(4, p(60, 16), p(60, 39))];
      const entrenador = { id: "e", tipo: "jugador" as const, equipo: "C" as const, etiqueta: "E" };
      return pizarra(
        "media",
        [...g, entrenador],
        { ...asignar(g, filas.map((q, i) => p(q.x - 6 + (i % 3), q.y + (i % 2 ? 2 : -2)))), e: p(76, 27.5) },
        [{ ms: 2200, movs: g.map((x, i) => corre(x.id, filas[i])) }],
      );
    })(),
  }),

  ejercicio({
    id: "devolucion-parejas-pase",
    nombre: "Pase y charla: la devolución del día",
    fase: "vuelta_calma",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "parejas" },
    intensidad: 1,
    arqueros: "opcional",
    objetivos: ["pase_recepcion"],
    espacio: "cuarto",
    material: { bochas: 1 },
    duracion: { min: 4, max: 8 },
    organizacion: "Parejas a 6 metros con una bocha.",
    consigna: "Pases suaves de ida y vuelta mientras cada uno le cuenta al otro una cosa que le salió bien y una que quiere mejorar. Al final, dos parejas lo cuentan al grupo.",
    puntosClave: ["Pases suaves, sin apuro", "Una cosa buena y una para mejorar, concretas", "Escuchá al compañero"],
    errores: [
      { error: "La charla se vuelve queja", correccion: "Primero lo que salió bien, siempre" },
      { error: "Dejan de pasarse la bocha", correccion: "La charla va al ritmo de los pases" },
    ],
    variantes: { inicial: "Solo una cosa buena.", intermedio: "Una buena y una para mejorar.", avanzado: "Una para mejorar del compañero, dicha con respeto." },
    progresion: { masFacil: "Sin pases: solo charla.", masDificil: "Pases de revés." },
    pizarra: pizarra(
      "media",
      [A(1), B(1), A(2), B(2), bocha("o"), bocha("q")],
      { a1: p(62, 18), b1: p(70, 18), a2: p(62, 36), b2: p(70, 36), o: pegada(p(62, 18), 1.3, 0.6), q: pegada(p(70, 36), -1.3, 0.6) },
      [
        { ms: 1500, movs: [pasa("o", p(68.7, 18.6)), pasa("q", p(63.3, 36.6))] },
        { ms: 1500, movs: [pasa("o", p(63.3, 18.6)), pasa("q", p(68.7, 36.6))] },
      ],
    ),
  }),

  ejercicio({
    id: "trote-suave-elongacion-fondo",
    nombre: "Trote suave y elongación en la línea de fondo",
    fase: "vuelta_calma",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "individual" },
    intensidad: 1,
    arqueros: "opcional",
    objetivos: [],
    espacio: "media",
    duracion: { min: 5, max: 10 },
    organizacion: "Todos en la mitad de cancha.",
    consigna: "Trote muy suave hasta la línea de fondo y elongación de isquiotibiales y gemelos apoyados en la línea. Vuelta caminando y repetir.",
    puntosClave: ["Trote al 40%, se tiene que poder charlar", "Elongación de 30 segundos por pierna", "Exhalá largo al estirar"],
    errores: [
      { error: "El trote se vuelve carrera", correccion: "Que trote al lado de un compañero hablando" },
      { error: "Estiran rebotando", correccion: "Posición quieta, sin rebote, 30 segundos" },
    ],
    variantes: { inicial: "Caminata en lugar de trote.", intermedio: "Trote suave.", avanzado: "Trote suave y elongación en parejas." },
    progresion: { masFacil: "Solo elongación.", masDificil: "Sumá elongación de cadera." },
    pizarra: (() => {
      const g = equipo(A, 6);
      return pizarra("media", g, asignar(g, enLinea(6, p(48, 10), p(48, 45))), [
        { ms: 2400, movs: g.map((x, i) => corre(x.id, p(88, 10 + i * 7))) },
      ]);
    })(),
  }),

  ejercicio({
    id: "relevo-pases-ronda-tranquilo",
    nombre: "Relevo de pases tranquilo en ronda",
    fase: "vuelta_calma",
    jugadores: { min: 5, max: 30 },
    formato: { tipo: "grupos", k: 6 },
    intensidad: 1,
    arqueros: "opcional",
    objetivos: ["pase_recepcion"],
    espacio: "cuarto",
    material: { bochas: 1 },
    duracion: { min: 4, max: 8 },
    organizacion: "Rondas de 6, sentados o de rodillas, a 4 metros del centro.",
    consigna: "Pase suave al de enfrente con una mano; cada uno dice una palabra de cómo se va del entrenamiento.",
    puntosClave: ["Bajá el ritmo a propósito", "Precisión con una mano", "Una palabra, no un discurso"],
    errores: [
      { error: "Se ríen y pierden la bocha a cada rato", correccion: "Ronda más chica" },
      { error: "Nadie dice nada", correccion: "El entrenador arranca con su palabra" },
    ],
    variantes: { inicial: "De pie.", intermedio: "De rodillas.", avanzado: "Sentados, con la mano no hábil." },
    progresion: { masFacil: "Sin la palabra.", masDificil: "Dos bochas." },
    pizarra: (() => {
      const g = equipo(A, 6);
      const lugares = enRonda(6, p(68, 27.5), 5, -90);
      return pizarra("media", [...g, bocha("o")], { ...asignar(g, lugares), o: p(lugares[0].x + 0.4, lugares[0].y + 1.3) }, [
        { ms: 1500, movs: [pasa("o", p(lugares[3].x - 0.4, lugares[3].y - 1.3))] },
        { ms: 1500, movs: [pasa("o", p(lugares[1].x - 1.2, lugares[1].y + 0.4))] },
      ]);
    })(),
  }),
];
