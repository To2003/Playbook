import type { CSSProperties } from "react";
import { AbsoluteFill, Easing, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ESCENAS, FPS, TEXTO_ACCESO, TRAILER_LINK, type IdEscena } from "../config";
import marcas from "../public/tomas/marcas.json";
import { C, EASE_OUT, MARCADOR } from "./marca";
import { CanchaTiza, Celular, Cesped, FichaA, Titulo } from "./piezas";

export type Formato = "vertical" | "cuadrado";
const salida = Easing.bezier(...EASE_OUT);
const pinza = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Tamaño de la toma grabada (390 × 844 a 3×). */
const TOMA = { w: 1170, h: 2532 };

/**
 * Dónde va cada cosa. En 9:16 todo el texto queda dentro de la zona segura de Instagram
 * (250 px libres arriba y abajo); en 1:1 el celular va a la izquierda y el texto a la derecha.
 */
function disposicion(formato: Formato) {
  if (formato === "vertical") {
    const anchoPantalla = 600;
    const bisel = Math.round(anchoPantalla * 0.03);
    const anchoCel = anchoPantalla + bisel * 2;
    return {
      W: 1080,
      H: 1920,
      texto: { left: 80, top: 272, width: 920 } as CSSProperties,
      tamTexto: 98,
      anchoPantalla,
      celular: { left: (1080 - anchoCel) / 2, top: 540 },
      bisel,
      cancha: { alto: 1240, left: (1080 - (1240 * 55) / 91.4) / 2, top: 580 },
      pizarraLlena: { x: 40, w: 1000, yCentro: 1200 },
      textoPizarra: { left: 80, top: 272, width: 920 } as CSSProperties,
    };
  }
  const anchoPantalla = 372;
  const bisel = Math.round(anchoPantalla * 0.03);
  const altoCel = (anchoPantalla * 844) / 390 + bisel * 2;
  return {
    W: 1080,
    H: 1080,
    texto: { left: 540, top: 0, bottom: 0, width: 470, display: "flex", alignItems: "center" } as CSSProperties,
    tamTexto: 80,
    anchoPantalla,
    celular: { left: 84, top: (1080 - altoCel) / 2 },
    bisel,
    cancha: { alto: 860, left: 84 + (anchoPantalla + bisel * 2 - (860 * 55) / 91.4) / 2, top: 110 },
    pizarraLlena: { x: 60, w: 960, yCentro: 640 },
    textoPizarra: { left: 70, top: 96, width: 940 } as CSSProperties,
  };
}
type Disp = ReturnType<typeof disposicion>;

