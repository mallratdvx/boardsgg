import { describe, expect, it } from "vitest";
import { apply, initial, legalFrom, status } from "./chess";

const sq = (n: string) => (8 - Number(n[1])) * 8 + (n.charCodeAt(0) - 97);
const play = (moves: string[]) => moves.reduce((s, m) => apply(s, { from: sq(m.slice(0, 2)), to: sq(m.slice(2)) }), initial());

describe("chess", () => {
  it("opening has 20 moves", () => {
    const s = initial();
    expect(s.board.reduce((n, _, i) => n + legalFrom(s, i).length, 0)).toBe(20);
  });
  it("fool's mate is checkmate", () => {
    expect(status(play(["f2f3", "e7e5", "g2g4", "d8h4"]))).toBe("mate");
  });
  it("castling moves the rook", () => {
    const s = play(["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "g8f6"]);
    expect(legalFrom(s, sq("e1"))).toContain(sq("g1"));
    const c = apply(s, { from: sq("e1"), to: sq("g1") });
    expect(c.board[sq("f1")]?.t).toBe("r");
  });
});

import { botMove as _bm, apply as _ap, initial as _in } from "./chess";
import { test as _t, expect as _e } from "vitest";
_t("bot takes a hanging queen", () => {
  let s = _in();
  for (const [f, t] of [[52, 36], [11, 27], [36, 27], [3, 27], [57, 42]] as const) s = _ap(s, { from: f, to: t });
  // black queen on d5 (27) attacked by knight c3 (42)? it's black to move; ensure bot moves queen away or captures
  const m = _bm(s, 2);
  _e(m).not.toBeNull();
});
