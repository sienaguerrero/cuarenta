import { useCallback, useState } from "react";
import { type GameState, type PlayerId, newMesa } from "./game/engine";
import { makeCard } from "./game/cards";
import { type Lang, STRINGS } from "./i18n";
import { loadGame, loadLang, saveGame, saveLang } from "./storage";
import Footer from "./components/Footer";
import HowToPlayModal from "./components/HowToPlay";
import WhatIsCuarentaModal from "./components/WhatIsCuarenta";
import { Mesa } from "./components/Mesa";
import { Sorteo } from "./components/Sorteo";
import { CardFace } from "./components/PlayingCard";
import { Sombrero } from "./components/Lucho";

type Screen = { name: "inicio" } | { name: "sorteo" } | { name: "mesa"; game: GameState; resumed: boolean };

const FAN = [makeCard(1, "D"), makeCard(7, "H"), makeCard(11, "S"), makeCard(4, "C"), makeCard(13, "H")];

export default function App() {
  const [lang, setLang] = useState<Lang>(loadLang);
  const [saved, setSaved] = useState<GameState | null>(loadGame);
  const [screen, setScreen] = useState<Screen>({ name: "inicio" });
  const [modal, setModal] = useState<"what" | "how" | null>(null);
  const t = STRINGS[lang];

  const toggleLang = () => {
    const next = lang === "es" ? "en" : "es";
    setLang(next);
    saveLang(next);
    document.documentElement.lang = next;
  };

  const persist = useCallback((game: GameState) => {
    const keep = game.phase === "mesaOver" ? null : game;
    saveGame(keep);
    setSaved(keep);
  }, []);

  const start = (dealer: PlayerId) => {
    setScreen({ name: "mesa", game: newMesa(dealer, Math.random), resumed: false });
  };

  return (
    <div className="app">
      <div className="bandera" aria-hidden>
        <span className="bandera__amarillo" />
        <span className="bandera__azul" />
        <span className="bandera__rojo" />
      </div>

      <header className="topbar">
        <button type="button" className="brand" onClick={() => setScreen({ name: "inicio" })}>
          <span className="brand__name">Cuarenta</span>
          <span className="brand__tag">{t.tagline}</span>
        </button>
        <nav className="topbar__nav">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setModal("what")}>
            {t.whatIs}
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setModal("how")}>
            {t.howTo}
          </button>
          <button type="button" className="btn btn--lang btn--sm" onClick={toggleLang} lang={lang === "es" ? "en" : "es"}>
            {t.otherLang}
          </button>
          {screen.name !== "inicio" && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setScreen({ name: "inicio" })}>
              {t.leave}
            </button>
          )}
        </nav>
      </header>

      <main className="main">
        {screen.name === "inicio" && (
          <section className="inicio">
            <div className="inicio__fan" aria-hidden>
              {FAN.map((c, i) => (
                <div
                  key={c.id}
                  className="inicio__fan-card"
                  style={{ ["--i" as string]: i - 2, ["--lift" as string]: `${Math.abs(i - 2) * 8}px` }}
                >
                  <CardFace card={c} lang={lang} />
                </div>
              ))}
            </div>
            <h1 className="display display--hero">Cuarenta</h1>
            <p className="inicio__lead">{t.homeLead}</p>
            <div className="inicio__vs">
              <Sombrero className="inicio__hat" />
              <span>{t.homeVs}</span>
            </div>
            <div className="inicio__actions">
              {saved && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => setScreen({ name: "mesa", game: saved, resumed: true })}
                >
                  {t.resume}
                </button>
              )}
              <button
                type="button"
                className={`btn ${saved ? "btn--secondary" : "btn--primary"}`}
                onClick={() => setScreen({ name: "sorteo" })}
              >
                {t.newMesa}
              </button>
            </div>
          </section>
        )}

        {screen.name === "sorteo" && <Sorteo lang={lang} onStart={start} />}

        {screen.name === "mesa" && (
          <Mesa
            key={screen.game.nextEventId + (screen.resumed ? "r" : "n")}
            initial={screen.game}
            lang={lang}
            resumed={screen.resumed}
            onChange={persist}
            onNewMesa={() => setScreen({ name: "sorteo" })}
          />
        )}
      </main>

      <Footer lang={lang} />

      <WhatIsCuarentaModal open={modal === "what"} lang={lang} onClose={() => setModal(null)} />
      <HowToPlayModal open={modal === "how"} lang={lang} onClose={() => setModal(null)} />
    </div>
  );
}
