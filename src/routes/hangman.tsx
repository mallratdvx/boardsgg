import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Banner, GameLayout } from "@/components/GameLayout";
import { useApp } from "@/lib/i18n/context";
import type { Lang } from "@/lib/i18n/dict";
import { sfx } from "@/lib/sound";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/hangman")({
  head: () => ({
    meta: [
      { title: "Hangman on a chalk slate or sketchpad — boards.gg" },
      { name: "description", content: "Guess the hidden word letter by letter before the gallows is drawn. Five languages." },
      { property: "og:title", content: "Hangman — boards.gg" },
      { property: "og:description", content: "Guess the word before the gallows is finished." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Hangman,
});

const WORDS: Record<Lang, string[]> = {
  en: ["LIBRARY", "PIRATE", "CASTLE", "VOLCANO", "GIRAFFE", "ROCKET", "PENGUIN", "BICYCLE", "LANTERN", "TREASURE", "JUNGLE", "WIZARD", "ORCHESTRA", "COMPASS"],
  de: ["BIBLIOTHEK", "PIRAT", "SCHLOSS", "VULKAN", "GIRAFFE", "RAKETE", "PINGUIN", "FAHRRAD", "LATERNE", "SCHATZ", "DSCHUNGEL", "ZAUBERER", "KOMPASS"],
  es: ["BIBLIOTECA", "PIRATA", "CASTILLO", "VOLCAN", "JIRAFA", "COHETE", "PINGUINO", "BICICLETA", "LINTERNA", "TESORO", "SELVA", "MAGO", "BRUJULA"],
  fr: ["BIBLIOTHEQUE", "PIRATE", "CHATEAU", "VOLCAN", "GIRAFE", "FUSEE", "PINGOUIN", "VELO", "LANTERNE", "TRESOR", "JUNGLE", "SORCIER", "BOUSSOLE"],
  it: ["BIBLIOTECA", "PIRATA", "CASTELLO", "VULCANO", "GIRAFFA", "RAZZO", "PINGUINO", "BICICLETTA", "LANTERNA", "TESORO", "GIUNGLA", "MAGO", "BUSSOLA"],
};
const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX = 7;

function Gallows({ miss, chalk }: { miss: number; chalk: boolean }) {
  const stroke = chalk ? "var(--chalk, oklch(0.95 0.01 90))" : "oklch(0.28 0.02 260)";
  const parts = [
    <path key="b" d="M20 190 H120 M50 190 V20 H130 V40" />,
    <circle key="h" cx="130" cy="58" r="18" />,
    <path key="t" d="M130 76 V128" />,
    <path key="la" d="M130 90 L108 112" />,
    <path key="ra" d="M130 90 L152 112" />,
    <path key="ll" d="M130 128 L112 160" />,
    <path key="rl" d="M130 128 L148 160" />,
  ];
  return (
    <svg viewBox="0 0 200 200" className="h-56 w-56" fill="none" stroke={stroke} strokeWidth={chalk ? 5 : 3.5} strokeLinecap="round" strokeLinejoin="round" style={chalk ? { filter: "drop-shadow(0 0 2px oklch(1 0 0 / 0.4))" } : undefined}>
      {parts.slice(0, miss).map((p, i) => <g key={i} className="animate-pop">{p}</g>)}
    </svg>
  );
}

function Hangman() {
  const { t, lang } = useApp();
  const [chalk, setChalk] = useState(true);
  const [word, setWord] = useState("");
  const [guessed, setGuessed] = useState<string[]>([]);
  const [flip, setFlip] = useState(0);

  const newWord = () => {
    const list = WORDS[lang];
    setWord(list[Math.floor(Math.random() * list.length)] ?? "BOARDS");
    setGuessed([]);
  };
  useEffect(newWord, [lang]);

  const miss = guessed.filter((g) => !word.includes(g)).length;
  const won = !!word && word.split("").every((c) => guessed.includes(c));
  const lost = miss >= MAX;

  const guess = (c: string) => {
    if (guessed.includes(c) || won || lost) return;
    const next = [...guessed, c];
    setGuessed(next);
    if (word.includes(c)) {
      sfx.chalk();
      if (word.split("").every((x) => next.includes(x))) { sfx.win(); void celebrate(); }
    } else {
      sfx.thud();
      if (next.filter((g) => !word.includes(g)).length >= MAX) sfx.lose();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { const k = e.key.toUpperCase(); if (ABC.includes(k)) guess(k); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const restart = () => { sfx.flip(); setFlip((f) => f + 1); setTimeout(newWord, 350); };

  return (
    <GameLayout
      title="g_hangman"
      actions={
        <div className="flex rounded-md bg-ink/60 p-1">
          <button className={`btn-real !px-3 ${chalk ? "" : "btn-dark"}`} onClick={() => { setChalk(true); sfx.click(); }}>Slate</button>
          <button className={`btn-real !px-3 ${!chalk ? "" : "btn-dark"}`} onClick={() => { setChalk(false); sfx.click(); }}>Sketchpad</button>
        </div>
      }
    >
      <div style={{ perspective: 1400 }}>
        <div
          key={flip}
          className={`${chalk ? "slate-board text-chalk" : "sketchpad text-ink"} mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-xl p-5 md:p-8 ${flip ? "animate-[pageturn_0.7s_cubic-bezier(0.4,0,0.2,1)]" : ""}`}
          style={{ transformOrigin: "top center" }}
        >
          <Gallows miss={miss} chalk={chalk} />
          <p className="text-sm opacity-80">{t("guessesLeft", { n: MAX - miss })}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {word.split("").map((c, i) => (
              <span key={i} className={`grid h-12 w-9 place-items-end justify-center border-b-4 pb-1 ${chalk ? "font-chalk" : "font-[Caveat]"} text-4xl ${chalk ? "border-chalk/70" : "border-ink/60"}`}>
                {guessed.includes(c) || lost ? <span className={`animate-pop ${!guessed.includes(c) ? "text-chip-red" : ""}`}>{c}</span> : ""}
              </span>
            ))}
          </div>
          <div className="h-12">
            {won && <Banner>{t("solved")}</Banner>}
            {lost && <Banner tone="red">{t("word", { w: word })}</Banner>}
          </div>
          <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-9">
            {ABC.map((c) => {
              const used = guessed.includes(c), hit = used && word.includes(c);
              return (
                <button key={c} onClick={() => guess(c)} disabled={used || won || lost}
                  className={`${chalk ? "wood text-ivory" : "paper-key text-ink"} h-11 w-11 rounded-md font-display text-lg font-black transition active:translate-y-0.5 disabled:opacity-40 ${hit ? "ring-2 ring-chip-green" : used ? "ring-2 ring-chip-red" : ""}`}
                  style={chalk ? { boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.3), 0 3px 0 oklch(0 0 0 / 0.5)" } : undefined}>
                  {c}
                </button>
              );
            })}
          </div>
          <button className="btn-real px-8" onClick={restart}>{t("again")}</button>
        </div>
      </div>
    </GameLayout>
  );
}
