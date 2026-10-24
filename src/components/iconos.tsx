import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { tam?: number };

function Base({ tam = 24, children, ...rest }: P) {
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconoVolver = (p: P) => (
  <Base {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Base>
);
export const IconoSeguir = (p: P) => (
  <Base {...p}>
    <path d="M9 5l7 7-7 7" />
  </Base>
);
export const IconoMas = (p: P) => (
  <Base {...p} strokeWidth={2.75}>
    <path d="M12 4.5v15M4.5 12h15" />
  </Base>
);
export const IconoMenos = (p: P) => (
  <Base {...p} strokeWidth={2.75}>
    <path d="M4.5 12h15" />
  </Base>
);
export const IconoCerrar = (p: P) => (
  <Base {...p} strokeWidth={2.5}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
);
export const IconoPausa = (p: P) => (
  <Base {...p} strokeWidth={3}>
    <path d="M8.5 5v14M15.5 5v14" />
  </Base>
);
export const IconoFlecha = (p: P) => (
  <Base {...p} strokeWidth={2.5}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Base>
);
/** Biblioteca: tres pizarras apiladas. */
export const IconoBiblioteca = (p: P) => (
  <Base {...p}>
    <rect x="3" y="7" width="15" height="11" rx="1.5" />
    <path d="M6 4h13.5A1.5 1.5 0 0 1 21 5.5V15" />
    <path d="M10.5 7v11" />
  </Base>
);
/** Mis ejercicios: pizarra con un trazo propio. */
export const IconoMisEjercicios = (p: P) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <path d="M7 15c2-4 4 0 6-3s3-1 4-3" />
  </Base>
);
/** Mi club: el silbato. */
export const IconoClub = (p: P) => (
  <Base {...p}>
    <path d="M3 10.5h9.5l5.5-3.5v3.5" />
    <circle cx="9" cy="14.5" r="4.5" />
    <path d="M14.5 10.5H21" />
  </Base>
);
export const IconoAgua = (p: P) => (
  <Base {...p}>
    <path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5z" />
  </Base>
);
export const IconoArrastrar = (p: P) => (
  <Base {...p} strokeWidth={2.5}>
    <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" />
  </Base>
);
/** División del grupo: fichas separándose. */
export const IconoDivision = (p: P) => (
  <Base {...p}>
    <circle cx="6.5" cy="8" r="2.5" />
    <rect x="15" y="5.5" width="5" height="5" rx="0.8" />
    <path d="M4 18h16M12 14v8" />
  </Base>
);
/** Arquero: la ficha con anillo. */
export const IconoArquero = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4.5" strokeWidth={2.75} />
    <circle cx="12" cy="12" r="8.5" />
  </Base>
);
export const IconoSol = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </Base>
);
export const IconoLuna = (p: P) => (
  <Base {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </Base>
);
export const IconoDeslizar = (p: P) => (
  <Base {...p}>
    <path d="M7 8l-4 4 4 4M17 8l4 4-4 4M3 12h18" />
  </Base>
);

/** Marca: la cancha vista desde arriba con la bocha en juego. */
export function Marca({ tam = 28 }: { tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <rect x="2" y="5" width="24" height="18" rx="2" fill="var(--turf)" />
      <rect x="2" y="5" width="24" height="18" rx="2" fill="none" stroke="var(--chalk)" strokeWidth="1.6" />
      <path d="M14 5v18" stroke="var(--chalk)" strokeWidth="1.6" />
      <path d="M2 10.5a4.5 4.5 0 0 1 0 7" fill="none" stroke="var(--chalk)" strokeWidth="1.6" />
      <circle cx="19.5" cy="14" r="2.6" fill="var(--lime)" />
    </svg>
  );
}
export const IconoMover = (p: P) => (
  <Base {...p}>
    <path d="M5 3l12 7-5 1.5L9.5 17z" />
  </Base>
);
/** Herramientas de trazo: el mismo lenguaje que la pizarra (línea llena, ondulada, punteada, gruesa). */
export const IconoDesplazamiento = (p: P) => (
  <Base {...p}>
    <path d="M4 18L18 6M18 6h-6M18 6v6" />
  </Base>
);
export const IconoConduccion = (p: P) => (
  <Base {...p}>
    <path d="M3 17c2-1 2-4 4-5s3 2 5 1 2-4 4-5l3-2M19 4v4M19 4h-4" />
  </Base>
);
export const IconoPase = (p: P) => (
  <Base {...p} strokeDasharray="3 3">
    <path d="M4 18L18 6" />
    <path d="M18 6h-6M18 6v6" strokeDasharray="none" />
  </Base>
);
export const IconoTiro = (p: P) => (
  <Base {...p} strokeWidth={3.5}>
    <path d="M4 18L17 7M17 7h-5M17 7v5" />
  </Base>
);
export const IconoDeshacer = (p: P) => (
  <Base {...p}>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h10a6 6 0 010 12h-3" />
  </Base>
);
export const IconoRehacer = (p: P) => (
  <Base {...p}>
    <path d="M15 14l5-5-5-5" />
    <path d="M20 9H10a6 6 0 000 12h3" />
  </Base>
);
