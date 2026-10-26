# Minigame Arcade

A playful arcade website with five minigames, a language switcher, and satisfying animations and sounds.

## Pages
- **Home** (`/`): animated game picker with cards for each game.
- **Tic Tac Toe** (`/tic-tac-toe`): 2 players or vs. computer, winning line animation, confetti.
- **Taboo** (`/taboo`): team turns, timer, word cards with forbidden words, Correct/Skip/Taboo buttons, scoring.
- **Board Game Island** (`/island`): dice-roll board game around an island path, 2-4 local players, special tiles (boost, trap, treasure), animated token movement.
- **Slot Machine** (`/slots`): 3 spinning reels, play coins, payouts, jackpot celebration.
- **Yatzy** (`/yatzy`): 5 dice, up to 3 rolls, hold dice, full scorecard, 1-4 players.

## Language button
- Header toggle: English, German, Spanish, French.
- All interface text and Taboo word lists translated. Choice remembered on the device.

## Feel
- Bright, chunky "toy arcade" look: bold rounded font, candy colors, soft shadows.
- Animations: card pop-ins, dice tumbling, reel spins, bouncy buttons, confetti on wins.
- Sounds generated in the browser (clicks, dice rolls, reel ticks, win jingles), with a mute button.

## Technical details
- Separate route per game, shared header in root layout with language + mute controls.
- i18n via a small context + dictionary files; persisted to localStorage (read after hydration).
- Sound via Web Audio API synth (no audio files). Animations with framer-motion; confetti via canvas-confetti.
- Pure game logic (winner checks, Yatzy scoring, slot payouts) in separate modules with unit tests.
- No backend needed; everything runs locally.
