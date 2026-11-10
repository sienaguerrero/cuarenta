import { describe, expect, it } from "vitest";
import { type Card, makeDeck, mulberry32, parseCard } from "./cards";
import {
  type GameState,
  LUCHO,
  YOU,
  applyMove,
  capturesFor,
  cartonPoints,
  drawForDealer,
  legalMoves,
  newMesa,
  nextChica,
  nextHand,
} from "./engine";
import { chooseMove, unseenBy } from "./ai";

const cards = (...ids: string[]): Card[] => ids.map(parseCard);

function stateWith(overrides: Partial<GameState>): GameState {
  return {
    ...newMesa(LUCHO, mulberry32(1)),
    events: [],
    rondas: [],
    lastDrop: null,
    turn: YOU,
    ...overrides,
  };
}

function rest(used: Card[]): Card[] {
  const ids = new Set(used.map((c) => c.id));
  return makeDeck().filter((c) => !ids.has(c.id));
}

describe("capturesFor", () => {
  it("runs an escalera up from a matched card and stops at the gap", () => {
    const table = cards("2H", "3S", "4D", "5C", "7H", "JS");
    const [match] = capturesFor(parseCard("2C"), table);
    expect(match.kind).toBe("match");
    expect(match.base).toEqual(["2H"]);
    expect(match.escalera).toEqual(["3S", "4D", "5C"]);
  });

  it("adds number cards and runs the escalera from the played rank, J after 7", () => {
    const table = cards("2H", "3S", "4D", "5C", "7H", "JS");
    const sums = capturesFor(parseCard("6C"), table);
    expect(sums.map((o) => o.base)).toContainEqual(["2H", "4D"]);
    for (const o of sums) expect(o.escalera).toEqual(["7H", "JS"]);
  });

  it("offers a match or a sum, never both together", () => {
    const table = cards("AH", "2S", "3D", "4C");
    const options = capturesFor(parseCard("4H"), table);
    const kinds = options.map((o) => `${o.kind}:${o.base.join("+")}`);
    expect(kinds).toEqual(["match:4C", "sum:AH+3D"]);
  });

  it("sums three or more cards", () => {
    const options = capturesFor(parseCard("7S"), cards("AH", "2S", "4D"));
    expect(options).toHaveLength(1);
    expect(options[0].base).toEqual(["AH", "2S", "4D"]);
  });

  it("never sums face cards and never runs past the king", () => {
    expect(capturesFor(parseCard("KS"), cards("JH", "2S"))).toEqual([]);
    const [match] = capturesFor(parseCard("KS"), cards("KH", "AS"));
    expect(match.escalera).toEqual([]);
  });
});

