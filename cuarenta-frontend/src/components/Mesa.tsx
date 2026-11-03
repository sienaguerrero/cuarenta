import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Card, byRank } from "../game/cards";
import { chooseMove } from "../game/ai";
import {
  type Capture,
  type EventKind,
  type GameState,
  type Move,
  type PlayerId,
  type ScoreEvent,
  DEALS_PER_HAND,
  LIMPIA_LIMIT,
  LUCHO,
  RONDA_LIMIT,
  WIN,
  YOU,
  applyMove,
  capturesFor,
  evaluatePlay,
  nextChica,
  nextHand,
} from "../game/engine";
import { EVENT_GLOSS, EVENT_LABELS, type Lang, STRINGS } from "../i18n";
import { type Line, type Mood, pickLine } from "../lucho";
import { LuchoBadge } from "./Lucho";
import { CardBack, CardFace } from "./PlayingCard";
import { Tally } from "./Tally";

const LUCHO_DELAY = 1100;
const DROP_DELAY = 420;
const CAPTURE_DELAY = 950;
const TOAST_MS = 2000;
const SPEECH_MS = 3600;
const RESULT_DELAY = 1300;

interface Option {
  capture: Capture;
  ids: string[];
  points: number;
  kinds: ScoreEvent["kind"][];
}

function optionsFor(game: GameState, card: Card): Option[] {
  return capturesFor(card, game.table)
    .map((capture) => {
      const outcome = evaluatePlay(game, game.turn, card, capture);
      return {
        capture,
        ids: [...capture.base, ...capture.escalera],
        points: outcome.points,
        kinds: outcome.events.map((e) => e.kind),
      };
    })
    .sort((a, b) => b.points - a.points || b.ids.length - a.ids.length);
}

const MOODS: [EventKind[], Mood, Mood][] = [
  [["dobleRonda"], "myDobleRonda", "yourDobleRonda"],
  [["caidaEnRonda"], "myCaidaEnRonda", "yourCaidaEnRonda"],
  [["caida", "limpia"], "myCaidaLimpia", "yourCaidaLimpia"],
  [["caida"], "myCaida", "yourCaida"],
  [["limpia"], "myLimpia", "yourLimpia"],
  [["ronda"], "myRonda", "yourRonda"],
];

function moodFor(events: ScoreEvent[]): Mood | null {
  for (const [kinds, mine, yours] of MOODS) {
    for (const p of [LUCHO, YOU]) {
      if (kinds.every((k) => events.some((e) => e.player === p && e.kind === k))) return p === LUCHO ? mine : yours;
    }
  }
  return null;
}

function byPlayer(events: ScoreEvent[]): { player: PlayerId; events: ScoreEvent[] }[] {
  const groups: { player: PlayerId; events: ScoreEvent[] }[] = [];
  for (const e of events) {
    const group = groups.find((g) => g.player === e.player);
    if (group) group.events.push(e);
    else groups.push({ player: e.player, events: [e] });
  }
  return groups;
}

function ChicaDots({ won, label }: { won: number; label: string }) {
  return (
    <span className="seat__chicas" aria-label={`${label}: ${won}`}>
      {[0, 1].map((i) => (
        <span key={i} className={`chica-dot${i < won ? " chica-dot--won" : ""}`} />
      ))}
    </span>
  );
}

function maxEventId(game: GameState) {
  return game.events.reduce((m, e) => Math.max(m, e.id), 0);
}

interface MesaProps {
  initial: GameState;
  lang: Lang;
  resumed: boolean;
  onChange: (game: GameState) => void;
  onNewMesa: () => void;
}

