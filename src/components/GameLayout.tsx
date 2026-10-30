import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useApp } from "@/lib/i18n/context";
import type { TKey } from "@/lib/i18n/context";

export function GameLayout({ title, children, actions }: { title: TKey; children: ReactNode; actions?: ReactNode }) {
  const { t } = useApp();
  return (
    <main className="mx-auto max-w-6xl px-2 py-3 sm:px-4 sm:py-6">
      <div className="mb-3 sm:mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="btn-real btn-dark !px-3" aria-label={t("back")}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="engraved text-3xl font-black text-brass md:text-4xl">{t(title)}</h1>
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>
      {children}
    </main>
  );
}

export function Banner({ children, tone = "brass" }: { children: ReactNode; tone?: "brass" | "red" }) {
  return (
    <div
      key={String(children)}
      className={`animate-pop mx-auto w-fit rounded-lg px-6 py-2 text-center text-xl font-black ${tone === "red" ? "btn-red" : "brass-plate"}`}
    >
      {children}
    </div>
  );
}
