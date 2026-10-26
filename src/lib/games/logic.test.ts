import { describe, expect, it } from "vitest";
import { handValue, settle, type Card } from "./cards";
import { c4Drop, c4Winner, rouletteWin, slotPayout, tttBestMove, tttWinner, yatzyBonus, yatzyScore, type C4Cell } from "./logic";

const c = (rank: string): Card => ({ rank, suit: "S" });

describe("blackjack", () => {
  it("counts aces flexibly", () => {
    expect(handValue([c("A"), c("K")])).toBe(21);
    expect(handValue([c("A"), c("A"), c("9")])).toBe(21);
    expect(handValue([c("A"), c("9"), c("5")])).toBe(15);
  });
  it("pays 3:2 on blackjack and busts over 21", () => {
    expect(settle([c("A"), c("Q")], [c("10"), c("9")]).mult).toBe(2.5);
    expect(settle([c("10"), c("9"), c("5")], [c("10"), c("7")]).outcome).toBe("bust");
    expect(settle([c("10"), c("8")], [c("10"), c("8")]).outcome).toBe("push");
  });
});

describe("tic tac toe", () => {
  it("detects a row and blocks a win", () => {
    expect(tttWinner(["X","X","X",null,null,null,null,null,null])?.mark).toBe("X");
    expect(tttBestMove(["X","X",null,null,"O",null,null,null,null], "O")).toBe(2);
  });
});

describe("connect four", () => {
  it("finds a vertical four", () => {
    let g: C4Cell[][] = Array.from({ length: 6 }, () => Array(7).fill(0));
    for (let i = 0; i < 4; i++) g = c4Drop(g, 2, 1)!.grid;
    expect(c4Winner(g)?.p).toBe(1);
  });
});

describe("yatzy", () => {
  it("scores categories", () => {
    expect(yatzyScore("yatzy", [4,4,4,4,4])).toBe(50);
    expect(yatzyScore("full", [2,2,3,3,3])).toBe(13);
    expect(yatzyScore("twoPairs", [6,6,2,2,1])).toBe(16);
    expect(yatzyScore("small", [1,2,3,4,5])).toBe(15);
    expect(yatzyScore("large", [2,3,4,5,6])).toBe(20);
    expect(yatzyScore("fours", [4,4,1,2,4])).toBe(12);
  });
  it("gives 50 bonus at 63 upper points", () => {
    expect(yatzyBonus({ ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18 })).toBe(50);
    expect(yatzyBonus({ sixes: 30 })).toBe(0);
  });
});

describe("payouts", () => {
  it("slots", () => {
    expect(slotPayout(["7️⃣","7️⃣","7️⃣"], 10)).toBe(1000);
    expect(slotPayout(["🍋","🍋","🔔"], 10)).toBe(20);
    expect(slotPayout(["🍒","🍋","🔔"], 10)).toBe(10);
    expect(slotPayout(["🍇","🍋","🔔"], 10)).toBe(0);
  });
  it("roulette", () => {
    expect(rouletteWin("n:17", 17)).toBe(36);
    expect(rouletteWin("red", 1)).toBe(2);
    expect(rouletteWin("red", 0)).toBe(0);
    expect(rouletteWin("even", 0)).toBe(0);
  });
});
