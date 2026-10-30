import type { TKey } from "@/lib/i18n/context";

export type TrayIcon = "grid" | "disc" | "dice" | "map" | "hush" | "photo" | "spade" | "wheel" | "reel" | "king" | "pencil" | "cue";

export const GAMES = [
  { to: "/tic-tac-toe", name: "g_tictactoe", desc: "d_tictactoe", icon: "grid", box: "slate" },
  { to: "/connect-four", name: "g_connect4", desc: "d_connect4", icon: "disc", box: "blue" },
  { to: "/yatzy", name: "g_yatzy", desc: "d_yatzy", icon: "dice", box: "ivory" },
  { to: "/island", name: "g_island", desc: "d_island", icon: "map", box: "sea" },
  { to: "/taboo", name: "g_taboo", desc: "d_taboo", icon: "hush", box: "red" },
  { to: "/memory", name: "g_memory", desc: "d_memory", icon: "photo", box: "ivory" },
  { to: "/blackjack", name: "g_blackjack", desc: "d_blackjack", icon: "spade", box: "felt" },
  { to: "/roulette", name: "g_roulette", desc: "d_roulette", icon: "wheel", box: "felt" },
  { to: "/slots", name: "g_slots", desc: "d_slots", icon: "reel", box: "red" },
  { to: "/chess", name: "g_chess", desc: "d_chess", icon: "king", box: "slate" },
  { to: "/pool", name: "g_pool", desc: "d_pool", icon: "cue", box: "felt" },
  { to: "/hangman", name: "g_hangman", desc: "d_hangman", icon: "pencil", box: "ivory" },
] as const satisfies readonly { to: string; name: TKey; desc: TKey; icon: TrayIcon; box: string }[];