export function Mesa({ initial, lang, resumed, onChange, onNewMesa }: MesaProps) {
  const t = STRINGS[lang];
  const [game, setGame] = useState(initial);
  const [pending, setPending] = useState<{ move: Move; player: PlayerId; card: Card } | null>(null);
  const [choosing, setChoosing] = useState<{ card: Card; options: Option[] } | null>(null);
  const [preview, setPreview] = useState<string[]>([]);
  const [toast, setToast] = useState<{ key: number; events: ScoreEvent[] } | null>(null);
  const [speech, setSpeech] = useState<{ key: number; line: Line } | null>(null);
  const [showResult, setShowResult] = useState(initial.phase !== "playing");
  const seen = useRef(resumed ? maxEventId(initial) : 0);
  const speechKey = useRef(0);

  const say = useCallback((mood: Mood, onlyIfQuiet = false) => {
    speechKey.current += 1;
    const next = { key: speechKey.current, line: pickLine(mood, Math.random) };
    setSpeech((current) => (onlyIfQuiet && current ? current : next));
  }, []);

  useEffect(() => {
    say(resumed ? "resume" : "greet");
  }, [resumed, say]);

  useEffect(() => {
    onChange(game);
  }, [game, onChange]);

  useEffect(() => {
    if (game.phase !== "playing" || game.turn !== LUCHO || pending) return;
    if (Math.random() < 0.18) say("think", true);
    const id = setTimeout(() => {
      const move = chooseMove(game, Math.random);
      const card = game.hands[LUCHO].find((c) => c.id === move.cardId)!;
      setPending({ move, player: LUCHO, card });
    }, LUCHO_DELAY);
    return () => clearTimeout(id);
  }, [game, pending, say]);

  useEffect(() => {
    if (!pending) return;
    const id = setTimeout(
      () => {
        setGame((g) => applyMove(g, pending.move));
        setPending(null);
      },
      pending.move.capture ? CAPTURE_DELAY : DROP_DELAY,
    );
    return () => clearTimeout(id);
  }, [pending]);

  useEffect(() => {
    const fresh = game.events.filter((e) => e.id > seen.current && e.kind !== "carton");
    seen.current = maxEventId(game);
    if (fresh.length > 0) {
      setToast({ key: seen.current, events: fresh });
      const mood = moodFor(fresh);
      if (mood) say(mood);
    }
    if (game.phase === "playing") {
      setShowResult(false);
      return;
    }
    const outcome: Mood =
      game.phase === "handOver"
        ? "count"
        : game.phase === "mesaOver"
          ? game.zapateria
            ? game.mesaWinner === LUCHO ? "zapateroYou" : "zapateroMe"
            : game.mesaWinner === LUCHO ? "winMesa" : "loseMesa"
          : game.chicaWinner === LUCHO ? "winChica" : "loseChica";
    const id = setTimeout(() => {
      say(outcome);
      setShowResult(true);
    }, fresh.length > 0 ? RESULT_DELAY : 300);
    return () => clearTimeout(id);
  }, [game, say]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (!speech) return;
    const id = setTimeout(() => setSpeech(null), SPEECH_MS);
    return () => clearTimeout(id);
  }, [speech]);

  const closeChooser = () => {
    setChoosing(null);
    setPreview([]);
  };

  useEffect(() => {
    if (!choosing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setChoosing(null);
      setPreview([]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choosing]);

  const myTurn = game.phase === "playing" && game.turn === YOU && !pending;
  const myHand = useMemo(
    () => game.hands[YOU].filter((c) => c.id !== pending?.card.id).sort(byRank),
    [game.hands, pending],
  );
  const luchoCount = game.hands[LUCHO].length - (pending?.player === LUCHO ? 1 : 0);
  const takenIds = new Set(
    pending?.move.capture ? [...pending.move.capture.base, ...pending.move.capture.escalera] : preview,
  );

  const play = (move: Move, card: Card) => {
    closeChooser();
    setPending({ move, player: YOU, card });
  };

  const pick = (card: Card) => {
    if (!myTurn) return;
    const options = optionsFor(game, card);
    if (options.length <= 1) play({ cardId: card.id, capture: options[0]?.capture ?? null }, card);
    else setChoosing({ card, options });
  };

  const hoverCard = (card: Card | null) => {
    if (!myTurn || choosing) return;
    setPreview(card ? optionsFor(game, card)[0]?.ids ?? [] : []);
  };

  const advance = () => {
    setShowResult(false);
    if (game.phase === "handOver") setGame(nextHand(game, Math.random));
    else if (game.phase === "chicaOver") setGame(nextChica(game, Math.random));
    else onNewMesa();
  };

  const name = (p: PlayerId) => (p === YOU ? t.you : t.lucho);

  const seat = (p: PlayerId) => {
    const score = game.scores[p];
    return (
      <div className={`seat${game.phase === "playing" && game.turn === p ? " seat--active" : ""}`}>
        <div className="seat__head">
          <span className="seat__name">{name(p)}</span>
          {game.dealer === p && <span className="chip chip--dealer">{t.deals}</span>}
          <ChicaDots won={game.chicas[p]} label={t.chicas} />
        </div>
        <div className="seat__score">
          <span className="seat__points">
            {score}
            <small> / 40</small>
          </span>
          <Tally score={score} />
        </div>
        <div className="seat__meta">
          <span>
            {t.carton}: {game.captured[p].length}
          </span>
          {score >= WIN ? null : score >= LIMPIA_LIMIT ? (
            <span className="chip chip--warn">{t.limitLimpia}</span>
          ) : score >= RONDA_LIMIT ? (
            <span className="chip chip--warn">{t.limitRonda}</span>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="mesa">
      <section className="row row--lucho" aria-label={t.lucho}>
        <LuchoBadge
          line={speech?.line ?? null}
          lineKey={speech?.key ?? 0}
          lang={lang}
          thinking={game.phase === "playing" && game.turn === LUCHO && !pending}
        />
        <div className="hand hand--lucho" role="img" aria-label={`${t.lucho}: ${luchoCount}`}>
          {Array.from({ length: luchoCount }, (_, i) => (
            <CardBack key={i} size="md" />
          ))}
        </div>
        {seat(LUCHO)}
      </section>

      <section className="rim" aria-label="Mesa">
        <div className="felt">
          <div className="felt__status">
            <span>{t.deal(Math.max(game.deal, 1), DEALS_PER_HAND)}</span>
            <span>{t.deckLeft(game.deck.length)}</span>
          </div>
          <div className="felt__body">
            <div className="deck" aria-hidden>
              {game.deck.length > 0 ? <CardBack size="md" /> : <div className="deck__empty" />}
              {game.deck.length > 10 && <CardBack size="md" className="deck__under" />}
            </div>
            <div className="table-cards">
              {game.table.length === 0 && !pending && <p className="felt__empty">{t.emptyTable}</p>}
              {game.table.map((c) => (
                <div
                  key={c.id}
                  className={[
                    "slot",
                    takenIds.has(c.id) ? (pending ? "slot--taken" : "slot--preview") : "",
                    game.lastDrop?.cardId === c.id ? "slot--fresh" : "",
                  ].join(" ")}
                >
                  <CardFace card={c} lang={lang} />
                </div>
              ))}
              {pending && (
                <div className={`slot slot--incoming slot--from-${pending.player === YOU ? "you" : "lucho"}`}>
                  <CardFace card={pending.card} lang={lang} />
                </div>
              )}
            </div>
          </div>
          {toast && (
            <div key={toast.key} className="toast" role="status">
              {byPlayer(toast.events).map((group) => (
                <div key={group.player} className="toast__group">
                  {group.events.map((e) => (
                    <div key={e.id} className={`toast__line${e.blocked ? " toast__line--blocked" : ""}`}>
                      <span className="toast__label">{EVENT_LABELS[e.kind]}</span>
                      <span className="toast__pts">{e.blocked ? t.notCounted : `+${e.points}`}</span>
                      {lang === "en" && <span className="toast__gloss">{EVENT_GLOSS[e.kind]}</span>}
                    </div>
                  ))}
                  <div className="toast__who">{name(group.player)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="row row--you" aria-label={t.you}>
        {seat(YOU)}
        <div className="you">
          <p className={`turn${myTurn ? " turn--you" : ""}`} aria-live="polite">
            {game.phase !== "playing" ? " " : myTurn ? t.yourTurn : pending?.player === YOU ? " " : t.luchoTurn}
          </p>
          <div className="hand hand--you">
            {myHand.map((c) => {
              const options = myTurn ? optionsFor(game, c) : [];
              const caida = options[0]?.kinds.some((k) => k === "caida" || k === "caidaEnRonda");
              const tag = caida ? "caida" : options.length ? "takes" : null;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`hand__card${choosing?.card.id === c.id ? " hand__card--chosen" : ""}`}
                  disabled={!myTurn}
                  onClick={() => pick(c)}
                  onMouseEnter={() => hoverCard(c)}
                  onMouseLeave={() => hoverCard(null)}
                  onFocus={() => hoverCard(c)}
                  onBlur={() => hoverCard(null)}
                >
                  <CardFace card={c} lang={lang} />
                  {tag && <span className={`hand__tag hand__tag--${tag}`}>{tag === "caida" ? "¡Caída!" : "+"}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {choosing && (
        <div className="chooser" role="dialog" aria-label={t.choose}>
          <p className="chooser__title">{t.choose}</p>
          <div className="chooser__options">
            {choosing.options.map((o, i) => {
              const cards = o.ids.map((id) => game.table.find((c) => c.id === id)!);
              return (
                <button
                  key={i}
                  type="button"
                  className="chooser__option"
                  onClick={() => play({ cardId: choosing.card.id, capture: o.capture }, choosing.card)}
                  onMouseEnter={() => setPreview(o.ids)}
                  onFocus={() => setPreview(o.ids)}
                  onMouseLeave={() => setPreview([])}
                  autoFocus={i === 0}
                >
                  <span className="chooser__cards">
                    {cards.map((c) => (
                      <CardFace key={c.id} card={c} lang={lang} size="sm" />
                    ))}
                  </span>
                  <span className="chooser__info">
                    {t.takes(cards.length + 1)}
                    {o.kinds.map((k) => (
                      <span key={k} className="chip chip--event">
                        {EVENT_LABELS[k]}
                      </span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          <button type="button" className="link-button" onClick={closeChooser}>
            {t.cancel}
          </button>
        </div>
      )}

      <aside className="log" aria-label={t.plays}>
        <h2 className="log__title">{t.plays}</h2>
        {game.events.length === 0 ? (
          <p className="log__empty">{t.noPlays}</p>
        ) : (
          <ol className="log__list">
            {[...game.events].reverse().map((e) => (
              <li key={e.id} className={`log__item log__item--${e.player === YOU ? "you" : "lucho"}`}>
                <span className="log__who">{name(e.player)}</span>
                <span className="log__what">{EVENT_LABELS[e.kind]}</span>
                <span className="log__pts">{e.blocked ? t.notCounted : `+${e.points}`}</span>
              </li>
            ))}
          </ol>
        )}
      </aside>

      {showResult && game.phase !== "playing" && (
        <div className="result-backdrop">
          <div className="result" role="dialog" aria-modal="true" aria-labelledby="result-title">
            <div className="faja" aria-hidden />
            <div className="result__body">
              <h2 id="result-title" className="result__title">
                {game.phase === "handOver"
                  ? t.handOver
                  : game.phase === "mesaOver"
                    ? game.zapateria
                      ? t.zapateria
                      : game.mesaWinner === YOU ? t.mesaYou : t.mesaLucho
                    : game.chicaWinner === YOU ? t.chicaYou : t.chicaLucho}
              </h2>
              {game.phase === "mesaOver" && game.zapateria && (
                <p className="result__sub">{game.mesaWinner === YOU ? t.zapateroLucho : t.zapateroYou}</p>
              )}
              {game.handResult && (
                <div className="result__carton">
                  <p>{t.cartonLine(game.handResult.cards[YOU], game.handResult.cards[LUCHO])}</p>
                  {game.handResult.leftover > 0 && <p className="fine">{t.leftover(game.handResult.leftover)}</p>}
                  <p className="result__carton-win">
                    {t.cartonWin(name(game.handResult.event.player), game.handResult.event.points)}
                  </p>
                </div>
              )}
              <div className="result__scores">
                {[YOU, LUCHO].map((p) => (
                  <div key={p} className="result__score">
                    <span className="result__name">{name(p)}</span>
                    <span className="result__points">{game.scores[p]}</span>
                    <Tally score={game.scores[p]} />
                    <ChicaDots won={game.chicas[p]} label={t.chicas} />
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn--primary" onClick={advance} autoFocus>
                {game.phase === "handOver" ? t.nextHand : game.phase === "chicaOver" ? t.nextChica : t.anotherMesa}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
