import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Banner, GameLayout } from "@/components/GameLayout";
import { useApp } from "@/lib/i18n/context";
import { TABOO } from "@/lib/i18n/dict";
import { shuffle } from "@/lib/games/cards";
import { sfx } from "@/lib/sound";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/taboo")({
  head: () => ({
    meta: [
      { title: "Taboo party game — boards.gg" },
      { name: "description", content: "Describe the word on the card without saying the forbidden words. Team party game in 5 languages." },
      { property: "og:title", content: "Taboo — boards.gg" },
      { property: "og:description", content: "Describe the word without the forbidden ones." },
    ],
  }),
  component: Taboo,
});

const ROUND = 60;

function Taboo() {
  const { t, lang } = useApp();
  const [order, setOrder] = useState<number[]>([]);
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [team, setTeam] = useState(0);
  const [time, setTime] = useState(ROUND);
  const [running, setRunning] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [skips, setSkips] = useState(3);
  const [names, setNames] = useState(["", ""]);
  const [handoff, setHandoff] = useState<string | null>(null);
  const teamName = (i: number) => names[i]?.trim() || t("team", { n: i + 1 });
  const cards = TABOO[lang];

  useEffect(() => { setOrder(shuffle(cards.map((_, i) => i))); setIdx(0); }, [lang]);

  useEffect(() => {
    if (!running) return;
    if (time <= 0) { setRunning(false); sfx.buzzer(); return; }
    const id = setTimeout(() => { setTime((s) => s - 1); if (time <= 10) sfx.tick(); }, 1000);
    return () => clearTimeout(id);
  }, [running, time]);

  const card = cards[order[idx % Math.max(order.length, 1)] ?? 0] ?? cards[0]!;
  const next = (delta: number, kind: "ok" | "skip" | "bad") => {
    if (kind === "skip") { if (skips <= 0) return; setSkips((k) => k - 1); }
    if (kind === "bad") {
      setScores((s) => s.map((v, i) => (i === team ? v + delta : v)));
      setIdx((i) => i + 1); setRunning(false); sfx.buzzer();
      setHandoff(t("tabooPass", { name: teamName(1 - team) }));
      setTeam((x) => 1 - x); setTime(ROUND); setRoundScore(0);
      return;
    }
    setScores((s) => s.map((v, i) => (i === team ? v + delta : v)));
    setRoundScore((r) => r + delta);
    setIdx((i) => i + 1);
    setFlash(kind === "skip" ? null : kind);
    setTimeout(() => setFlash(null), 400);
    if (kind === "ok") sfx.ding(); else if (kind === "bad") sfx.buzzer(); else sfx.card();
  };

  const start = () => { setHandoff(null); setTime(ROUND); setRoundScore(0); setSkips(3); setRunning(true); sfx.click(); };
  const nextTeam = () => {
    if (roundScore > 0) void celebrate();
    setTeam((t) => 1 - t); setTime(ROUND); setRoundScore(0); sfx.chip();
  };

  const pct = time / ROUND;

  return (
    <GameLayout
      title="g_taboo"
      actions={[0, 1].map((i) => (
        <div key={i} className={`rounded-md px-4 py-2 font-bold ${i === team ? "brass-plate" : "btn-dark"}`}>{teamName(i)}: {scores[i]}</div>
      ))}
    >
      <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
        <div className="flex flex-col items-center gap-6">
          <p className="text-xl font-bold text-ivory">{t("turn", { name: teamName(team) })}</p>
          {running ? (
            <div
              key={idx}
              className={`paper animate-deal w-full max-w-sm overflow-hidden rounded-2xl ${flash === "bad" ? "animate-shake" : ""}`}
              style={{ transform: `rotate(${(idx % 3) - 1}deg)` }}
            >
              <div className="btn-red px-6 py-6 text-center">
                <h2 className="text-4xl font-black uppercase tracking-wide">{card.word}</h2>
              </div>
              <div className="px-6 py-5">
                <p className="mb-2 text-center text-xs font-bold uppercase tracking-[0.3em] text-ink/50">{t("forbidden")}</p>
                <ul className="space-y-2 text-center text-xl font-semibold">
                  {card.banned.map((w) => <li key={w} className="border-b border-dashed border-ink/20 pb-1">{w}</li>)}
                </ul>
              </div>
            </div>
          ) : (
            <div className="card-back grid h-80 w-full max-w-sm place-items-center rounded-2xl">
              <div className="paper rounded-xl px-6 py-4 text-center">
                {time <= 0 ? (
                  <>
                    <p className="text-2xl font-black text-chip-red">{t("timeUp")}</p>
                    <p className="mt-1">{t("round")}: <b>{roundScore}</b></p>
                    <button className="btn-real mt-4" onClick={nextTeam}>{t("next")}</button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    {handoff && <p className="text-lg font-black text-chip-red">{handoff}</p>}
                    {!handoff && [0, 1].map((i) => (
                      <input key={i} value={names[i]} maxLength={18} placeholder={t("teamName", { n: i + 1 })}
                        onChange={(e) => setNames((ns) => ns.map((v, j) => (j === i ? e.target.value : v)))}
                        className="w-56 border-b-2 border-dashed border-ink/40 bg-transparent px-2 py-1 text-center font-display text-lg outline-none focus:border-chip-red" />
                    ))}
                    <p className="text-sm italic">{t("passTo", { name: teamName(team) })}</p>
                    <button className="btn-real px-8 py-3 text-lg" onClick={start}>{handoff ? t("ready") : t("start")}</button>
                  </div>
                )}
              </div>
            </div>
          )}
          {running && (
            <div className="flex flex-wrap justify-center gap-3">
              <button className="btn-real btn-red" onClick={() => next(-1, "bad")}>{t("taboo")}</button>
              <button className="btn-real btn-dark" disabled={skips <= 0} onClick={() => next(0, "skip")}>{t("skip")} · {skips}</button>
              <button className="btn-real px-8" onClick={() => next(1, "ok")}>{t("correct")}</button>
            </div>
          )}
          {flash === "ok" && <Banner>+1</Banner>}
        </div>

        {/* Hourglass */}
        <div className="mx-auto flex flex-col items-center gap-2">
          <div className="wood h-4 w-32 rounded-sm shadow-[var(--shadow-object)]" />
          <div className="relative h-56 w-24">
            <div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 55% 100%, 45% 100%)", background: "oklch(1 0 0 / 0.15)" }}>
              <div className="absolute inset-x-0 bottom-0 bg-brass transition-all duration-1000 ease-linear" style={{ height: `${pct * 100}%` }} />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden" style={{ clipPath: "polygon(45% 0, 55% 0, 100% 100%, 0 100%)", background: "oklch(1 0 0 / 0.15)" }}>
              <div className="absolute inset-x-0 bottom-0 bg-brass transition-all duration-1000 ease-linear" style={{ height: `${(1 - pct) * 100}%` }} />
              {running && <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-brass/80" />}
            </div>
          </div>
          <div className="wood h-4 w-32 rounded-sm shadow-[var(--shadow-object)]" />
          <p className={`font-mono text-3xl font-bold ${time <= 10 ? "text-chip-red animate-pulse" : "text-ivory"}`}>{time}s</p>
        </div>
      </div>
    </GameLayout>
  );
}
