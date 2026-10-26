import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { useApp } from "@/lib/i18n/context";
import { SLOT_SYMBOLS, slotPayout } from "@/lib/games/logic";
import { sfx } from "@/lib/sound";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/slots")({
  head: () => ({
    meta: [
      { title: "Slot Machine — boards.gg" },
      { name: "description", content: "Pull the lever of a chrome slot machine and chase the 7-7-7 jackpot." },
      { property: "og:title", content: "Slot Machine — boards.gg" },
      { property: "og:description", content: "Pull the lever, chase the jackpot." },
    ],
  }),
  component: Slots,
});

const ITEM = 96;
const WEIGHTED = ["🍒","🍒","🍒","🍋","🍋","🍋","🔔","🔔","🍇","🍇","⭐","7️⃣"];
const strip = () => Array.from({ length: 30 }, () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)] as string);

function Slots() {
  const { t } = useApp();
  const [coins, setCoins] = useState(200);
  const [bet, setBet] = useState(5);
  const [strips, setStrips] = useState<string[][]>(() => [["7️⃣"], ["7️⃣"], ["7️⃣"]]);
  const [spinning, setSpinning] = useState(false);
  const [pulled, setPulled] = useState(false);
  const [msg, setMsg] = useState<{ text: string; big?: boolean } | null>(null);
  const [spinId, setSpinId] = useState(0);
  const ticks = useRef<number | null>(null);

  const spin = () => {
    if (spinning) return;
    if (coins < bet) { setCoins(200); setMsg({ text: t("broke") }); return; }
    setCoins((c) => c - bet);
    setMsg(null); setSpinning(true); setPulled(true); setSpinId((s) => s + 1);
    sfx.lever();
    setTimeout(() => setPulled(false), 350);
    const result = [0, 1, 2].map(() => WEIGHTED[Math.floor(Math.random() * WEIGHTED.length)]);
    setStrips(result.map((r) => [...strip(), r]));
    ticks.current = window.setInterval(sfx.tick, 70);
    [1200, 1700, 2200].forEach((ms) => setTimeout(sfx.thud, ms));
    setTimeout(() => {
      if (ticks.current) clearInterval(ticks.current);
      setSpinning(false);
      const win = slotPayout(result, bet);
      if (win > 0) {
        setCoins((c) => c + win);
        const jack = result.every((r) => r === result[0]);
        setMsg({ text: jack && result[0] === "7️⃣" ? `${t("jackpot")} +${win}` : t("winAmount", { n: win }), big: jack });
        if (jack) { sfx.jackpot(); void celebrate(true); } else { sfx.win(); }
      } else { setMsg({ text: t("noWin") }); }
    }, 2300);
  };

  return (
    <GameLayout title="g_slots" actions={<div className="brass-plate rounded-md px-4 py-2 font-black">🪙 {coins}</div>}>
      <div className="mx-auto flex max-w-2xl items-center justify-center gap-2">
        <div className="relative w-full max-w-lg rounded-[2rem] btn-red p-5 md:p-8" style={{ boxShadow: "inset 0 4px 0 oklch(1 0 0 / 0.3), inset 0 -10px 0 oklch(0 0 0 / 0.3), 0 30px 60px -10px oklch(0 0 0 / 0.8)" }}>
          <div className="brass-plate mb-5 rounded-xl py-2 text-center font-display text-3xl font-black tracking-widest">
            {msg?.big ? <span className="animate-pulse">★ {t("jackpot")} ★</span> : "★ LUCKY 7 ★"}
          </div>
          <div className="chrome rounded-xl p-3">
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-ink p-2">
              {strips.map((s, i) => (
                <div key={i} className="relative overflow-hidden rounded-md bg-ivory" style={{ height: ITEM, boxShadow: "inset 0 12px 14px -6px oklch(0 0 0 / 0.55), inset 0 -12px 14px -6px oklch(0 0 0 / 0.55)" }}>
                  <div
                    key={spinId}
                    className="flex flex-col"
                    style={{
                      transform: `translateY(-${(s.length - 1) * ITEM}px)`,
                      transition: spinning ? `transform ${1.2 + i * 0.5}s cubic-bezier(0.15, 0.6, 0.25, 1.04)` : "none",
                      animation: spinning ? undefined : undefined,
                    }}
                    ref={(el) => {
                      if (el && spinning && el.dataset.spin !== String(spinId)) {
                        el.dataset.spin = String(spinId);
                        el.style.transition = "none";
                        el.style.transform = "translateY(0)";
                        void el.offsetHeight;
                        el.style.transition = `transform ${1.2 + i * 0.5}s cubic-bezier(0.15, 0.6, 0.25, 1.04)`;
                        el.style.transform = `translateY(-${(s.length - 1) * ITEM}px)`;
                      }
                    }}
                  >
                    {s.map((sym, j) => (
                      <div key={j} className="grid shrink-0 place-items-center text-5xl" style={{ height: ITEM }}>{sym}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 flex h-12 items-center justify-center">
            {msg && <div key={msg.text + spinId} className="animate-pop rounded-md bg-ink px-5 py-2 font-mono text-xl font-bold text-brass">{msg.text}</div>}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <span className="font-bold text-ivory">{t("bet")}</span>
            {[1, 5, 10, 25].map((b) => (
              <button key={b} disabled={spinning} className={`btn-real !px-3 ${bet === b ? "" : "btn-dark"}`} onClick={() => { setBet(b); sfx.chip(); }}>{b}</button>
            ))}
            <button className="btn-real px-8 text-lg" onClick={spin} disabled={spinning}>{t("spin")}</button>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-1 rounded-md bg-ink/60 p-2 text-center text-xs text-ivory">
            <span>7️⃣7️⃣7️⃣ ×100</span><span>⭐⭐⭐ ×25</span><span>🍇🍇🍇 ×15</span>
            <span>🔔🔔🔔 ×12</span><span>🍋🍋🍋 ×8</span><span>🍒🍒🍒 ×5</span>
          </div>
        </div>
        {/* Lever */}
        <button onClick={spin} disabled={spinning} aria-label={t("pull")} className="relative hidden h-72 w-12 sm:block">
          <div className="chrome absolute bottom-6 left-1/2 h-14 w-8 -translate-x-1/2 rounded-md" />
          <div
            className="absolute bottom-16 left-1/2 w-3 -translate-x-1/2 origin-bottom transition-transform duration-300"
            style={{ height: 180, transform: `translateX(-50%) scaleY(${pulled ? -0.6 : 1})` }}
          >
            <div className="chrome h-full w-full rounded-full" />
            <div className="absolute -left-4 -top-6 h-11 w-11 rounded-full bg-chip-red" style={{ boxShadow: "inset -4px -6px 8px oklch(0 0 0 / 0.4), inset 4px 4px 6px oklch(1 0 0 / 0.5), var(--shadow-object)" }} />
          </div>
        </button>
      </div>
    </GameLayout>
  );
}
