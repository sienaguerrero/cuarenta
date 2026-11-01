import { useEffect, useMemo, useState } from "react";
import { type PlayerId, LUCHO, YOU, drawForDealer } from "../game/engine";
import { type Lang, STRINGS } from "../i18n";
import { CardFace } from "./PlayingCard";

const STEP_MS = 420;

interface Props {
  lang: Lang;
  onStart: (dealer: PlayerId) => void;
}

export function Sorteo({ lang, onStart }: Props) {
  const t = STRINGS[lang];
  const { draws, dealer } = useMemo(() => drawForDealer(Math.random), []);
  const [shown, setShown] = useState(0);
  const done = shown >= draws.length;

  useEffect(() => {
    if (done) return;
    const id = setTimeout(() => setShown((n) => n + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [shown, done]);

  const row = (p: PlayerId) =>
    draws.slice(0, shown).filter((_, i) => (i % 2 === 0 ? YOU : LUCHO) === p);

  return (
    <section className="sorteo">
      <h1 className="display">{t.sorteoTitle}</h1>
      <p className="sorteo__how">{t.sorteoHow}</p>
      {([YOU, LUCHO] as PlayerId[]).map((p) => (
        <div key={p} className="sorteo__row">
          <span className="sorteo__who">{p === YOU ? t.you : t.lucho}</span>
          <div className="sorteo__cards">
            {row(p).map((c) => (
              <div key={c.id} className={`sorteo__card${c.suit === "D" ? " sorteo__card--hit" : ""}`}>
                <CardFace card={c} lang={lang} size="md" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="sorteo__result" aria-live="polite">
        {done ? (dealer === YOU ? t.sorteoYou : t.sorteoLucho) : " "}
      </p>
      <div className="sorteo__actions">
        {done ? (
          <button type="button" className="btn btn--primary" onClick={() => onStart(dealer)} autoFocus>
            {t.sorteoGo}
          </button>
        ) : (
          <button type="button" className="btn btn--ghost" onClick={() => setShown(draws.length)}>
            {t.sorteoSkip}
          </button>
        )}
      </div>
    </section>
  );
}
