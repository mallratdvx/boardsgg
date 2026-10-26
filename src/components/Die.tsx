const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

export function Die({
  value, size = 64, rolling, held, onClick, rollKey,
}: { value: number; size?: number; rolling?: boolean; held?: boolean; onClick?: (() => void) | undefined; rollKey?: number }) {
  const pip = size * 0.17;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      key={rollKey}
      className={`die relative grid shrink-0 transition-transform ${rolling ? "animate-tumble" : ""} ${held ? "-translate-y-3 ring-4 ring-brass" : ""}`}
      style={{ width: size, height: size, gridTemplate: "repeat(3,1fr)/repeat(3,1fr)", padding: size * 0.12 }}
      aria-label={`Die ${value}`}
    >
      {PIPS[value]?.map(([r, c], i) => (
        <span key={i} className="pip self-center justify-self-center" style={{ gridRow: r + 1, gridColumn: c + 1, width: pip, height: pip }} />
      ))}
    </button>
  );
}
