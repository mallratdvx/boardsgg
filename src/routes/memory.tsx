import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Banner, GameLayout } from "@/components/GameLayout";
import { useApp } from "@/lib/i18n/context";
import { shuffle } from "@/lib/games/cards";
import { sfx } from "@/lib/sound";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Memory card game — boards.gg" },
      { name: "description", content: "Flip real-looking cards and find all the matching pairs as fast as you can." },
      { property: "og:title", content: "Memory — boards.gg" },
      { property: "og:description", content: "Flip cards, find the pairs." },
    ],
  }),
  component: Memory,
});

const ICONS = ["🦊", "🐙", "🦉", "🐢", "🦋", "🐳", "🦁", "🐸", "🦜", "🐝"];
const makeDeck = () => shuffle([...ICONS.slice(0, 8), ...ICONS.slice(0, 8)]).map((icon, id) => ({ id, icon }));

function Memory() {
  const { t } = useApp();
  const [deck, setDeck] = useState<{ id: number; icon: string }[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const done = found.size === 8;

  useEffect(() => setDeck(makeDeck()), []);
  useEffect(() => {
    if (!started || done) return;
    const id = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [started, done]);

  const flip = (i: number) => {
    const card = deck[i];
    if (!card || open.length === 2 || open.includes(i) || found.has(card.icon)) return;
    setStarted(true);
    sfx.flip();
    const o = [...open, i];
    setOpen(o);
    if (o.length === 2) {
      setMoves((m) => m + 1);
      if (deck[o[0]!]?.icon === deck[o[1]!]?.icon) {
        setTimeout(() => {
          const f = new Set(found).add(card.icon);
          setFound(f); setOpen([]); sfx.ding();
          if (f.size === 8) { sfx.win(); void celebrate(true); }
        }, 400);
      } else setTimeout(() => { setOpen([]); sfx.card(); }, 900);
    }
  };

  const reset = () => { setDeck(makeDeck()); setOpen([]); setFound(new Set()); setMoves(0); setTime(0); setStarted(false); sfx.click(); };

  return (
    <GameLayout
      title="g_memory"
      actions={
        <>
          <div className="brass-plate rounded-md px-4 py-2 font-bold">{t("moves")}: {moves}</div>
          <div className="brass-plate rounded-md px-4 py-2 font-bold">⏱ {Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}</div>
        </>
      }
    >
      <div className="mb-4 h-12">{done && <Banner>🎉 {t("moves")}: {moves}</Banner>}</div>
      <div className="felt table-rail mx-auto grid max-w-2xl grid-cols-4 gap-3 rounded-3xl p-6 md:gap-4" style={{ perspective: 900 }}>
        {deck.map((c, i) => {
          const up = open.includes(i) || found.has(c.icon);
          return (
            <button
              key={c.id}
              onClick={() => flip(i)}
              className="relative aspect-[3/4] transition-transform duration-500"
              style={{ transformStyle: "preserve-3d", transform: up ? "rotateY(180deg)" : "none" }}
            >
              <div className="card-back absolute inset-0" style={{ backfaceVisibility: "hidden" }} />
              <div
                className={`card-face absolute inset-0 grid place-items-center text-4xl md:text-6xl ${found.has(c.icon) ? "opacity-80 ring-4 ring-brass" : ""}`}
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                {c.icon}
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-8 text-center"><button className="btn-real" onClick={reset}>{t("newGame")}</button></div>
    </GameLayout>
  );
}
