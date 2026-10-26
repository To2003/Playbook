import { continueRender, delayRender, staticFile } from "remotion";

/** Tokens de DESIGN.md (los mismos valores que src/app/globals.css de la app). */
export const C = {
  ground: "#070b12",
  surface: "#0e1520",
  ink: "#f2f5f8",
  inkMuted: "#a9b4c4",
  lime: "#d2fa45",
  onLime: "#0a1004",
  coral: "#ff7059",
  keeper: "#3fdcff",
  turf: "#1d5daa",
  turfStripe: "#1a549b",
  turfRunoff: "#143f74",
  fiberLight: "#2c6ebf",
  fiberDark: "#164a8c",
  chalk: "#eef3f1",
} as const;

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Archivo variable (wdth 62–125, wght 100–900): la misma fuente local de la app. */
export const FUENTE = '"Archivo PB", system-ui, sans-serif';
const espera = delayRender("Cargando Archivo");
const cara = new FontFace("Archivo PB", `url(${staticFile("fuentes/archivo-latin-wdth.woff2")}) format("woff2")`, { weight: "100 900", stretch: "62% 125%" });
cara
  .load()
  .then((f) => {
    document.fonts.add(f);
    continueRender(espera);
  })
  .catch(() => continueRender(espera));

/** Voz de marcador: condensada, pesada, cifras tabulares. */
export const MARCADOR = { fontFamily: FUENTE, fontWeight: 800, fontVariationSettings: '"wdth" 62', fontVariantNumeric: "tabular-nums" } as const;
