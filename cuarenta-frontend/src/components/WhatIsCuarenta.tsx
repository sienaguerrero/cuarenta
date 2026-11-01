import { type Lang, STRINGS } from "../i18n";
import { Modal } from "./Modal";

interface Props {
  open: boolean;
  lang: Lang;
  onClose: () => void;
}

export default function WhatIsCuarentaModal({ open, lang, onClose }: Props) {
  const t = STRINGS[lang];

  return (
    <Modal open={open} title={t.whatIs} closeLabel={t.close} onClose={onClose}>
      {lang === "es" ? (
        <>
          <p className="lede">Cuarenta es el juego de cartas nacional del Ecuador.</p>
          <p>
            Cuarenta quiere decir 40. El juego usa 40 cartas, y la chica se gana con 40 puntos. Hay hasta campeonatos
            oficiales.
          </p>
          <p>
            Es un juego de pesca. En cada turno juegas una carta y tratas de llevarte cartas de la mesa por pareja,
            por suma o por escalera. Casi todos los puntos salen de la <strong>caída</strong> y la{" "}
            <strong>limpia</strong>. Caída es llevarte la carta que tu rival acaba de jugar. Limpia es dejar la mesa
            vacía.
          </p>
          <p>
            Se juega de dos, o de cuatro en parejas. Aquí juegas mano a mano contra Don Lucho. Él usa sombrero de paja
            toquilla.
          </p>
          <h3>Tantos y perros</h3>
          <p>
            Los puntos se cuentan con las cartas que sobran de la baraja, los 8, 9 y 10. Cada carta boca arriba es un{" "}
            <strong>tanto</strong> de 2 puntos. Cinco tantos se cambian por un <strong>perro</strong> boca abajo, que
            vale 10. El marcador de esta mesa funciona igual.
          </p>
          <h3>Chica, mesa y zapatería</h3>
          <p>
            Una <strong>chica</strong> se gana con 40 puntos y la <strong>mesa</strong> con dos chicas. Si ganas una
            chica antes de que tu rival haga un solo perro, es <strong>zapatería</strong>: te llevas la mesa entera y
            el otro queda de <strong>zapatero</strong>.
          </p>
        </>
      ) : (
        <>
          <p className="lede">Cuarenta is the national card game of Ecuador.</p>
          <p>
            Cuarenta means forty. The game uses 40 cards, and 40 points wins a chica. It even has official tournaments.
          </p>
          <p>
            It's a fishing game. Each turn you play one card and try to capture cards from the table by pair, by sum,
            or by escalera. Most points come from the <strong>caída</strong> and the <strong>limpia</strong>. A caída
            means you take the card your rival just played. A limpia means you clear the table.
          </p>
          <p>
            It's played by two, or by four in teams. Here you play head to head against Don Lucho. He wears a paja
            toquilla, the straw hat most people call a Panama hat.
          </p>
          <h3>Tantos and perros</h3>
          <p>
            Points are kept with the cards taken out of the deck, the 8s, 9s, and 10s. Each face-up card is a{" "}
            <strong>tanto</strong> worth 2 points. Five tantos trade for a face-down <strong>perro</strong> worth 10.
            The scoreboard at this table works the same way.
          </p>
          <h3>Chica, mesa, and zapatería</h3>
          <p>
            You win a <strong>chica</strong> at 40 points and the <strong>mesa</strong> with two chicas. Win a chica
            before your rival makes a single perro and it's <strong>zapatería</strong>: you take the whole mesa, and
            your rival is the <strong>zapatero</strong>, which means shoemaker.
          </p>
        </>
      )}
    </Modal>
  );
}
