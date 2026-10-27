import { Dices, User } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Banner, GameLayout } from "@/components/GameLayout";
import { Die } from "@/components/Die";
import { useApp } from "@/lib/i18n/context";
import type { Dict } from "@/lib/i18n/dict";
import { YATZY_CATS, yatzyBonus, yatzyScore, type YatzyCat } from "@/lib/games/logic";
import { sfx } from "@/lib/sound";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/yatzy")({
  head: () => ({
    meta: [
      { title: "Yatzy with real dice — boards.gg" },
      { name: "description", content: "Roll ivory dice and fill your paper scorecard. Yatzy for 1–4 players." },
      { property: "og:title", content: "Yatzy — boards.gg" },
      { property: "og:description", content: "Five dice, three rolls, one scorecard." },
    ],
  }),
  component: Yatzy,
});

type Sheet = Partial<Record<YatzyCat, number>>;
const rnd = () => 1 + Math.floor(Math.random() * 6);
const total = (s: Sheet) => Object.values(s).reduce((a, b) => a + (b ?? 0), 0) + yatzyBonus(s);

function Yatzy() {
  const { t } = useApp();
  const [count, setCount] = useState(2);
  const [sheets, setSheets] = useState<Sheet[]>([{}, {}]);
  const [cur, setCur] = useState(0);
  const [dice, setDice] = useState([1, 2, 3, 4, 5]);
  const [held, setHeld] = useState([false, false, false, false, false]);
  const [rolls, setRolls] = useState(0);
  const [rollKey, setRollKey] = useState(0);
  const done = sheets.every((s) => Object.keys(s).length === YATZY_CATS.length);

  const start = (n: number) => {
    setCount(n); setSheets(Array.from({ length: n }, () => ({}))); setCur(0); setRolls(0);
    setHeld([false, false, false, false, false]); sfx.click();
  };

  const roll = () => {
    if (rolls >= 3) return;
    setDice((d) => d.map((v, i) => (held[i] ? v : rnd())));
    setRolls((r) => r + 1);
    setRollKey((k) => k + 1);
    sfx.dice();
  };

  const pick = (cat: YatzyCat) => {
    if (rolls === 0 || sheets[cur]?.[cat] !== undefined) return;
    const s = yatzyScore(cat, dice);
    const next = sheets.map((sh, i) => (i === cur ? { ...sh, [cat]: s } : sh));
    setSheets(next);
    if (cat === "yatzy" && s) { sfx.jackpot(); void celebrate(true); } else sfx.chalk();
    setCur((cur + 1) % count); setRolls(0); setHeld([false, false, false, false, false]);
    if (next.every((sh) => Object.keys(sh).length === YATZY_CATS.length)) setTimeout(() => { sfx.win(); void celebrate(true); }, 300);
  };

  const winner = done ? sheets.reduce((b, s, i) => (total(s) > total(sheets[b] ?? {}) ? i : b), 0) : -1;

  return (
    <GameLayout
      title="g_yatzy"
      actions={[1, 2, 3, 4].map((n) => (
        <button key={n} className={`btn-real ${count === n ? "" : "btn-dark"}`} onClick={() => start(n)}>{n} <User className="h-4 w-4" /></button>
      ))}
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
        <div className="felt table-rail flex flex-col items-center justify-center gap-6 rounded-3xl p-8">
          {done ? <Banner>{t("wins", { name: `${t("player")} ${winner + 1}` })}</Banner> : (
            <p className="text-xl font-bold text-ivory">{t("turn", { name: `${t("player")} ${cur + 1}` })}</p>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            {dice.map((v, i) => (
              <Die
                key={`${i}-${held[i] ? "h" : rollKey}`}
                value={v}
                size={72}
                rolling={!held[i] && rolls > 0}
                held={!!held[i]}
                onClick={rolls > 0 && rolls < 3 ? () => { setHeld((h) => h.map((x, j) => (j === i ? !x : x))); sfx.click(); } : undefined}
              />
            ))}
          </div>
          <p className="text-sm text-ivory/80">{rolls > 0 && rolls < 3 ? t("holdHint") : "\u00a0"}</p>
          <button className="btn-real btn-red px-10 py-4 text-xl" disabled={rolls >= 3 || done} onClick={roll}>
            <Dices className="h-5 w-5" /> {t("roll")} <span className="text-sm opacity-80">({3 - rolls})</span>
          </button>
        </div>

        <div className="paper overflow-x-auto rounded-md p-4" style={{ backgroundImage: "repeating-linear-gradient(transparent 0 31px, oklch(0.7 0.05 240 / 0.35) 31px 32px), var(--gradient-ivory)" }}>
          <table className="text-sm">
            <thead>
              <tr className="font-display">
                <th className="px-2 py-1 text-left">boards.gg</th>
                {sheets.map((_, i) => (
                  <th key={i} className={`w-14 px-2 py-1 text-center ${i === cur && !done ? "rounded bg-brass/50" : ""}`}>P{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {YATZY_CATS.map((cat, idx) => (
                <tr key={cat} className={idx === 6 ? "border-t-2 border-ink/40" : ""}>
                  <td className="h-8 px-2 font-semibold">{t(`y_${cat}` as keyof Dict)}</td>
                  {sheets.map((s, i) => {
                    const filled = s[cat] !== undefined;
                    const preview = i === cur && rolls > 0 && !filled;
                    return (
                      <td key={i} className="text-center">
                        {filled ? (
                          <span className="font-chalk text-2xl text-chip-blue">{s[cat]}</span>
                        ) : preview ? (
                          <button onClick={() => pick(cat)} className="w-full rounded px-1 font-bold text-ink/50 hover:bg-brass/40 hover:text-ink">
                            {yatzyScore(cat, dice)}
                          </button>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-t-2 border-ink/40">
                <td className="px-2 font-semibold">{t("bonus")}</td>
                {sheets.map((s, i) => <td key={i} className="text-center font-chalk text-xl">{yatzyBonus(s) || "–"}</td>)}
              </tr>
              <tr>
                <td className="px-2 font-display font-black">{t("total")}</td>
                {sheets.map((s, i) => <td key={i} className="text-center font-chalk text-2xl font-bold text-chip-red">{total(s)}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </GameLayout>
  );
}