describe("scoring plays", () => {
  it("scores caída for matching the card the other player just dropped", () => {
    const s = stateWith({
      hands: [cards("5S", "KD"), cards("2C")],
      table: cards("5H", "QC"),
      lastDrop: { cardId: "5H", player: LUCHO },
      scores: [0, 0],
    });
    const next = applyMove(s, legalMoves(s).find((m) => m.cardId === "5S")!);
    expect(next.events.map((e) => e.kind)).toEqual(["caida"]);
    expect(next.scores[YOU]).toBe(2);
  });

  it("scores 4 for caída y limpia", () => {
    const s = stateWith({
      hands: [cards("5S", "KD"), cards("2C")],
      table: cards("5H"),
      lastDrop: { cardId: "5H", player: LUCHO },
      scores: [10, 0],
    });
    const next = applyMove(s, legalMoves(s).find((m) => m.cardId === "5S")!);
    expect(next.events.map((e) => e.kind)).toEqual(["caida", "limpia"]);
    expect(next.scores[YOU]).toBe(14);
  });

  it("does not score caída on a sum", () => {
    const s = stateWith({
      hands: [cards("5S", "KD"), cards("2C")],
      table: cards("2H", "3D"),
      lastDrop: { cardId: "3D", player: LUCHO },
    });
    const next = applyMove(s, legalMoves(s).find((m) => m.cardId === "5S")!);
    expect(next.events.map((e) => e.kind)).toEqual(["limpia"]);
  });

  it("does not count limpia at 38, but a caída still wins", () => {
    const s = stateWith({
      hands: [cards("5S", "KD"), cards("2C")],
      table: cards("5H"),
      lastDrop: { cardId: "5H", player: LUCHO },
      scores: [38, 0],
      chicas: [1, 0],
    });
    const next = applyMove(s, legalMoves(s).find((m) => m.cardId === "5S")!);
    const limpia = next.events.find((e) => e.kind === "limpia");
    expect(limpia).toMatchObject({ points: 0, blocked: true });
    expect(next.scores[YOU]).toBe(40);
    expect(next.phase).toBe("mesaOver");
  });

  it("lets 36 win with caída y limpia", () => {
    const s = stateWith({
      hands: [cards("5S", "KD"), cards("2C")],
      table: cards("5H"),
      lastDrop: { cardId: "5H", player: LUCHO },
      scores: [36, 20],
    });
    const next = applyMove(s, legalMoves(s).find((m) => m.cardId === "5S")!);
    expect(next.scores[YOU]).toBe(40);
    expect(next.phase).toBe("chicaOver");
    expect(next.chicas).toEqual([1, 0]);
  });

  it("scores 10 for caída en ronda", () => {
    const s = stateWith({
      hands: [cards("7S", "KD"), cards("2C")],
      table: cards("7H", "QC"),
      lastDrop: { cardId: "7H", player: LUCHO },
      rondas: [{ player: LUCHO, rank: 7 }],
    });
    const next = applyMove(s, legalMoves(s).find((m) => m.cardId === "7S")!);
    expect(next.events).toMatchObject([{ kind: "caidaEnRonda", points: 10 }]);
  });

  it("forces a capture when one is available", () => {
    const s = stateWith({ hands: [cards("5S"), cards("2C")], table: cards("5H") });
    expect(() => applyMove(s, { cardId: "5S", capture: null })).toThrow();
  });

  it("rejects a capture that is not one of the card's options", () => {
    const s = stateWith({ hands: [cards("5S", "KD"), cards("2C")], table: cards("5H", "2H", "3D") });
    expect(() => applyMove(s, { cardId: "5S", capture: { kind: "sum", base: ["5H"], escalera: [] } })).toThrow();
    expect(() => applyMove(s, { cardId: "5S", capture: { kind: "match", base: ["2H"], escalera: [] } })).toThrow();
    expect(() => applyMove(s, { cardId: "KD", capture: { kind: "match", base: ["5H"], escalera: [] } })).toThrow();
  });

  it("pays a capturer at 30 or more only 2 for a caída on a counted ronda", () => {
    const s = stateWith({
      hands: [cards("7S", "KD"), cards("2C")],
      table: cards("7H", "QC"),
      lastDrop: { cardId: "7H", player: LUCHO },
      rondas: [{ player: LUCHO, rank: 7 }],
      scores: [30, 0],
    });
    const next = applyMove(s, legalMoves(s).find((m) => m.cardId === "7S")!);
    expect(next.events).toMatchObject([{ kind: "caida", points: 2 }]);
    expect(next.scores[YOU]).toBe(32);
  });
});

