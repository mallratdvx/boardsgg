import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { DICTS, LANGS, type Dict, type Lang } from "./dict";
import { EXTRA, type XKey } from "./extra";
import { setMuted } from "../sound";

export type TKey = keyof Dict | XKey;
type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  muted: boolean;
  toggleMute: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("boards-lang") as Lang | null;
    if (saved && LANGS.includes(saved)) setLangState(saved);
    else {
      const nav = navigator.language.slice(0, 2) as Lang;
      if (LANGS.includes(nav)) setLangState(nav);
    }
    const m = localStorage.getItem("boards-muted") === "1";
    setMutedState(m);
    setMuted(m);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("boards-lang", l);
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((m) => {
      const n = !m;
      setMuted(n);
      localStorage.setItem("boards-muted", n ? "1" : "0");
      return n;
    });
  }, []);

  const t = useCallback(
    (key: keyof Dict | XKey, vars?: Record<string, string | number>) => {
      const d = DICTS[lang] as Record<string, string>;
      const x = EXTRA[lang] as Record<string, string>;
      let s = d[key] ?? x[key] ?? (EXTRA.en as Record<string, string>)[key] ?? String(key);
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
      return s;
    },
    [lang],
  );

  return <AppCtx.Provider value={{ lang, setLang, t, muted, toggleMute }}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside AppProvider");
  return c;
}
