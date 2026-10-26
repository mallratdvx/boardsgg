import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Banner, GameLayout } from "@/components/GameLayout";
import { Chip } from "@/components/PlayingCard";
import { useApp } from "@/lib/i18n/context";
import { WHEEL, rouletteColor, rouletteWin } from "@/lib/games/logic";
import { sfx } from "@/lib/sound";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/roulette")({
  head: () => ({
    meta: [
      { title: "Roulette — boards.gg" },
      { name: "description", content: "Spin a realistic European roulette wheel and bet with chips on red, black or your lucky number." },
      { property: "og:title", content: "Roulette — boards.gg" },
      { property: "og:description", content: "Spin the wheel, bet on your luck." },
    ],
  }),
  component: Roulette,
});

const SEG = 360 / WHEEL.length;
const colorCls = (n: number) => (rouletteColor(n) === "red" ? "bg-chip-red" : rouletteColor(n) === "black" ? "bg-chip-black" : "bg-chip-green");

function Wheel({ rotation, ball, spinning }: { rotation: number; ball: number; spinning: boolean }) {
  const stops = WHEEL.map((n, i) => {
    const c = rouletteColor(n) === "red" ? "var(--chip-red)" : rouletteColor(n) === "black" ? "var(--chip-black)" : "var(--chip-green)";
    return `${c} ${i * SEG}deg ${(i + 1) * SEG}deg`;
  }).join(",");
  return (
    <div className="relative aspect-square w-full max-w-sm">
      <div className="wood absolute inset-0 rounded-full" style={{ boxShadow: "0 20px 40px -10px oklch(0 0 0 / 0.8), inset 0 0 0 10px oklch(0.3 0.06 45), inset 0 6px 20px oklch(0 0 0 / 0.7)" }} />
      <div
        className="absolute inset-[9%] rounded-full"
        style={{
          background: `conic-gradient(${stops})`,
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? "transform 5s cubic-bezier(0.12, 0.6, 0.15, 1)" : "none",
          boxShadow: "0 0 0 4px var(--brass), inset 0 0 20px oklch(0 0 0 / 0.5)",
        }}
      >
        {WHEEL.map((n, i) => (
          <div key={n} className="absolute left-1/2 top-0 h-1/2 -translate-x-1/2 origin-bottom pt-1 text-center text-[10px] font-bold text-ivory md:text-xs" style={{ transform: `translateX(-50%) rotate(${i * SEG + SEG / 2}deg)` }}>
            {n}
          </div>
        ))}
        <div className="brass-plate absolute inset-[30%] rounded-full" style={{ background: "radial-gradient(circle at 40% 35%, oklch(0.9 0.1 88), var(--brass-dark))" }} />
      </div>
      {/* ball */}
      <div
        className="absolute inset-[13%]"
        style={{ transform: `rotate(${ball}deg)`, transition: spinning ? "transform 5s cubic-bezier(0.2, 0.55, 0.2, 1)" : "none" }}
      >
        <div className="absolute left-1/2 top-[2%] h-4 w-4 -translate-x-1/2 rounded-full bg-ivory" style={{ boxShadow: "inset -2px -2px 3px oklch(0 0 0 / 0.4), 0 2px 3px oklch(0 0 0 / 0.6)" }} />
      </div>
    </div>
  );
}

