import React from "react";

type HowToPlayModalProps = {
  isHowToPlayOpen: boolean;
  onClose: () => void;
};

function HowToPlayModal(props: HowToPlayModalProps) {
  const { isHowToPlayOpen, onClose } = props;

  return (
    <div
      id="how-to-play"
      className={`modal${isHowToPlayOpen ? " is-active" : ""}`}
    >
      <div className="modal-background" onClick={onClose} />

      <div className="modal-content">
        <div className="box">
          https://www.pagat.com/fishing/cuarenta.html
          https://soundsandcolours.com/subjects/travel/ecuadors-national-card-game-cuarenta-play-41066/
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

export default HowToPlayModal;
