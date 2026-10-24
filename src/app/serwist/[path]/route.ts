import { createSerwistRoute } from "@serwist/turbopack";
import { RUTAS_OFFLINE } from "@/lib/rutas";

// Cambia en cada build: así el service worker refresca el HTML precacheado.
const revision = process.env.VERCEL_GIT_COMMIT_SHA ?? String(Date.now());

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  swSrc: "src/sw/sw.ts",
  additionalPrecacheEntries: RUTAS_OFFLINE.map((url) => ({ url, revision })),
});