/** Un tramo de una toma: [desde, hasta] en segundos de la toma, estirado o comprimido a `frames`. */
function Toma({ toma, desde, hasta, frames }: { toma: "armado" | "pizarra" | "cancha"; desde: number; hasta: number; frames: number }) {
  return (
    <OffthreadVideo
      src={staticFile(`tomas/${toma}.mp4`)}
      trimBefore={Math.round(desde * FPS)}
      playbackRate={((hasta - desde) * FPS) / frames}
      muted
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

const m = marcas.armado.marcas;
/** Los tramos de cada escena salen de las marcas que deja `grabar.mjs`: si se regraba, el montaje sigue sincronizado. */
const TRAMOS: Partial<Record<IdEscena, { toma: "armado" | "pizarra" | "cancha"; desde: number; hasta: number }>> = {
  cuantos: { toma: "armado", desde: m.cuantos.t + 0.6, hasta: m.arquero.t + 0.7 },
  queArmamos: { toma: "armado", desde: m.queArmamos.t + 0.25, hasta: m.toqueArmame.t + 0.55 },
  // Arranca cuando ya apareció "Armando la sesión…" (la generación tarda unas décimas después del toque).
  sesion: { toma: "armado", desde: m.toqueArmame.t + 1.0, hasta: m.swipe.t - 0.4 },
  dameOtro: { toma: "armado", desde: m.swipe.t - 0.4, hasta: marcas.armado.duracion - 0.05 },
  pizarra: { toma: "pizarra", desde: 0.7, hasta: 4.7 },
  cancha: { toma: "cancha", desde: marcas.cancha.marcas.tiempo.t - 2.4, hasta: marcas.cancha.marcas.tiempo.t + 0.6 },
};

/** El celular con su tramo, con la entrada que corresponde al corte. */
function EscenaCelular({ id, frames, d, entrada }: { id: IdEscena; frames: number; d: Disp; entrada: "subir" | "zoom" | "barrido" }) {
  const f = useCurrentFrame();
  const t = TRAMOS[id]!;
  const k = interpolate(f, [0, 8], [0, 1], { ...pinza, easing: salida });
  const transform =
    entrada === "subir" ? `translateY(${(1 - k) * 700}px)` : entrada === "barrido" ? `translateX(${(1 - k) * 1100}px)` : `scale(${1.045 - 0.045 * k})`;
  return (
    <Celular anchoPantalla={d.anchoPantalla} estilo={{ position: "absolute", ...d.celular, transform, transformOrigin: "50% 40%" }}>
      <Toma {...t} frames={frames} />
    </Celular>
  );
}

/** La pizarra sale del celular y llena la pantalla (zoom de 300 ms). */
function EscenaPizarra({ frames, d }: { frames: number; d: Disp }) {
  const f = useCurrentFrame();
  const t = TRAMOS.pizarra!;
  const caja = marcas.pizarra.marcas.caja.caja;
  const escPantalla = d.anchoPantalla / 390;
  const origen = { x: d.celular.left + d.bisel + caja.x * escPantalla, y: d.celular.top + d.bisel + caja.y * escPantalla, w: caja.width * escPantalla };
  const destinoH = (d.pizarraLlena.w * caja.height) / caja.width;
  const destino = { x: d.pizarraLlena.x, y: d.pizarraLlena.yCentro - destinoH / 2, w: d.pizarraLlena.w };
  const k = interpolate(f, [0, 9], [0, 1], { ...pinza, easing: Easing.bezier(0.77, 0, 0.175, 1) });
  const x = origen.x + (destino.x - origen.x) * k;
  const y = origen.y + (destino.y - origen.y) * k;
  const w = origen.w + (destino.w - origen.w) * k;
  const esc = w / caja.width; // px de trailer por px CSS de la toma
  return (
    <>
      <Celular anchoPantalla={d.anchoPantalla} estilo={{ position: "absolute", ...d.celular, opacity: 1 - k }}>
        <Toma {...t} frames={frames} />
      </Celular>
      <div style={{ position: "absolute", left: x, top: y, width: w, height: (w * caja.height) / caja.width, overflow: "hidden", borderRadius: 10 + 14 * k, boxShadow: `0 0 0 ${3 * k}px ${C.ground}` }}>
        <div style={{ position: "absolute", left: -caja.x * esc, top: -caja.y * esc, width: 390 * esc, height: 844 * esc }}>
          <Toma {...t} frames={frames} />
        </div>
      </div>
    </>
  );
}

/** Intro: la cancha en tiza sobre negro y, en la segunda escena, caen 7 fichas desordenadas. */
function EscenaTiza({ inicio, d, conFichas }: { inicio: number; d: Disp; conFichas: boolean }) {
  const local = useCurrentFrame();
  const f = local + inicio;
  const { fps } = useVideoConfig();
  const progreso = interpolate(f, [0, 150], [0.04, 1], { ...pinza, easing: Easing.bezier(0.33, 0, 0.2, 1) });
  const ancho = (d.cancha.alto * 55) / 91.4;
  const esc = d.cancha.alto / 95.4;
  const posiciones = [
    [14, 30],
    [41, 19],
    [23, 51],
    [36, 41],
    [9, 63],
    [46, 60],
    [29, 75],
  ];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", left: d.cancha.left, top: d.cancha.top, width: ancho, height: d.cancha.alto }}>
        <CanchaTiza progreso={progreso} alto={d.cancha.alto} />
        {conFichas &&
          posiciones.map(([px, py], i) => {
            const fl = local - 6 - i * 5;
            const s = spring({ frame: fl, fps, config: { damping: 11, stiffness: 160, mass: 0.7 } });
            const tam = 2.6 * esc;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: (px + 1.5) * esc - tam / 2,
                  top: (py + 2) * esc - tam / 2,
                  opacity: fl < 0 ? 0 : 1,
                  transform: `translateY(${(1 - s) * -260}px) rotate(${(1 - s) * (i % 2 ? 12 : -12)}deg)`,
                }}
              >
                <FichaA tam={tam} />
              </div>
            );
          })}
      </div>
    </AbsoluteFill>
  );
}

