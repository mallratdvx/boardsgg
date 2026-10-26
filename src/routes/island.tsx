import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Banner, GameLayout } from "@/components/GameLayout";
import { Die } from "@/components/Die";
import { useApp } from "@/lib/i18n/context";
import { sfx } from "@/lib/sound";
import { celebrate } from "@/lib/celebrate";
import islandImg from "@/assets/island.jpg";

export const Route = createFileRoute("/island")({
  head: () => ({
    meta: [
      { title: "Island Quest board game — boards.gg" },
      { name: "description", content: "Roll the dice and race your pawn around a painted island to the treasure. 2–4 players." },
      { property: "og:title", content: "Island Quest — boards.gg" },
      { property: "og:description", content: "Race around the island to the treasure." },
    ],
  }),
  component: Island,
});

// Tile positions (% of board) following the printed path.
const PATH: [number, number][] = [
  [33, 82], [27, 76], [22, 68], [20, 60], [24, 53], [30, 48], [35, 41], [33, 33], [27, 27], [23, 20],
  [29, 15], [36, 17], [41, 23], [47, 26], [54, 23], [60, 19], [67, 21], [73, 27], [79, 33], [83, 41],
  [80, 49], [75, 55], [77, 62], [81, 69], [76, 75], [68, 72], [61, 71], [54, 70], [48, 65], [43, 59],
];
const LAST = PATH.length - 1;
const SPECIAL: Record<number, "boost" | "trap" | "treasure"> = { 4: "boost", 8: "trap", 12: "treasure", 16: "boost", 19: "trap", 22: "treasure", 25: "trap", 27: "boost" };
const PAWN = ["bg-chip-red", "bg-chip-blue", "bg-brass", "bg-chip-green"];
const ICON = { boost: "💨", trap: "🌀", treasure: "💎" };

