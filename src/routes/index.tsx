import { createFileRoute, Link } from "@tanstack/react-router";
import { Castle, Cherry, CircleDot, Dices, Disc3, Grid3x3, Images, Map as MapIcon, MessageSquareOff, PenLine, Spade, Target } from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { GAMES, type TrayIcon } from "@/lib/games/registry";
import { sfx } from "@/lib/sound";

const GLYPH = { grid: Grid3x3, disc: CircleDot, dice: Dices, map: MapIcon, hush: MessageSquareOff, photo: Images, spade: Spade, wheel: Disc3, reel: Cherry, king: Castle, pencil: PenLine, cue: Target } as const;
function TrayGlyph({ icon }: { icon: TrayIcon }) {
  const I = GLYPH[icon];
  return <I className="h-8 w-8 drop-shadow-[0_2px_1px_oklch(0_0_0/0.7)]" strokeWidth={2.2} />;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "boards.gg — Play classic table games online" },
      { name: "description", content: "A realistic games parlor: Blackjack, Roulette, Slots, Yatzy, Taboo, Connect Four, Memory, Chess, Pool and more." },
      { property: "og:title", content: "boards.gg — Play classic table games online" },
      { property: "og:description", content: "A realistic games parlor with twelve classic games, in five languages." },
    ],
  }),
  component: Index,
});

const BOX: Record<string, string> = {
  slate: "slate-board text-chalk",
  blue: "bg-chip-blue text-ivory",
  ivory: "paper",
  sea: "bg-chip-blue text-ivory",
  red: "btn-red",
  felt: "felt text-ivory",
};

function Index() {
  const { t } = useApp();
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
      <section className="mb-10 text-center">
        <h1 className="engraved text-5xl font-black text-brass md:text-7xl">boards.gg</h1>
        <p className="mt-3 text-lg text-muted-foreground">{t("tagline")}</p>
      </section>

      <h2 className="mb-4 text-center font-display text-2xl text-ivory">{t("pick")}</h2>
      <div className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g, i) => (
          <Link
            key={g.to}
            to={g.to}
            onClick={() => sfx.card()}
            className="group relative animate-pop"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* open component tray: mahogany frame, felt well, pieces inside */}
            <div
              className="wood relative rounded-lg p-3 transition-transform duration-300 group-hover:-translate-y-2 group-active:translate-y-0"
              style={{ boxShadow: "var(--shadow-object), inset 0 2px 0 oklch(1 0 0 / 0.18), inset 0 -6px 0 oklch(0 0 0 / 0.35)" }}
            >
              <div className={`${BOX[g.box]} relative grid h-36 grid-cols-[auto_1fr] items-center gap-4 overflow-hidden rounded-md p-4`} style={{ boxShadow: "inset 0 6px 14px oklch(0 0 0 / 0.65), inset 0 -2px 0 oklch(1 0 0 / 0.1)" }}>
                <span className="grid h-20 w-20 place-items-center rounded-full brass-plate transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
                  <TrayGlyph icon={g.icon} />
                </span>
                <p className="text-base leading-snug opacity-90">{t(g.desc)}</p>
              </div>
              <div className="mx-auto -mb-6 mt-2 w-fit translate-y-1 rounded-sm brass-plate px-5 py-1 text-center">
                <h3 className="text-lg font-black uppercase tracking-[0.12em]">{t(g.name)}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
