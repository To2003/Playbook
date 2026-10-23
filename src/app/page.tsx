import Link from "next/link";
import { Pizarra } from "@/components/pizarra/Pizarra";
import { IconoBiblioteca, IconoClub, IconoFlecha, IconoMisEjercicios, IconoSeguir, Marca } from "@/components/iconos";
import { reducido, sesionMaqueta } from "@/data/maqueta";

export default function Inicio() {
  const bloques = sesionMaqueta.items;
  const total = bloques.reduce((s, b) => s + b.minutos, 0);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-4 pt-[max(env(safe-area-inset-top),12px)]">
      <header className="flex h-14 items-center justify-between">
        <span className="flex items-center gap-2">
          <Marca />
          <span className="marcador text-[1.75rem] leading-none">Playbook</span>
        </span>
        <span className="text-label text-ink-muted">Jueves 23 de octubre</span>
      </header>

      <main className="flex flex-1 flex-col gap-6 pb-[calc(112px+env(safe-area-inset-bottom))] pt-2">
        <h1 className="sr-only">Inicio</h1>

        <section aria-labelledby="hoy">
          <Link href="/sesion" className="pressable block overflow-hidden rounded-card bg-surface">
            <div className="overflow-hidden rounded-t-card">
              <Pizarra pizarra={reducido} aspecto={16 / 9} className="h-auto w-full" titulo="Pizarra del juego reducido de la sesión de hoy" />
            </div>
            <div className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <h2 id="hoy" className="text-title font-[650]">
                  Volver a la de hoy
                </h2>
                <p className="mt-1 text-label text-ink-muted">
                  18:30 · {sesionMaqueta.jugadores} jugadores + {sesionMaqueta.arqueros} arqueros · {sesionMaqueta.nivel} · {sesionMaqueta.intensidad}
                </p>
              </div>
              <span className="marcador shrink-0 text-[2.5rem]">
                {total}
                <span className="text-title font-[650] text-ink-muted" style={{ fontVariationSettings: '"wdth" 100' }}>
                  {" "}
                  min
                </span>
              </span>
            </div>
            {/* La sesión como tira de marcador: cada bloque ocupa lo que dura. */}
            <div className="flex gap-[3px] px-4 pb-4" aria-label="Bloques de la sesión">
              {bloques.map((b) => (
                <span
                  key={b.id}
                  className={`h-2 rounded-[2px] ${"pausa" in b ? "bg-line" : "bg-ink-faint"}`}
                  style={{ flexGrow: b.minutos }}
                />
              ))}
            </div>
          </Link>
        </section>

        <nav aria-label="Más cosas">
          <ul className="flex flex-col">
            {[
              { href: "/biblioteca", icono: IconoBiblioteca, titulo: "Biblioteca", dato: "60 ejercicios" },
              { href: "/mis-ejercicios", icono: IconoMisEjercicios, titulo: "Mis ejercicios", dato: "2 borradores" },
              { href: "/mi-club", icono: IconoClub, titulo: "Mi club", dato: "90 min · media cancha" },
            ].map(({ href, icono: Icono, titulo, dato }, i) => (
              <li key={href} className={i > 0 ? "border-t border-line" : undefined}>
                <Link href={href} className="pressable flex h-16 items-center gap-4 rounded-card px-1">
                  <Icono className="text-ink-muted" />
                  <span className="flex-1 text-body font-semibold">{titulo}</span>
                  <span className="text-label text-ink-faint">{dato}</span>
                  <IconoSeguir tam={20} className="text-ink-faint" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>

      <div className="fixed inset-x-0 bottom-0 bg-ground">
        <div className="mx-auto max-w-[480px] px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
          <Link href="/armar" className="pressable btn-primary flex h-24 items-center justify-between px-6">
            <span className="marcador text-[2.25rem] leading-none" style={{ fontVariationSettings: '"wdth" 70' }}>
              Arrancar entrenamiento
            </span>
            <IconoFlecha tam={32} />
          </Link>
        </div>
      </div>
    </div>
  );
}
