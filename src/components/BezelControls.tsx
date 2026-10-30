import { sfx } from "@/lib/sound";

function SketchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="4" width="12" height="17" rx="1" />
      <path d="M7 2v4M10 2v4M13 2v4M8 10h6M8 13h6" />
      <path d="M20 8l-6 9-1.5.5.5-1.5 6-9z" />
    </svg>
  );
}
function SlateIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <rect x="5.5" y="7.5" width="13" height="9" />
      <path d="M8 14l7-4" />
    </svg>
  );
}

/** Recessed milled channel with a sliding amber resin pill: Slate <-> Sketchpad. */
export function SurfaceSlider({ chalk, onChange }: { chalk: boolean; onChange: (chalk: boolean) => void }) {
  const set = (v: boolean) => { if (v !== chalk) { sfx.click(); onChange(v); } };
  return (
    <div role="radiogroup" aria-label="Surface" className="bezel-well relative grid h-9 w-[5.5rem] grid-cols-2 rounded-full p-1">
      <span aria-hidden className="resin-pill absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-full transition-transform duration-300 ease-[cubic-bezier(0.5,1.6,0.4,1)]"
        style={{ transform: chalk ? "translateX(0)" : "translateX(100%)" }} />
      <button role="radio" aria-checked={chalk} aria-label="Slate" onClick={() => set(true)}
        className={`relative z-10 grid place-items-center transition-colors ${chalk ? "bezel-icon-on" : "bezel-icon-off"}`}><SlateIcon /></button>
      <button role="radio" aria-checked={!chalk} aria-label="Sketchpad" onClick={() => set(false)}
        className={`relative z-10 grid place-items-center transition-colors ${!chalk ? "bezel-icon-on" : "bezel-icon-off"}`}><SketchIcon /></button>
    </div>
  );
}

/** Recessed I / II rocker with amber indicator jewels. */
export function PlayerRocker({ two, onChange, labels }: { two: boolean; onChange: (two: boolean) => void; labels: [string, string] }) {
  const set = (v: boolean) => { if (v !== two) { sfx.click(); onChange(v); } };
  return (
    <div role="radiogroup" aria-label="Players" className="bezel-well flex h-9 gap-1 rounded-md p-1">
      {[false, true].map((v) => {
        const on = v === two;
        return (
          <button key={String(v)} role="radio" aria-checked={on} aria-label={labels[v ? 1 : 0]} title={labels[v ? 1 : 0]} onClick={() => set(v)}
            className={`rocker-key relative w-10 rounded font-display text-sm font-black ${on ? "rocker-on" : ""}`}>
            <span aria-hidden className={`jewel absolute left-1/2 top-0.5 h-1 w-1 -translate-x-1/2 rounded-full ${on ? "jewel-on" : ""}`} />
            <span className="relative top-0.5">{v ? "II" : "I"}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Wooden rail strip that hosts the embedded controls along the board's top edge. */
export function BezelRail({ children }: { children: React.ReactNode }) {
  return <div className="bezel-rail mx-auto flex w-full items-center justify-between gap-3 rounded-t-lg px-3 py-2">{children}</div>;
}
