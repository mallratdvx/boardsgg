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

  const reset = () => { setBoard(Array(9).fill(null)); setTurn("X"); sfx.click(); };
  const name = (m: "X" | "O") => (vsAi ? (m === "X" ? t("you") : t("computer")) : m);

  return (
    <GameLayout
      title="g_tictactoe"
      actions={
        <>
          <button className={`btn-real ${vsAi ? "" : "btn-dark"}`} onClick={() => { setVsAi(true); reset(); }}>{t("vsComputer")}</button>
          <button className={`btn-real ${!vsAi ? "" : "btn-dark"}`} onClick={() => { setVsAi(false); reset(); }}>{t("twoPlayers")}</button>
        </>
      }
    >
      <div className="mb-6 h-12">
        {win ? <Banner>{t("wins", { name: name(win.mark!) })}</Banner> : full ? <Banner tone="red">{t("draw")}</Banner> : (
          <p className="text-center font-chalk text-3xl text-ivory">{t("turn", { name: name(turn) })}</p>
        )}
      </div>
      <div className="slate-board mx-auto grid aspect-square w-full max-w-md grid-cols-3 rounded-md p-4">
        {board.map((m, i) => (
          <button
            key={i}
            onClick={() => (!vsAi || turn === "X") && play(i)}
            className={`grid place-items-center font-chalk text-7xl text-chalk md:text-8xl ${i % 3 < 2 ? "border-r-4" : ""} ${i < 6 ? "border-b-4" : ""} border-chalk/70 ${win?.line.includes(i) ? "animate-glow rounded-xl text-brass" : ""}`}
            style={{ textShadow: "0 0 2px currentColor" }}
          >
            {m && <span className="animate-pop">{m === "X" ? "✗" : "○"}</span>}
          </button>
        ))}
      </div>
      <div className="mt-8 text-center">
        <button className="btn-real" onClick={reset}>{t("newGame")}</button>
      </div>
    </GameLayout>
  );
}