describe("dealing", () => {
  it("announces a ronda for 4 points, but not at 30 or more", () => {
    const youHand = cards("4S", "4H", "4D", "KC", "AS");
    const luchoHand = cards("2S", "3H", "5D", "6C", "7S");
    const deck = [...luchoHand, ...youHand, ...rest([...youHand, ...luchoHand])];
    const s = stateWith({ hands: [[], []], deck, dealer: YOU, scores: [0, 0], deal: 0 });
    const dealt = applyMove(
      { ...s, hands: [cards("JS"), []], turn: YOU, deck, table: [] },
      { cardId: "JS", capture: null },
    );
    expect(dealt.deal).toBe(1);
    const ronda = dealt.events.find((e) => e.kind === "ronda");
    expect(ronda).toMatchObject({ player: YOU, points: 4, rank: 4 });
    expect(dealt.scores[YOU]).toBe(4);

    const late = applyMove(
      { ...s, scores: [30, 0], hands: [cards("JS"), []], turn: YOU, deck, table: [] },
      { cardId: "JS", capture: null },
    );
    expect(late.events.find((e) => e.kind === "ronda")).toMatchObject({ points: 0, blocked: true });
    expect(late.scores[YOU]).toBe(30);
  });

  it("pays caída en ronda on a ronda that did not count", () => {
    const youHand = cards("7S", "7H", "7D", "KC", "AS");
    const luchoHand = cards("7C", "3H", "5D", "6C", "2S");
    const deck = [...luchoHand, ...youHand, ...rest([...youHand, ...luchoHand, ...cards("JS")])];
    const s = stateWith({ hands: [cards("JS"), []], turn: YOU, deck, table: [], dealer: YOU, scores: [32, 0] });
    let g = applyMove(s, { cardId: "JS", capture: null });
    expect(g.events.find((e) => e.kind === "ronda")).toMatchObject({ player: YOU, blocked: true });
    g = applyMove(g, { cardId: "2S", capture: null });
    g = applyMove(g, { cardId: "7H", capture: null });
    g = applyMove(g, legalMoves(g).find((m) => m.cardId === "7C")!);
    expect(g.events.at(-1)).toMatchObject({ kind: "caidaEnRonda", player: LUCHO, points: 10 });
  });

  it("gives the chica to a doble ronda", () => {
    const youHand = cards("QS", "QH", "QD", "QC", "AS");
    const luchoHand = cards("2S", "3H", "5D", "6C", "7S");
    const deck = [...luchoHand, ...youHand, ...rest([...youHand, ...luchoHand])];
    const s = stateWith({ hands: [cards("JS"), []], turn: YOU, deck, table: [], dealer: YOU, scores: [12, 30] });
    const dealt = applyMove(s, { cardId: "JS", capture: null });
    expect(dealt.scores[YOU]).toBe(40);
    expect(dealt.phase).toBe("chicaOver");
  });

  it("allows no caída on the first play after a new deal", () => {
    const youHand = cards("AS", "2S", "3S", "4S", "5S");
    const luchoHand = cards("JC", "2H", "3H", "4H", "6H");
    const deck = [...luchoHand, ...youHand, ...rest([...youHand, ...luchoHand, ...cards("JS")])];
    const s = stateWith({ hands: [cards("JS"), []], turn: YOU, deck, table: [], dealer: YOU, scores: [0, 0] });
    const dealt = applyMove(s, { cardId: "JS", capture: null });
    expect(dealt.lastDrop).toBeNull();
    expect(dealt.turn).toBe(LUCHO);
    const next = applyMove(dealt, legalMoves(dealt).find((m) => m.cardId === "JC")!);
    expect(next.events.map((e) => e.kind)).toEqual(["limpia"]);
  });

  it("announces a ronda on a later deal of the hand", () => {
    const youHand = cards("6S", "6H", "6D", "KC", "AS");
    const luchoHand = cards("2S", "3H", "5D", "JC", "7S");
    const deck = [...luchoHand, ...youHand, ...rest([...youHand, ...luchoHand, ...cards("JS")]).slice(0, 10)];
    const s = stateWith({ hands: [cards("JS"), []], turn: YOU, deck, table: [], dealer: YOU, scores: [0, 0], deal: 2 });
    const dealt = applyMove(s, { cardId: "JS", capture: null });
    expect(dealt.deal).toBe(3);
    expect(dealt.events.find((e) => e.kind === "ronda")).toMatchObject({ player: YOU, points: 4, rank: 6 });
    expect(dealt.scores[YOU]).toBe(4);
  });

  it("pays both rondas when the dealer and the other player each hold one", () => {
    const youHand = cards("6S", "6H", "6D", "KC", "AS");
    const luchoHand = cards("2S", "2H", "2D", "JC", "7S");
    const deck = [...luchoHand, ...youHand, ...rest([...youHand, ...luchoHand, ...cards("JS")])];
    const s = stateWith({ hands: [cards("JS"), []], turn: YOU, deck, table: [], dealer: YOU, scores: [0, 0] });
    const dealt = applyMove(s, { cardId: "JS", capture: null });
    const rondas = dealt.events.filter((e) => e.kind === "ronda");
    expect(rondas).toMatchObject([
      { player: LUCHO, points: 4, rank: 2 },
      { player: YOU, points: 4, rank: 6 },
    ]);
    expect(dealt.scores).toEqual([4, 4]);
  });
});

