# boards.gg — Heritage Games Parlor

A tactile, zero-install digital parlor of traditional board, tabletop, and pub games. Built with strict material skeuomorphism, Roman typographic styling, pure procedural Web Audio sound synthesis, and zero generic emojis or flat UI elements.

Live preview: [boards.gg](https://boardsgg.vercel.app)

---

## 🏛 Features & Design Philosophy

- **Zero-Emoji Physical Skeuomorphism:** Every element is modeled as a real physical object—aged walnut wood, wool felt baize, natural schoolroom slate, linen paper, carved ivory dice, and milled brass hardware.
- **Monumental Typography:** Carved monumental Roman serifs (*Cinzel*, *Cormorant Garamond*) paired with expressive graphite handwriting (*Caveat*).
- **Procedural ASMR Sound Engine:** Low-latency Web Audio API synthesis generating real-time acoustic feedback—chalk scrapes, wooden token drops, mechanical clock clacks, cue ball collisions, and vintage analog slot reels.
- **Edge-to-Edge Responsive Layout:** Designed so phones feel like the physical gaming surface (a pocket notebook, a slate chalkboard, or a felt pool table).
- **Five-Language Internationalization (i18n):** Complete runtime localization across English, German, Spanish, French, and Italian with native dictionary fallback.

---

## 🎲 Game Catalog

| Game | Category | Engine / Key Mechanics |
| :--- | :--- | :--- |
| **8-Ball Pool** | Pub / Sports | HTML5 Canvas 2D physics, elastic vector collisions, cushion deflection, drag-to-aim stroke mechanics. |
| **Chess** | Strategy | Staunton piece set, pass-and-play, dual mechanical game clock rockers, Minimax engine bot (Levels 1–3). |
| **Connect Four** | Strategy | Slotted mahogany vertical drop cabinet with custom gravity tokens and win-detection vectors. |
| **Tic Tac Toe** | Paper & Slate | Instant hardware surface toggle (School Slate ↔ Ruled Paper Notebook) with 3D flip animation. |
| **Hangman** | Paper & Slate | Cream linen paper notebook, twin copper spiral binding, graphite pencil stroke rendering, typewriter key deck. |
| **Taboo** | Party / Word | Chalk slate scorekeeper, mechanical hourglass timer, printed paper cards, buzzer pass/fail handoff states. |
| **Mini Roulette** | Casino | 13-pocket wheel (0–12), authentic French *la partage* half-back rule on even-money bets, canvas turret rotation. |
| **Blackjack** | Casino | Green baize felt, support for European card decks (French, Spanish Baraja, Italian Napoletane, German Skat). |
| **Classic Slots** | Casino | 3-reel mechanical machine with brass rotary dial switching between 1899 Liberty Bell, 1930s Deco, and 1970s Vegas. |
| **Yatzy** | Dice | 3D ivory dice physics, multi-touch shaking, and an authentic pencil-scored scorecard ledger. |
| **Photo Memory** | Memory | Double-sided wooden tiles with archive monochrome historical photographs. |
| **Island Quest** | Board Game | Multi-map expedition game (*Smuggler's Atoll*, *Caesar's Causeway*, *Caldera of the Sun*) with pewter pawns and hazard waypoints. |

---

## 🛠 Tech Stack

- **Framework:** [TanStack Start v1](https://tanstack.com/start) + [React 19](https://react.dev/)
- **Build Tool:** [Vite 7](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with custom design tokens in `src/styles.css`
- **Audio:** Custom Web Audio API oscillator synthesis (`src/lib/sound.ts`)
- **Routing:** TanStack Router (`@tanstack/react-router`) with file-based routing in `src/routes/`
- **Testing:** [Vitest](https://vitest.dev/) with React Testing Library
- **Package Manager / Runtime:** [Bun](https://bun.sh/)

---

## 📁 Repository Structure

```text
├── src/
│   ├── assets/              # Skeuomorphic textures (wood, paper, felt, memory photos)
│   ├── components/          # Reusable tactile components (PlayingCard, Die, BezelControls)
│   ├── lib/
│   │   ├── games/           # Game logic, bot engines, card decks, and rules
│   │   │   ├── chess.ts     # Minimax chess AI and board validation
│   │   │   ├── cards.ts     # Multi-deck generation (French, Italian, Spanish, German)
│   │   │   └── registry.ts  # Central catalog and tray metadata
│   │   ├── i18n/            # Localization context and translation dictionaries
│   │   ├── sound.ts         # Synthesized Web Audio ASMR engine
│   │   └── celebrate.ts     # Parchment and brass win confetti effects
│   ├── routes/              # TanStack Start file-based routes for all games
│   ├── styles.css           # Tailwind v4 theme variables, OKLCH palette, textures
│   └── router.tsx           # Router bootstrap
├── AGENTS.md                # Architectural invariants and design decisions
└── package.json
