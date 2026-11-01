Cuarenta is webapp based on the card game "Cuarenta" (the national card game of Ecuador).

Cuarenta means "40" in Spanish; it is both the number of cards in play and the number of points needed to win.

You play a full mesa against Don Lucho, a computer opponent. The interface is in Spanish, with an English toggle.

## Run it

```bash
cd cuarenta-frontend
npm install
npm run dev
```

`npm test` runs the rules engine tests. `npm run build` writes a static site to `cuarenta-frontend/dist`.

## Where things live

- `cuarenta-frontend/src/game/engine.ts`: the rules. Captures, caída, limpia, ronda, the 30 and 38 limits, cartón, chica, mesa, and zapatería.
- `cuarenta-frontend/src/game/ai.ts`: Don Lucho. He weighs points and cards taken against the odds that you can catch what he leaves on the table.
- `cuarenta-frontend/src/components/`: the table, cards, scoreboard, and rules pages.
- `cuarenta-backend/`: an early socket.io stub for online play. The game doesn't use it yet.

## Rules

Rules follow [pagat.com](https://www.pagat.com/fishing/cuarenta.html). Two simplifications: a card that can capture always captures, and the escalera is taken for you.
