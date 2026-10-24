import { A, B, aro, asignar, cono, corre, ejercicio, enLinea, enRonda, equipo, muchos, p, pizarra, zona } from "./armar";
import type { Ejercicio } from "@/lib/tipos";

export const CALOR_SIN_BOCHA_2: Ejercicio[] = [
  ejercicio({
    id: "escalera-platos-coordinacion",
    nombre: "Escalera de platos: coordinación de pies",
    fase: "calor_sin_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "grupos", k: 5 },
    intensidad: 1,
    arqueros: "no",
    objetivos: [],
    espacio: "cuarto",
    material: { conos: 16 },
    duracion: { min: 6, max: 10 },
    organizacion: "Una fila de 8 platos a 60 cm por estación. De 4 a 6 jugadores por fila.",
    consigna: "Pasar los platos con apoyos cortos: un pie en cada hueco, dos pies en cada hueco, lateral y en zigzag. Al salir, trote de 10 metros y vuelta caminando.",
    puntosClave: ["Apoyos en la parte de adelante del pie", "Brazos acompañando el ritmo de las piernas", "Mirá adelante, no los platos"],
    errores: [
      { error: "Pisan los platos", correccion: "Primero lento y prolijo; la velocidad aparece sola cuando el patrón sale" },
      { error: "Apoyan el talón y se frenan", correccion: "Pedí que se escuchen pasos cortos y livianos, sin ruido de talón" },
    ],
    variantes: { inicial: "Un pie por hueco.", intermedio: "Dos pies por hueco y lateral.", avanzado: "Zigzag adentro-afuera a máxima frecuencia." },
    progresion: { masFacil: "Platos más separados.", masDificil: "Al salir, pique de 5 metros a la señal." },
    pizarra: (() => {
      const filas = [16, 27.5, 39];
      const els = [...equipo(A, 3), ...filas.flatMap((_, f) => muchos(cono, `c${f}-`, 6))];
      const ini: Record<string, { x: number; y: number }> = {};
      filas.forEach((y, f) => {
        ini[`a${f + 1}`] = p(56, y);
        enLinea(6, p(59, y), p(71, y)).forEach((q, i) => (ini[`c${f}-${i + 1}`] = q));
      });
      return pizarra("media", els, ini, [
        { ms: 1800, movs: filas.map((y, f) => corre(`a${f + 1}`, p(73, y), p(65, y + (f % 2 ? 2 : -2)))) },
        { ms: 1200, movs: filas.map((y, f) => corre(`a${f + 1}`, p(82, y))) },
      ]);
    })(),
  }),

  ejercicio({
    id: "reloj-cambios-direccion",
    nombre: "El reloj: cambios de dirección",
    fase: "calor_sin_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "grupos", k: 4 },
    intensidad: 2,
    arqueros: "no",
    objetivos: [],
    espacio: "cuarto",
    material: { conos: 5 },
    duracion: { min: 6, max: 10 },
    organizacion: "Un cono en el centro y cuatro a 5 metros, como las horas 12, 3, 6 y 9. Grupos de 4, uno trabaja y tres esperan.",
    consigna: "Desde el centro, el entrenador canta una hora: pique al cono, lo toca con la mano y vuelve al centro de espaldas o lateral. Seis salidas y cambia.",
    puntosClave: ["Bajá la cadera antes de cambiar de dirección", "Primer paso corto y explosivo", "Volvé al centro listo para la próxima"],
    errores: [
      { error: "Frenan con las piernas rectas", correccion: "Que toquen el cono con la mano: los obliga a flexionar" },
      { error: "Esperan la señal parados sobre los talones", correccion: "Posición de arranque: rodillas flexionadas, peso adelante, pies activos" },
    ],
    variantes: { inicial: "Horas en orden fijo.", intermedio: "Horas al azar.", avanzado: "El entrenador señala con la mano, sin hablar: obliga a mirar." },
    progresion: { masFacil: "Conos a 4 metros.", masDificil: "Dos horas seguidas sin volver al centro." },
    pizarra: (() => {
      const centro = p(68, 27.5);
      const horas = enRonda(4, centro, 6, -90);
      const els = [cono("c0"), ...muchos(cono, "c", 4), A(1), A(2), A(3), A(4)];
      return pizarra(
        "media",
        els,
        { c0: centro, ...asignar(muchos(cono, "c", 4), horas), a1: p(69.5, 27.5), a2: p(62, 34), a3: p(60, 34), a4: p(58, 34) },
        [
          { ms: 900, movs: [corre("a1", p(horas[1].x, horas[1].y - 1.4))] },
          { ms: 900, movs: [corre("a1", p(69.5, 27.5))] },
          { ms: 900, movs: [corre("a1", p(horas[3].x, horas[3].y + 1.4))] },
          { ms: 900, movs: [corre("a1", p(69.5, 27.5))] },
        ],
      );
    })(),
  }),

  ejercicio({
    id: "espejo-desplazamiento-defensivo",
    nombre: "Espejo: desplazamiento defensivo en parejas",
    fase: "calor_sin_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "parejas" },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["quite_marca"],
    espacio: "cuarto",
    material: { conos: 8 },
    duracion: { min: 5, max: 10 },
    organizacion: "Parejas enfrentadas a 2 metros en un pasillo de 6 metros de ancho marcado con conos.",
    consigna: "Uno guía con desplazamientos laterales y amagues; el otro lo copia como un espejo, sin cruzar los pies. 20 segundos y cambian de rol.",
    puntosClave: ["Pasos laterales cortos, sin cruzar", "Mirá la cadera del compañero, no los pies", "Siempre en posición baja, como para marcar"],
    errores: [
      { error: "El que copia se queda atrás de cada amague", correccion: "Que achique la distancia a 1,5 metros: tiene que reaccionar antes" },
      { error: "Se paran derechos a los pocos segundos", correccion: "Bajá el tiempo a 15 segundos y pedí calidad en cada desplazamiento" },
    ],
    variantes: { inicial: "Solo lateral, sin amagues.", intermedio: "Lateral con amagues.", avanzado: "Lateral, adelante y atrás, con amagues." },
    progresion: { masFacil: "Pasillo más angosto.", masDificil: "Al silbato, el que copia tiene que tocar al guía." },
    pizarra: (() => {
      const ys = [14, 27.5, 41];
      const els = ys.flatMap((_, i) => [A(i + 1), B(i + 1)]);
      const ini: Record<string, { x: number; y: number }> = {};
      ys.forEach((y, i) => {
        ini[`a${i + 1}`] = p(66, y);
        ini[`b${i + 1}`] = p(70, y);
      });
      return pizarra("media", els, ini, [
        { ms: 900, movs: ys.flatMap((y, i) => [corre(`a${i + 1}`, p(66, y + 4)), corre(`b${i + 1}`, p(70, y + 4))]) },
        { ms: 1100, movs: ys.flatMap((y, i) => [corre(`a${i + 1}`, p(66, y - 4)), corre(`b${i + 1}`, p(70, y - 4))]) },
        { ms: 800, movs: ys.flatMap((y, i) => [corre(`a${i + 1}`, p(66, y)), corre(`b${i + 1}`, p(70, y))]) },
      ]);
    })(),
  }),

  ejercicio({
    id: "piques-reaccion-senal",
    nombre: "Piques de reacción a la señal",
    fase: "calor_sin_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "grupos", k: 6 },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["transicion"],
    espacio: "media",
    material: { conos: 12 },
    duracion: { min: 5, max: 10 },
    organizacion: "Filas de 5 o 6 en la mitad de cancha, sentados, acostados o de espaldas según la consigna. Meta a 15 metros.",
    consigna: "A la señal (silbato, palmada o una mano arriba) se paran y pican 15 metros. Cambiar la posición de salida en cada serie.",
    puntosClave: ["Reaccioná a la señal, no al compañero", "Los primeros pasos cortos y con los brazos", "Desacelerá después de la meta, no antes"],
    errores: [
      { error: "Salen antes de la señal mirando al de al lado", correccion: "Variá el tiempo de espera y usá señales visuales" },
      { error: "Frenan justo en la meta y se cargan las piernas", correccion: "La meta está 3 metros antes de donde frenan: corren a través" },
    ],
    variantes: { inicial: "Salida de pie.", intermedio: "Salida sentados o de espaldas.", avanzado: "Salida acostados boca abajo y a la señal visual." },
    progresion: { masFacil: "10 metros.", masDificil: "Pique con cambio de dirección a mitad de camino." },
    pizarra: (() => {
      const ys = enLinea(5, p(0, 10), p(0, 45)).map((q) => q.y);
      const corredores = equipo(A, 5);
      const ini = asignar(corredores, ys.map((y) => p(50, y)));
      ys.forEach((y, i) => {
        ini[`c${i + 1}`] = p(48, y + 2);
        ini[`d${i + 1}`] = p(66, y + 2);
      });
      return pizarra("media", [...corredores, ...muchos(cono, "c", 5), ...muchos(cono, "d", 5)], ini, [
        { ms: 1300, movs: ys.map((y, i) => corre(`a${i + 1}`, p(70, y))) },
      ]);
    })(),
  }),

  ejercicio({
    id: "aros-pies-rapidos",
    nombre: "Aros: pies rápidos y apoyos",
    fase: "calor_sin_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "grupos", k: 5 },
    intensidad: 1,
    arqueros: "no",
    objetivos: [],
    espacio: "cuarto",
    material: { aros: 12 },
    duracion: { min: 5, max: 10 },
    organizacion: "Dos líneas de aros en zigzag por estación. Grupos de 4 o 5.",
    consigna: "Saltos de un aro al otro con un pie, con dos, adentro-afuera y en zigzag. Al final, trote suave de vuelta.",
    puntosClave: ["Aterrizá suave, con las rodillas flexionadas", "Contacto corto con el piso", "Rodillas alineadas con la punta de los pies"],
    errores: [
      { error: "Aterrizan con las rodillas hacia adentro", correccion: "Menos distancia entre aros y pedí aterrizajes quietos dos segundos" },
      { error: "Se apuran y pisan los aros", correccion: "Ritmo marcado en voz alta por el entrenador" },
    ],
    variantes: { inicial: "Dos pies en cada aro.", intermedio: "Un pie, alternando.", avanzado: "Un pie, saltando un aro sí y otro no." },
    progresion: { masFacil: "Aros más juntos.", masDificil: "Pique de 5 metros al salir del último aro." },
    pizarra: (() => {
      const aros = muchos(aro, "r", 6);
      const pts = Array.from({ length: 6 }, (_, i) => p(58 + i * 3, 27.5 + (i % 2 ? 1.8 : -1.8)));
      return pizarra("media", [...aros, A(1), A(2), A(3)], { ...asignar(aros, pts), a1: p(55, 27.5), a2: p(52.5, 27.5), a3: p(50, 27.5) }, [
        { ms: 1600, movs: [corre("a1", p(76, 27.5), p(66, 23)), corre("a2", p(55, 27.5)), corre("a3", p(52.5, 27.5))] },
        { ms: 1200, movs: [corre("a1", p(82, 33), p(80, 28))] },
      ]);
    })(),
  }),

  ejercicio({
    id: "trote-perimetro-cambios-ritmo",
    nombre: "Trote por el perímetro con cambios de ritmo",
    fase: "calor_sin_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "individual" },
    intensidad: 1,
    arqueros: "opcional",
    objetivos: [],
    espacio: "media",
    material: {},
    duracion: { min: 5, max: 10 },
    organizacion: "Todos juntos alrededor de media cancha. Los arqueros con los demás, sin equipo.",
    consigna: "Trote suave por los laterales; en la línea de fondo, progresivo hasta el 70%; en la mitad de cancha, caminata. Tres vueltas.",
    puntosClave: ["Trote conversado: si no podés hablar, vas muy rápido", "Progresivo de verdad: de menos a más", "Caminá en la mitad para respirar"],
    errores: [
      { error: "El progresivo se vuelve un pique", correccion: "Ponele número: 70% es correr fuerte, no correr al máximo" },
      { error: "El grupo se estira mucho", correccion: "El que va adelante marca el ritmo del grupo, no el suyo" },
    ],
    variantes: { inicial: "Dos vueltas, sin progresivos.", intermedio: "Tres vueltas con progresivo.", avanzado: "Tres vueltas con progresivo y desplazamiento lateral en la mitad." },
    progresion: { masFacil: "Solo trote.", masDificil: "Sumá skipping en la línea de 23." },
    pizarra: (() => {
      const grupo = equipo(A, 5);
      return pizarra("media", grupo, asignar(grupo, enLinea(5, p(50, 2), p(62, 2))), [
        // Trote por el lateral hasta el córner y progresivo por la línea de fondo.
        { ms: 2200, movs: grupo.map((g, i) => corre(g.id, p(76 + i * 3, 2.5))) },
        { ms: 2200, movs: grupo.map((g, i) => corre(g.id, p(89, 12 + i * 7))) },
      ]);
    })(),
  }),

  ejercicio({
    id: "zancadas-movilidad-parejas",
    nombre: "Zancadas y movilidad de cadera en parejas",
    fase: "calor_sin_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "parejas" },
    intensidad: 1,
    arqueros: "opcional",
    objetivos: [],
    espacio: "cuarto",
    material: { conos: 4, colores: 0 },
    duracion: { min: 5, max: 10 },
    organizacion: "Parejas, una al lado de la otra, en una franja de 15 metros.",
    consigna: "Ida con zancadas y giro de tronco hacia la pierna de adelante; vuelta con apertura y cierre de cadera caminando. El compañero corrige.",
    puntosClave: ["Rodilla de adelante sobre el tobillo, no más allá", "Tronco derecho en la zancada", "El compañero mira y corrige: es parte del trabajo"],
    errores: [
      { error: "La rodilla de adelante pasa la punta del pie", correccion: "Paso más largo: que la canilla quede vertical" },
      { error: "Hacen la zancada con el tronco tirado adelante", correccion: "Manos en la cintura y mirada al frente" },
    ],
    variantes: { inicial: "Zancadas cortas sin giro.", intermedio: "Zancadas con giro de tronco.", avanzado: "Zancadas con giro y palo arriba de la cabeza." },
    progresion: { masFacil: "Menos repeticiones.", masDificil: "Zancada lateral y hacia atrás." },
    pizarra: (() => {
      const pares = [...equipo(A, 3), ...equipo(B, 3)];
      const ini = { ...asignar(equipo(A, 3), enLinea(3, p(55, 16), p(55, 38))), ...asignar(equipo(B, 3), enLinea(3, p(55, 19.5), p(55, 41.5))) };
      return pizarra("media", [zona("z", 18, 34), ...pares], { z: p(64, 28.5), ...ini }, [
        { ms: 2200, movs: equipo(A, 3).map((a, i) => corre(a.id, p(72, 16 + i * 11))) },
        { ms: 1600, movs: equipo(B, 3).map((b, i) => corre(b.id, p(70, 19.5 + i * 11))) },
      ]);
    })(),
  }),
];
