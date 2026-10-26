import { Composition } from "remotion";
import { FPS } from "../config";
import { DURACION_TOTAL, Trailer } from "./Trailer";

export const Raiz = () => (
  <>
    <Composition id="Vertical" component={Trailer} durationInFrames={DURACION_TOTAL} fps={FPS} width={1080} height={1920} defaultProps={{ formato: "vertical" as const }} />
    <Composition id="Cuadrado" component={Trailer} durationInFrames={DURACION_TOTAL} fps={FPS} width={1080} height={1080} defaultProps={{ formato: "cuadrado" as const }} />
  </>
);
