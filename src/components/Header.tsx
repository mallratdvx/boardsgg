import { Link } from "@tanstack/react-router";
import { Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/i18n/context";
import { LANGS, LANG_FLAGS, LANG_LABELS } from "@/lib/i18n/dict";
import { sfx } from "@/lib/sound";

export function Header() {
  const { lang, setLang, muted, toggleMute, t } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <header className="wood relative z-30 border-b-4 border-brass-dark shadow-[var(--shadow-object)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" onClick={() => sfx.click()} className="brass-plate rounded-md px-4 py-1.5">
          <span className="font-display text-2xl font-black tracking-tight">
            boards<span className="text-accent">.gg</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { toggleMute(); sfx.click(); }}
            className="btn-real btn-dark !px-3"
            aria-label={t("sound")}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <div className="relative">
            <button onClick={() => { setOpen((o) => !o); sfx.click(); }} className="btn-real" aria-label="Language">
              <span className="text-lg">{LANG_FLAGS[lang]}</span>
              <span className="uppercase">{lang}</span>
            </button>
            {open && (
              <ul className="paper animate-pop absolute right-0 mt-3 w-44 overflow-hidden rounded-lg py-1">
                {LANGS.map((l) => (
                  <li key={l}>
                    <button
                      onClick={() => { setLang(l); setOpen(false); sfx.chip(); }}
                      className={`flex w-full items-center gap-3 px-4 py-2 text-left font-semibold hover:bg-brass/30 ${l === lang ? "bg-brass/40" : ""}`}
                    >
                      <span className="text-lg">{LANG_FLAGS[l]}</span>
                      {LANG_LABELS[l]}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
