import { A, B, K, arcoChico, bocha, conduce, cono, corre, ejercicio, p, pasa, pegada, pizarra, tira, zona } from "./armar";
import type { Ejercicio } from "@/lib/tipos";

export const PRINCIPAL: Ejercicio[] = [
  ejercicio({
    id: "push-recepcion-orientada-triangulos",
    nombre: "Push y recepción orientada en triángulos",
    fase: "principal",
    jugadores: { min: 6, max: 30 },
    formato: { tipo: "grupos", k: 3 },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["pase_recepcion"],
    espacio: "media",
    material: { bochas: 1, conos: 3 },
    duracion: { min: 12, max: 25 },
    organizacion: "Triángulos de conos de 10–12 metros, un jugador por cono y una bocha por triángulo.",
    consigna: "Push al compañero; recibe perfilado hacia el tercer cono, sale conduciendo dos metros y pasa. Cambiar el sentido cada dos minutos.",
    puntosClave: ["Recibí perfilado hacia donde vas a salir", "Push con el peso en la pierna de adelante", "Pedila con el palo apoyado en el piso"],
    errores: [
      { error: "Reciben de frente y giran con la bocha parada", correccion: "Marcá con un plato hacia dónde tiene que mirar el pie de adelante al recibir" },
      { error: "El push sale levantado", correccion: "Cabeza del palo pegada al piso y empujá hasta el final, sin pegar" },
    ],
    variantes: {
      inicial: "Recepción quieta y pase; sin conducción.",
      intermedio: "Recepción orientada y conducción corta.",
      avanzado: "Recepción de revés y pase de primera al tercer vértice.",
    },
    progresion: { masFacil: "Triángulos de 8 metros.", masDificil: "Un defensor pasivo en el medio del triángulo." },
    pizarra: pizarra(
      "media",
      [A(1), A(2), A(3), A(4), A(5), A(6), cono("c1"), cono("c2"), cono("c3"), cono("c4"), cono("c5"), cono("c6"), bocha("o"), bocha("q")],
      {
        a1: p(56, 22), a2: p(72, 13), a3: p(74, 30), a4: p(58, 40), a5: p(72, 36), a6: p(80, 47),
        c1: p(54, 24), c2: p(72, 10), c3: p(76, 32), c4: p(56, 42), c5: p(70, 38.5), c6: p(82, 49),
        o: pegada(p(56, 22), 1.6, 0.6), q: pegada(p(58, 40), 1.6, 0.6),
      },
      [
        { ms: 1200, movs: [pasa("o", p(72, 14.6)), pasa("q", p(72, 37.6))] },
        { ms: 1400, movs: [conduce("a2", p(83, 20), p(79, 15))] },
        { ms: 1200, movs: [pasa("o", p(75.4, 31.2)), pasa("q", p(81.4, 48.2))] },
      ],
    ),
  }),

  ejercicio({
    id: "quite-marca-carriles-1v1",
    nombre: "Quite y marca en carriles, 1 contra 1",
    fase: "principal",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "parejas" },
    intensidad: 3,
    arqueros: "no",
    objetivos: ["quite_marca", "conduccion"],
    espacio: "media",
    material: { bochas: 1, conos: 8, arcosChicos: 1 },
    duracion: { min: 12, max: 20 },
    organizacion: "Carriles de 30 × 10 metros con un arco chico al fondo. Parejas: uno ataca conduciendo, el otro marca.",
    consigna: "El atacante sale conduciendo y busca hacer el gol en el arco chico. El defensor acompaña de perfil y busca el quite sin falta. Cambian de rol en cada repetición.",
    puntosClave: ["Defendé de perfil, nunca de frente", "Esperá el error: no te tires al quite", "Palo abajo, del lado del revés"],
    errores: [
      { error: "El defensor se tira y queda pasado", correccion: "Que cuente dos pasos de acompañamiento antes de intentar el quite" },
      { error: "El defensor marca de frente y lo pasan por cualquier lado", correccion: "Pie de adelante del lado del derecho del atacante para cerrarle el camino" },
    ],
    variantes: {
      inicial: "Defensor pasivo: solo acompaña, no roba.",
      intermedio: "Defensor activo, carril de 10 metros de ancho.",
      avanzado: "Carril de 8 metros y gol solo si se pasa al defensor.",
    },
    progresion: { masFacil: "Carril más ancho.", masDificil: "El que recupera contraataca hacia el otro lado." },
    pizarra: (() => {
      const ys = [12, 27.5, 43];
      const ini: Record<string, { x: number; y: number }> = {};
      ys.forEach((y, i) => {
        ini[`z${i}`] = p(69, y);
        ini[`a${i + 1}`] = p(54, y + (i === 1 ? 2 : -1.5));
        ini[`b${i + 1}`] = p(70, y + (i === 1 ? -1 : 1.5));
        ini[`o${i}`] = p(55.6, y + (i === 1 ? 2.8 : -0.7));
        ini[`g${i}`] = p(86.5, y);
      });
      return pizarra(
        "media",
        [zona("z0", 34, 11), zona("z1", 34, 11), zona("z2", 34, 11), A(1), A(2), A(3), B(1), B(2), B(3), bocha("o0"), bocha("o1"), bocha("o2"), arcoChico("g0"), arcoChico("g1"), arcoChico("g2")],
        ini,
        [
          {
            ms: 2200,
            movs: ys.flatMap((y, i) => [
              conduce(`a${i + 1}`, p(68, y + (i === 1 ? -2 : 2)), p(61, y + (i === 1 ? 4 : -3))),
              corre(`b${i + 1}`, p(73, y + (i === 1 ? -0.5 : 1))),
            ]),
          },
          {
            ms: 1800,
            movs: ys.flatMap((y, i) => [
              conduce(`a${i + 1}`, p(78, y + (i === 1 ? 2 : -2)), p(74, y + (i === 1 ? -4 : 4))),
              corre(`b${i + 1}`, p(79, y + (i === 1 ? 0.5 : -0.5))),
            ]),
          },
        ],
      );
    })(),
  }),

  ejercicio({
    id: "definicion-pase-desde-costado",
    nombre: "Definición tras pase desde el costado",
    fase: "principal",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "grupos", k: 4 },
    intensidad: 2,
    arqueros: "arco_chico",
    objetivos: ["definicion", "pase_recepcion"],
    espacio: "area",
    material: { bochas: 10, conos: 4 },
    duracion: { min: 12, max: 25 },
    organizacion: "Una fila de pasadores en el costado del área, a la altura de la línea punteada, y una fila de delanteros en el borde del área por el medio. Si no hay arquero, dos arcos chicos en los palos.",
    consigna: "El pasador conduce dos metros y mete el pase al punto penal. El delantero entra en diagonal, controla y define. Después cambian de fila.",
    puntosClave: ["Entrá en diagonal para ver bocha y arco a la vez", "Control orientado hacia el arco, no hacia atrás", "Definí rasante y cruzado"],
    errores: [
      { error: "El delantero llega antes que la bocha y se frena", correccion: "Que arranque cuando el pasador levanta la cabeza, no antes" },
      { error: "Definen fuerte al medio, al cuerpo del arquero", correccion: "Marcá dos zonas con conos en los palos: el gol solo vale ahí" },
    ],
    variantes: {
      inicial: "Pase quieto y control con tiempo; definición con push.",
      intermedio: "Pase en movimiento y definición de primera o con un control.",
      avanzado: "Defensor que sale desde el punto penal cuando sale el pase.",
    },
    progresion: { masFacil: "Pase más corto, desde el borde del área.", masDificil: "Definición de revés obligatoria." },
    pizarra: pizarra(
      "area",
      [K("k"), A(1), A(2), A(3), A(4), bocha("o"), cono("c1"), cono("c2")],
      {
        k: p(89.8, 27.5),
        a1: p(77, 7.5), a3: p(74, 5.5),
        a2: p(73, 29), a4: p(70.5, 31),
        o: pegada(p(77, 7.5), 1.2, 1),
        c1: p(74.5, 4), c2: p(71, 33),
      },
      [
        { ms: 1300, movs: [conduce("a1", p(80.5, 11), p(80, 8))] },
        { ms: 1200, movs: [pasa("o", p(84.2, 24.4)), corre("a2", p(83, 24), p(79, 27))] },
        { ms: 900, movs: [tira("o", p(91.6, 29))] },
      ],
    ),
  }),

  ejercicio({
    id: "dos-contra-uno-al-arco",
    nombre: "2 contra 1 hacia el arco",
    fase: "principal",
    jugadores: { min: 6, max: 30 },
    formato: { tipo: "superioridad", atacan: 2, defienden: 1 },
    intensidad: 3,
    arqueros: "opcional",
    objetivos: ["definicion", "transicion"],
    espacio: "media",
    material: { bochas: 10, conos: 6 },
    duracion: { min: 12, max: 20 },
    organizacion: "Dos atacantes salen desde la mitad de cancha con una bocha. Un defensor espera en la de 23. Arco con arquero, o dos arcos chicos.",
    consigna: "Los atacantes tienen 10 segundos para definir. El que tiene la bocha fija al defensor conduciendo hacia él y pasa en el momento justo. El defensor intenta demorar y cortar el pase.",
    puntosClave: ["Conducí hacia el defensor para fijarlo", "El compañero abre la cancha y llega en profundidad", "Pasá cuando el defensor se compromete, ni antes ni después"],
    errores: [
      { error: "Pasan apenas arrancan y el defensor no tiene que decidir nada", correccion: "El pase recién vale después de entrar a la de 23" },
      { error: "Los dos atacantes van pegados", correccion: "Marcá un carril para cada uno con conos: tienen que estar separados por lo menos 8 metros" },
    ],
    variantes: {
      inicial: "Defensor que solo puede caminar.",
      intermedio: "Defensor activo, 10 segundos.",
      avanzado: "Un segundo defensor sale desde atrás a los 3 segundos (2 contra 2).",
    },
    progresion: { masFacil: "Más tiempo y más ancho.", masDificil: "6 segundos para definir." },
    pizarra: pizarra(
      "media",
      [K("k"), A(1), A(2), B(1), bocha("o"), cono("c1"), cono("c2")],
      {
        k: p(89.8, 27.5),
        a1: p(52, 22), a2: p(52, 36), b1: p(68.5, 27.5),
        o: pegada(p(52, 22), 1.4, 0.8),
        c1: p(50, 18), c2: p(50, 40),
      },
      [
        { ms: 1700, movs: [conduce("a1", p(64, 24), p(58, 21)), corre("a2", p(66, 38)), corre("b1", p(70, 26.5))] },
        { ms: 1100, movs: [pasa("o", p(75.4, 36)), corre("a2", p(74, 35)), corre("b1", p(71.5, 28.5))] },
        { ms: 1200, movs: [conduce("a2", p(82, 32), p(79, 35)), corre("a1", p(80, 24))] },
        { ms: 900, movs: [tira("o", p(91.6, 28.6))] },
      ],
    ),
  }),

  ejercicio({
    id: "barrida-flick-distancia",
    nombre: "Barrida y flick a distancia",
    fase: "principal",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "parejas" },
    intensidad: 2,
    arqueros: "no",
    objetivos: ["pase_recepcion", "salida"],
    espacio: "media",
    material: { bochas: 1, conos: 4 },
    duracion: { min: 12, max: 20 },
    organizacion: "Parejas enfrentadas a 18–25 metros, una bocha por pareja. Una puerta de conos de 3 metros adelante de cada uno.",
    consigna: "Pase largo con barrida por el piso para que pase por la puerta del compañero. Cada cinco pases, cambian a flick dirigido a la misma puerta.",
    puntosClave: ["Pie izquierdo adelante, apuntando a la puerta", "En la barrida, el palo barre el piso antes de la bocha", "En el flick, la bocha sale desde adelante del pie, empujada, sin pegar"],
    errores: [
      { error: "La barrida sale levantada", correccion: "Que el palo toque el piso un palmo antes de la bocha: si no suena el piso, no vale" },
      { error: "El flick se hace con un golpe de muñeca", correccion: "Bocha bien adelante, palo pegado a la bocha y empujar con todo el cuerpo de abajo hacia arriba" },
    ],
    variantes: {
      inicial: "Push largo a 15 metros en lugar de barrida y flick.",
      intermedio: "Barrida a 20 metros y flick a 15.",
      avanzado: "Barrida a 25 metros y flick por encima de una valla a mitad de camino.",
    },
    progresion: { masFacil: "Puerta más ancha y más cerca.", masDificil: "Recepción con un solo toque antes de devolver." },
    pizarra: (() => {
      const ys = [12, 27.5, 43];
      const ini: Record<string, { x: number; y: number }> = {};
      ys.forEach((y, i) => {
        ini[`a${i + 1}`] = p(53, y);
        ini[`b${i + 1}`] = p(77, y);
        ini[`o${i}`] = pegada(p(53, y), 1.3, 0.8);
      });
      return pizarra(
        "media",
        [A(1), A(2), A(3), { ...B(1), equipo: "A", etiqueta: "1" }, { ...B(2), equipo: "A", etiqueta: "2" }, { ...B(3), equipo: "A", etiqueta: "3" }, bocha("o0"), bocha("o1"), bocha("o2")],
        ini,
        [
          { ms: 1100, movs: ys.map((y, i) => pasa(`o${i}`, p(75.5, y + 0.6))) },
          { ms: 1400, movs: ys.map((y, i) => pasa(`o${i}`, p(54.5, y + 0.6), p(65, y + (i === 1 ? -4 : 4)))) },
        ],
      );
    })(),
  }),
];
