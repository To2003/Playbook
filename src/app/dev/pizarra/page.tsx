import { notFound } from "next/navigation";
import { PizarraAnimada } from "@/components/pizarra/PizarraAnimada";
import { BIBLIOTECA } from "@/data/biblioteca";

/** Banco de pruebas del reproductor (solo en desarrollo). */
export default async function BancoPizarra({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { id } = await searchParams;
  const lista = id ? BIBLIOTECA.filter((e) => e.id === id) : BIBLIOTECA;
  return (
    <main className="mx-auto flex max-w-[480px] flex-col gap-8 p-4">
      {lista.map((e) => (
        <section key={e.id} className="flex flex-col gap-2">
          <h2 className="text-title font-semibold">{e.nombre}</h2>
          <PizarraAnimada pizarra={e.pizarra} aspecto={16 / 10} controles className="overflow-hidden rounded-pitch" titulo={e.nombre} />
        </section>
      ))}
    </main>
  );
}