function Island() {
  const { t } = useApp();
  const [n, setN] = useState(2);
  const [pos, setPos] = useState([0, 0]);
  const [cur, setCur] = useState(0);
  const [die, setDie] = useState(1);
  const [rollKey, setRollKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [winner, setWinner] = useState(-1);

  const start = (k: number) => { setN(k); setPos(Array(k).fill(0)); setCur(0); setWinner(-1); setMsg(""); sfx.click(); };
  const name = (i: number) => `${t("player")} ${i + 1}`;

  const stepTo = (from: number, to: number, who: number, done: (p: number) => void) => {
    const dir = to > from ? 1 : -1;
    let p = from;
    const iv = setInterval(() => {
      p += dir;
      setPos((ps) => ps.map((v, i) => (i === who ? p : v)));
      sfx.click();
      if (p === to) { clearInterval(iv); setTimeout(() => done(p), 250); }
    }, 260);
  };

  const roll = () => {
    if (busy || winner >= 0) return;
    setBusy(true);
    const r = 1 + Math.floor(Math.random() * 6);
    setDie(r); setRollKey((k) => k + 1); sfx.dice();
    setMsg(t("island_rolled", { name: name(cur), n: r }));
    setTimeout(() => {
      const from = pos[cur] ?? 0;
      const target = Math.min(LAST, from + r);
      stepTo(from, target, cur, (p) => {
        const finishTurn = (final: number, again = false) => {
          if (final >= LAST) { setWinner(cur); sfx.jackpot(); void celebrate(true); setBusy(false); return; }
          if (!again) setCur((c) => (c + 1) % n);
          setBusy(false);
        };
        const s = SPECIAL[p];
        if (s === "boost") { setMsg(t("island_boost")); sfx.ding(); stepTo(p, Math.min(LAST, p + 3), cur, (q) => finishTurn(q)); }
        else if (s === "trap") { setMsg(t("island_trap")); sfx.lose(); stepTo(p, Math.max(0, p - 3), cur, (q) => finishTurn(q)); }
        else if (s === "treasure") { setMsg(t("island_treasure")); sfx.win(); finishTurn(p, true); }
        else finishTurn(p);
      });
    }, 750);
  };

  return (
    <GameLayout
      title="g_island"
      actions={[2, 3, 4].map((k) => (
        <button key={k} className={`btn-real ${n === k ? "" : "btn-dark"}`} onClick={() => start(k)} disabled={busy}>{k} 👤</button>
      ))}
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="relative mx-auto aspect-square w-full max-w-[680px] rounded-md" style={{ boxShadow: "0 0 0 10px oklch(0.85 0.05 80), 0 0 0 12px oklch(0.6 0.05 70), 0 30px 60px -10px oklch(0 0 0 / 0.8)" }}>
          <img src={islandImg} alt="Island board" width={1024} height={1024} className="absolute inset-0 h-full w-full rounded-md object-cover" />
          {PATH.map(([x, y], i) => (
            <div
              key={i}
              className={`absolute grid h-[5.5%] w-[5.5%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[10px] font-black md:text-sm ${i === LAST ? "brass-plate !h-[9%] !w-[9%]" : "paper"}`}
              style={{ left: `${x}%`, top: `${y}%`, boxShadow: "0 3px 0 oklch(0 0 0 / 0.35), inset 0 -2px 0 oklch(0 0 0 / 0.15)" }}
            >
              {i === LAST ? <span className="text-xl md:text-3xl">🧰</span> : i === 0 ? "⚓" : SPECIAL[i] ? ICON[SPECIAL[i]] : i}
            </div>
          ))}
          {pos.map((p, i) => {
            const [x, y] = PATH[p] ?? PATH[0]!;
            const off = (i - (pos.length - 1) / 2) * 1.6;
            return (
              <div
                key={i}
                className="absolute z-10 -translate-x-1/2 -translate-y-full transition-all duration-200 ease-out"
                style={{ left: `${x + off}%`, top: `${y + 1}%` }}
              >
                <div className={`${PAWN[i]} h-6 w-6 rounded-full md:h-8 md:w-8 ${i === cur && winner < 0 ? "animate-bounce" : ""}`} style={{ boxShadow: "inset -3px -4px 5px oklch(0 0 0 / 0.35), inset 3px 3px 4px oklch(1 0 0 / 0.4), 0 6px 6px -2px oklch(0 0 0 / 0.6)" }} />
                <div className={`${PAWN[i]} mx-auto -mt-1 h-3 w-8 rounded-[50%] md:w-10`} style={{ boxShadow: "inset 0 -2px 2px oklch(0 0 0 / 0.4), 0 3px 4px oklch(0 0 0 / 0.5)" }} />
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="paper w-full rounded-lg p-4">
            <p className="mb-3 text-center text-sm italic">{t("island_goal")}</p>
            {pos.map((p, i) => (
              <div key={i} className={`flex items-center justify-between rounded px-2 py-1 ${i === cur && winner < 0 ? "bg-brass/40" : ""}`}>
                <span className="flex items-center gap-2 font-bold"><span className={`h-4 w-4 rounded-full ${PAWN[i]}`} />{name(i)}</span>
                <span className="font-chalk text-xl">{p}/{LAST}</span>
              </div>
            ))}
          </div>
          <div className="felt grid h-36 w-full place-items-center rounded-2xl">
            <Die key={rollKey} value={die} size={76} rolling={rollKey > 0} />
          </div>
          <div className="h-12">
            {winner >= 0 ? <Banner>{t("wins", { name: name(winner) })}</Banner> : msg && <p key={msg} className="animate-pop text-center font-bold text-ivory">{msg}</p>}
          </div>
          {winner >= 0 ? (
            <button className="btn-real px-10" onClick={() => start(n)}>{t("again")}</button>
          ) : (
            <button className="btn-real btn-red px-10 py-4 text-xl" onClick={roll} disabled={busy}>🎲 {t("roll")}</button>
          )}
          <p className="text-sm text-ivory/80">{winner < 0 && t("turn", { name: name(cur) })}</p>
        </div>
      </div>
    </GameLayout>
  );
}
