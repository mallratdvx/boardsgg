import { createFileRoute, Link } from "@tanstack/react-router";
import { Castle, Cherry, CircleDot, Dices, Disc3, Grid3x3, Images, Map as MapIcon, MessageSquareOff, PenLine, Spade } from "lucide-react";
import { useApp } from "@/lib/i18n/context";
import { GAMES, type TrayIcon } from "@/lib/games/registry";
import { sfx } from "@/lib/sound";

const GLYPH = { grid: Grid3x3, disc: CircleDot, dice: Dices, map: MapIcon, hush: MessageSquareOff, photo: Images, spade: Spade, wheel: Disc3, reel: Cherry, king: Castle, pencil: PenLine } as const;
function TrayGlyph({ icon }: { icon: TrayIcon }) {
  const I = GLYPH[icon];
  return <I className="h-8 w-8 drop-shadow-[0_2px_1px_oklch(0_0_0/0.7)]" strokeWidth={2.2} />;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "boards.gg — Play classic table games online" },
      { name: "description", content: "A realistic games parlor: Blackjack, Roulette, Slots, Yatzy, Taboo, Connect Four, Memory and more." },
      { property: "og:title", content: "boards.gg — Play classic table games online" },
      { property: "og:description", content: "A realistic games parlor with nine classic games, in five languages." },
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
      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g, i) => (
          <Link
            key={g.to}
            to={g.to}
            onClick={() => sfx.card()}
            className="group relative animate-pop"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div
              className={`${BOX[g.box]} relative flex h-48 flex-col justify-between overflow-hidden rounded-lg p-5 transition-transform duration-300 group-hover:-translate-y-3 group-hover:-rotate-1`}
              style={{ boxShadow: "var(--shadow-object), inset 0 0 0 3px oklch(1 0 0 / 0.15), inset 0 -10px 0 oklch(0 0 0 / 0.18)" }}
            >
              <div className="flex items-start justify-between">
                <span className="wood grid h-16 w-16 place-items-center rounded-md p-1.5" style={{ boxShadow: "inset 0 2px 4px oklch(0 0 0 / 0.6), 0 3px 0 oklch(0 0 0 / 0.3)" }}>
                  <span className="felt grid h-full w-full place-items-center rounded-sm text-brass transition-transform duration-300 group-hover:scale-110" style={{ boxShadow: "inset 0 3px 6px oklch(0 0 0 / 0.6)" }}>
                    <TrayGlyph icon={g.icon} />
                  </span>
                </span>
                <span className="brass-plate rounded px-2 py-0.5 text-xs font-bold uppercase">{t("play")}</span>
              </div>
              <div>
                <h3 className="text-2xl font-black">{t(g.name)}</h3>
                <p className="text-sm opacity-80">{t(g.desc)}</p>
              </div>
            </div>
            {/* shelf plank */}
            <div className="absolute -bottom-4 left-[-12px] right-[-12px] h-4 rounded-sm wood shadow-[var(--shadow-object)]" />
          </Link>
        ))}
      </div>
    </main>
  );
}
