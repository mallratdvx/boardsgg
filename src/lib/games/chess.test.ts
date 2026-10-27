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
