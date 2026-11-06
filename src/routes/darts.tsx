import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Banner, GameLayout } from "@/components/GameLayout";
import { useApp } from "@/lib/i18n/context";
import { sfx } from "@/lib/sound";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/darts")({
  head: () => ({
    meta: [
      { title: "Tavern Darts 301 — boards.gg" },
      { name: "description", content: "Flick darts at a sisal pub board under a brass lamp and count down from 301." },
      { property: "og:title", content: "Tavern Darts — boards.gg" },
      { property: "og:description", content: "Pub darts with a chalkboard tally. First to check out from 301 wins." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Darts,
});

const NUMS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
// Board radii in units of the 170 outer double ring.
const R = { bull: 6.35, outer: 16, tIn: 99, tOut: 107, dIn: 162, dOut: 170 };

function scoreAt(x: number, y: number): { pts: number; label: string } {
  const d = Math.hypot(x, y);
  if (d <= R.bull) return { pts: 50, label: "BULL" };
  if (d <= R.outer) return { pts: 25, label: "25" };
  if (d > R.dOut) return { pts: 0, label: "MISS" };
  const ang = (Math.atan2(x, -y) * 180) / Math.PI;
  const n = NUMS[Math.round(((ang + 360) % 360) / 18) % 20] ?? 0;
  if (d >= R.dIn) return { pts: n * 2, label: `D${n}` };
  if (d >= R.tIn && d <= R.tOut) return { pts: n * 3, label: `T${n}` };
  return { pts: n, label: String(n) };
}

function wedge(a0: number, a1: number, r0: number, r1: number) {
  const p = (a: number, r: number) => `${(Math.sin((a * Math.PI) / 180) * r).toFixed(2)} ${(-Math.cos((a * Math.PI) / 180) * r).toFixed(2)}`;
  return `M${p(a0, r0)} L${p(a0, r1)} A${r1} ${r1} 0 0 1 ${p(a1, r1)} L${p(a1, r0)} A${r0} ${r0} 0 0 0 ${p(a0, r0)}Z`;
}

type Hit = { x: number; y: number; label: string };

function Darts() {
  const { t } = useApp();
  const [scores, setScores] = useState([301, 301]);
  const [turn, setTurn] = useState(0);
  const [darts, setDarts] = useState<Hit[]>([]);
  const [turnStart, setTurnStart] = useState(301);
  const [msg, setMsg] = useState("");
  const [winner, setWinner] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const busy = useRef(false);
  const name = (i: number) => t("playerN", { n: i + 1 });

  const throwDart = (dx: number, vy: number) => {
    if (busy.current || winner !== null || darts.length >= 3) return;
    // Upward speed sets height (ideal ~1.6 px/ms lands on bull), sideways drift sets x; small human wobble.
    const wob = () => (Math.random() - 0.5) * 34;
    const x = dx * 0.9 + wob();
    const y = (1.6 - vy) * 140 + wob();
    const hit = scoreAt(x, y);
    sfx.dartThunk();
    const nd = [...darts, { x, y, label: hit.label }];
    setDarts(nd);
    const left = scores[turn]! - hit.pts;
    const isDouble = hit.label.startsWith("D") || hit.label === "BULL";
    let ended = nd.length === 3;
    if (left < 0 || left === 1 || (left === 0 && !isDouble)) {
      setMsg(t("dartsBust")); sfx.buzzer();
      setScores((s) => s.map((v, i) => (i === turn ? turnStart : v)));
      ended = true;
    } else {
      setScores((s) => s.map((v, i) => (i === turn ? left : v)));
      setMsg(hit.label);
      if (left === 0) { setWinner(turn); sfx.win(); celebrate(); return; }
    }
    if (ended) {
      busy.current = true;
      setZoom(true);
      setTimeout(() => {
        setZoom(false); setDarts([]); setMsg("");
        const nt = 1 - turn; setTurn(nt);
        setScores((s) => { setTurnStart(s[nt]!); return s; });
        busy.current = false;
      }, 1600);
    }
  };

  const reset = () => { setScores([301, 301]); setTurn(0); setDarts([]); setTurnStart(301); setWinner(null); setMsg(""); sfx.click(); };

  return (
    <GameLayout title="g_darts" actions={<button className="btn-real" onClick={reset}>{t("newGame")}</button>}>
      <div className="mx-auto grid max-w-3xl gap-3 md:grid-cols-[1fr_200px]">
        <div
          className="wood relative touch-none select-none overflow-hidden rounded-2xl p-3"
          onPointerDown={(e) => { start.current = { x: e.clientX, y: e.clientY, t: performance.now() }; }}
          onPointerUp={(e) => {
            const s = start.current; start.current = null;
            if (!s) return;
            const dy = s.y - e.clientY, dt = Math.max(30, performance.now() - s.t);
            if (dy < 25) return;
            throwDart(e.clientX - s.x, dy / dt);
          }}
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-64 -translate-x-1/2 rounded-full" style={{ background: "radial-gradient(closest-side, oklch(0.85 0.12 80 / 0.35), transparent)" }} />
          <svg viewBox="-215 -215 430 430" className="mx-auto block aspect-square w-full max-w-[min(100%,70dvh)] transition-transform duration-500"
            style={{ transform: zoom && darts.length ? `scale(1.6) translate(${-(darts.reduce((a, d) => a + d.x, 0) / darts.length) / 4.3}%, ${-(darts.reduce((a, d) => a + d.y, 0) / darts.length) / 4.3}%)` : undefined }}>
            <circle r="212" fill="oklch(0.28 0.06 40)" stroke="oklch(0.7 0.12 80)" strokeWidth="4" />
            <circle r="190" fill="oklch(0.16 0.01 60)" />
            {NUMS.map((n, i) => {
              const a0 = i * 18 - 9, a1 = a0 + 18, dark = i % 2 === 0;
              const base = dark ? "oklch(0.2 0.01 60)" : "oklch(0.88 0.04 85)";
              const ring = dark ? "oklch(0.5 0.17 25)" : "oklch(0.5 0.12 150)";
              const a = (i * 18 * Math.PI) / 180;
              return (
                <g key={n} stroke="oklch(0.75 0.02 80)" strokeWidth="0.8">
                  <path d={wedge(a0, a1, R.outer, R.tIn)} fill={base} />
                  <path d={wedge(a0, a1, R.tIn, R.tOut)} fill={ring} />
                  <path d={wedge(a0, a1, R.tOut, R.dIn)} fill={base} />
                  <path d={wedge(a0, a1, R.dIn, R.dOut)} fill={ring} />
                  <text x={Math.sin(a) * 186} y={-Math.cos(a) * 186 + 6} textAnchor="middle" fontSize="17" fill="oklch(0.92 0.03 85)" stroke="none" fontFamily="Cinzel" fontWeight="700">{n}</text>
                </g>
              );
            })}
            <circle r={R.outer} fill="oklch(0.5 0.12 150)" stroke="oklch(0.75 0.02 80)" />
            <circle r={R.bull} fill="oklch(0.5 0.17 25)" />
            {darts.map((d, i) => (
              <g key={i} transform={`translate(${d.x} ${d.y})`} className="animate-pop">
                <line x1="0" y1="0" x2="10" y2="34" stroke="oklch(0.65 0.02 80)" strokeWidth="4" strokeLinecap="round" />
                <path d="M8 30 L22 52 L4 44 Z" fill="oklch(0.45 0.15 25)" />
                <circle r="3" fill="oklch(0.85 0.02 80)" />
              </g>
            ))}
          </svg>
          <p className="mt-2 text-center font-display text-xs tracking-widest text-ivory/80">{t("dartsHint")}</p>
          <div className="mx-auto mt-2 flex w-fit gap-2 rounded-full bg-background/40 px-4 py-2 shadow-inner">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`h-8 w-2 rounded-full transition ${i < 3 - darts.length ? "bg-brass" : "bg-ivory/15"}`} />
            ))}
          </div>
        </div>
        <div className="slate-board flex flex-col gap-3 rounded-xl p-4 text-chalk">
          {[0, 1].map((i) => (
            <div key={i} className={`rounded-md border-2 p-2 ${turn === i ? "border-chalk/80" : "border-transparent"}`}>
              <p className="font-chalk text-xl">{name(i)}</p>
              <p className="font-chalk text-5xl">{scores[i]}</p>
            </div>
          ))}
          <p className="font-chalk text-2xl">{darts.map((d) => d.label).join("  ·  ")}</p>
          {msg && <p className="font-chalk text-xl opacity-80">{msg}</p>}
        </div>
      </div>
      {winner !== null && <div className="mt-4"><Banner>{t("dartsWin", { name: name(winner) })}</Banner></div>}
    </GameLayout>
  );
}
