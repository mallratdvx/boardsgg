import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Banner, GameLayout } from "@/components/GameLayout";
import { useApp } from "@/lib/i18n/context";
import { tttBestMove, tttWinner, type Mark } from "@/lib/games/logic";
import { sfx } from "@/lib/sound";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/tic-tac-toe")({
  head: () => ({
    meta: [
      { title: "Tic Tac Toe on a chalk slate — boards.gg" },
      { name: "description", content: "Play Tic Tac Toe with chalk on a slate board, against a friend or the computer." },
      { property: "og:title", content: "Tic Tac Toe — boards.gg" },
      { property: "og:description", content: "Chalk duel on a slate board." },
    ],
  }),
  component: TicTacToe,
});

function TicTacToe() {
  const { t } = useApp();
  const [board, setBoard] = useState<Mark[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [vsAi, setVsAi] = useState(true);
  const [chalk, setChalk] = useState(true);
  const [flip, setFlip] = useState(0);
  const win = tttWinner(board);
  const full = board.every(Boolean);

  const play = (i: number) => {
    if (board[i] || win) return;
    const b = [...board];
    b[i] = turn;
    setBoard(b);
    setTurn(turn === "X" ? "O" : "X");
    sfx.chalk();
  };

  useEffect(() => {
    if (vsAi && turn === "O" && !win && !full) {
      const id = setTimeout(() => play(tttBestMove(board, "O")), 550);
      return () => clearTimeout(id);
    }
    return undefined;
  });

  useEffect(() => {
    if (win) {
      if (vsAi && win.mark === "O") sfx.lose();
      else { sfx.win(); void celebrate(); }
    } else if (full) sfx.buzzer();
  }, [!!win, full]);

  const reset = () => { sfx.flip(); setFlip((f) => f + 1); setTimeout(() => { setBoard(Array(9).fill(null)); setTurn("X"); }, 300); };
  const name = (m: "X" | "O") => (vsAi ? (m === "X" ? t("you") : t("computer")) : m);

  return (
    <GameLayout
      title="g_tictactoe"
      actions={
        <>
          <button className={`btn-real ${vsAi ? "" : "btn-dark"}`} onClick={() => { setVsAi(true); reset(); }}>{t("vsComputer")}</button>
          <button className={`btn-real ${!vsAi ? "" : "btn-dark"}`} onClick={() => { setVsAi(false); reset(); }}>{t("twoPlayers")}</button>
          <button className="btn-real btn-dark" onClick={() => { setChalk(!chalk); sfx.click(); }}>{chalk ? "Sketchpad" : "Slate"}</button>
        </>
      }
    >
      <div className="mb-6 h-12">
        {win ? <Banner>{t("wins", { name: name(win.mark!) })}</Banner> : full ? <Banner tone="red">{t("draw")}</Banner> : (
          <p className="text-center font-chalk text-3xl text-ivory">{t("turn", { name: name(turn) })}</p>
        )}
      </div>
      <div style={{ perspective: 1400 }}>
      <div key={flip} className={`${chalk ? "slate-board" : "sketchpad"} mx-auto grid aspect-square w-full max-w-md rounded-md p-4 ${flip ? "animate-[pageturn_0.6s_cubic-bezier(0.4,0,0.2,1)]" : ""}`}
        style={{ transformOrigin: "top center", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridTemplateRows: "repeat(3, minmax(0, 1fr))" }}>
        {board.map((m, i) => (
          <button
            key={i}
            aria-label={`cell ${i + 1}`}
            onClick={() => (!vsAi || turn === "X") && play(i)}
            className={`relative min-h-0 min-w-0 overflow-hidden ${i % 3 < 2 ? "border-r-4" : ""} ${i < 6 ? "border-b-4" : ""} ${chalk ? "border-chalk/70 text-chalk" : "border-ink/60 text-ink"} ${win?.line.includes(i) ? "animate-glow rounded-xl !text-brass" : ""}`}
          >
            {m && (
              <svg viewBox="0 0 100 100" className="animate-pop absolute inset-[18%]" fill="none" stroke="currentColor" strokeWidth={chalk ? 9 : 6} strokeLinecap="round" style={chalk ? { filter: "drop-shadow(0 0 2px currentColor)" } : undefined}>
                {m === "X" ? <path d="M15 15 L85 85 M85 15 L15 85" /> : <circle cx="50" cy="50" r="36" />}
              </svg>
            )}
          </button>
        ))}
      </div>
      </div>
      <div className="mt-8 text-center">
        <button className="btn-real" onClick={reset}>{t("newGame")}</button>
      </div>
    </GameLayout>
  );
}
