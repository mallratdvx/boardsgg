import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Banner, GameLayout } from "@/components/GameLayout";
import { useApp } from "@/lib/i18n/context";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/pinball")({
  head: () => ({
    meta: [
      { title: "Tavern Beer Pinball — boards.gg" },
      { name: "description", content: "An oak tavern pinball table with barrel bumpers, foaming stein targets and a beer-tap plunger." },
      { property: "og:title", content: "Tavern Pinball — boards.gg" },
      { property: "og:description", content: "Flip, bump and ring the brass bell. Don't tilt the table." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pinball,
});

const W = 400, H = 720, BR = 9;
const BUMPERS = [{ x: 130, y: 210, r: 26 }, { x: 250, y: 190, r: 26 }, { x: 190, y: 300, r: 26 }];
const STEINS = [{ x: 70, y: 380, r: 16 }, { x: 310, y: 380, r: 16 }];
const LANE = 370; // plunger lane x divider
const FL = { l: { x: 115, y: 640 }, r: { x: 285, y: 640 }, len: 72 };

type Seg = [number, number, number, number];
const WALLS: Seg[] = [
  [10, 10, 390, 10], [10, 10, 10, 560], [390, 10, 390, 710], [LANE, 120, LANE, 710],
  [10, 560, FL.l.x, FL.l.y], [LANE, 560, FL.r.x, FL.r.y], [320, 10, 390, 80],
];

function collideSeg(b: { x: number; y: number; vx: number; vy: number }, s: Seg, bounce: number, push = 0) {
  const [x1, y1, x2, y2] = s;
  const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy;
  const tt = Math.max(0, Math.min(1, ((b.x - x1) * dx + (b.y - y1) * dy) / L2));
  const px = x1 + tt * dx, py = y1 + tt * dy;
  const ox = b.x - px, oy = b.y - py, d = Math.hypot(ox, oy);
  if (d >= BR || d === 0) return false;
  const nx = ox / d, ny = oy / d;
  b.x = px + nx * BR; b.y = py + ny * BR;
  const vn = b.vx * nx + b.vy * ny;
  if (vn < 0) { b.vx -= (1 + bounce) * vn * nx; b.vy -= (1 + bounce) * vn * ny; }
  if (push) { b.vx += nx * push * tt; b.vy += ny * push * tt; }
  return true;
}

function Pinball() {
  const { t } = useApp();
  const cv = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [balls, setBalls] = useState(3);
  const [tilt, setTilt] = useState(false);
  const [over, setOver] = useState(false);
  const st = useRef({ b: { x: 380, y: 680, vx: 0, vy: 0 }, live: false, l: false, r: false, la: 0.5, ra: 0.5, plunge: 0, pulling: false, score: 0, balls: 3, tilt: false, flash: 0 });

  useEffect(() => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let raf = 0;
    const s = st.current;
    const reset = () => { s.b = { x: 380, y: 680, vx: 0, vy: 0 }; s.live = false; };
    const addScore = (n: number) => { s.score += n; setScore(s.score); };
    const step = () => {
      const b = s.b;
      const target = (on: boolean) => (on ? -0.45 : 0.5);
      const pl = s.la, pr = s.ra;
      s.la += (target(s.l && !s.tilt) - s.la) * 0.45;
      s.ra += (target(s.r && !s.tilt) - s.ra) * 0.45;
      if (s.pulling) s.plunge = Math.min(1, s.plunge + 0.025);
      for (let k = 0; k < 3; k++) {
        if (!s.live) break;
        b.vy += 0.06; b.x += b.vx / 3; b.y += b.vy / 3;
        for (const w of WALLS) collideSeg(b, w, 0.4);
        const lE: Seg = [FL.l.x, FL.l.y, FL.l.x + Math.cos(s.la) * FL.len, FL.l.y + Math.sin(s.la) * FL.len];
        const rE: Seg = [FL.r.x, FL.r.y, FL.r.x - Math.cos(s.ra) * FL.len, FL.r.y + Math.sin(s.ra) * FL.len];
        collideSeg(b, lE, 0.3, s.la < pl - 0.02 ? 9 : 0);
        collideSeg(b, rE, 0.3, s.ra < pr - 0.02 ? 9 : 0);
        for (const o of [...BUMPERS, ...STEINS]) {
          const dx = b.x - o.x, dy = b.y - o.y, d = Math.hypot(dx, dy);
          if (d < o.r + BR) {
            const nx = dx / d, ny = dy / d;
            b.x = o.x + nx * (o.r + BR); b.y = o.y + ny * (o.r + BR);
            const sp = Math.max(7, Math.hypot(b.vx, b.vy));
            b.vx = nx * sp; b.vy = ny * sp;
            if (o.r > 20) { sfx.barrel(); addScore(100); } else { sfx.bell(); addScore(500); }
            s.flash = 8;
          }
        }
        const v = Math.hypot(b.vx, b.vy); if (v > 16) { b.vx *= 16 / v; b.vy *= 16 / v; }
      }
      if (s.live && b.y > H + 20) {
        s.balls -= 1; setBalls(s.balls); sfx.lose(); s.tilt = false; setTilt(false);
        if (s.balls <= 0) setOver(true); else reset();
      }
      // draw
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#3a2414"); g.addColorStop(1, "#1f130a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,210,140,0.06)"; for (let y = 0; y < H; y += 7) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y + 3); ctx.stroke(); }
      ctx.strokeStyle = "#c9a14a"; ctx.lineWidth = 5; ctx.lineCap = "round";
      for (const [x1, y1, x2, y2] of WALLS) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
      for (const o of BUMPERS) {
        ctx.fillStyle = s.flash > 0 ? "#a8642a" : "#7a4520"; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 7); ctx.fill();
        ctx.strokeStyle = "#c9a14a"; ctx.lineWidth = 3; for (const rr of [o.r - 2, o.r * 0.55]) { ctx.beginPath(); ctx.arc(o.x, o.y, rr, 0, 7); ctx.stroke(); }
      }
      for (const o of STEINS) {
        ctx.fillStyle = "#e0a530"; ctx.fillRect(o.x - 12, o.y - 10, 24, 26);
        ctx.fillStyle = "#fbf3dc"; ctx.beginPath(); ctx.arc(o.x - 6, o.y - 12, 7, 0, 7); ctx.arc(o.x + 6, o.y - 12, 7, 0, 7); ctx.fill();
        ctx.strokeStyle = "#c9a14a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(o.x + 14, o.y + 3, 7, -1.5, 1.5); ctx.stroke();
      }
      ctx.strokeStyle = "#e9dcc0"; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.moveTo(FL.l.x, FL.l.y); ctx.lineTo(FL.l.x + Math.cos(s.la) * FL.len, FL.l.y + Math.sin(s.la) * FL.len); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(FL.r.x, FL.r.y); ctx.lineTo(FL.r.x - Math.cos(s.ra) * FL.len, FL.r.y + Math.sin(s.ra) * FL.len); ctx.stroke();
      // plunger spring
      const py = 695 + s.plunge * 20; ctx.strokeStyle = "#b08a3a"; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 10; i++) ctx.lineTo(380 + (i % 2 ? 6 : -6), py + i * ((H - py) / 10)); ctx.stroke();
      const bg = ctx.createRadialGradient(b.x - 3, b.y - 3, 1, b.x, b.y, BR); bg.addColorStop(0, "#fff"); bg.addColorStop(1, "#8a8f96");
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(b.x, s.live ? b.y : py - BR, BR, 0, 7); ctx.fill();
      if (s.flash > 0) s.flash--;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const key = (down: boolean) => (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "z") { if (down && !s.l) sfx.flipper(); s.l = down; }
      if (e.key === "ArrowRight" || e.key === "m") { if (down && !s.r) sfx.flipper(); s.r = down; }
      if (e.key === " " || e.key === "ArrowDown") { e.preventDefault(); if (down) startPull(); else release(); }
    };
    const kd = key(true), ku = key(false);
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    let last = 0;
    const motion = (e: DeviceMotionEvent) => {
      const a = e.acceleration; if (!a) return;
      const m = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0);
      if (m > 22 && s.live && performance.now() - last > 1000) { last = performance.now(); s.tilt = true; setTilt(true); sfx.buzzer(); }
      else if (m > 9 && s.live) { s.b.vx += (a.x ?? 0) * 0.2; }
    };
    window.addEventListener("devicemotion", motion);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); window.removeEventListener("devicemotion", motion); };
  }, []);

  function startPull() { const s = st.current; if (!s.live && s.balls > 0) s.pulling = true; }
  function release() {
    const s = st.current; if (!s.pulling) return;
    s.pulling = false; s.live = true; s.b = { x: 380, y: 680, vx: 0, vy: -(8 + s.plunge * 9) }; s.plunge = 0; sfx.lever();
  }
  const flip = (side: "l" | "r", on: boolean) => { const s = st.current; if (on && !s[side]) sfx.flipper(); s[side] = on; };
  const newGame = () => { const s = st.current; s.score = 0; s.balls = 3; s.live = false; s.b = { x: 380, y: 680, vx: 0, vy: 0 }; setScore(0); setBalls(3); setOver(false); setTilt(false); s.tilt = false; };

  const pad = "btn-real btn-dark h-16 flex-1 touch-none select-none font-display text-sm tracking-widest";
  return (
    <GameLayout title="g_pinball" actions={<button className="btn-real" onClick={newGame}>{t("newGame")}</button>}>
      <div className="mx-auto flex max-w-md flex-col gap-2">
        <div className="brass-plate flex justify-between rounded-md px-4 py-1 font-display text-sm font-black">
          <span>{t("score", { n: score })}</span><span>{t("balls", { n: balls })}</span>
        </div>
        <div className="wood relative rounded-2xl p-2">
          <canvas ref={cv} width={W} height={H} className="mx-auto block h-auto max-h-[calc(100dvh-260px)] w-auto max-w-full rounded-lg" />
          {tilt && <div className="absolute inset-x-4 top-1/3"><Banner tone="red">{t("tilt")}</Banner></div>}
          {over && <div className="absolute inset-x-4 top-1/2"><Banner>{t("gameOver", { n: score })}</Banner></div>}
        </div>
        <div className="flex gap-2">
          <button className={pad} onPointerDown={() => flip("l", true)} onPointerUp={() => flip("l", false)} onPointerLeave={() => flip("l", false)} aria-label="left flipper">L</button>
          <button className="btn-real h-16 flex-1 touch-none select-none font-display text-xs tracking-widest" onPointerDown={startPull} onPointerUp={release} onPointerLeave={release}>{t("launch")}</button>
          <button className={pad} onPointerDown={() => flip("r", true)} onPointerUp={() => flip("r", false)} onPointerLeave={() => flip("r", false)} aria-label="right flipper">R</button>
        </div>
      </div>
    </GameLayout>
  );
}
