import {
  type Card,
  type Rank,
  type Rng,
  makeDeck,
  nextRank,
  shuffle,
} from "./cards";

export type PlayerId = 0 | 1;
export const YOU: PlayerId = 0;
export const LUCHO: PlayerId = 1;

export const WIN = 40;
export const RONDA_LIMIT = 30;
export const LIMPIA_LIMIT = 38;
export const ZAPATERIA_BELOW = 10;
export const DEAL_SIZE = 5;
export const CHICAS_FOR_MESA = 2;

export const other = (p: PlayerId): PlayerId => (p === 0 ? 1 : 0);

export interface Capture {
  kind: "match" | "sum";
  base: string[];
  escalera: string[];
}

export interface Move {
  cardId: string;
  capture: Capture | null;
}

export type EventKind =
  | "ronda"
  | "dobleRonda"
  | "caida"
  | "caidaEnRonda"
  | "limpia"
  | "carton";

export interface ScoreEvent {
  id: number;
  kind: EventKind;
  player: PlayerId;
  points: number;
  blocked?: boolean;
  cards?: number;
  rank?: Rank;
}

type NewEvent = Omit<ScoreEvent, "id">;

export interface HandResult {
  cards: [number, number];
  leftover: number;
  event: ScoreEvent;
}

export type Phase = "playing" | "handOver" | "chicaOver" | "mesaOver";

export interface GameState {
  phase: Phase;
  scores: [number, number];
  chicas: [number, number];
  dealer: PlayerId;
  turn: PlayerId;
  deck: Card[];
  hands: [Card[], Card[]];
  table: Card[];
  captured: [Card[], Card[]];
  lastDrop: { cardId: string; player: PlayerId } | null;
  deal: number;
  rondas: { player: PlayerId; rank: Rank }[];
  events: ScoreEvent[];
  nextEventId: number;
  handResult: HandResult | null;
  chicaWinner: PlayerId | null;
  mesaWinner: PlayerId | null;
  zapateria: boolean;
}

export const DEALS_PER_HAND = makeDeck().length / (DEAL_SIZE * 2);

export function drawForDealer(rng: Rng): { draws: Card[]; dealer: PlayerId } {
  const deck = shuffle(makeDeck(), rng);
  const draws: Card[] = [];
  for (const c of deck) {
    draws.push(c);
    if (c.suit === "D") break;
  }
  return { draws, dealer: draws.length % 2 === 1 ? YOU : LUCHO };
}

export function newMesa(firstDealer: PlayerId, rng: Rng): GameState {
  return startHand(
    {
      phase: "playing",
      scores: [0, 0],
      chicas: [0, 0],
      dealer: firstDealer,
      turn: other(firstDealer),
      deck: [],
      hands: [[], []],
      table: [],
      captured: [[], []],
      lastDrop: null,
      deal: 0,
      rondas: [],
      events: [],
      nextEventId: 1,
      handResult: null,
      chicaWinner: null,
      mesaWinner: null,
      zapateria: false,
    },
    rng,
  );
}

export function nextHand(state: GameState, rng: Rng): GameState {
  if (state.phase !== "handOver") throw new Error("The hand is not over");
  return startHand({ ...state, dealer: other(state.dealer) }, rng);
}

export function nextChica(state: GameState, rng: Rng): GameState {
  if (state.phase !== "chicaOver") throw new Error("The chica is not over");
  return startHand(
    {
      ...state,
      scores: [0, 0],
      chicaWinner: null,
      zapateria: false,
      dealer: other(state.dealer),
    },
    rng,
  );
}

function startHand(state: GameState, rng: Rng): GameState {
  const s: GameState = {
    ...structuredClone(state),
    phase: "playing",
    deck: shuffle(makeDeck(), rng),
    hands: [[], []],
    table: [],
    captured: [[], []],
    lastDrop: null,
    deal: 0,
    rondas: [],
    events: [],
    handResult: null,
  };
  dealRound(s);
  return s;
}

