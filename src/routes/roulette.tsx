import { createFileRoute } from "@tanstack/react-router";
import { Coins } from "lucide-react";
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
      { title: "Mini Roulette — boards.gg" },
      { name: "description", content: "A simple 13-pocket roulette wheel (0 to 12) with big bets and the friendly la partage rule." },
      { property: "og:title", content: "Mini Roulette — boards.gg" },
      { property: "og:description", content: "Spin a 13-pocket wheel, bet on red, black or your lucky number." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
    <div className="relative aspect-square w-[min(82vw,22rem)] shrink-0">
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
          <div key={n} className="absolute left-1/2 top-0 h-1/2 origin-bottom pt-2 text-center font-display text-base font-black text-ivory md:text-lg" style={{ transform: `translateX(-50%) rotate(${i * SEG + SEG / 2}deg)` }}>
            {n}
          </div>
        ))}
        {WHEEL.map((_, i) => (
          <div key={`f${i}`} className="absolute left-1/2 top-0 h-1/2 w-[2px] origin-bottom bg-brass" style={{ transform: `translateX(-50%) rotate(${i * SEG}deg)` }} />
        ))}
        <div className="absolute inset-[32%] rounded-full" style={{ background: "radial-gradient(circle at 40% 35%, oklch(0.9 0.1 88), var(--brass-dark))", boxShadow: "0 4px 10px oklch(0 0 0 / 0.6)" }} />
      </div>
      <div className="absolute inset-[11%]" style={{ transform: `rotate(${ball}deg)`, transition: spinning ? "transform 5s cubic-bezier(0.2, 0.55, 0.2, 1)" : "none" }}>
        <div className="absolute left-1/2 top-[1%] h-5 w-5 -translate-x-1/2 rounded-full bg-ivory" style={{ boxShadow: "inset -2px -2px 3px oklch(0 0 0 / 0.4), 0 2px 3px oklch(0 0 0 / 0.6)" }} />
      </div>
      <div className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[16px] border-x-transparent border-t-brass" />
    </div>
  );
}

function Roulette() {
  const { t } = useApp();
  const [coins, setCoins] = useState(500);
  const [chip, setChip] = useState(10);
  const [bets, setBets] = useState<Record<string, number>>({});
  const [last, setLast] = useState<Record<string, number>>({});
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
  const rebet = () => {
    const sum = Object.values(last).reduce((a, b) => a + b, 0);
    if (spinning || !sum || coins < sum) return;
    setBets(last); setCoins((c) => c - sum); sfx.chip();
  };

  const spin = () => {
    if (spinning || !totalBet) return;
    const idx = Math.floor(Math.random() * WHEEL.length);
    const n = WHEEL[idx] ?? 0;
    setResult(null); setSpinning(true); setLast(bets);
    const wheelRot = rotation - (rotation % 360) + 360 * 4 + Math.random() * 360;
    setRotation(wheelRot);
    // ball (absolute angle) must end on the pocket's centre: wheelRot + idx*SEG + SEG/2
    const target = (wheelRot + idx * SEG + SEG / 2) % 360;
    setBall(ball - (((ball % 360) + 360) % 360) - 360 * 6 + target);
    let delay = 60;
    const tick = () => { sfx.tick(); delay *= 1.07; if (delay < 600) setTimeout(tick, delay); };
    tick();
    setTimeout(() => {
      setSpinning(false);
      let won = 0;
      for (const [k, v] of Object.entries(bets)) won += v * rouletteWin(k, n);
      setCoins((c) => c + won);
      setResult({ n, won });
      setBets({});
      if (won > totalBet) { sfx.win(); void celebrate(won >= totalBet * 10); } else if (won > 0) sfx.chip(); else sfx.lose();
    }, 5100);
  };

  const outside: [string, string][] = [["low", "1–6"], ["even", t("even")], ["red", t("red")], ["black", t("black")], ["odd", t("odd")], ["high", "7–12"]];
  const BetMark = ({ k }: { k: string }) => bets[k] ? <span className="brass-plate absolute -right-1 -top-1 grid h-7 min-w-7 place-items-center rounded-full px-1 text-[10px] font-black animate-pop">{bets[k]}</span> : null;
  const glow = (hit: boolean) => (hit && result && !spinning ? "ring-4 ring-brass shadow-[0_0_20px_var(--brass)]" : "ring-1 ring-ivory/40");

  return (
    <GameLayout title="g_roulette" actions={<div className="brass-plate flex items-center gap-2 rounded-md px-4 py-2 font-black"><Coins className="h-5 w-5" /> {coins}</div>}>
      <div className="felt table-rail flex flex-col items-center gap-6 rounded-3xl p-4 md:p-6 lg:flex-row lg:items-start lg:justify-center">
        <div className="flex flex-col items-center gap-4">
          <Wheel rotation={rotation} ball={ball} spinning={spinning} />
          <div className="min-h-12">
            {result && (
              <Banner tone={result.won ? "brass" : "red"}>
                <span className={`mr-2 inline-grid h-9 w-9 place-items-center rounded-full text-ivory ${colorCls(result.n)}`}>{result.n}</span>
                {result.n === 0 && result.won > 0 ? t("halfBack", { n: result.won }) : result.won ? t("winAmount", { n: result.won }) : t("noWin")}
              </Banner>
            )}
          </div>
        </div>
        <div className="flex w-full max-w-md flex-col gap-3">
          <p className="text-center text-ivory/80">{t("placeBets")}</p>
          <button onClick={() => place("n:0")} className={`relative h-12 rounded-full bg-chip-green font-display text-xl font-black text-ivory ${glow(result?.n === 0)}`}>0<BetMark k="n:0" /></button>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => place(`n:${n}`)} className={`relative h-14 rounded-md font-display text-xl font-black text-ivory transition active:scale-95 ${colorCls(n)} ${glow(result?.n === n)}`}>
                {n}<BetMark k={`n:${n}`} />
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-ivory/70">11 : 1</p>
          <div className="grid grid-cols-3 gap-2">
            {outside.map(([k, label]) => (
              <button key={k} onClick={() => place(k)} className={`relative h-14 rounded-md font-display text-sm font-black text-ivory active:scale-95 ${k === "red" ? "bg-chip-red" : k === "black" ? "bg-chip-black" : "bg-ivory/10"} ${glow(!!result && result.n !== 0 && rouletteWin(k, result.n) > 0)}`}>
                {label}<BetMark k={k} />
              </button>
            ))}
          </div>
          <p className="brass-plate mx-auto rounded px-3 py-1 text-center text-xs font-bold">1 : 1 · {t("laPartage")}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {[5, 10, 25, 50, 100].map((v) => <Chip key={v} value={v} active={chip === v} onClick={() => { setChip(v); sfx.click(); }} />)}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="btn-real btn-dark" disabled={spinning || !totalBet} onClick={() => { setCoins(coins + totalBet); setBets({}); sfx.chip(); }}>{t("clear")}</button>
            <button className="btn-real btn-dark" disabled={spinning || !!totalBet || !Object.keys(last).length} onClick={rebet}>↻</button>
            <button className="btn-real px-10 text-lg" disabled={spinning || !totalBet} onClick={spin}>{t("spin")} · {totalBet}</button>
          </div>
          {coins < 5 && !totalBet && !spinning && (
            <button className="btn-real btn-red mx-auto" onClick={() => setCoins(500)}>{t("broke")}</button>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
