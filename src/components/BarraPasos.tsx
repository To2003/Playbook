/** Las tres pantallas del flujo: dónde estás y cuánto falta. */
export function BarraPasos({ actual }: { actual: 1 | 2 | 3 }) {
  return (
    <div className="flex flex-1 items-center gap-1.5" role="img" aria-label={`Paso ${actual} de 3`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= actual ? "bg-ink" : "bg-raised"}`} />
      ))}
    </div>
  );
}
