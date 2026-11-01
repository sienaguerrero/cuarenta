import type { GameState } from "./game/engine";
import type { Lang } from "./i18n";

const GAME_KEY = "cuarenta:mesa:v2";
const LANG_KEY = "cuarenta:lang";

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return null;
    const game = JSON.parse(raw) as GameState;
    return Array.isArray(game.hands) && Array.isArray(game.scores) && game.phase !== "mesaOver" ? game : null;
  } catch {
    return null;
  }
}

export function saveGame(game: GameState | null) {
  try {
    if (game) localStorage.setItem(GAME_KEY, JSON.stringify(game));
    else localStorage.removeItem(GAME_KEY);
  } catch {
    return;
  }
}

export function loadLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    return;
  }
}
