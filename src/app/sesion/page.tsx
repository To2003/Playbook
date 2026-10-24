import Link from "next/link";
import { PizarraAnimada } from "@/components/pizarra/PizarraAnimada";
import {
  IconoAgua,
  IconoArquero,
  IconoArrastrar,
  IconoDeslizar,
  IconoDivision,
  IconoMas,
  IconoMenos,
  IconoSeguir,
  IconoVolver,
} from "@/components/iconos";
import { NOMBRE_FASE, type BloqueMaqueta, sesionMaqueta } from "@/data/maqueta";

export default function SesionGenerada() {
  const { items, jugadores, arqueros, nivel, intensidad } = sesionMaqueta;
  const total = items.reduce((s, b) => s + b.minutos, 0);
  // Minuto en que arranca cada ítem, para el riel de tiempo.
  const inicios = items.map((_, i) => items.slice(0, i).reduce((s, b) => s + b.minutos, 0));

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-4 pt-[max(env(safe-area-inset-top),12px)]">
      <header className="flex h-14 items-center gap-2">
        <Link href="/armar" aria-label="Volver a ¿Qué armamos?" className="pressable -ml-3 grid size-12 place-items-center rounded-card">
          <IconoVolver />
        </Link>
        <p className="flex-1 truncate text-label text-ink-muted">
          {jugadores} + {arqueros} arqueros · {nivel} · {intensidad}
        </p>
      </header>

      <main className="pb-[calc(104px+env(safe-area-inset-bottom))]">
        <div className="mt-1 flex items-end justify-between gap-4">
          <h1 className="titular">Tu sesión</h1>
          <p className="marcador text-[4.5rem]" aria-label={`${total} minutos en total`}>
            {total}
            <span className="ml-1 text-title font-[650] text-ink-muted" style={{ fontVariationSettings: '"wdth" 100' }}>
              min
            </span>
          </p>
        </div>

        <p className="mt-2 flex items-center gap-2 text-label text-ink-muted">
          <IconoDeslizar tam={18} /> Deslizá un bloque y te doy otro ejercicio.
        </p>

        <ol className="mt-4 flex flex-col">
          {items.map((item, i) => {
            const desde = inicios[i];
            if ("pausa" in item) {
              return (
                <li key={item.id} className="grid grid-cols-[44px_1fr] items-center gap-3 py-2">
                  <span className="marcador text-right text-[1.25rem] text-ink-faint">{desde}&#8242;</span>
                  <p className="flex h-10 items-center gap-2 text-label text-ink-muted">
                    <IconoAgua tam={18} /> Hidratación: dos minutos
                  </p>
                </li>
              );
            }
            return (
              <li key={item.id} className="grid grid-cols-[44px_1fr] gap-3 py-1.5">
                <span className="marcador pt-4 text-right text-[1.5rem] text-ink-muted">{desde}&#8242;</span>
                <TarjetaBloque bloque={item} />
              </li>
            );
          })}
        </ol>
      </main>

      <div className="fixed inset-x-0 bottom-0 bg-ground">
        <div className="mx-auto grid max-w-[480px] grid-cols-[1fr_1.6fr] gap-2 px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
          <button type="button" className="pressable pressable-raised btn-secondary h-16 text-body">
            Guardar para después
          </button>
          <Link href="/cancha" className="pressable btn-primary flex h-16 items-center justify-center text-title">
            ¡A la cancha!
          </Link>
        </div>
      </div>
    </div>
  );
}

function TarjetaBloque({ bloque }: { bloque: BloqueMaqueta }) {
  return (
    <article className="overflow-hidden rounded-card bg-surface">
      <div className="flex items-center gap-2 pl-4 pr-1 pt-1">
        <p className="flex-1 text-label text-ink-muted">{NOMBRE_FASE[bloque.fase]}</p>
        <button type="button" aria-label={`Mover ${bloque.ejercicio}`} className="grid size-12 cursor-grab place-items-center text-ink-faint">
          <IconoArrastrar tam={20} />
        </button>
      </div>
      <h2 className="px-4 text-title font-[650]">{bloque.ejercicio}</h2>
      <div className="mt-3 overflow-hidden">
        <PizarraAnimada pizarra={bloque.pizarra} aspecto={16 / 9} titulo={`Pizarra: ${bloque.ejercicio}`} />
      </div>
      <dl className="flex flex-col gap-1.5 px-4 pt-3 text-label">
        <div className="flex items-center gap-2">
          <dt className="text-ink-faint">
            <IconoDivision tam={18} aria-label="División del grupo" />
          </dt>
          <dd className="num font-semibold">{bloque.division}</dd>
        </div>
        {bloque.arqueros && (
          <div className="flex items-center gap-2">
            <dt className="text-keeper">
              <IconoArquero tam={18} aria-label="Tarea de arqueros" />
            </dt>
            <dd className="text-ink-muted">{bloque.arqueros.replace("Arqueros: ", "")}</dd>
          </div>
        )}
      </dl>
      <div className="mt-2 flex items-center gap-1 px-1 pb-1">
        <button type="button" aria-label="Un minuto menos" className="pressable grid size-12 place-items-center rounded-card text-ink-muted">
          <IconoMenos tam={20} />
        </button>
        <span className="marcador min-w-[3ch] text-center text-[2rem]">{bloque.minutos}&#8242;</span>
        <button type="button" aria-label="Un minuto más" className="pressable grid size-12 place-items-center rounded-card text-ink-muted">
          <IconoMas tam={20} />
        </button>
        <Link href="/sesion" className="pressable ml-auto flex h-12 items-center gap-1 rounded-card px-3 text-label font-semibold">
          Ficha <IconoSeguir tam={18} />
        </Link>
      </div>
    </article>
  );
}
