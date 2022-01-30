import React, { useState } from "react";
import logo from "./design-system/ecuador-flag-xs.png";
import "./App.css";
import WhatIsCuarentaModal from "./components/WhatIsCuarenta";
import HowToPlayModal from "./components/HowToPlay";
import Footer from "./components/Footer";

function App() {
  const [isWhatIsCuarentaOpen, setIsWhatIsCuarentaOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);

  // event handlers
  const handleModalOpen = (modalName: "how-to-play" | "what-is-cuarenta") => {
    switch (modalName) {
      case "how-to-play":
        setIsHowToPlayOpen(true);
        break;
      case "what-is-cuarenta":
        setIsWhatIsCuarentaOpen(true);
        break;
    }
  };

  const handleModalClose = (modalName: "how-to-play" | "what-is-cuarenta") => {
    switch (modalName) {
      case "how-to-play":
        setIsHowToPlayOpen(false);
        break;
      case "what-is-cuarenta":
        setIsWhatIsCuarentaOpen(false);
        break;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <img src={logo} className="App-logo" alt="logo" />
        </div>
        <div className="mt-4">
          <button className="button is-primary is-large">Start New Game</button>
        </div>
      </header>

      <body className="MainMenu-body is-flex is-flex-direction-column is-justify-content-center">
        <div className="columns is-centered">
          <div className="column is-half">
            <div className="columns">
              <div className="column is-flex is-justify-content-center">
                <button
                  className="button is-info"
                  onClick={() => handleModalOpen("what-is-cuarenta")}
                >
                  What is Cuarenta?
                </button>
              </div>
              <div className="column is-flex is-justify-content-center">
                <button
                  className="button is-info"
                  onClick={() => handleModalOpen("how-to-play")}
                >
                  How To Play
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>

      <Footer />

      {/* Modals */}
      <WhatIsCuarentaModal
        isWhatIsCuarentaOpen={isWhatIsCuarentaOpen}
        onClose={() => handleModalClose("what-is-cuarenta")}
      />
      <HowToPlayModal
        isHowToPlayOpen={isHowToPlayOpen}
        onClose={() => handleModalClose("how-to-play")}
      />
    </div>
  );
}

export default App;