function emit(s: GameState, e: NewEvent): ScoreEvent {
  const event = { ...e, id: s.nextEventId++ };
  s.events.push(event);
  return event;
}

function award(s: GameState, player: PlayerId, points: number) {
  if (s.phase !== "playing" && s.phase !== "handOver") return;
  s.scores[player] = Math.min(WIN, s.scores[player] + points);
  if (s.scores[player] >= WIN) winChica(s, player);
}

function winChica(s: GameState, player: PlayerId) {
  s.chicaWinner = player;
  s.chicas[player] += 1;
  s.zapateria = s.scores[other(player)] < ZAPATERIA_BELOW;
  if (s.zapateria || s.chicas[player] >= CHICAS_FOR_MESA) {
    s.mesaWinner = player;
    s.phase = "mesaOver";
  } else {
    s.phase = "chicaOver";
  }
}

function dealRound(s: GameState) {
  const first = other(s.dealer);
  s.hands[first] = s.deck.splice(0, DEAL_SIZE);
  s.hands[s.dealer] = s.deck.splice(0, DEAL_SIZE);
  s.deal += 1;
  s.rondas = [];
  s.lastDrop = null;
  s.turn = first;

  for (const p of [first, s.dealer]) {
    if (s.phase !== "playing") return;
    const counts = new Map<Rank, number>();
    for (const c of s.hands[p]) counts.set(c.rank, (counts.get(c.rank) ?? 0) + 1);
    for (const [rank, n] of counts) {
      if (n === 4) {
        emit(s, { kind: "dobleRonda", player: p, points: WIN - s.scores[p], rank });
        award(s, p, WIN);
        return;
      }
      if (n === 3) {
        const blocked = s.scores[p] >= RONDA_LIMIT;
        if (!blocked) s.rondas.push({ player: p, rank });
        emit(s, { kind: "ronda", player: p, points: blocked ? 0 : 4, blocked: blocked || undefined, rank });
        if (!blocked) award(s, p, 4);
      }
    }
  }
}

export function escaleraFrom(rank: Rank, table: Card[]): string[] {
  const out: string[] = [];
  for (let r = nextRank(rank); r !== null; r = nextRank(r)) {
    const found = table.find((t) => t.rank === r);
    if (!found) break;
    out.push(found.id);
  }
  return out;
}

function subsetsSummingTo(cards: Card[], target: number): Card[][] {
  const sorted = [...cards].sort((a, b) => a.rank - b.rank);
  const out: Card[][] = [];
  const walk = (start: number, remaining: number, picked: Card[]) => {
    if (remaining === 0) {
      out.push([...picked]);
      return;
    }
    for (let i = start; i < sorted.length && sorted[i].rank <= remaining; i++) {
      picked.push(sorted[i]);
      walk(i + 1, remaining - sorted[i].rank, picked);
      picked.pop();
    }
  };
  walk(0, target, []);
  return out;
}

export function capturesFor(card: Pick<Card, "rank">, table: Card[]): Capture[] {
  const options: Capture[] = [];
  const escalera = escaleraFrom(card.rank, table);

  const match = table.find((t) => t.rank === card.rank);
  if (match) options.push({ kind: "match", base: [match.id], escalera });

  if (card.rank <= 7) {
    const addends = table.filter((t) => t.rank < card.rank);
    for (const combo of subsetsSummingTo(addends, card.rank)) {
      if (combo.length < 2) continue;
      options.push({ kind: "sum", base: combo.map((c) => c.id), escalera });
    }
  }

  return options;
}

export function legalMoves(s: GameState): Move[] {
  if (s.phase !== "playing") return [];
  return s.hands[s.turn].flatMap((card): Move[] => {
    const options = capturesFor(card, s.table);
    return options.length > 0
      ? options.map((capture) => ({ cardId: card.id, capture }))
      : [{ cardId: card.id, capture: null }];
  });
}

const sortedKey = (ids: string[]) => [...ids].sort().join(",");

export function sameCapture(a: Capture, b: Capture): boolean {
  return (
    a.kind === b.kind &&
    sortedKey(a.base) === sortedKey(b.base) &&
    sortedKey(a.escalera) === sortedKey(b.escalera)
  );
}

