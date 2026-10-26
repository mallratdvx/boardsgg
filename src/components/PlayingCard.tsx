import type { Card } from "@/lib/games/cards";

const SUIT: Record<Card["suit"], string> = { S: "♠", H: "♥", D: "♦", C: "♣" };

export function PlayingCard({ card, hidden, delay = 0 }: { card: Card; hidden?: boolean; delay?: number }) {
  const red = card.suit === "H" || card.suit === "D";
  if (hidden) return <div className="card-back animate-deal h-28 w-20 md:h-36 md:w-24" style={{ animationDelay: `${delay}ms` }} />;
  return (
    <div
      className={`card-face animate-deal relative h-28 w-20 select-none md:h-36 md:w-24 ${red ? "text-suit-red" : "text-ink"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute left-1.5 top-1 text-center leading-none">
        <div className="font-display text-lg font-bold">{card.rank}</div>
        <div>{SUIT[card.suit]}</div>
      </div>
      <div className="absolute inset-0 grid place-items-center text-4xl md:text-5xl">{SUIT[card.suit]}</div>
      <div className="absolute bottom-1 right-1.5 rotate-180 text-center leading-none">
        <div className="font-display text-lg font-bold">{card.rank}</div>
        <div>{SUIT[card.suit]}</div>
      </div>
    </div>
  );
}

export function Chip({ value, onClick, active }: { value: number; onClick?: () => void; active?: boolean }) {
  const color = value >= 100 ? "text-chip-black" : value >= 50 ? "text-chip-blue" : value >= 25 ? "text-chip-green" : "text-chip-red";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip ${color} grid h-14 w-14 place-items-center transition-transform hover:-translate-y-1 active:translate-y-0.5 ${active ? "-translate-y-2 animate-glow" : ""}`}
    >
      <span className="text-sm font-black text-ivory">{value}</span>
    </button>
  );
}
