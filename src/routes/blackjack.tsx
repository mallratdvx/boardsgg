import { Coins } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Banner, GameLayout } from "@/components/GameLayout";
import { Chip, PlayingCard } from "@/components/PlayingCard";
import { useApp } from "@/lib/i18n/context";
import { handValue, isBlackjack, newDeck, settle, type Card } from "@/lib/games/cards";
import { sfx } from "@/lib/sound";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/blackjack")({
  head: () => ({
    meta: [
      { title: "Blackjack on green felt — boards.gg" },
      { name: "description", content: "Play Blackjack against the dealer with realistic cards and chips." },
      { property: "og:title", content: "Blackjack — boards.gg" },
      { property: "og:description", content: "Beat the dealer to 21." },
    ],
  }),
  component: Blackjack,
});

type Phase = "bet" | "play" | "done";

function Blackjack() {
  const { t } = useApp();
  const [coins, setCoins] = useState(500);
  const [bet, setBet] = useState(0);
  const [deck, setDeck] = useState<Card[]>([]);
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>("bet");
  const [result, setResult] = useState<string>("");

  const addBet = (v: number) => {
    if (phase !== "bet" || v > coins) return;
    setBet(bet + v); setCoins(coins - v); sfx.chip();
  };

  const finish = (p: Card[], d0: Card[], dk: Card[], b: number) => {
    let d = [...d0];
    const k = [...dk];
    if (handValue(p) <= 21) while (handValue(d) < 17) d.push(k.pop()!);
    setDealer(d); setDeck(k); setPhase("done");
    const r = settle(p, d);
    setCoins((c) => c + b * r.mult);
    setResult(r.outcome);
    if (r.mult > 1) { sfx.win(); void celebrate(r.outcome === "blackjack"); } else if (r.mult === 1) sfx.ding(); else sfx.lose();
  };

  const deal = () => {
    if (!bet) return;
    const k = deck.length < 15 ? newDeck(4) : [...deck];
    const p = [k.pop()!, k.pop()!];
    const d = [k.pop()!, k.pop()!];
    setPlayer(p); setDealer(d); setDeck(k); setPhase("play"); setResult("");
    [0, 150, 300, 450].forEach((ms) => setTimeout(sfx.card, ms));
    if (isBlackjack(p) || isBlackjack(d)) setTimeout(() => finish(p, d, k, bet), 700);
  };

  const hit = () => {
    const k = [...deck];
    const p = [...player, k.pop()!];
    setPlayer(p); setDeck(k); sfx.card();
    if (handValue(p) > 21) setTimeout(() => finish(p, dealer, k, bet), 500);
  };

  const dbl = () => {
    if (coins < bet) return;
    const k = [...deck];
    const p = [...player, k.pop()!];
    const b = bet * 2;
    setCoins(coins - bet); setBet(b); setPlayer(p); sfx.chip(); sfx.card();
    setTimeout(() => finish(p, dealer, k, b), 500);
  };

  const next = () => {
    setPlayer([]); setDealer([]); setBet(0); setPhase("bet");
    if (coins <= 0) { setCoins(500); setResult("broke"); } else setResult("");
  };

  const msg: Record<string, string> = { blackjack: t("blackjack"), win: t("youWin"), push: t("push"), lose: t("youLose"), bust: t("bust"), broke: t("broke") };

  return (
    <GameLayout title="g_blackjack" actions={<div className="brass-plate rounded-md px-4 py-2 font-black flex items-center gap-2"><Coins className="h-5 w-5" /> {coins}</div>}>
      <div className="felt table-rail relative flex min-h-[560px] flex-col items-center justify-between gap-6 rounded-[3rem_3rem_10rem_10rem] p-6 md:p-10">
        <div className="text-center">
          <p className="mb-2 font-display text-lg text-brass">{t("dealer")} {phase !== "bet" && `· ${phase === "done" ? handValue(dealer) : "?"}`}</p>
          <div className="flex min-h-36 justify-center gap-2">
            {dealer.map((c, i) => <PlayingCard key={i} card={c} hidden={i === 1 && phase === "play"} delay={i * 150 + 75} />)}
          </div>
        </div>

        <div className="h-12">
          {result ? <Banner tone={["lose", "bust"].includes(result) ? "red" : "brass"}>{msg[result]}</Banner> : (
            <p className="font-display text-sm uppercase tracking-[0.3em] text-ivory/50">Blackjack pays 3 to 2</p>
          )}
        </div>

        <div className="text-center">
          <div className="flex min-h-36 justify-center gap-2">
            {player.map((c, i) => <PlayingCard key={i} card={c} delay={i * 150} />)}
          </div>
          <p className="mt-2 font-display text-lg text-brass">{t("you")} {player.length > 0 && `· ${handValue(player)}`}</p>
        </div>

        <div className="flex flex-col items-center gap-4">
          {phase === "bet" && (
            <>
              <div className="flex gap-3">{[5, 25, 50, 100].map((v) => <Chip key={v} value={v} onClick={() => addBet(v)} />)}</div>
              <p className="font-bold text-ivory">{t("bet")}: {bet}</p>
              <div className="flex gap-3">
                <button className="btn-real btn-dark" onClick={() => { setCoins(coins + bet); setBet(0); sfx.chip(); }} disabled={!bet}>{t("clear")}</button>
                <button className="btn-real px-8" onClick={deal} disabled={!bet}>{t("deal")}</button>
              </div>
            </>
          )}
          {phase === "play" && (
            <div className="flex gap-3">
              <button className="btn-real btn-red px-8" onClick={hit}>{t("hit")}</button>
              <button className="btn-real px-8" onClick={() => finish(player, dealer, deck, bet)}>{t("stand")}</button>
              <button className="btn-real btn-dark" onClick={dbl} disabled={coins < bet || player.length > 2}>{t("double")}</button>
            </div>
          )}
          {phase === "done" && <button className="btn-real px-8" onClick={next}>{t("again")}</button>}
        </div>
      </div>
    </GameLayout>
  );
}
