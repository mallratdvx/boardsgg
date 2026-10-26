export type Card = { rank: string; suit: "S" | "H" | "D" | "C" };
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function newDeck(decks = 1): Card[] {
  const out: Card[] = [];
  for (let d = 0; d < decks; d++)
    for (const suit of ["S", "H", "D", "C"] as const) for (const rank of RANKS) out.push({ rank, suit });
  return shuffle(out);
}

/** Best blackjack value: aces count 11 unless that busts. */
export function handValue(hand: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    if (c.rank === "A") { aces++; total += 11; }
    else if (["J", "Q", "K"].includes(c.rank)) total += 10;
    else total += Number(c.rank);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

export const isBlackjack = (hand: Card[]) => hand.length === 2 && handValue(hand) === 21;

/** Result for the player: payout multiplier on the bet returned (0 = lose, 1 = push, 2 = win, 2.5 = blackjack). */
export function settle(player: Card[], dealer: Card[]): { outcome: "blackjack" | "win" | "push" | "lose" | "bust"; mult: number } {
  const p = handValue(player);
  const d = handValue(dealer);
  if (p > 21) return { outcome: "bust", mult: 0 };
  if (isBlackjack(player) && !isBlackjack(dealer)) return { outcome: "blackjack", mult: 2.5 };
  if (isBlackjack(dealer) && !isBlackjack(player)) return { outcome: "lose", mult: 0 };
  if (d > 21 || p > d) return { outcome: "win", mult: 2 };
  if (p === d) return { outcome: "push", mult: 1 };
  return { outcome: "lose", mult: 0 };
}
