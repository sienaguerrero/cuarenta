import React from "react";

type WhatIsCuarentaProps = {
  isWhatIsCuarentaOpen: boolean;
  onClose: () => void;
};

function WhatIsCuarentaModal(props: WhatIsCuarentaProps) {
  const { isWhatIsCuarentaOpen, onClose } = props;

  return (
    <div
      id="what-is-cuarenta"
      className={`modal${isWhatIsCuarentaOpen ? " is-active" : ""}`}
    >
      <div className="modal-background" onClick={onClose} />

      <div className="modal-content">
        <div className="box">
          https://en.wikipedia.org/wiki/Cuarenta Cuarenta is the national card
          game of Ecuador. It is a fishing game played with the standard 52 card
          pack of Anglo-American playing cards, but all 10s, 9s and 8s are
          omitted (ace is low). This game is almost exclusively played in
          Ecuador. The name of the game, cuarenta is Spanish for the number 40
          (forty). This refers to the number of points that are required to win
          a chica (small division of the game) and also to the number of cards
          used to play it. Two chicas or the first chica with zapatería (loss of
          the chica by scoring less than ten points) win the game (a completed
          game is called a "mesa", literally meaning "table", which in this
          context refers to "match"). The game can be played by 2 players, or 4
          players split into two teams. Cuarenta is the national card game of
          Ecuador and even has official tournaments.
        </div>
      </div>

      <button
        className="modal-close is-large"
        aria-label="close"
        onClick={onClose}
      />
    </div>
  );
}

export default WhatIsCuarentaModal;
