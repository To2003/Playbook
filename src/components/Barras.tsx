/** Barritas de intensidad: se lee el nivel sin depender de la palabra. */
export function Barras({ n, tam = 1 }: { n: 1 | 2 | 3; tam?: number }) {
  return (
    <span className="inline-flex items-end gap-[3px]" role="img" aria-label={`Intensidad ${n} de 3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={`rounded-[1px] bg-current ${i <= n ? "" : "opacity-25"}`} style={{ width: 4 * tam, height: (5 + i * 3.5) * tam }} />
      ))}
    </span>
  );
}