/** Cierre: la marca grande sobre la cancha, con el acento lima. */
function EscenaLogo({ d }: { d: Disp }) {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 10], [0, 1], { ...pinza, easing: salida });
  const k2 = interpolate(f, [8, 18], [0, 1], { ...pinza, easing: salida });
  const vertical = d.H > d.W;
  return (
    <AbsoluteFill>
      <Cesped />
      <AbsoluteFill style={{ background: `${C.ground}b8` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: vertical ? 36 : 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: vertical ? 34 : 26, opacity: k, transform: `scale(${1.08 - 0.08 * k})` }}>
          <div style={{ width: vertical ? 92 : 74, height: vertical ? 92 : 74, borderRadius: 12, background: C.lime }} />
          <div style={{ ...MARCADOR, fontVariationSettings: '"wdth" 75', fontSize: vertical ? 150 : 124, letterSpacing: "0.06em", color: C.ink, lineHeight: 1 }}>PLAYBOOK</div>
        </div>
        <div style={{ ...MARCADOR, fontSize: vertical ? 74 : 60, color: C.ink, opacity: k2, transform: `translateY(${(1 - k2) * 24}px)` }}>Beta para entrenadores</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginTop: vertical ? 40 : 20, opacity: k2, transform: `translateY(${(1 - k2) * 24}px)` }}>
          <div style={{ fontFamily: MARCADOR.fontFamily, fontWeight: 600, fontSize: vertical ? 44 : 36, color: C.inkMuted }}>{TEXTO_ACCESO}</div>
          <div style={{ ...MARCADOR, fontVariationSettings: '"wdth" 80', fontSize: vertical ? 66 : 54, color: C.lime }}>{TRAILER_LINK}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/** El pasto entra con el celular (después de la intro en negro). */
function FondoCesped({ aparece }: { aparece: boolean }) {
  const f = useCurrentFrame();
  return <Cesped opacidad={aparece ? interpolate(f, [0, 8], [0, 1], pinza) : 1} />;
}

export const DURACION_TOTAL = ESCENAS.reduce((s, e) => s + e.segundos * FPS, 0);

export function Trailer({ formato }: { formato: Formato }) {
  const d = disposicion(formato);
  let desde = 0;
  return (
    <AbsoluteFill style={{ background: C.ground }}>
      {ESCENAS.map((e, i) => {
        const frames = e.segundos * FPS;
        const inicio = desde;
        desde += frames;
        const textoPos = e.id === "pizarra" ? d.textoPizarra : d.texto;
        return (
          <Sequence key={e.id} from={inicio} durationInFrames={frames} name={e.id}>
            {(e.id === "lineas" || e.id === "fichas") && <EscenaTiza inicio={inicio} d={d} conFichas={e.id === "fichas"} />}
            {i >= 2 && e.id !== "logo" && <FondoCesped aparece={e.id === "cuantos"} />}
            {e.id === "cuantos" && <EscenaCelular id={e.id} frames={frames} d={d} entrada="subir" />}
            {(e.id === "queArmamos" || e.id === "sesion" || e.id === "dameOtro") && <EscenaCelular id={e.id} frames={frames} d={d} entrada="zoom" />}
            {e.id === "pizarra" && <EscenaPizarra frames={frames} d={d} />}
            {e.id === "cancha" && <EscenaCelular id={e.id} frames={frames} d={d} entrada="barrido" />}
            {e.id === "logo" && <EscenaLogo d={d} />}
            {e.id !== "logo" && <Titulo texto={e.texto} duracion={frames} tam={d.tamTexto} estilo={textoPos} sinEntrada={i === 0} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