export interface PlayOutcome {
  taken: Card[];
  tableAfter: Card[];
  events: NewEvent[];
  points: number;
}

export function evaluatePlay(
  s: GameState,
  player: PlayerId,
  card: Card,
  capture: Capture | null,
): PlayOutcome {
  if (!capture) {
    return { taken: [], tableAfter: [...s.table, card], events: [], points: 0 };
  }

  const ids = new Set([...capture.base, ...capture.escalera]);
  const taken = s.table.filter((c) => ids.has(c.id));
  const tableAfter = s.table.filter((c) => !ids.has(c.id));
  const score = s.scores[player];
  const drop = s.lastDrop;
  const events: NewEvent[] = [];

  if (capture.kind === "match" && drop && capture.base[0] === drop.cardId) {
    const enRonda = s.rondas.some((r) => r.player === drop.player && r.rank === card.rank);
    if (enRonda && score < RONDA_LIMIT) {
      events.push({ kind: "caidaEnRonda", player, points: 10 });
    } else {
      events.push({ kind: "caida", player, points: 2 });
    }
  }

  if (tableAfter.length === 0) {
    const blocked = score >= LIMPIA_LIMIT;
    events.push({ kind: "limpia", player, points: blocked ? 0 : 2, blocked: blocked || undefined });
  }

  return {
    taken,
    tableAfter,
    events,
    points: events.reduce((sum, e) => sum + e.points, 0),
  };
}

export function applyMove(state: GameState, move: Move): GameState {
  if (state.phase !== "playing") throw new Error("Nobody can play right now");
  const p = state.turn;
  const card = state.hands[p].find((c) => c.id === move.cardId);
  if (!card) throw new Error(`${move.cardId} is not in the hand of player ${p}`);

  const options = capturesFor(card, state.table);
  let capture: Capture | null = null;
  if (options.length > 0) {
    capture = (move.capture && options.find((o) => sameCapture(o, move.capture!))) || null;
    if (!capture) throw new Error(`${card.id} has to take one of its captures`);
  } else if (move.capture) {
    throw new Error(`${card.id} has nothing to take`);
  }

  const outcome = evaluatePlay(state, p, card, capture);
  const s = structuredClone(state);
  s.hands[p] = s.hands[p].filter((c) => c.id !== card.id);
  s.table = outcome.tableAfter;
  if (capture) {
    s.captured[p].push(card, ...outcome.taken);
    s.lastDrop = null;
  } else {
    s.lastDrop = { cardId: card.id, player: p };
  }

  for (const e of outcome.events) emit(s, e);
  if (outcome.points > 0) award(s, p, outcome.points);
  if (s.phase !== "playing") return s;

  s.turn = other(p);
  if (s.hands[0].length === 0 && s.hands[1].length === 0) {
    if (s.deck.length > 0) dealRound(s);
    else endHand(s);
  }
  return s;
}

export function cartonPoints(cards: number): number {
  return 6 + 2 * Math.ceil((cards - 20) / 2);
}

function endHand(s: GameState) {
  const cards: [number, number] = [s.captured[0].length, s.captured[1].length];
  const nonDealer = other(s.dealer);
  let winner: PlayerId;
  let points: number;

  if (cards[0] === 20 && cards[1] === 20) {
    winner = nonDealer;
    points = 6;
  } else if (cards[0] >= 20 || cards[1] >= 20) {
    winner = cards[0] > cards[1] ? 0 : 1;
    points = cartonPoints(cards[winner]);
  } else {
    winner = cards[0] === cards[1] ? nonDealer : cards[0] > cards[1] ? 0 : 1;
    points = 2;
  }
  points = Math.min(points, WIN - s.scores[winner]);

  s.phase = "handOver";
  const event = emit(s, { kind: "carton", player: winner, points, cards: cards[winner] });
  s.handResult = { cards, leftover: s.table.length, event };
  award(s, winner, points);
}