describe("cartón", () => {
  it("scores 6 for 20 cards and rounds extras up to even", () => {
    expect(cartonPoints(20)).toBe(6);
    expect(cartonPoints(21)).toBe(8);
    expect(cartonPoints(22)).toBe(8);
    expect(cartonPoints(23)).toBe(10);
    expect(cartonPoints(30)).toBe(16);
  });

  function lastPlayOfHand(capturedYou: number, capturedLucho: number, dealer = LUCHO, table: Card[] = []) {
    const pool = rest([parseCard("KS"), ...table]);
    return stateWith({
      deck: [],
      dealer,
      hands: [cards("KS"), []],
      table,
      turn: YOU,
      captured: [pool.slice(0, capturedYou), pool.slice(capturedYou, capturedYou + capturedLucho)],
      scores: [0, 12],
    });
  }

  it("gives 2 to whoever has more when nobody reaches 20", () => {
    const end = applyMove(lastPlayOfHand(18, 19), { cardId: "KS", capture: null });
    expect(end.phase).toBe("handOver");
    expect(end.handResult).toMatchObject({ cards: [18, 19], leftover: 1 });
    expect(end.handResult?.event).toMatchObject({ player: LUCHO, points: 2 });
  });

  it("gives a tie under 20 to the player who did not deal", () => {
    const luchoDealt = applyMove(lastPlayOfHand(19, 19, LUCHO), { cardId: "KS", capture: null });
    expect(luchoDealt.handResult?.event).toMatchObject({ player: YOU, points: 2 });
    const youDealt = applyMove(lastPlayOfHand(19, 19, YOU), { cardId: "KS", capture: null });
    expect(youDealt.handResult?.event).toMatchObject({ player: LUCHO, points: 2 });
  });

  it("scores 6 for 20 cards against 19", () => {
    const end = applyMove(lastPlayOfHand(20, 19), { cardId: "KS", capture: null });
    expect(end.handResult?.event).toMatchObject({ player: YOU, points: 6, cards: 20 });
  });

  it("gives the 20 to 20 tie to the player who did not deal", () => {
    const s = lastPlayOfHand(18, 20, YOU, cards("KH"));
    const end = applyMove(s, legalMoves(s)[0]);
    expect(end.handResult).toMatchObject({ cards: [20, 20], leftover: 0 });
    expect(end.handResult?.event).toMatchObject({ player: LUCHO, points: 6, cards: 20 });
  });

  it("only shows the cartón points that were still needed to reach 40", () => {
    const end = applyMove({ ...lastPlayOfHand(22, 17), scores: [36, 12] }, { cardId: "KS", capture: null });
    expect(end.handResult?.event).toMatchObject({ player: YOU, points: 4, cards: 22 });
    expect(end.scores[YOU]).toBe(40);
    expect(end.phase).toBe("chicaOver");
  });
});

