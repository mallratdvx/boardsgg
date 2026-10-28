import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Banner, GameLayout } from "@/components/GameLayout";
import { useApp } from "@/lib/i18n/context";
import { apply, initial, legalFrom, status, type Color, type Piece, type State } from "@/lib/games/chess";
import { sfx } from "@/lib/sound";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/chess")({
  head: () => ({
    meta: [
      { title: "Chess with a tournament clock — boards.gg" },
      { name: "description", content: "Pass-and-play chess with boxwood and rosewood pieces and a mechanical chess clock." },
      { property: "og:title", content: "Chess — boards.gg" },
      { property: "og:description", content: "Carved wooden chessmen and a real rocker chess clock." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Chess,
});

// Solid Staunton-style silhouettes (filled), coloured as boxwood or rosewood.
const GLYPH: Record<Piece["t"], string> = { k: "\u265A", q: "\u265B", r: "\u265C", b: "\u265D", n: "\u265E", p: "\u265F" };

function Man({ p }: { p: Piece }) {
  const w = p.c === "w";
  return (
    <span
      className="pointer-events-none select-none text-[min(10vw,3.4rem)] leading-none"
      style={{
        fontFamily: "'Segoe UI Symbol','DejaVu Sans',serif",
        color: w ? "oklch(0.88 0.07 80)" : "oklch(0.32 0.08 30)",
        WebkitTextStroke: w ? "1px oklch(0.45 0.07 60)" : "1px oklch(0.15 0.03 30)",
        textShadow: w
          ? "0 1px 0 oklch(1 0 0 / 0.6), 0 4px 4px oklch(0 0 0 / 0.55)"
          : "0 1px 0 oklch(0.55 0.08 40), 0 4px 4px oklch(0 0 0 / 0.6)",
      }}
    >
      {GLYPH[p.t]}
    </span>
  );
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, "0")}`;

function Chess() {
  const { t } = useApp();
  const [mins, setMins] = useState(5);
  const [s, setS] = useState<State>(initial);
  const [sel, setSel] = useState<number | null>(null);
  const [clock, setClock] = useState({ w: 300, b: 300 });
  const [running, setRunning] = useState(false);
  const [last, setLast] = useState<[number, number] | null>(null);
  const st = status(s);
  const flagged: Color | null = clock.w <= 0 ? "w" : clock.b <= 0 ? "b" : null;
  const over = st === "mate" || st === "stalemate" || !!flagged;
  const nm = (c: Color) => (c === "w" ? t("white") : t("black2"));

  useEffect(() => {
    if (!running || over) return;
    const id = setInterval(() => setClock((c) => ({ ...c, [s.turn]: c[s.turn] - 1 })), 1000);
    return () => clearInterval(id);
  }, [running, over, s.turn]);

  const reset = (m = mins) => { setMins(m); setS(initial()); setSel(null); setLast(null); setClock({ w: m * 60, b: m * 60 }); setRunning(false); sfx.click(); };
  const moves = sel !== null ? legalFrom(s, sel) : [];

  const tap = (i: number) => {
    if (over) return;
    if (sel !== null && moves.includes(i)) {
      const capture = !!s.board[i];
      const n = apply(s, { from: sel, to: i });
      setS(n); setSel(null); setLast([sel, i]); setRunning(true);
      if (capture) sfx.thud(); else sfx.chip();
      sfx.clock();
      const ns = status(n);
      if (ns === "mate") { sfx.jackpot(); void celebrate(true); } else if (ns === "check") sfx.ding();
      return;
    }
    if (s.board[i]?.c === s.turn) { setSel(i); sfx.click(); } else setSel(null);
  };

  const Face = ({ c }: { c: Color }) => {
    const active = running && s.turn === c && !over;
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`h-4 w-20 rounded-t-md transition-transform duration-150 ${active ? "translate-y-0 bg-chip-red" : "translate-y-2 bg-brass"}`} style={{ boxShadow: "inset 0 2px 0 oklch(1 0 0 / 0.4), 0 3px 0 oklch(0 0 0 / 0.5)" }} />
        <div className="paper grid h-20 w-24 place-items-center rounded-full font-mono text-2xl font-black" style={{ boxShadow: "inset 0 3px 8px oklch(0 0 0 / 0.5), 0 0 0 4px var(--brass)" }}>
          <span className={clock[c] <= 30 ? "text-chip-red" : ""}>{fmt(clock[c])}</span>
        </div>
        <span className="text-xs font-bold uppercase text-ivory/80">{nm(c)}</span>
      </div>
    );
  };

  return (
    <GameLayout
      title="g_chess"
      actions={[3, 5, 10].map((m) => (
        <button key={m} className={`btn-real ${mins === m ? "" : "btn-dark"}`} onClick={() => reset(m)}>{t("minutes", { n: m })}</button>
      ))}
    >
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_260px]">
        <div className="wood mx-auto w-full max-w-[640px] rounded-lg p-3 md:p-5" style={{ boxShadow: "var(--shadow-object)" }}>
          <div className="grid aspect-square grid-cols-8 overflow-hidden rounded-sm" style={{ boxShadow: "inset 0 0 0 2px var(--brass)" }}>
            {s.board.map((p, i) => {
              const dark = ((i >> 3) + (i & 7)) % 2 === 1;
              const target = moves.includes(i);
              const isLast = last?.includes(i);
              return (
                <button key={i} onClick={() => tap(i)} aria-label={`square ${i}`}
                  className="relative grid place-items-center"
                  style={{ background: dark ? "linear-gradient(135deg, oklch(0.42 0.08 45), oklch(0.36 0.07 40))" : "linear-gradient(135deg, oklch(0.84 0.06 80), oklch(0.78 0.06 75))" }}>
                  {isLast && <span className="absolute inset-0 bg-brass/30" />}
                  {sel === i && <span className="absolute inset-0 ring-4 ring-inset ring-brass" />}
                  {p && <Man p={p} />}
                  {target && <span className={`absolute rounded-full ${p ? "inset-1 ring-4 ring-chip-red/70" : "h-1/4 w-1/4 bg-ink/40"}`} />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="wood flex items-end gap-6 rounded-xl px-6 pb-4 pt-2" style={{ boxShadow: "var(--shadow-object)" }}>
            <Face c="b" /><Face c="w" />
          </div>
          <p className="text-center text-sm text-ivory/80">{t("tapClock")}</p>
          <div className="min-h-12">
            {st === "mate" && <Banner>{t("checkmate", { name: nm(s.turn === "w" ? "b" : "w") })}</Banner>}
            {st === "stalemate" && <Banner>{t("stalemate")}</Banner>}
            {flagged && <Banner tone="red">{t("timeOut", { name: nm(flagged) })}</Banner>}
            {st === "check" && !flagged && <Banner tone="red">{t("check")}</Banner>}
            {!over && st !== "check" && <p className="text-center font-bold text-ivory">{t("turn", { name: nm(s.turn) })}</p>}
          </div>
          <button className="btn-real px-8" onClick={() => reset()}>{t("again")}</button>
        </div>
      </div>
    </GameLayout>
  );
}
