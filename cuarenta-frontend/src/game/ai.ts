import { type Card, type Rank, type Rng, RANKS, makeDeck } from "./cards";
import {
  type GameState,
  type Move,
  type PlayerId,
  LIMPIA_LIMIT,
  RONDA_LIMIT,
  WIN,
  capturesFor,
  evaluatePlay,
  legalMoves,
  other,
} from "./engine";

const CARD_VALUE = 0.5;
const RISK_WEIGHT = 0.9;
const WINNING_PLAY = 100;

export function unseenBy(s: GameState, player: PlayerId): Card[] {
  const known = new Set(
    [...s.hands[player], ...s.table, ...s.captured[0], ...s.captured[1]].map((c) => c.id),
  );
  return makeDeck().filter((c) => !known.has(c.id));
}

interface Unseen {
  total: number;
  ofRank: Map<Rank, number>;
}

function countUnseen(s: GameState, player: PlayerId): Unseen {
  const unseen = unseenBy(s, player);
  const ofRank = new Map<Rank, number>();
  for (const c of unseen) ofRank.set(c.rank, (ofRank.get(c.rank) ?? 0) + 1);
  return { total: unseen.length, ofRank };
}

function chanceToHold(unseen: number, ofRank: number, handSize: number): number {
  let miss = 1;
  for (let i = 0; i < handSize; i++) miss *= Math.max(0, unseen - ofRank - i) / (unseen - i);
  return 1 - miss;
}

function opponentThreat(
  s: GameState,
  me: PlayerId,
  unseen: Unseen,
  tableAfter: Card[],
  dropped: Card | null,
): number {
  const opp = other(me);
  let handSize = s.hands[opp].length;
  let caidaOpen = dropped !== null;
  if (handSize === 0) {
    if (s.deck.length === 0) return 0;
    handSize = 5;
    caidaOpen = false;
  }
  if (tableAfter.length === 0) return 0;

  const oppScore = s.scores[opp];
  const myRonda = dropped && s.rondas.some((r) => r.player === me && r.rank === dropped.rank);
  const dropId = caidaOpen && dropped ? dropped.id : null;

  const threats = RANKS.map((rank) => {
    const ofRank = unseen.ofRank.get(rank) ?? 0;
    if (ofRank === 0) return { p: 0, gain: 0 };
    let gain = 0;
    for (const option of capturesFor({ rank }, tableAfter)) {
      const taken = option.base.length + option.escalera.length;
      let points = 0;
      if (dropId && option.kind === "match" && option.base[0] === dropId) {
        points += myRonda && oppScore < RONDA_LIMIT ? 10 : 2;
      }
      if (taken === tableAfter.length && oppScore < LIMPIA_LIMIT) points += 2;
      const value = oppScore + points >= WIN ? WINNING_PLAY / 2 : points + CARD_VALUE * (taken + 1);
      gain = Math.max(gain, value);
    }
    return { p: chanceToHold(unseen.total, ofRank, handSize), gain };
  }).sort((a, b) => b.gain - a.gain);

  let expected = 0;
  let noneBetter = 1;
  for (const t of threats) {
    expected += t.gain * t.p * noneBetter;
    noneBetter *= 1 - t.p;
  }
  return expected;
}

export function chooseMove(s: GameState, rng: Rng): Move {
  const me = s.turn;
  const moves = legalMoves(s);
  if (moves.length === 0) throw new Error("No legal moves");
  const unseen = countUnseen(s, me);

  let best = moves[0];
  let bestValue = -Infinity;
  for (const move of moves) {
    const card = s.hands[me].find((c) => c.id === move.cardId)!;
    const outcome = evaluatePlay(s, me, card, move.capture);
    let value = outcome.points;
    if (move.capture) value += CARD_VALUE * (outcome.taken.length + 1);
    if (s.scores[me] + outcome.points >= WIN) value += WINNING_PLAY;
    value -= RISK_WEIGHT * opponentThreat(s, me, unseen, outcome.tableAfter, move.capture ? null : card);
    value += rng() * 0.15;
    if (value > bestValue) {
      bestValue = value;
      best = move;
    }
  }
  return best;
}
