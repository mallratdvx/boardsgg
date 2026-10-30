import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { GameLayout, Banner } from "@/components/GameLayout";
import { useApp } from "@/lib/i18n/context";
import { sfx } from "@/lib/sound";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/pool")({
  head: () => ({
    meta: [
      { title: "8-Ball Pool — boards.gg" },
      { name: "description", content: "Play 8-ball pool on a mahogany table with green baize, resin balls and real physics." },
      { property: "og:title", content: "8-Ball Pool — boards.gg" },
      { property: "og:description", content: "Pull back the cue and strike on a realistic billiard table." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pool,
});

// Table in portrait units: 500 x 1000 playing bed
const W = 500, H = 1000, R = 15, POCKET = 30;
const POCKETS: [number, number][] = [[0, 0], [W, 0], [0, H / 2], [W, H / 2], [0, H], [W, H]];
const COLORS = ["#f2ead8", "#e8b923", "#1f4fa8", "#c4242b", "#5b2a86", "#e5671f", "#1f7a3e", "#7a2420", "#151515"];
type Ball = { n: number; x: number; y: number; vx: number; vy: number; in: boolean };

function rack(): Ball[] {
  const order = [1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15];
  const balls: Ball[] = [{ n: 0, x: W / 2, y: H * 0.75, vx: 0, vy: 0, in: false }];
  let k = 0;
  for (let row = 0; row < 5; row++)
    for (let i = 0; i <= row; i++)
      balls.push({ n: order[k++]!, x: W / 2 + (i - row / 2) * R * 2.05, y: H * 0.25 - row * R * 1.8, vx: 0, vy: 0, in: false });
  return balls;
}
const group = (n: number) => (n === 0 || n === 8 ? null : n < 8 ? "solids" : "stripes");

function Pool() {
  const { t } = useApp();
  const canvas = useRef<HTMLCanvasElement>(null);
  const balls = useRef<Ball[]>(rack());
  const aim = useRef<{ x: number; y: number } | null>(null);
  const moving = useRef(false);
  const shot = useRef<{ potted: number[]; firstHit: number | null }>({ potted: [], firstHit: null });
  const [turn, setTurn] = useState(0);
  const [groups, setGroups] = useState<(null | "solids" | "stripes")[]>([null, null]);
  const [msg, setMsg] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const state = useRef({ turn, groups, over });
  state.current = { turn, groups, over };
  const name = (i: number) => t("playerN", { n: i + 1 });

  const endShot = () => {
    const { turn: tr, groups: gs } = state.current;
    const { potted } = shot.current;
    const cue = balls.current[0]!;
    const scratch = cue.in;
    let g = [...gs];
    if (potted.includes(8)) {
      const mine = g[tr];
      const left = balls.current.filter((b) => !b.in && group(b.n) === mine).length;
      const win = mine && left === 0 && !scratch;
      const text = win ? t("poolWin", { name: name(tr) }) : t("poolLose", { name: name(tr), other: name(1 - tr) });
      setOver(text);
      sfx.win(); celebrate();
      return;
    }
    if (!g[tr] && potted.length) {
      const first = group(potted.find((n) => n !== 0) ?? 0);
      if (first) { g[tr] = first; g[1 - tr] = first === "solids" ? "stripes" : "solids"; setGroups(g); }
    }
    if (scratch) {
      Object.assign(cue, { x: W / 2, y: H * 0.75, vx: 0, vy: 0, in: false });
      setMsg(t("scratch")); sfx.buzzer();
      setTurn(1 - tr);
      return;
    }
    setMsg(null);
    const ownPotted = potted.some((n) => n !== 0 && (!g[tr] || group(n) === g[tr]));
    if (!ownPotted) setTurn(1 - tr);
  };

  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const step = () => {
      const bs = balls.current;
      let any = false;
      for (let sub = 0; sub < 4; sub++) {
        for (const b of bs) {
          if (b.in) continue;
          b.x += b.vx / 4; b.y += b.vy / 4;
          if (b.x < R) { b.x = R; b.vx = -b.vx * 0.8; sub === 0 && sfx.tick(); }
          if (b.x > W - R) { b.x = W - R; b.vx = -b.vx * 0.8; }
          if (b.y < R) { b.y = R; b.vy = -b.vy * 0.8; }
          if (b.y > H - R) { b.y = H - R; b.vy = -b.vy * 0.8; }
          for (const [px, py] of POCKETS) {
            if (Math.hypot(b.x - px, b.y - py) < POCKET) {
              b.in = true; b.vx = b.vy = 0; shot.current.potted.push(b.n); sfx.thud();
            }
          }
        }
        for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
          const a = bs[i]!, b = bs[j]!;
          if (a.in || b.in) continue;
          const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
          if (d > 0 && d < R * 2) {
            const nx = dx / d, ny = dy / d, ov = (R * 2 - d) / 2;
            a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov;
            const p = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
            if (p > 0) {
              a.vx -= p * nx; a.vy -= p * ny; b.vx += p * nx; b.vy += p * ny;
              if (p > 1) sfx.chip();
              if (shot.current.firstHit === null && a.n === 0) shot.current.firstHit = b.n;
            }
          }
        }
      }
      for (const b of bs) {
        b.vx *= 0.985; b.vy *= 0.985;
        if (Math.hypot(b.vx, b.vy) < 0.05) b.vx = b.vy = 0; else any = true;
      }
      if (moving.current && !any) { moving.current = false; endShot(); }
      draw(ctx);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, W, H);
    // baize
    const g = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, H * 0.65);
    g.addColorStop(0, "#2f7a45"); g.addColorStop(1, "#14402a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, H * 0.75); ctx.lineTo(W, H * 0.75); ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, H * 0.75, 80, 0, Math.PI); ctx.stroke();
    for (const [px, py] of POCKETS) {
      ctx.fillStyle = "#050302"; ctx.beginPath(); ctx.arc(px, py, POCKET, 0, Math.PI * 2); ctx.fill();
    }
    for (const b of balls.current) {
      if (b.in) continue;
      ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.ellipse(b.x + 4, b.y + 5, R, R * 0.85, 0, 0, Math.PI * 2); ctx.fill();
      const base = COLORS[b.n > 8 ? b.n - 8 : b.n]!;
      ctx.save(); ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = b.n > 8 ? COLORS[0]! : base; ctx.fillRect(b.x - R, b.y - R, R * 2, R * 2);
      if (b.n > 8) { ctx.fillStyle = base; ctx.fillRect(b.x - R, b.y - R * 0.55, R * 2, R * 1.1); }
      if (b.n > 0) {
        ctx.fillStyle = COLORS[0]!; ctx.beginPath(); ctx.arc(b.x, b.y, R * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#111"; ctx.font = "bold 11px Georgia"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(b.n), b.x, b.y + 1);
      }
      const sh = ctx.createRadialGradient(b.x - 5, b.y - 6, 1, b.x, b.y, R);
      sh.addColorStop(0, "rgba(255,255,255,0.75)"); sh.addColorStop(0.3, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = sh; ctx.fillRect(b.x - R, b.y - R, R * 2, R * 2);
      ctx.restore();
    }
    const cue = balls.current[0]!;
    if (aim.current && !moving.current) {
      const dx = cue.x - aim.current.x, dy = cue.y - aim.current.y;
      const d = Math.min(Math.hypot(dx, dy), 220), a = Math.atan2(dy, dx);
      ctx.setLineDash([6, 8]); ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cue.x, cue.y); ctx.lineTo(cue.x + Math.cos(a) * 600, cue.y + Math.sin(a) * 600); ctx.stroke();
      ctx.setLineDash([]);
      // cue stick
      const s0 = R + 6 + d * 0.5, s1 = s0 + 380;
      const x0 = cue.x - Math.cos(a) * s0, y0 = cue.y - Math.sin(a) * s0, x1 = cue.x - Math.cos(a) * s1, y1 = cue.y - Math.sin(a) * s1;
      const sg = ctx.createLinearGradient(x0, y0, x1, y1);
      sg.addColorStop(0, "#3a6fb0"); sg.addColorStop(0.02, "#f1e3c2"); sg.addColorStop(0.6, "#d9b27a"); sg.addColorStop(0.75, "#4a2414"); sg.addColorStop(1, "#1d0e08");
      ctx.strokeStyle = sg; ctx.lineCap = "round"; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
  };

  const toTable = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const down = (e: React.PointerEvent) => {
    if (moving.current || state.current.over) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    aim.current = toTable(e);
  };
  const move = (e: React.PointerEvent) => { if (aim.current) aim.current = toTable(e); };
  const up = () => {
    const p = aim.current; aim.current = null;
    if (!p) return;
    const cue = balls.current[0]!;
    const dx = cue.x - p.x, dy = cue.y - p.y, d = Math.min(Math.hypot(dx, dy), 220);
    if (d < 10) return;
    const power = (d / 220) * 38;
    cue.vx = (dx / Math.hypot(dx, dy)) * power; cue.vy = (dy / Math.hypot(dx, dy)) * power;
    shot.current = { potted: [], firstHit: null };
    moving.current = true; sfx.thud();
  };
  const reset = () => { balls.current = rack(); setTurn(0); setGroups([null, null]); setMsg(null); setOver(null); sfx.dice(); };

  return (
    <GameLayout title="g_pool" actions={<button className="btn-real" onClick={reset}>{t("newGame")}</button>}>
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
        {[0, 1].map((i) => (
          <div key={i} className={`rounded px-3 py-1 text-sm font-bold ${turn === i ? "brass-plate" : "btn-dark"}`}>
            {name(i)}{groups[i] ? ` · ${t(groups[i]!)}` : ""}
          </div>
        ))}
      </div>
      <div className="mb-3 min-h-10">{over ? <Banner>{over}</Banner> : msg ? <Banner tone="red">{msg}</Banner> : <p className="text-center text-sm text-muted-foreground">{t("poolTurn", { name: name(turn) })} — {t("aimHint")}</p>}</div>
      <div className="wood mx-auto w-full max-w-[min(100%,46vh)] rounded-2xl p-[4%] max-sm:-mx-4 max-sm:w-screen max-sm:max-w-none max-sm:rounded-none" style={{ boxShadow: "var(--shadow-object), inset 0 2px 0 oklch(1 0 0 / 0.2)" }}>
        <canvas
          ref={canvas}
          width={W}
          height={H}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={() => (aim.current = null)}
          className="block aspect-[1/2] w-full touch-none rounded-md"
          style={{ boxShadow: "inset 0 0 0 6px oklch(0.3 0.08 150), 0 0 0 3px oklch(0.2 0.03 50)" }}
        />
      </div>
    </GameLayout>
  );
}
