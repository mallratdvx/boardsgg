import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Banner, GameLayout } from "@/components/GameLayout";
import { useApp } from "@/lib/i18n/context";
import { C4_COLS, C4_ROWS, c4AiMove, c4Drop, c4Winner, type C4Cell } from "@/lib/games/logic";
import { sfx } from "@/lib/sound";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/connect-four")({
  head: () => ({
    meta: [
      { title: "Connect Four — boards.gg" },
      { name: "description", content: "Drop discs into a realistic Connect Four rack. Play a friend or the computer." },
      { property: "og:title", content: "Connect Four — boards.gg" },
      { property: "og:description", content: "Drop discs, line up four." },
    ],
  }),
  component: ConnectFour,
});

const empty = (): C4Cell[][] => Array.from({ length: C4_ROWS }, () => Array(C4_COLS).fill(0));

function ConnectFour() {
  const { t } = useApp();
  const [grid, setGrid] = useState(empty);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [vsAi, setVsAi] = useState(true);
  const [last, setLast] = useState<[number, number] | null>(null);
  const win = c4Winner(grid);
  const full = grid[0]!.every(Boolean);

  const drop = (c: number) => {
    if (win) return;
    const d = c4Drop(grid, c, turn);
    if (!d) return;
    setGrid(d.grid);
    setLast([d.row, c]);
    setTurn(turn === 1 ? 2 : 1);
    setTimeout(() => sfx.thud(), 380);
  };

  useEffect(() => {
    if (vsAi && turn === 2 && !win && !full) {
      const id = setTimeout(() => drop(c4AiMove(grid)), 700);
      return () => clearTimeout(id);
    }
    return undefined;
  });

  useEffect(() => {
    if (win) setTimeout(() => {
      if (vsAi && win.p === 2) sfx.lose(); else { sfx.win(); void celebrate(); }
    }, 500);
  }, [!!win]);

  const reset = () => { setGrid(empty()); setTurn(1); setLast(null); sfx.click(); };
  const name = (p: 1 | 2) => (vsAi ? (p === 1 ? t("you") : t("computer")) : `${t("player")} ${p}`);

  return (
    <GameLayout
      title="g_connect4"
      actions={
        <>
          <button className={`btn-real ${vsAi ? "" : "btn-dark"}`} onClick={() => { setVsAi(true); reset(); }}>{t("vsComputer")}</button>
          <button className={`btn-real ${!vsAi ? "" : "btn-dark"}`} onClick={() => { setVsAi(false); reset(); }}>{t("twoPlayers")}</button>
        </>
      }
    >
      <div className="mb-6 flex h-12 items-center justify-center">
        {win ? <Banner>{t("wins", { name: name(win.p) })}</Banner> : full ? <Banner tone="red">{t("draw")}</Banner> : (
          <div className="flex items-center gap-3 text-xl font-bold text-ivory">
            <span className={`h-7 w-7 rounded-full ${turn === 1 ? "bg-chip-red" : "bg-brass"} shadow-[var(--shadow-object)]`} />
            {t("turn", { name: name(turn) })}
          </div>
        )}
      </div>
      <div className="mx-auto w-full max-w-xl">
        <div
          className="grid gap-2 rounded-2xl bg-chip-blue p-3 md:gap-3 md:p-4"
          style={{
            gridTemplateColumns: `repeat(${C4_COLS}, 1fr)`,
            boxShadow: "inset 0 2px 0 oklch(1 0 0 / 0.3), inset 0 -6px 0 oklch(0 0 0 / 0.25), 0 20px 40px -10px oklch(0 0 0 / 0.7)",
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => (!vsAi || turn === 1) && drop(c)}
                className="relative aspect-square rounded-full bg-background/90"
                style={{ boxShadow: "inset 0 4px 8px oklch(0 0 0 / 0.8)" }}
              >
                {cell !== 0 && (
                  <span
                    key={`${r}-${c}-${cell}`}
                    className={`absolute inset-[6%] rounded-full ${last && last[0] === r && last[1] === c ? "animate-drop" : ""} ${win?.cells.some(([a, b]) => a === r && b === c) ? "animate-glow" : ""} ${cell === 1 ? "bg-chip-red" : "bg-brass"}`}
                    style={{
                      ["--drop-from" as string]: `-${(r + 1) * 115}%`,
                      boxShadow: "inset 0 -4px 0 oklch(0 0 0 / 0.25), inset 0 3px 0 oklch(1 0 0 / 0.35), inset 0 0 0 6px oklch(0 0 0 / 0.08)",
                    }}
                  />
                )}
              </button>
            )),
          )}
        </div>
        <div className="mx-auto h-4 w-[104%] -translate-x-[2%] rounded-b-lg bg-chip-blue brightness-75" />
      </div>
      <div className="mt-8 text-center">
        <button className="btn-real" onClick={reset}>{t("newGame")}</button>
      </div>
    </GameLayout>
  );
}
