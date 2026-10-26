import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/i18n/context";
import { GAMES } from "@/lib/games/registry";
import { sfx } from "@/lib/sound";

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
                <span className="text-5xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110">{g.icon}</span>
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
