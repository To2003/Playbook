import type { Division, Ejercicio, Formato } from "../tipos";

const lista = (xs: (string | number)[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`);

/** Reparte n en m partes lo más parejas posible (las más grandes primero). */
export function repartir(n: number, m: number): number[] {
  const base = Math.floor(n / m);
  const resto = n % m;
  return Array.from({ length: m }, (_, i) => base + (i < resto ? 1 : 0));
}

/** Cuántos de campo necesita, como mínimo, cada formato. */
export function minimoDelFormato(f: Formato): number {
  switch (f.tipo) {
    case "individual":
      return 1;
    case "parejas":
      return 2;
    case "grupos":
      return Math.min(f.k, 3);
    case "dos_equipos":
      return 4;
    case "superioridad":
      return f.atacan + f.defienden;
  }
}

/** La división sin estaciones: el grupo entero en un solo espacio. */
function dividirUno(n: number, f: Formato, conBocha: boolean): Omit<Division, "estaciones" | "texto"> & { detalle: string } {
  switch (f.tipo) {
    case "individual":
      return { partes: Array(n).fill(1), comodines: 0, rotan: 0, detalle: conBocha ? "todos a la vez, cada uno con su bocha" : "todos a la vez" };
    case "parejas": {
      if (n < 4) return { partes: [n], comodines: 0, rotan: 0, detalle: n === 3 ? "1 terna" : "1 pareja" };
      const ternas = n % 2;
      const parejas = (n - 3 * ternas) / 2;
      return {
        partes: [...Array(parejas).fill(2), ...Array(ternas).fill(3)],
        comodines: 0,
        rotan: 0,
        detalle: ternas ? `${parejas} parejas y 1 terna` : `${parejas} parejas`,
      };
    }
    case "grupos": {
      const g = Math.floor(n / f.k);
      const resto = n % f.k;
      // El resto se reparte sumando 1 a algunos grupos; si sobra más que grupos, se arma uno más y se emparejan.
      const partes = g === 0 ? [n] : resto <= g ? repartir(n, g) : repartir(n, g + 1);
      const iguales = partes.every((x) => x === partes[0]);
      const detalle = partes.length === 1 ? `1 grupo de ${partes[0]}` : iguales ? `${partes.length} grupos de ${partes[0]}` : `${partes.length} grupos: ${lista(partes.slice().sort((a, b) => a - b))}`;
      return { partes, comodines: 0, rotan: 0, detalle };
    }
    case "dos_equipos": {
      const comodines = n % 2;
      const lado = (n - comodines) / 2;
      return { partes: [lado, lado], comodines, rotan: 0, detalle: `${lado} contra ${lado}${comodines ? " + 1 comodín que juega con el que ataca" : ""}` };
    }
    case "superioridad": {
      const celula = f.atacan + f.defienden;
      const celulas = Math.floor(n / celula);
      const rotan = n - celulas * celula;
      return {
        partes: Array(celulas).fill(celula),
        comodines: 0,
        rotan,
        detalle: `${celulas} ${celulas === 1 ? "célula" : "células"} de ${f.atacan} contra ${f.defienden}${rotan ? `; ${rotan} ${rotan === 1 ? "rota" : "rotan"} entrando por el que sale` : ""}`,
      };
    }
  }
}

/**
 * Divide a los jugadores de campo según el formato del ejercicio (SPEC 4.4).
 * Si son más que el máximo del ejercicio, se arma en estaciones (salvo superioridad, que rota).
 * Invariante: suma(partes) + comodines + rotan === n.
 */
export function dividir(n: number, f: Formato, max: number, opciones: { conBocha?: boolean; rotacionMin?: number } = {}): Division {
  const { conBocha = true, rotacionMin = 6 } = opciones;
  const estaciones = f.tipo !== "superioridad" && n > max && max > 0 ? Math.ceil(n / max) : 1;
  if (estaciones === 1) {
    const { detalle, ...resto } = dividirUno(n, f, conBocha);
    return { ...resto, estaciones: 1, texto: `${n} → ${detalle}` };
  }
  const tamanos = repartir(n, estaciones);
  const partes: number[] = [];
  let comodines = 0;
  let rotan = 0;
  const detalles: string[] = [];
  for (const t of tamanos) {
    const d = dividirUno(t, f, conBocha);
    partes.push(...d.partes);
    comodines += d.comodines;
    rotan += d.rotan;
    detalles.push(d.detalle);
  }
  const mismos = detalles.every((d) => d === detalles[0]);
  const texto = `${n} → ${estaciones} estaciones de ${lista([...new Set(tamanos)])}, rotan cada ${rotacionMin} min: ${mismos ? detalles[0] : detalles.join(" / ")}`;
  return { partes, comodines, rotan, estaciones, texto };
}

/** ¿Se puede hacer este ejercicio con n de campo (directo o escalado)? */
export function aplicable(e: Pick<Ejercicio, "jugadores" | "formato">, n: number): boolean {
  if (n < 4 && e.formato.tipo !== "individual") return false;
  return n >= e.jugadores.min && n >= minimoDelFormato(e.formato);
}

export const sumaDivision = (d: Division) => d.partes.reduce((s, x) => s + x, 0) + d.comodines + d.rotan;
