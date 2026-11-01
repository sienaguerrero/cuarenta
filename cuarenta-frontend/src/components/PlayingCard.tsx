import { type Card, SUIT_SYMBOLS, isRed, rankLabel } from "../game/cards";
import { type Lang, cardName } from "../i18n";

const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[50, 18], [50, 82]],
  3: [[50, 18], [50, 50], [50, 82]],
  4: [[30, 18], [70, 18], [30, 82], [70, 82]],
  5: [[30, 18], [70, 18], [50, 50], [30, 82], [70, 82]],
  6: [[30, 18], [70, 18], [30, 50], [70, 50], [30, 82], [70, 82]],
  7: [[30, 18], [70, 18], [50, 34], [30, 50], [70, 50], [30, 82], [70, 82]],
};

type Size = "lg" | "md" | "sm";

interface FaceProps {
  card: Card;
  lang: Lang;
  size?: Size;
  className?: string;
}

export function CardFace({ card, lang, size = "lg", className = "" }: FaceProps) {
  const label = rankLabel(card.rank);
  const suit = SUIT_SYMBOLS[card.suit];
  const color = isRed(card.suit) ? "card--red" : "card--black";

  return (
    <div
      className={`card card--${size} ${color} ${className}`}
      role="img"
      aria-label={cardName(card, lang)}
    >
      <span className="card__corner card__corner--top" aria-hidden>
        <span>{label}</span>
        <span>{suit}</span>
      </span>
      {size !== "sm" && (
        <span className="card__corner card__corner--bottom" aria-hidden>
          <span>{label}</span>
          <span>{suit}</span>
        </span>
      )}
      {size !== "sm" && (
        <span className="card__body" aria-hidden>
          {card.rank <= 7 ? (
            PIPS[card.rank].map(([x, y], i) => (
              <span
                key={i}
                className={`card__pip${card.rank === 1 ? " card__pip--ace" : ""}${y > 50 ? " card__pip--flip" : ""}`}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {suit}
              </span>
            ))
          ) : (
            <span className="card__court">
              <span className="card__court-letter">{label}</span>
              <span className="card__court-suit">{suit}</span>
            </span>
          )}
        </span>
      )}
    </div>
  );
}

export function CardBack({ size = "lg", className = "" }: { size?: Size; className?: string }) {
  return <div className={`card card--${size} card--back ${className}`} aria-hidden />;
}

export function ScoreCard({ label, suit }: { label: string; suit: keyof typeof SUIT_SYMBOLS }) {
  return (
    <div className={`card card--sm ${isRed(suit) ? "card--red" : "card--black"}`} aria-hidden>
      <span className="card__corner card__corner--top">
        <span>{label}</span>
        <span>{SUIT_SYMBOLS[suit]}</span>
      </span>
    </div>
  );
}
