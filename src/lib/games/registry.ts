import type { Dict } from "@/lib/i18n/dict";

export const GAMES = [
  { to: "/tic-tac-toe", name: "g_tictactoe", desc: "d_tictactoe", icon: "✖️", box: "slate" },
  { to: "/connect-four", name: "g_connect4", desc: "d_connect4", icon: "🔴", box: "blue" },
  { to: "/yatzy", name: "g_yatzy", desc: "d_yatzy", icon: "🎲", box: "ivory" },
  { to: "/island", name: "g_island", desc: "d_island", icon: "🏝️", box: "sea" },
  { to: "/taboo", name: "g_taboo", desc: "d_taboo", icon: "🤐", box: "red" },
  { to: "/memory", name: "g_memory", desc: "d_memory", icon: "🃏", box: "ivory" },
  { to: "/blackjack", name: "g_blackjack", desc: "d_blackjack", icon: "♠️", box: "felt" },
  { to: "/roulette", name: "g_roulette", desc: "d_roulette", icon: "🎡", box: "felt" },
  { to: "/slots", name: "g_slots", desc: "d_slots", icon: "🎰", box: "red" },
] as const satisfies readonly { to: string; name: keyof Dict; desc: keyof Dict; icon: string; box: string }[];
