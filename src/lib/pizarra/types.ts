/**
 * Pizarra táctica. Todas las coordenadas son metros sobre la cancha de hockey 11:
 * x a lo largo (0 = línea de fondo izquierda, 91.4 = línea de fondo derecha),
 * y a lo ancho (0 = lateral superior, 55 = lateral inferior).
 */
export type Punto = { x: number; y: number };

export type Vista = "completa" | "media" | "area";

export type TipoElemento =
  | "jugador"
  | "arquero"
  | "bocha"
  | "cono"
  | "valla"
  | "aro"
  | "arco_chico"
  | "zona"
  | "texto";

export type Equipo = "A" | "B" | "comodin";

export interface Elemento {
  id: string;
  tipo: TipoElemento;
  /** Solo para jugadores. */
  equipo?: Equipo;
  /** Número o letra dentro de la ficha, o el texto corto. */
  etiqueta?: string;
  /** Zonas: forma y tamaño en metros. */
  forma?: "rect" | "elipse";
  ancho?: number;
  alto?: number;
  /** Vallas y arcos chicos: rotación en grados. */
  rotacion?: number;
}

export type TipoTrazo = "desplazamiento" | "conduccion" | "pase" | "tiro";

export interface Trazo {
  id: string;
  tipo: TipoTrazo;
  /** Quién se mueve (desplazamiento/conducción) o quién la juega (pase/tiro). */
  desde: string;
  /** Recorrido en metros. El primer punto es el origen y el último el destino. */
  puntos: Punto[];
  /** Pase: quién recibe. */
  hacia?: string;
}

export interface Paso {
  /** Segundos que dura la transición hacia el paso siguiente. */
  duracion: number;
  posiciones: Record<string, Punto>;
  /** Trazos que llevan de este paso al siguiente. */
  trazos: Trazo[];
}

export interface Pizarra {
  vista: Vista;
  elementos: Elemento[];
  pasos: Paso[];
}