describe("chica and mesa", () => {
  it("calls zapatería when the loser has under 10 points", () => {
    const s = stateWith({
      hands: [cards("5S", "KD"), cards("2C")],
      table: cards("5H"),
      lastDrop: { cardId: "5H", player: LUCHO },
      scores: [36, 8],
    });
    const next = applyMove(s, legalMoves(s).find((m) => m.cardId === "5S")!);
    expect(next.phase).toBe("mesaOver");
    expect(next.zapateria).toBe(true);
    expect(next.mesaWinner).toBe(YOU);
  });

  it("ends the mesa on a second chica", () => {
    const s = stateWith({
      hands: [cards("5S", "KD"), cards("2C")],
      table: cards("5H"),
      lastDrop: { cardId: "5H", player: LUCHO },
      scores: [36, 20],
      chicas: [1, 0],
    });
    const next = applyMove(s, legalMoves(s).find((m) => m.cardId === "5S")!);
    expect(next.phase).toBe("mesaOver");
    expect(next.zapateria).toBe(false);
    expect(next.chicas).toEqual([2, 0]);
    expect(next.mesaWinner).toBe(YOU);
  });

  it("ends the mesa on a doble ronda when the other player has under 10", () => {
    const youHand = cards("QS", "QH", "QD", "QC", "AS");
    const luchoHand = cards("2S", "3H", "5D", "6C", "7S");
    const deck = [...luchoHand, ...youHand, ...rest([...youHand, ...luchoHand])];
    const s = stateWith({ hands: [cards("JS"), []], turn: YOU, deck, table: [], dealer: YOU, scores: [12, 4] });
    const dealt = applyMove(s, { cardId: "JS", capture: null });
    expect(dealt.events.find((e) => e.kind === "dobleRonda")).toMatchObject({ player: YOU });
    expect(dealt.phase).toBe("mesaOver");
    expect(dealt.zapateria).toBe(true);
    expect(dealt.mesaWinner).toBe(YOU);
  });
});

describe("El Guapo", () => {
  it("does not count your own hand as unseen", () => {
    const s = stateWith({
      hands: [cards("5S", "KD"), cards("2C", "3C")],
      table: cards("5H"),
      captured: [cards("AS"), cards("AH")],
    });
    const unseen = unseenBy(s, LUCHO).map((c) => c.id);
    expect(unseen).toHaveLength(40 - 5);
    for (const id of ["2C", "3C", "5H", "AS", "AH"]) expect(unseen).not.toContain(id);
    for (const id of ["5S", "KD"]) expect(unseen).toContain(id);
  });

  it("takes caída y limpia when it is on the table", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const s = stateWith({
        turn: LUCHO,
        hands: [cards("2S", "3S"), cards("5C", "6S", "KD")],
        table: cards("5H", "6D"),
        lastDrop: { cardId: "5H", player: YOU },
      });
      expect(chooseMove(s, mulberry32(seed)).cardId).toBe("5C");
    }
  });
});

describe("full games", () => {
  it("plays whole mesas between two computers without losing a card", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const rng = mulberry32(seed);
      let s = newMesa(drawForDealer(rng).dealer, rng);
      let plays = 0;
      while (s.phase !== "mesaOver") {
        if (s.phase === "handOver") s = nextHand(s, rng);
        else if (s.phase === "chicaOver") s = nextChica(s, rng);
        else {
          s = applyMove(s, chooseMove(s, rng));
          plays++;
        }
        if (s.phase === "playing" || s.phase === "handOver") {
          const all = [...s.deck, ...s.hands[0], ...s.hands[1], ...s.table, ...s.captured[0], ...s.captured[1]];
          expect(new Set(all.map((c) => c.id)).size).toBe(40);
          expect(all).toHaveLength(40);
          expect(new Set(s.table.map((c) => c.rank)).size).toBe(s.table.length);
        }
        expect(plays).toBeLessThan(5000);
      }
      expect(s.scores.some((x) => x === 40)).toBe(true);
      expect(s.scores.every((x) => x % 2 === 0)).toBe(true);
    }
  });

  it("picks the first dealer by the first diamond", () => {
    const { draws, dealer } = drawForDealer(mulberry32(7));
    expect(draws.at(-1)?.suit).toBe("D");
    expect(draws.slice(0, -1).every((c) => c.suit !== "D")).toBe(true);
    expect(dealer).toBe(draws.length % 2 === 1 ? YOU : LUCHO);
  });
});
