import type { Lang } from "./dict";

const en = {
  g_hangman: "Hangman",
  d_hangman: "Guess the word letter by letter before the gallows is drawn.",
  g_chess: "Chess",
  d_chess: "Boxwood and rosewood pieces with a tournament clock.",
  teamName: "Team {n} name",
  skipsLeft: "Skips left: {n}",
  passTo: "Pass the device to {name}",
  ready: "Ready",
  tabooPass: "Taboo! Turn passes to {name}",
  laPartage: "La Partage: zero returns half of even-money bets",
  halfBack: "Zero! Half returned: {n}",
  guessesLeft: "Mistakes left: {n}",
  word: "The word was: {w}",
  solved: "Solved!",
  check: "Check!",
  checkmate: "Checkmate! {name} wins",
  stalemate: "Stalemate",
  white: "White",
  black2: "Black",
  timeOut: "{name} ran out of time",
  minutes: "{n} min",
  tapClock: "Tap your clock button to end your turn",
};
type X = typeof en;
export type XKey = keyof X;

export const EXTRA: Record<Lang, X> = {
  en,
  de: {
    g_hangman: "Galgenmännchen", d_hangman: "Errate das Wort Buchstabe für Buchstabe, bevor der Galgen fertig ist.",
    g_chess: "Schach", d_chess: "Figuren aus Buchsbaum und Palisander mit Turnieruhr.",
    teamName: "Name von Team {n}", skipsLeft: "Übrige Pässe: {n}", passTo: "Gib das Gerät an {name}", ready: "Bereit",
    tabooPass: "Tabu! Der Zug geht an {name}", laPartage: "La Partage: Bei Null gibt es die Hälfte der einfachen Chancen zurück",
    halfBack: "Null! Hälfte zurück: {n}", guessesLeft: "Fehler übrig: {n}", word: "Das Wort war: {w}", solved: "Gelöst!",
    check: "Schach!", checkmate: "Schachmatt! {name} gewinnt", stalemate: "Patt", white: "Weiß", black2: "Schwarz",
    timeOut: "{name} hat keine Zeit mehr", minutes: "{n} Min", tapClock: "Drücke deinen Uhrknopf, um den Zug zu beenden",
  },
  es: {
    g_hangman: "Ahorcado", d_hangman: "Adivina la palabra letra a letra antes de que se dibuje la horca.",
    g_chess: "Ajedrez", d_chess: "Piezas de boj y palisandro con reloj de torneo.",
    teamName: "Nombre del equipo {n}", skipsLeft: "Pases restantes: {n}", passTo: "Pasa el dispositivo a {name}", ready: "Listos",
    tabooPass: "¡Tabú! El turno pasa a {name}", laPartage: "La Partage: el cero devuelve la mitad de las apuestas sencillas",
    halfBack: "¡Cero! Se devuelve la mitad: {n}", guessesLeft: "Fallos restantes: {n}", word: "La palabra era: {w}", solved: "¡Resuelto!",
    check: "¡Jaque!", checkmate: "¡Jaque mate! Gana {name}", stalemate: "Tablas por ahogado", white: "Blancas", black2: "Negras",
    timeOut: "{name} se quedó sin tiempo", minutes: "{n} min", tapClock: "Pulsa tu botón del reloj para terminar el turno",
  },
  fr: {
    g_hangman: "Le Pendu", d_hangman: "Devinez le mot lettre par lettre avant que la potence soit dessinée.",
    g_chess: "Échecs", d_chess: "Pièces en buis et palissandre avec pendule de tournoi.",
    teamName: "Nom de l'équipe {n}", skipsLeft: "Passes restantes : {n}", passTo: "Passez l'appareil à {name}", ready: "Prêts",
    tabooPass: "Tabou ! Le tour passe à {name}", laPartage: "La Partage : le zéro rend la moitié des chances simples",
    halfBack: "Zéro ! Moitié rendue : {n}", guessesLeft: "Erreurs restantes : {n}", word: "Le mot était : {w}", solved: "Trouvé !",
    check: "Échec !", checkmate: "Échec et mat ! {name} gagne", stalemate: "Pat", white: "Blancs", black2: "Noirs",
    timeOut: "{name} n'a plus de temps", minutes: "{n} min", tapClock: "Appuyez sur votre bouton de pendule pour finir le tour",
  },
  it: {
    g_hangman: "Impiccato", d_hangman: "Indovina la parola lettera per lettera prima che la forca sia disegnata.",
    g_chess: "Scacchi", d_chess: "Pezzi in bosso e palissandro con orologio da torneo.",
    teamName: "Nome squadra {n}", skipsLeft: "Passi rimasti: {n}", passTo: "Passa il dispositivo a {name}", ready: "Pronti",
    tabooPass: "Tabù! Il turno passa a {name}", laPartage: "La Partage: lo zero restituisce metà delle puntate semplici",
    halfBack: "Zero! Metà restituita: {n}", guessesLeft: "Errori rimasti: {n}", word: "La parola era: {w}", solved: "Risolto!",
    check: "Scacco!", checkmate: "Scacco matto! Vince {name}", stalemate: "Stallo", white: "Bianco", black2: "Nero",
    timeOut: "{name} ha finito il tempo", minutes: "{n} min", tapClock: "Premi il tuo pulsante dell'orologio per finire il turno",
  },
};

export const HANGMAN_WORDS: Record<Lang, string[]> = {
  en: ["PARLOR", "CHESSBOARD", "LANTERN", "TREASURE", "HARBOR", "VELVET", "COMPASS", "CASTLE", "BICYCLE", "LIBRARY", "PENGUIN", "VOLCANO"],
  de: ["SPIELZIMMER", "LATERNE", "SCHATZ", "HAFEN", "SAMT", "KOMPASS", "SCHLOSS", "FAHRRAD", "BIBLIOTHEK", "PINGUIN", "VULKAN", "WÜRFEL"],
  es: ["SALON", "LINTERNA", "TESORO", "PUERTO", "TERCIOPELO", "BRUJULA", "CASTILLO", "BICICLETA", "BIBLIOTECA", "PINGUINO", "VOLCAN", "DADO"],
  fr: ["SALON", "LANTERNE", "TRESOR", "PORT", "VELOURS", "BOUSSOLE", "CHATEAU", "BICYCLETTE", "BIBLIOTHEQUE", "PINGOUIN", "VOLCAN", "ECHIQUIER"],
  it: ["SALOTTO", "LANTERNA", "TESORO", "PORTO", "VELLUTO", "BUSSOLA", "CASTELLO", "BICICLETTA", "BIBLIOTECA", "PINGUINO", "VULCANO", "SCACCHIERA"],
};
export const ALPHABET: Record<Lang, string> = {
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  de: "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ",
  es: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ",
  fr: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  it: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
};
