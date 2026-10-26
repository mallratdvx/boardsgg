// ---------- Tic Tac Toe ----------
export type Mark = "X" | "O" | null;
export const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

export function tttWinner(b: Mark[]): { mark: Mark; line: number[] } | null {
  for (const l of LINES) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return { mark: b[l[0]], line: l };
  return null;
}

function minimax(b: Mark[], me: "X" | "O", turn: "X" | "O"): number {
  const w = tttWinner(b);
  if (w) return w.mark === me ? 10 : -10;
  if (b.every(Boolean)) return 0;
  const scores: number[] = [];
  b.forEach((c, i) => {
    if (c) return;
    const n = [...b]; n[i] = turn;
    scores.push(minimax(n, me, turn === "X" ? "O" : "X") * 0.9);
  });
  return turn === me ? Math.max(...scores) : Math.min(...scores);
}

export function tttBestMove(b: Mark[], me: "X" | "O"): number {
  let best = -Infinity, move = -1;
  b.forEach((c, i) => {
    if (c) return;
    const n = [...b]; n[i] = me;
    const s = minimax(n, me, me === "X" ? "O" : "X") + Math.random() * 0.5;
    if (s > best) { best = s; move = i; }
  });
  return move;
}

// ---------- Connect Four ----------
export const C4_ROWS = 6, C4_COLS = 7;
export type C4Cell = 0 | 1 | 2;

export function c4Drop(grid: C4Cell[][], col: number, p: 1 | 2): { grid: C4Cell[][]; row: number } | null {
  for (let r = C4_ROWS - 1; r >= 0; r--) {
    if (grid[r][col] === 0) {
      const g = grid.map((row) => [...row]);
      g[r][col] = p;
      return { grid: g, row: r };
    }
  }
  return null;
}

export function c4Winner(g: C4Cell[][]): { p: 1 | 2; cells: [number, number][] } | null {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < C4_ROWS; r++) for (let c = 0; c < C4_COLS; c++) {
    const p = g[r][c];
    if (!p) continue;
    for (const [dr, dc] of dirs) {
      const cells: [number, number][] = [[r, c]];
      for (let k = 1; k < 4; k++) {
        const rr = r + dr * k, cc = c + dc * k;
        if (rr < 0 || rr >= C4_ROWS || cc < 0 || cc >= C4_COLS || g[rr][cc] !== p) break;
        cells.push([rr, cc]);
      }
      if (cells.length === 4) return { p, cells };
    }
  }
  return null;
}

export function c4AiMove(g: C4Cell[][]): number {
  const valid = [...Array(C4_COLS).keys()].filter((c) => g[0][c] === 0);
  for (const p of [2, 1] as const) for (const c of valid) {
    const d = c4Drop(g, c, p);
    if (d && c4Winner(d.grid)) return c;
  }
  const pref = [3, 2, 4, 1, 5, 0, 6].filter((c) => valid.includes(c));
  // avoid giving the opponent a win directly above
  const safe = pref.filter((c) => {
    const d = c4Drop(g, c, 2)!;
    const above = c4Drop(d.grid, c, 1);
    return !(above && c4Winner(above.grid));
  });
  const pool = safe.length ? safe : pref;
  return Math.random() < 0.7 ? pool[0] : pool[Math.floor(Math.random() * pool.length)];
}

// ---------- Yatzy (Scandinavian) ----------
export const YATZY_CATS = ["ones","twos","threes","fours","fives","sixes","pair","twoPairs","three","four","small","large","full","chance","yatzy"] as const;
export type YatzyCat = (typeof YATZY_CATS)[number];

export function yatzyScore(cat: YatzyCat, dice: number[]): number {
  const counts = [0,0,0,0,0,0,0];
  dice.forEach((d) => counts[d]++);
  const sum = dice.reduce((a, b) => a + b, 0);
  const ofKind = (n: number) => { for (let v = 6; v >= 1; v--) if (counts[v] >= n) return v * n; return 0; };
  const upper = ["ones","twos","threes","fours","fives","sixes"].indexOf(cat);
  if (upper >= 0) return counts[upper + 1] * (upper + 1);
  switch (cat) {
    case "pair": return ofKind(2);
    case "twoPairs": {
      const pairs = [6,5,4,3,2,1].filter((v) => counts[v] >= 2);
      return pairs.length >= 2 ? pairs[0] * 2 + pairs[1] * 2 : 0;
    }
    case "three": return ofKind(3);
    case "four": return ofKind(4);
    case "small": return [1,2,3,4,5].every((v) => counts[v] === 1) ? 15 : 0;
    case "large": return [2,3,4,5,6].every((v) => counts[v] === 1) ? 20 : 0;
    case "full": {
      const three = counts.findIndex((c, v) => v > 0 && c === 3);
      const two = counts.findIndex((c, v) => v > 0 && c === 2);
      return three > 0 && two > 0 ? sum : 0;
    }
    case "chance": return sum;
    case "yatzy": return counts.some((c) => c === 5) ? 50 : 0;
  }
  return 0;
}

export function yatzyBonus(sheet: Partial<Record<YatzyCat, number>>): number {
  const up = (["ones","twos","threes","fours","fives","sixes"] as YatzyCat[]).reduce((a, c) => a + (sheet[c] ?? 0), 0);
  return up >= 63 ? 50 : 0;
}

// ---------- Slots ----------
export const SLOT_SYMBOLS = ["🍒", "🍋", "🔔", "🍇", "⭐", "7️⃣"] as const;
const SLOT_PAY: Record<string, number> = { "🍒": 5, "🍋": 8, "🔔": 12, "🍇": 15, "⭐": 25, "7️⃣": 100 };

export function slotPayout(reels: string[], bet: number): number {
  const [a, b, c] = reels;
  if (a === b && b === c) return bet * SLOT_PAY[a];
  if (a === b || b === c || a === c) return bet * 2;
  if (reels.includes("🍒")) return bet;
  return 0;
}

// ---------- Roulette (European) ----------
export const WHEEL = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const REDS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
export const rouletteColor = (n: number): "red" | "black" | "green" => (n === 0 ? "green" : REDS.has(n) ? "red" : "black");

export type RBet = string; // "n:17" | "red" | "black" | "even" | "odd" | "low" | "high"
export function rouletteWin(bet: RBet, n: number): number {
  if (bet.startsWith("n:")) return Number(bet.slice(2)) === n ? 36 : 0;
  if (n === 0) return 0;
  const ok =
    (bet === "red" && rouletteColor(n) === "red") ||
    (bet === "black" && rouletteColor(n) === "black") ||
    (bet === "even" && n % 2 === 0) ||
    (bet === "odd" && n % 2 === 1) ||
    (bet === "low" && n <= 18) ||
    (bet === "high" && n >= 19);
  return ok ? 2 : 0;
}
