# boards.gg — Minigame Parlor

A realistic game parlor website: games look like real objects on felt tables and wooden boards, with a language switcher and satisfying animations and sounds.

## Pages
- **Home** (`/`): a wooden game shelf / lobby where each game is a physical box or object you pick up.
- **Tic Tac Toe** (`/tic-tac-toe`): chalk on a slate board; 2 players or vs. computer.
- **Taboo** (`/taboo`): paper cards, sand timer, buzzer, team scoring.
- **Board Game Island** (`/island`): printed cardboard island board, wooden pawns, dice; 2-4 local players, special tiles.
- **Slot Machine** (`/slots`): chrome cabinet with a pull lever, 3 reels, coins, jackpot.
- **Yatzy** (`/yatzy`): wooden dice cup, ivory dice, paper scorecard; 1-4 players.
- **Blackjack** (`/blackjack`): green felt table, real-looking cards and chips; hit, stand, double, split vs. dealer.
- **Memory** (`/memory`): flip-over card pairs with timer and moves count.
- **Connect Four** (`/connect-four`): blue plastic rack with dropping discs; 2 players or vs. computer.
- **Roulette** (`/roulette`): spinning wheel with ball, felt betting layout, chips.

## Language button
- Header toggle: English, German, Spanish, French, Italian.
- All interface text and Taboo word lists translated. Choice remembered on the device.

## Look and feel (skeuomorphic)
- Real materials: felt, polished wood, brass, paper, chalk, chrome — using textures, gradients, inner shadows and highlights.
- Elegant serif title font with a classic casino/parlor feel.
- Animations: dice tumbling in 3D, cards dealt and flipped, reels spinning with blur, discs dropping and bouncing, wheel spin, confetti on wins.
- Sounds generated in the browser (card snaps, chip clinks, dice rattle, reel ticks, win jingles), with a mute button.

## Technical details
- Separate route per game; shared header in root layout with language + mute controls.
- A few generated texture images (felt, wood, paper) in src/assets.
- i18n via a small context + dictionary files; persisted to localStorage (read after hydration).
- Sound via Web Audio API synth. Animations with framer-motion; confetti via canvas-confetti.
- Pure game logic (winner checks, Yatzy scoring, blackjack hand values, slot/roulette payouts) in separate modules with unit tests.
- No backend; everything runs locally.