function Roulette() {
  const { t } = useApp();
  const [coins, setCoins] = useState(500);
  const [chip, setChip] = useState(10);
  const [bets, setBets] = useState<Record<string, number>>({});
  const [rotation, setRotation] = useState(0);
  const [ball, setBall] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ n: number; won: number } | null>(null);
  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  const place = (key: string) => {
    if (spinning || coins < chip) return;
    setBets((b) => ({ ...b, [key]: (b[key] ?? 0) + chip }));
    setCoins((c) => c - chip); sfx.chip();
  };

  const spin = () => {
    if (spinning || !totalBet) return;
    const idx = Math.floor(Math.random() * WHEEL.length);
    const n = WHEEL[idx] ?? 0;
    setResult(null); setSpinning(true);
    const wheelRot = rotation - (rotation % 360) + 360 * 4 + Math.random() * 360;
    setRotation(wheelRot);
    // ball ends on segment idx relative to the wheel
    const target = wheelRot + idx * SEG + SEG / 2;
    setBall(ball - (ball % 360) - 360 * 6 - ((360 - (target % 360)) % 360));
    const iv = window.setInterval(sfx.tick, 90);
    setTimeout(() => {
      clearInterval(iv);
      setSpinning(false);
      let won = 0;
      for (const [k, v] of Object.entries(bets)) won += v * rouletteWin(k, n);
      setCoins((c) => c + won);
      setResult({ n, won });
      setBets({});
      if (won > 0) { sfx.win(); void celebrate(won >= totalBet * 10); } else sfx.lose();
    }, 5100);
  };

  const outside: [string, string][] = [["low", t("low")], ["even", t("even")], ["red", t("red")], ["black", t("black")], ["odd", t("odd")], ["high", t("high")]];
  const BetMark = ({ k }: { k: string }) => bets[k] ? <span className="chip text-chip-blue absolute -right-1 -top-1 grid h-6 w-6 place-items-center !border-2 text-[9px] font-black text-ivory animate-pop">{bets[k]}</span> : null;

  return (
    <GameLayout title="g_roulette" actions={<div className="brass-plate rounded-md px-4 py-2 font-black">🪙 {coins}</div>}>
      <div className="felt table-rail grid gap-8 rounded-3xl p-6 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="flex flex-col items-center gap-4">
          <Wheel rotation={rotation} ball={ball} spinning={spinning} />
          <div className="h-12">
            {result && (
              <Banner tone={result.won ? "brass" : "red"}>
                <span className={`mr-2 inline-grid h-8 w-8 place-items-center rounded-full text-ivory ${colorCls(result.n)}`}>{result.n}</span>
                {result.won ? t("winAmount", { n: result.won }) : t("noWin")}
              </Banner>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-center text-ivory/80">{t("placeBets")}</p>
          <div className="grid grid-cols-[auto_1fr] gap-1">
            <button onClick={() => place("n:0")} className="relative row-span-1 rounded-l-full bg-chip-green px-3 font-bold text-ivory ring-1 ring-ivory/40">0<BetMark k="n:0" /></button>
            <div className="grid grid-cols-12 gap-1">
              {[3, 2, 1].flatMap((row) =>
                Array.from({ length: 12 }, (_, c) => c * 3 + row).map((n) => (
                  <button key={n} onClick={() => place(`n:${n}`)} className={`relative aspect-square rounded-sm text-xs font-bold text-ivory ring-1 ring-ivory/40 transition hover:brightness-125 md:text-sm ${colorCls(n)}`}>
                    {n}<BetMark k={`n:${n}`} />
                  </button>
                )),
              )}
            </div>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {outside.map(([k, label]) => (
              <button key={k} onClick={() => place(k)} className={`relative rounded-sm py-3 text-xs font-bold text-ivory ring-1 ring-ivory/40 hover:bg-ivory/10 md:text-sm ${k === "red" ? "bg-chip-red" : k === "black" ? "bg-chip-black" : ""}`}>
                {label}<BetMark k={k} />
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {[5, 10, 25, 50, 100].map((v) => <Chip key={v} value={v} active={chip === v} onClick={() => { setChip(v); sfx.click(); }} />)}
          </div>
          <div className="flex justify-center gap-3">
            <button className="btn-real btn-dark" disabled={spinning || !totalBet} onClick={() => { setCoins(coins + totalBet); setBets({}); sfx.chip(); }}>{t("clear")}</button>
            <button className="btn-real px-10 text-lg" disabled={spinning || !totalBet} onClick={spin}>{t("spin")} · {totalBet}</button>
          </div>
          {coins === 0 && !totalBet && !spinning && (
            <button className="btn-real btn-red mx-auto" onClick={() => setCoins(500)}>{t("broke")}</button>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
