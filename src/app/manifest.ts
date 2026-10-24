import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Playbook",
    short_name: "Playbook",
    description: "Contás cuántos vinieron y te arma el entrenamiento de hockey, con la pizarra animada.",
    lang: "es-AR",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#070b12",
    theme_color: "#070b12",
    icons: [
      { src: "/iconos/icono-192.png", sizes: "192x192", type: "image/png" },
      { src: "/iconos/icono-512.png", sizes: "512x512", type: "image/png" },
      { src: "/iconos/icono-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
