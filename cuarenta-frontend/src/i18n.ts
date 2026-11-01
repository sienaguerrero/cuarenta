import type { Card, Rank, Suit } from "./game/cards";
import type { EventKind } from "./game/engine";

export type Lang = "es" | "en";

const RANK_NAMES: Record<Lang, Record<Rank, string>> = {
  es: { 1: "As", 2: "Dos", 3: "Tres", 4: "Cuatro", 5: "Cinco", 6: "Seis", 7: "Siete", 11: "Jota", 12: "Reina", 13: "Rey" },
  en: { 1: "Ace", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven", 11: "Jack", 12: "Queen", 13: "King" },
};

const SUIT_NAMES: Record<Lang, Record<Suit, string>> = {
  es: { S: "picas", H: "corazones", D: "diamantes", C: "tréboles" },
  en: { S: "spades", H: "hearts", D: "diamonds", C: "clubs" },
};

export function cardName(card: Card, lang: Lang): string {
  const joiner = lang === "es" ? " de " : " of ";
  return RANK_NAMES[lang][card.rank] + joiner + SUIT_NAMES[lang][card.suit];
}

export const EVENT_LABELS: Record<EventKind, string> = {
  caida: "¡Caída!",
  limpia: "¡Limpia!",
  caidaEnRonda: "¡Caída en ronda!",
  ronda: "¡Ronda!",
  dobleRonda: "¡Doble ronda!",
  carton: "Cartón",
};

const es = {
  tagline: "El juego de cartas nacional del Ecuador",
  whatIs: "¿Qué es?",
  howTo: "Cómo jugar",
  otherLang: "English",
  close: "Cerrar",
  leave: "Salir",
  you: "Tú",
  lucho: "Don Lucho",
  newMesa: "Nueva mesa",
  resume: "Seguir la mesa",
  homeLead: "Gana dos chicas contra Don Lucho y la mesa es tuya.",
  homeVs: "Tu rival: Don Lucho",
  sorteoTitle: "Sorteo",
  sorteoHow: "Se reparten cartas boca arriba. El primero en recibir un diamante reparte.",
  sorteoYou: "Repartes tú. Don Lucho juega primero.",
  sorteoLucho: "Reparte Don Lucho. Juegas primero.",
  sorteoSkip: "Saltar",
  sorteoGo: "¡A jugar!",
  yourTurn: "Te toca",
  luchoTurn: "Don Lucho está pensando",
  deal: (n: number, total: number) => `Reparto ${n} de ${total}`,
  deckLeft: (n: number) => (n === 1 ? "1 carta en el mazo" : `${n} cartas en el mazo`),
  deals: "reparte",
  carton: "Cartón",
  points: "puntos",
  chicas: "Chicas",
  plays: "Jugadas",
  noPlays: "Todavía nada. Las caídas, limpias y rondas aparecen aquí.",
  emptyTable: "Mesa vacía",
  choose: "¿Qué te llevas?",
  cancel: "Cancelar",
  takes: (n: number) => (n === 1 ? "1 carta" : `${n} cartas`),
  stays: "Se queda en la mesa",
  notCounted: "no cuenta",
  limitRonda: "Desde 30, la ronda no cuenta",
  limitLimpia: "A los 38, la limpia no cuenta",
  handOver: "Fin de la mano",
  cartonLine: (you: number, lucho: number) => `Tú ${you} cartas, Don Lucho ${lucho}`,
  leftover: (n: number) => (n === 1 ? "1 carta quedó en la mesa y no cuenta." : `${n} cartas quedaron en la mesa y no cuentan.`),
  cartonWin: (who: string, pts: number) => `Cartón para ${who}: +${pts}`,
  nextHand: "Siguiente mano",
  chicaYou: "¡Ganaste la chica!",
  chicaLucho: "Don Lucho gana la chica",
  nextChica: "Siguiente chica",
  mesaYou: "¡La mesa es tuya!",
  mesaLucho: "Mesa para Don Lucho",
  zapateria: "¡Zapatería!",
  zapateroYou: "Te fuiste de zapatero: ni un perro en toda la chica.",
  zapateroLucho: "Don Lucho se fue de zapatero: ni un perro en toda la chica.",
  anotherMesa: "Otra mesa",
  score: (you: number, lucho: number) => `Tú ${you}, Don Lucho ${lucho}`,
  madeBy: "Hecho con ♥ por",
  sourceOn: "El código está en",
};

export type Strings = typeof es;

const en: Strings = {
  tagline: "The national card game of Ecuador",
  whatIs: "What is it?",
  howTo: "How to play",
  otherLang: "Español",
  close: "Close",
  leave: "Leave",
  you: "You",
  lucho: "Don Lucho",
  newMesa: "New mesa",
  resume: "Resume the mesa",
  homeLead: "Win two chicas against Don Lucho and the mesa is yours.",
  homeVs: "Your rival: Don Lucho",
  sorteoTitle: "Who deals?",
  sorteoHow: "Cards are dealt face up. The first player to get a diamond deals.",
  sorteoYou: "You deal. Don Lucho plays first.",
  sorteoLucho: "Don Lucho deals. You play first.",
  sorteoSkip: "Skip",
  sorteoGo: "Let's play!",
  yourTurn: "Your turn",
  luchoTurn: "Don Lucho is thinking",
  deal: (n, total) => `Deal ${n} of ${total}`,
  deckLeft: (n) => (n === 1 ? "1 card in the deck" : `${n} cards in the deck`),
  deals: "deals",
  carton: "Captured",
  points: "points",
  chicas: "Chicas",
  plays: "Plays",
  noPlays: "Nothing yet. Caídas, limpias, and rondas show up here.",
  emptyTable: "Empty table",
  choose: "What do you take?",
  cancel: "Cancel",
  takes: (n) => (n === 1 ? "1 card" : `${n} cards`),
  stays: "Stays on the table",
  notCounted: "doesn't count",
  limitRonda: "From 30 up, rondas don't count",
  limitLimpia: "At 38, limpias don't count",
  handOver: "End of the hand",
  cartonLine: (you, lucho) => `You ${you} cards, Don Lucho ${lucho}`,
  leftover: (n) => (n === 1 ? "1 card was left on the table and doesn't count." : `${n} cards were left on the table and don't count.`),
  cartonWin: (who, pts) => `Cartón to ${who}: +${pts}`,
  nextHand: "Next hand",
  chicaYou: "You won the chica!",
  chicaLucho: "Don Lucho wins the chica",
  nextChica: "Next chica",
  mesaYou: "The mesa is yours!",
  mesaLucho: "Don Lucho takes the mesa",
  zapateria: "¡Zapatería!",
  zapateroYou: "You're the zapatero: not one perro all chica.",
  zapateroLucho: "Don Lucho is the zapatero: not one perro all chica.",
  anotherMesa: "Another mesa",
  score: (you, lucho) => `You ${you}, Don Lucho ${lucho}`,
  madeBy: "Made with ♥ by",
  sourceOn: "The source code is on",
};

export const EVENT_GLOSS: Record<EventKind, string> = {
  caida: "Caught the card just played",
  limpia: "Cleared the table",
  caidaEnRonda: "Caught a card from a ronda",
  ronda: "Dealt three of a kind",
  dobleRonda: "Dealt four of a kind: takes the chica",
  carton: "Most cards captured",
};

export const STRINGS: Record<Lang, Strings> = { es, en };
