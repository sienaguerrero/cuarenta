export const SUITS = ["S", "H", "D", "C"] as const;
export type Suit = (typeof SUITS)[number];

export const RANKS = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13] as const;
export type Rank = (typeof RANKS)[number];

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
}

export type Rng = () => number;

const RANK_LABELS: Record<Rank, string> = {
  1: "A",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  11: "J",
  12: "Q",
  13: "K",
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣",
};

export function rankLabel(rank: Rank): string {
  return RANK_LABELS[rank];
}

export function makeCard(rank: Rank, suit: Suit): Card {
  return { id: `${RANK_LABELS[rank]}${suit}`, rank, suit };
}

export function parseCard(id: string): Card {
  const suit = id.slice(-1) as Suit;
  const label = id.slice(0, -1);
  const rank = RANKS.find((r) => RANK_LABELS[r] === label);
  if (rank === undefined || !SUITS.includes(suit)) {
    throw new Error(`Unknown card ${id}`);
  }
  return makeCard(rank, suit);
}

export function makeDeck(): Card[] {
  return SUITS.flatMap((suit) => RANKS.map((rank) => makeCard(rank, suit)));
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function nextRank(rank: Rank): Rank | null {
  const i = RANKS.indexOf(rank);
  return i < RANKS.length - 1 ? RANKS[i + 1] : null;
}

export function isRed(suit: Suit): boolean {
  return suit === "H" || suit === "D";
}

export function byRank(a: Card, b: Card): number {
  return a.rank - b.rank || SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
}

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
