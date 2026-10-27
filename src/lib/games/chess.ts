// Compact chess rules: legal moves incl. castling, en passant, auto-queen promotion.
export type Color = "w" | "b";
export type Piece = { c: Color; t: "p" | "n" | "b" | "r" | "q" | "k" };
export type Board = (Piece | null)[]; // 64, index = r*8+f, r=0 is rank 8
export type State = { board: Board; turn: Color; castle: string; ep: number | null };
export type Move = { from: number; to: number };

export function initial(): State {
  const back = "rnbqkbnr".split("") as Piece["t"][];
  const board: Board = Array(64).fill(null);
  for (let f = 0; f < 8; f++) {
    board[f] = { c: "b", t: back[f]! };
    board[8 + f] = { c: "b", t: "p" };
    board[48 + f] = { c: "w", t: "p" };
    board[56 + f] = { c: "w", t: back[f]! };
  }
  return { board, turn: "w", castle: "KQkq", ep: null };
}

const on = (r: number, f: number) => r >= 0 && r < 8 && f >= 0 && f < 8;

function attacks(b: Board, sq: number, by: Color): boolean {
  const r = sq >> 3, f = sq & 7;
  const pr = by === "w" ? r + 1 : r - 1;
  for (const df of [-1, 1]) if (on(pr, f + df)) { const p = b[pr * 8 + f + df]; if (p && p.c === by && p.t === "p") return true; }
  for (const [dr, df] of [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]] as const)
    if (on(r + dr, f + df)) { const p = b[(r + dr) * 8 + f + df]; if (p && p.c === by && p.t === "n") return true; }
  for (const [dr, df] of [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]] as const) {
    const diag = dr !== 0 && df !== 0;
    for (let k = 1; k < 8; k++) {
      const rr = r + dr * k, ff = f + df * k;
      if (!on(rr, ff)) break;
      const p = b[rr * 8 + ff];
      if (!p) continue;
      if (p.c === by && (p.t === "q" || (diag ? p.t === "b" : p.t === "r") || (k === 1 && p.t === "k"))) return true;
      break;
    }
  }
  return false;
}

export function inCheck(s: State, c: Color = s.turn) {
  const k = s.board.findIndex((p) => p?.c === c && p.t === "k");
  return k >= 0 && attacks(s.board, k, c === "w" ? "b" : "w");
}

function pseudo(s: State, from: number): number[] {
  const b = s.board, p = b[from];
  if (!p) return [];
  const r = from >> 3, f = from & 7, out: number[] = [];
  const add = (rr: number, ff: number) => { if (on(rr, ff) && b[rr * 8 + ff]?.c !== p.c) out.push(rr * 8 + ff); };
  if (p.t === "p") {
    const d = p.c === "w" ? -1 : 1, start = p.c === "w" ? 6 : 1;
    if (on(r + d, f) && !b[(r + d) * 8 + f]) {
      out.push((r + d) * 8 + f);
      if (r === start && !b[(r + 2 * d) * 8 + f]) out.push((r + 2 * d) * 8 + f);
    }
    for (const df of [-1, 1]) {
      if (!on(r + d, f + df)) continue;
      const t = (r + d) * 8 + f + df;
      if ((b[t] && b[t]!.c !== p.c) || s.ep === t) out.push(t);
    }
  } else if (p.t === "n") {
    for (const [dr, df] of [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]] as const) add(r + dr, f + df);
  } else if (p.t === "k") {
    for (let dr = -1; dr <= 1; dr++) for (let df = -1; df <= 1; df++) if (dr || df) add(r + dr, f + df);
    const opp = p.c === "w" ? "b" : "w", home = p.c === "w" ? 60 : 4;
    if (from === home && !attacks(b, home, opp)) {
      const [K, Q] = p.c === "w" ? ["K", "Q"] : ["k", "q"];
      if (s.castle.includes(K) && !b[home + 1] && !b[home + 2] && !attacks(b, home + 1, opp)) out.push(home + 2);
      if (s.castle.includes(Q) && !b[home - 1] && !b[home - 2] && !b[home - 3] && !attacks(b, home - 1, opp)) out.push(home - 2);
    }
  } else {
    const dirs = p.t === "b" ? [[1,1],[1,-1],[-1,1],[-1,-1]] : p.t === "r" ? [[1,0],[-1,0],[0,1],[0,-1]] : [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
    for (const [dr, df] of dirs as [number, number][])
      for (let k = 1; k < 8; k++) {
        const rr = r + dr * k, ff = f + df * k;
        if (!on(rr, ff)) break;
        const t = b[rr * 8 + ff];
        if (t?.c === p.c) break;
        out.push(rr * 8 + ff);
        if (t) break;
      }
  }
  return out;
}

export function apply(s: State, m: Move): State {
  const b = [...s.board], p = b[m.from]!;
  let ep: number | null = null;
  let castle = s.castle;
  if (p.t === "p" && m.to === s.ep) b[m.to + (p.c === "w" ? 8 : -8)] = null;
  if (p.t === "p" && Math.abs(m.to - m.from) === 16) ep = (m.to + m.from) / 2;
  if (p.t === "k" && Math.abs(m.to - m.from) === 2) {
    const rookFrom = m.to > m.from ? m.from + 3 : m.from - 4, rookTo = m.to > m.from ? m.from + 1 : m.from - 1;
    b[rookTo] = b[rookFrom]!; b[rookFrom] = null;
  }
  if (p.t === "k") castle = castle.replace(p.c === "w" ? /[KQ]/g : /[kq]/g, "");
  for (const [sq, ch] of [[63, "K"], [56, "Q"], [7, "k"], [0, "q"]] as const) if (m.from === sq || m.to === sq) castle = castle.replace(ch, "");
  b[m.to] = p.t === "p" && (m.to < 8 || m.to >= 56) ? { c: p.c, t: "q" } : p;
  b[m.from] = null;
  return { board: b, turn: s.turn === "w" ? "b" : "w", castle, ep };
}

export function legalFrom(s: State, from: number): number[] {
  if (s.board[from]?.c !== s.turn) return [];
  return pseudo(s, from).filter((to) => !inCheck(apply(s, { from, to }), s.turn));
}

export function status(s: State): "play" | "check" | "mate" | "stalemate" {
  const any = s.board.some((p, i) => p?.c === s.turn && legalFrom(s, i).length > 0);
  const chk = inCheck(s);
  if (!any) return chk ? "mate" : "stalemate";
  return chk ? "check" : "play";
}
