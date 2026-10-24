import { A, asignar, bocha, conduce, cono, corre, ejercicio, enLinea, enRonda, equipo, muchos, p, pasa, pegada, pizarra, zona } from "./armar";
import type { Ejercicio, Punto } from "@/lib/tipos";

const centro = p(68, 27.5);

export const CALOR_CON_BOCHA_2: Ejercicio[] = [
  ejercicio({
    id: "cuatro-esquinas-pase-sigo",
    nombre: "Cuatro esquinas: paso y sigo",
    fase: "calor_con_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "grupos", k: 5 },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["pase_recepcion"],
    espacio: "cuarto",
    material: { bochas: 2, conos: 4 },
    duracion: { min: 8, max: 15 },
    organizacion: "Cuadrado de 12 metros con un cono por esquina; el que sobra arranca en la esquina de la bocha.",
    consigna: "Push a la esquina de la derecha y salgo detrás de mi pase. El que recibe controla y pasa a la siguiente. Al minuto, cambio de sentido.",
    puntosClave: ["Recibí con el palo apoyado del lado de donde viene", "Controlá hacia la próxima esquina", "Seguí tu pase sin cortar por adentro"],
    errores: [
      { error: "Controlan con la bocha en los pies", correccion: "Que la bocha quede un metro adelante y a la derecha después del control" },
      { error: "Pases lentos que se frenan en el pasto", correccion: "Push firme: el pie de adelante apunta al compañero" },
    ],
    variantes: { inicial: "Una bocha, dos toques.", intermedio: "Dos bochas a la vez.", avanzado: "Dos bochas, pase de primera." },
    progresion: { masFacil: "Cuadrado de 10 metros.", masDificil: "Recepción de revés en esquinas impares." },
    pizarra: (() => {
      const esquinas = [p(62, 21.5), p(74, 21.5), p(74, 33.5), p(62, 33.5)];
      const conos = muchos(cono, "c", 4);
      const gente = equipo(A, 5);
      return pizarra(
        "media",
        [...conos, ...gente, bocha("o")],
        { ...asignar(conos, esquinas.map((q) => p(q.x - 1.4, q.y - 1.4))), ...asignar(gente, [...esquinas, p(59.5, 21.5)]), o: pegada(esquinas[0], 1.3, 0.6) },
        [
          { ms: 1100, movs: [pasa("o", p(72.6, 22.1)), corre("a1", p(71.5, 19.5))] },
          { ms: 1100, movs: [pasa("o", p(73.4, 32.1)), corre("a2", p(76.5, 31))] },
          { ms: 1100, movs: [pasa("o", p(63.4, 33.1)), corre("a3", p(64.5, 36))] },
        ],
      );
    })(),
  }),

  ejercicio({
    id: "conduccion-cambios-ritmo-conos",
    nombre: "Conducción con cambios de ritmo",
    fase: "calor_con_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "individual" },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["conduccion"],
    espacio: "media",
    material: { bochas: 1, conos: 12 },
    duracion: { min: 8, max: 12 },
    organizacion: "Carriles de 30 metros con un cono cada 10. Un jugador por carril, cada uno con su bocha.",
    consigna: "Conducción suave hasta el primer cono, acelerar hasta el segundo, frenar con la bocha controlada en el tercero. Vuelta de revés.",
    puntosClave: ["Acelerá empujando la bocha más lejos, no más fuerte", "Frená con el palo adelante de la bocha", "Cabeza arriba en el tramo suave"],
    errores: [
      { error: "En la aceleración pierden la bocha", correccion: "Toques más largos pero siempre al alcance del palo" },
      { error: "Frenan pisando la bocha", correccion: "El palo se adelanta y la bocha se frena contra la cara del palo" },
    ],
    variantes: { inicial: "Sin aceleración: suave y frenada.", intermedio: "Suave, aceleración y frenada.", avanzado: "Con cambio de dirección al frenar." },
    progresion: { masFacil: "Carril de 20 metros.", masDificil: "Conducción de revés en el tramo rápido." },
    pizarra: (() => {
      const ys = [12, 22, 33, 43];
      const gente = equipo(A, 4);
      const ini: Record<string, Punto> = asignar(gente, ys.map((y) => p(50, y)));
      ys.forEach((y, i) => {
        ini[`o${i + 1}`] = pegada(p(50, y), 1.4, 0.7);
        [0, 1, 2].forEach((k) => (ini[`c${i + 1}${k}`] = p(58 + k * 10, y + 2.5)));
      });
      return pizarra("media", [...gente, ...muchos(bocha, "o", 4), ...ys.flatMap((_, i) => [0, 1, 2].map((k) => cono(`c${i + 1}${k}`)))], ini, [
        { ms: 1500, movs: ys.map((y, i) => conduce(`a${i + 1}`, p(58, y))) },
        { ms: 1000, movs: ys.map((y, i) => conduce(`a${i + 1}`, p(68, y))) },
        { ms: 1500, movs: ys.map((y, i) => conduce(`a${i + 1}`, p(76, y))) },
      ]);
    })(),
  }),

  ejercicio({
    id: "reves-recepcion-salida-derecha",
    nombre: "Recepción de revés y salida por derecha",
    fase: "calor_con_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "parejas" },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["pase_recepcion", "conduccion"],
    espacio: "cuarto",
    material: { bochas: 1, conos: 2 },
    duracion: { min: 8, max: 12 },
    organizacion: "Parejas a 10 metros. Un cono a 3 metros a la izquierda del que recibe.",
    consigna: "El pasador pasa a la izquierda del receptor. Recepción de revés, giro y salida por derecha rodeando el cono; push de vuelta al pasador.",
    puntosClave: ["Palo de revés bien abierto y apoyado", "Recibí adelante del pie izquierdo", "Salí por derecha en un toque"],
    errores: [
      { error: "La bocha pega en los pies al recibir de revés", correccion: "Pie derecho atrás y palo lejos del cuerpo" },
      { error: "Giran con la bocha parada", correccion: "El primer toque después de la recepción ya es hacia adelante" },
    ],
    variantes: { inicial: "Pase lento y recepción quieta.", intermedio: "Recepción y salida en dos toques.", avanzado: "Pase fuerte y salida de primera." },
    progresion: { masFacil: "Recibir de derecho y salir por revés.", masDificil: "Un defensor pasivo detrás del cono." },
    pizarra: pizarra(
      "media",
      [A(1), A(2), bocha("o"), cono("c")],
      { a1: p(58, 27.5), a2: p(70, 27.5), o: pegada(p(58, 27.5), 1.3, 0.6), c: p(70, 31.5) },
      [
        { ms: 1100, movs: [pasa("o", p(69, 29.8))] },
        { ms: 1500, movs: [conduce("a2", p(73, 26), p(74, 32))] },
        { ms: 1100, movs: [pasa("o", p(59.4, 28.1))] },
      ],
    ),
  }),

  ejercicio({
    id: "pasillo-trio-movimiento",
    nombre: "Pasillo de pases en trío",
    fase: "calor_con_bocha",
    jugadores: { min: 6, max: 30 },
    formato: { tipo: "grupos", k: 3 },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["pase_recepcion"],
    espacio: "media",
    material: { bochas: 1 },
    duracion: { min: 8, max: 15 },
    organizacion: "Tríos avanzando en paralelo a lo largo de media cancha, a 8 metros uno del otro. Una bocha por trío.",
    consigna: "El del medio recibe y abre a un costado; el de afuera devuelve al medio adelantado. Llegan al fondo con 6 a 8 pases y vuelven trotando.",
    puntosClave: ["Pase adelante del compañero, al espacio", "El del medio recibe perfilado", "Los de afuera no se adelantan a la bocha"],
    errores: [
      { error: "Pases para atrás que frenan el avance", correccion: "Cada pase tiene que ganar al menos dos metros" },
      { error: "Se cierran todos al medio", correccion: "Marcá los carriles con conos en la de 23" },
    ],
    variantes: { inicial: "Caminando.", intermedio: "Trotando, dos toques.", avanzado: "A ritmo de juego, un toque." },
    progresion: { masFacil: "Solo pases al medio.", masDificil: "Cambio de posición después de cada pase." },
    pizarra: (() => {
      const gente = equipo(A, 3);
      return pizarra(
        "media",
        [...gente, bocha("o")],
        { ...asignar(gente, [p(50, 17), p(50, 27.5), p(50, 38)]), o: pegada(p(50, 27.5), 1.3, 0.7) },
        [
          { ms: 1200, movs: [pasa("o", p(60.6, 17.6)), corre("a1", p(59, 17)), corre("a2", p(57, 27.5)), corre("a3", p(58, 38))] },
          { ms: 1200, movs: [pasa("o", p(66.4, 28.2)), corre("a1", p(66, 17)), corre("a2", p(65, 27.5)), corre("a3", p(66, 38))] },
          { ms: 1200, movs: [pasa("o", p(75.6, 38.6)), corre("a1", p(74, 17)), corre("a2", p(73, 27.5)), corre("a3", p(74, 38))] },
        ],
      );
    })(),
  }),

  ejercicio({
    id: "toco-y-me-voy-pared",
    nombre: "Toco y me voy: la pared en tríos",
    fase: "calor_con_bocha",
    jugadores: { min: 6, max: 30 },
    formato: { tipo: "grupos", k: 3 },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["pase_recepcion", "transicion"],
    espacio: "cuarto",
    material: { bochas: 1, conos: 2 },
    duracion: { min: 8, max: 12 },
    organizacion: "Tríos: uno conduce, uno hace de pared a 8 metros en diagonal, uno espera en el fondo.",
    consigna: "Conduzco, paso a la pared y pico por adelante; la pared devuelve de primera al espacio. Recibo, paso al del fondo y roto.",
    puntosClave: ["Pasá y arrancá en el mismo movimiento", "La pared devuelve al espacio, no a los pies", "Picá en diagonal para ganar la espalda"],
    errores: [
      { error: "El que pasa se queda mirando el pase", correccion: "Que la pared solo devuelva si el pasador ya arrancó" },
      { error: "La pared controla y frena el juego", correccion: "Un toque obligatorio para la pared" },
    ],
    variantes: { inicial: "Pared con dos toques.", intermedio: "Pared de primera.", avanzado: "Pared de primera de revés." },
    progresion: { masFacil: "Distancias más cortas.", masDificil: "Un defensor pasivo entre el pasador y la pared." },
    pizarra: pizarra(
      "media",
      [A(1), A(2), A(3), bocha("o"), cono("c1"), cono("c2")],
      { a1: p(52, 33), a2: p(64, 23), a3: p(82, 30), o: pegada(p(52, 33), 1.3, 0.6), c1: p(58, 31), c2: p(70, 33) },
      [
        { ms: 1100, movs: [conduce("a1", p(58, 34))] },
        { ms: 1100, movs: [pasa("o", p(63.6, 24.4)), corre("a1", p(68, 31), p(64, 34))] },
        { ms: 1100, movs: [pasa("o", p(70.8, 30.2)), corre("a1", p(70, 30))] },
        { ms: 1100, movs: [pasa("o", p(80.8, 30.4))] },
      ],
    ),
  }),

  ejercicio({
    id: "ronda-dos-bochas",
    nombre: "Ronda de pases con dos bochas",
    fase: "calor_con_bocha",
    jugadores: { min: 5, max: 30 },
    formato: { tipo: "grupos", k: 6 },
    intensidad: 1,
    arqueros: "no",
    objetivos: ["pase_recepcion"],
    espacio: "cuarto",
    material: { bochas: 2 },
    duracion: { min: 6, max: 12 },
    organizacion: "Rondas de 6 en un círculo de 10 metros de diámetro. Dos bochas por ronda.",
    consigna: "Pases a cualquiera que no sea el de al lado, diciendo el nombre. Con dos bochas a la vez hay que mirar antes de pasar.",
    puntosClave: ["Mirá antes de recibir: ¿dónde está la otra bocha?", "Decí el nombre antes de pasar", "Control hacia adentro de la ronda"],
    errores: [
      { error: "Dos bochas al mismo jugador", correccion: "Primero contacto visual, después el pase" },
      { error: "Pases flojos que no llegan", correccion: "Push con el pie de adelante apuntando" },
    ],
    variantes: { inicial: "Una bocha.", intermedio: "Dos bochas.", avanzado: "Dos bochas y un toque." },
    progresion: { masFacil: "Ronda más chica.", masDificil: "Tres bochas." },
    pizarra: (() => {
      const gente = equipo(A, 6);
      const lugares = enRonda(6, centro, 6.5, -90);
      return pizarra(
        "media",
        [...gente, bocha("o"), bocha("q")],
        { ...asignar(gente, lugares), o: p(lugares[0].x - 1.2, lugares[0].y + 0.8), q: p(lugares[3].x + 1.2, lugares[3].y - 0.8) },
        [
          { ms: 1100, movs: [pasa("o", p(lugares[2].x - 1, lugares[2].y - 1.2)), pasa("q", p(lugares[5].x + 1, lugares[5].y + 1.2))] },
          { ms: 1100, movs: [pasa("o", p(lugares[4].x + 1.2, lugares[4].y - 0.4)), pasa("q", p(lugares[1].x - 1.2, lugares[1].y + 0.4))] },
        ],
      );
    })(),
  }),

  ejercicio({
    id: "push-largo-en-y",
    nombre: "Push largo en Y",
    fase: "calor_con_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "grupos", k: 4 },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["pase_recepcion", "salida"],
    espacio: "media",
    material: { bochas: 2, conos: 4 },
    duracion: { min: 8, max: 15 },
    organizacion: "Forma de Y: una base, un vértice central a 12 metros y dos puntas abiertas a 12 metros más.",
    consigna: "La base pasa al centro; el centro recibe perfilado y abre largo a una punta. La punta conduce de vuelta a la base. Todos rotan una posición.",
    puntosClave: ["El centro decide la punta antes de recibir", "Push largo: más brazo y más peso, no más golpe", "La punta recibe ya saliendo"],
    errores: [
      { error: "El centro recibe de espaldas a las puntas", correccion: "Que se abra un paso al costado antes de pedirla" },
      { error: "El pase largo sale botando", correccion: "Bocha adelante del pie de adelante y empujar hasta el final" },
    ],
    variantes: { inicial: "Pases cortos.", intermedio: "Pase largo a 12 metros.", avanzado: "Pase largo de revés a la punta izquierda." },
    progresion: { masFacil: "Sin rotación.", masDificil: "Un defensor pasivo en el centro." },
    pizarra: pizarra(
      "media",
      [A(1), A(2), A(3), A(4), bocha("o"), ...muchos(cono, "c", 4)],
      {
        a1: p(52, 27.5), a2: p(64, 27.5), a3: p(76, 18), a4: p(76, 37),
        o: pegada(p(52, 27.5), 1.3, 0.6),
        c1: p(50, 29), c2: p(64, 30), c3: p(78, 16.5), c4: p(78, 39),
      },
      [
        { ms: 1100, movs: [pasa("o", p(62.6, 28.2))] },
        { ms: 1300, movs: [pasa("o", p(74.8, 19.2), p(70, 21)), corre("a3", p(74.5, 19))] },
        { ms: 1800, movs: [conduce("a3", p(55, 24), p(66, 17))] },
      ],
    ),
  }),

  ejercicio({
    id: "recepcion-orientada-reloj",
    nombre: "Recepción orientada en el reloj",
    fase: "calor_con_bocha",
    jugadores: { min: 5, max: 30 },
    formato: { tipo: "grupos", k: 5 },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["pase_recepcion"],
    espacio: "cuarto",
    material: { bochas: 1, conos: 5 },
    duracion: { min: 8, max: 12 },
    organizacion: "Un jugador en el centro y cuatro alrededor, a 8 metros, como las horas 12, 3, 6 y 9.",
    consigna: "Pasa la 12 al centro, que recibe orientado hacia la 3 y le pasa. La 3 pasa al centro, que orienta hacia la 6. El centro cambia cada vuelta.",
    puntosClave: ["El centro mira a quién va a pasar antes de recibir", "Recibí con el cuerpo de costado", "Pase y desmarque corto del centro"],
    errores: [
      { error: "El centro recibe de frente y gira", correccion: "Que abra el pie hacia la hora siguiente antes del pase" },
      { error: "Los de afuera pasan sin mirar si el centro está listo", correccion: "El centro pide con el palo: sin palo apoyado no hay pase" },
    ],
    variantes: { inicial: "Dos toques en el centro.", intermedio: "Recepción orientada y pase.", avanzado: "Pase de primera, alternando derecho y revés." },
    progresion: { masFacil: "Distancias de 6 metros.", masDificil: "Un defensor pasivo pegado al centro." },
    pizarra: (() => {
      const horas = enRonda(4, centro, 8, -90);
      const afuera = equipo(A, 4);
      return pizarra(
        "media",
        [...afuera, A(5), bocha("o")],
        { ...asignar(afuera, horas), a5: centro, o: p(horas[0].x - 1.2, horas[0].y + 1) },
        [
          { ms: 1100, movs: [pasa("o", p(centro.x - 1.3, centro.y - 0.6))] },
          { ms: 1100, movs: [pasa("o", p(horas[1].x - 1.3, horas[1].y))] },
          { ms: 1100, movs: [pasa("o", p(centro.x + 1.3, centro.y + 0.5)), corre("a5", p(centro.x + 0.5, centro.y))] },
          { ms: 1100, movs: [pasa("o", p(horas[2].x + 1, horas[2].y - 1.2))] },
        ],
      );
    })(),
  }),

  ejercicio({
    id: "conduccion-frenada-giro",
    nombre: "Conducción, frenada y giro",
    fase: "calor_con_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "individual" },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["conduccion"],
    espacio: "media",
    material: { bochas: 1 },
    duracion: { min: 6, max: 12 },
    organizacion: "Todos con bocha en media cancha, dispersos.",
    consigna: "Conducción libre. Al silbato, frenada en seco con la bocha protegida; a dos silbatos, giro de 180° por revés y salida rápida.",
    puntosClave: ["Frená con el cuerpo entre el rival imaginario y la bocha", "Giro corto, con la bocha cerca del palo", "Salí acelerando, no al trote"],
    errores: [
      { error: "La bocha se les va al frenar", correccion: "Que bajen la velocidad apenas escuchan el silbato y frenen en dos toques cortos" },
      { error: "Giran abriendo mucho", correccion: "El giro se hace en el lugar, pivotando sobre el pie izquierdo" },
    ],
    variantes: { inicial: "Solo frenada.", intermedio: "Frenada y giro.", avanzado: "Frenada, giro y pase a un compañero." },
    progresion: { masFacil: "Más espacio.", masDificil: "Medio campo más chico y más gente." },
    pizarra: (() => {
      const gente = equipo(A, 4);
      const salida = [p(52, 12), p(56, 30), p(54, 44), p(62, 20)];
      const ini: Record<string, Punto> = asignar(gente, salida);
      salida.forEach((q, i) => (ini[`o${i + 1}`] = pegada(q, 1.4, 0.6)));
      return pizarra("media", [...gente, ...muchos(bocha, "o", 4)], ini, [
        { ms: 1500, movs: gente.map((g, i) => conduce(g.id, p(salida[i].x + 14, salida[i].y + (i % 2 ? 3 : -3)))) },
        { ms: 1200, movs: gente.map((g, i) => conduce(g.id, p(salida[i].x + 6, salida[i].y + (i % 2 ? 6 : -6)), p(salida[i].x + 18, salida[i].y + (i % 2 ? 7 : -7)))) },
      ]);
    })(),
  }),

  ejercicio({
    id: "slalom-reves-pase-carril",
    nombre: "Revés en línea y pase de vuelta",
    fase: "calor_con_bocha",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "grupos", k: 4 },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["conduccion", "pase_recepcion"],
    espacio: "media",
    material: { bochas: 2, conos: 8 },
    duracion: { min: 8, max: 12 },
    organizacion: "Pasillo de 2 metros entre dos filas de conos, de 15 metros. Dos de cada lado.",
    consigna: "Conducción de revés por el pasillo sin tocar los conos; a la salida, push al de la otra punta y paso a la cola.",
    puntosClave: ["Revés con la bocha a la izquierda del cuerpo", "Mano derecha baja en el palo", "Pase al salir del pasillo, sin frenar"],
    errores: [
      { error: "Pasan la bocha a derecho dentro del pasillo", correccion: "Pasillo angosto: solo entra el revés" },
      { error: "Conducen erguidos", correccion: "Que toquen el pasto con la mano izquierda al empezar" },
    ],
    variantes: { inicial: "Pasillo ancho.", intermedio: "Pasillo de 2 metros.", avanzado: "Pasillo con curva." },
    progresion: { masFacil: "Pasillo de 10 metros.", masDificil: "Pase de revés al salir." },
    pizarra: (() => {
      const conos = [...enLinea(4, p(58, 25.5), p(72, 25.5)), ...enLinea(4, p(58, 29.5), p(72, 29.5))];
      const cs = muchos(cono, "c", 8);
      return pizarra(
        "media",
        [...cs, A(1), A(2), A(3), A(4), bocha("o"), bocha("q"), zona("z", 16, 4)],
        { ...asignar(cs, conos), z: p(65, 27.5), a1: p(54, 27.5), a2: p(51, 27.5), a3: p(79, 27.5), a4: p(82, 27.5), o: pegada(p(54, 27.5), 1.3, -0.6), q: pegada(p(79, 27.5), -1.3, 0.6) },
        [
          { ms: 2000, movs: [conduce("a1", p(74, 27.5), p(65, 26.5)), corre("a2", p(54, 27.5))] },
          { ms: 1100, movs: [pasa("o", p(78, 28)), corre("a1", p(76, 31))] },
        ],
      );
    })(),
  }),
];
