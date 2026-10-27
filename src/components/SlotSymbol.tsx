// Enamel-painted reel artwork, drawn as SVG so no emoji is ever used.
export function SlotSymbol({ s, size = 64 }: { s: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 64 64", "aria-label": s, role: "img" as const };
  const ink = "oklch(0.2 0.02 40)";
  switch (s) {
    case "cherry":
      return (
        <svg {...common}>
          <path d="M22 40 C26 24 34 14 46 10 M42 42 C42 28 44 18 46 10" stroke="oklch(0.45 0.1 140)" strokeWidth="3" fill="none" />
          <path d="M46 10 c-8 -2 -14 2 -16 8 c8 2 14 -2 16 -8z" fill="oklch(0.55 0.15 140)" stroke={ink} strokeWidth="1.5" />
          <circle cx="20" cy="46" r="11" fill="oklch(0.5 0.2 25)" stroke={ink} strokeWidth="2" />
          <circle cx="42" cy="48" r="11" fill="oklch(0.5 0.2 25)" stroke={ink} strokeWidth="2" />
          <circle cx="16" cy="42" r="3" fill="oklch(1 0 0 / 0.6)" /><circle cx="38" cy="44" r="3" fill="oklch(1 0 0 / 0.6)" />
        </svg>
      );
    case "lemon":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="34" rx="22" ry="16" fill="oklch(0.86 0.17 95)" stroke={ink} strokeWidth="2" transform="rotate(-20 32 34)" />
          <path d="M12 42 l-4 3 M52 26 l4 -3" stroke={ink} strokeWidth="2" />
          <ellipse cx="26" cy="28" rx="6" ry="3" fill="oklch(1 0 0 / 0.5)" transform="rotate(-20 26 28)" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M32 8 c-12 0 -16 12 -16 24 c0 8 -6 12 -6 16 h44 c0 -4 -6 -8 -6 -16 c0 -12 -4 -24 -16 -24z" fill="oklch(0.75 0.13 80)" stroke={ink} strokeWidth="2" />
          <circle cx="32" cy="52" r="5" fill="oklch(0.6 0.12 70)" stroke={ink} strokeWidth="2" />
          <path d="M24 18 c-3 6 -3 14 -3 20" stroke="oklch(1 0 0 / 0.6)" strokeWidth="3" fill="none" />
        </svg>
      );
    case "grape":
      return (
        <svg {...common}>
          <path d="M32 12 v-6 M32 12 c6 -6 14 -4 16 0" stroke="oklch(0.45 0.1 140)" strokeWidth="3" fill="none" />
          {[[24,20],[40,20],[32,20],[20,30],[44,30],[28,30],[36,30],[24,40],[40,40],[32,40],[28,50],[36,50]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="6.5" fill="oklch(0.4 0.15 310)" stroke={ink} strokeWidth="1.5" />
          ))}
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M32 6 l7 17 18 1 -14 11 5 18 -16 -10 -16 10 5 -18 -14 -11 18 -1z" fill="oklch(0.82 0.15 85)" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <text x="32" y="52" textAnchor="middle" fontFamily="Cinzel, serif" fontWeight="900" fontSize="52" fill="oklch(0.5 0.2 25)" stroke={ink} strokeWidth="2">7</text>
        </svg>
      );
  }
}
