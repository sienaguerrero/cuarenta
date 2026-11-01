import type { Suit } from "../game/cards";
import { CardBack, ScoreCard } from "./PlayingCard";

const SCORE_CARDS: [string, Suit][] = [
  ["8", "S"], ["9", "H"], ["10", "D"], ["8", "C"],
  ["9", "S"], ["10", "H"], ["8", "D"], ["9", "C"],
  ["10", "S"], ["8", "H"], ["9", "D"], ["10", "C"],
];

export function Tally({ score }: { score: number }) {
  const perros = Math.floor(score / 10);
  const tantos = (score % 10) / 2;

  return (
    <div className="tally" aria-hidden>
      {Array.from({ length: perros }, (_, i) => (
        <span key={`p${i}`} className="tally__perro" title="perro">
          <CardBack size="sm" />
        </span>
      ))}
      {Array.from({ length: tantos }, (_, i) => {
        const [label, suit] = SCORE_CARDS[(perros + i) % SCORE_CARDS.length];
        return (
          <span key={`t${i}`} className="tally__tanto" title="tanto">
            <ScoreCard label={label} suit={suit} />
          </span>
        );
      })}
    </div>
  );
}
