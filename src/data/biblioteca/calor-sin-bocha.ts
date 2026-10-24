import { A, B, corre, cono, ejercicio, equipo, muchos, p, pizarra, zona } from "./armar";
import type { Ejercicio } from "@/lib/tipos";

export const CALOR_SIN_BOCHA: Ejercicio[] = [
  ejercicio({
    id: "activacion-cambios-ritmo",
    nombre: "Activación con cambios de ritmo",
    fase: "calor_sin_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "grupos", k: 6 },
    intensidad: 1,
    arqueros: "no",
    objetivos: [],
    espacio: "media",
    material: { conos: 12 },
    duracion: { min: 6, max: 12 },
    organizacion: "Filas de 5 o 6 detrás de una línea de conos en la mitad de la cancha. Otra línea de conos en la de 23 y una tercera cerca del fondo.",
    consigna: "Trote suave hasta la de 23, frenada corta en dos tiempos y pique hasta los conos del fondo. Vuelven caminando por afuera y sale la fila siguiente.",
    puntosClave: ["Frená en dos tiempos, bajando la cadera", "Pique con pasos cortos los primeros 3 metros", "Brazos activos y mirada arriba"],
    errores: [
      { error: "Frenan con el cuerpo tirado para atrás", correccion: "Pedí que el último paso caiga adelante de la cadera y con las rodillas flexionadas" },
      { error: "El pique arranca con zancadas largas", correccion: "Marcá 3 platos a un metro: tienen que pisar entre cada uno" },
    ],
    variantes: {
      inicial: "Solo trote y frenada, sin pique.",
      intermedio: "Pique al silbato, no en el cono.",
      avanzado: "Pique con cambio de dirección a la señal del entrenador.",
    },
    progresion: { masFacil: "Distancias más cortas y caminando de vuelta.", masDificil: "Sumá un giro de 180° antes de picar." },
    pizarra: pizarra(
      "media",
      [...equipo(A, 6), ...muchos(cono, "c", 6), ...muchos(cono, "d", 6)],
      {
        ...Object.fromEntries([1, 2, 3, 4, 5, 6].map((i) => [`a${i}`, p(49, 6 + i * 6.5)])),
        ...Object.fromEntries([1, 2, 3, 4, 5, 6].map((i) => [`c${i}`, p(47, 6 + i * 6.5)])),
        ...Object.fromEntries([1, 2, 3, 4, 5, 6].map((i) => [`d${i}`, p(86, 6 + i * 6.5)])),
      },
      [
        { ms: 1500, movs: [1, 3, 5].map((i) => corre(`a${i}`, p(68.5, 6 + i * 6.5))) },
        { ms: 1100, movs: [1, 3, 5].map((i) => corre(`a${i}`, p(84, 6 + i * 6.5))) },
        { ms: 1500, movs: [2, 4, 6].map((i) => corre(`a${i}`, p(68.5, 6 + i * 6.5))) },
      ],
    ),
  }),

  ejercicio({
    id: "movilidad-dinamica-carriles",
    nombre: "Movilidad dinámica en carriles",
    fase: "calor_sin_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "individual" },
    intensidad: 1,
    arqueros: "no",
    objetivos: [],
    espacio: "media",
    material: { conos: 10 },
    duracion: { min: 6, max: 10 },
    organizacion: "Carriles de 20 metros marcados con conos, de 3 a 5 jugadores por carril.",
    consigna: "Ida y vuelta por el carril: rodillas arriba, talones a la cola, desplazamiento lateral, apertura de cadera y zancada con giro de tronco.",
    puntosClave: ["Movimientos amplios pero sin rebotes", "Tronco firme, mirada al frente", "Volvé trotando suave entre ejercicio y ejercicio"],
    errores: [
      { error: "Hacen los ejercicios a toda velocidad", correccion: "Recordá que es movilidad: pedí amplitud, no velocidad" },
      { error: "En el lateral cruzan los pies", correccion: "Que los pies se acerquen sin tocarse, con la cadera baja" },
    ],
    variantes: {
      inicial: "Tres ejercicios, con demostración antes de cada uno.",
      intermedio: "Cinco ejercicios encadenados.",
      avanzado: "Cinco ejercicios y un pique de 10 metros al final de cada carril.",
    },
    progresion: { masFacil: "Carril más corto.", masDificil: "Sumá skipping con brazos coordinados." },
    pizarra: pizarra(
      "media",
      [...equipo(A, 5), ...muchos(cono, "c", 5), ...muchos(cono, "d", 5)],
      {
        ...Object.fromEntries([1, 2, 3, 4, 5].map((i) => [`a${i}`, p(55, 4 + i * 9)])),
        ...Object.fromEntries([1, 2, 3, 4, 5].map((i) => [`c${i}`, p(52.5, 4 + i * 9)])),
        ...Object.fromEntries([1, 2, 3, 4, 5].map((i) => [`d${i}`, p(76, 4 + i * 9)])),
      },
      [
        { ms: 2200, movs: [1, 2, 3, 4, 5].map((i) => corre(`a${i}`, p(74, 4 + i * 9), p(64.5, 4 + i * 9 + (i % 2 ? 2.5 : -2.5)))) },
        { ms: 2200, movs: [1, 2, 3, 4, 5].map((i) => corre(`a${i}`, p(55, 4 + i * 9), p(64.5, 4 + i * 9 + (i % 2 ? -2.5 : 2.5)))) },
      ],
    ),
  }),

  ejercicio({
    id: "mancha-con-salvadas",
    nombre: "Mancha con salvadas",
    fase: "calor_sin_bocha",
    jugadores: { min: 6, max: 30 },
    formato: { tipo: "individual" },
    intensidad: 2,
    arqueros: "no",
    objetivos: [],
    espacio: "cuarto",
    material: { conos: 4, colores: 1 },
    duracion: { min: 5, max: 10 },
    organizacion: "Cuadrado de 25 × 25 metros. Uno de cada seis con peto: son los que manchan.",
    consigna: "Los que manchan persiguen. El manchado se queda quieto con los brazos abiertos hasta que un compañero le pasa por abajo del brazo. Cambio de manchas cada minuto.",
    puntosClave: ["Cambios de dirección cortos, sin frenar del todo", "Mirá el espacio libre, no al que mancha", "Salvar es tan importante como escapar"],
    errores: [
      { error: "Se amontonan en una esquina", correccion: "Achicá el cuadrado o sumá una mancha más para que tengan que moverse" },
      { error: "Nadie salva y el juego se corta", correccion: "Que salvar valga un punto para el equipo de los que escapan" },
    ],
    variantes: {
      inicial: "Una mancha cada ocho, cuadrado grande.",
      intermedio: "Una mancha cada seis.",
      avanzado: "Las manchas van de a dos de la mano: obliga a coordinar.",
    },
    progresion: { masFacil: "Cuadrado más grande.", masDificil: "Prohibido correr en línea recta más de tres pasos." },
    pizarra: pizarra(
      "media",
      [zona("z", 26, 26), ...muchos(cono, "c", 4), B(1), B(2), ...equipo(A, 6)],
      {
        z: p(68, 27.5),
        c1: p(55, 14.5), c2: p(81, 14.5), c3: p(81, 40.5), c4: p(55, 40.5),
        b1: p(62, 22), b2: p(74, 34),
        a1: p(66, 18), a2: p(76, 22), a3: p(60, 32), a4: p(70, 28), a5: p(78, 36), a6: p(64, 38),
      },
      [
        { ms: 1500, movs: [corre("b1", p(65, 19.5)), corre("a1", p(72, 17), p(70, 15)), corre("b2", p(77.5, 35.5)), corre("a5", p(76, 30), p(80, 32))] },
        { ms: 1500, movs: [corre("b1", p(70, 18)), corre("a1", p(76, 16)), corre("a4", p(71.5, 33.5), p(74, 30))] },
      ],
    ),
  }),
];
