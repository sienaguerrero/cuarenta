import type { Rng } from "./game/cards";

export interface Line {
  es: string;
  en: string;
}

export type Mood =
  | "greet"
  | "resume"
  | "think"
  | "myCaida"
  | "myLimpia"
  | "myCaidaLimpia"
  | "myCaidaEnRonda"
  | "myRonda"
  | "myDobleRonda"
  | "yourCaida"
  | "yourLimpia"
  | "yourCaidaLimpia"
  | "yourCaidaEnRonda"
  | "yourRonda"
  | "yourDobleRonda"
  | "count"
  | "winChica"
  | "loseChica"
  | "winMesa"
  | "loseMesa"
  | "zapateroYou"
  | "zapateroMe";

export const LINES: Record<Mood, Line[]> = {
  greet: [
    { es: "¿Qué fue, pana? ¿Una de cuarenta?", en: "What's up, friend? A game of cuarenta?" },
    { es: "¡Achachay, qué frío! Juguemos para calentarnos.", en: "Brr, it's cold! Let's play to warm up." },
    { es: "Siéntate nomás, que ya mismo reparto.", en: "Have a seat, I'll deal in a sec." },
  ],
  resume: [
    { es: "¿Seguimos? Yo me acuerdo de todo.", en: "Shall we go on? I remember everything." },
    { es: "Ya pues, donde nos quedamos.", en: "Alright then, right where we left off." },
  ],
  think: [
    { es: "A ver, a ver...", en: "Let's see, let's see..." },
    { es: "Ya mismo juego.", en: "I'll play in a sec." },
    { es: "Chulla vida... ¡ahí va!", en: "You only live once... here goes!" },
    { es: "Mmm, ¿qué tendrás en la mano, guambra?", en: "Hmm, what are you holding, kid?" },
  ],
  myCaida: [
    { es: "¡Caída! Te caí, pana.", en: "Caída! Got you, friend." },
    { es: "¡Caidita! De ley.", en: "A little caída. Naturally." },
    { es: "Eso, eso... ¡caída!", en: "That's it, that's it... caída!" },
  ],
  myLimpia: [
    { es: "¡Limpia! Mesa limpiecita.", en: "Limpia! Spotless table." },
    { es: "Barrí con todo, ¿cachas?", en: "Swept it all, get it?" },
  ],
  myCaidaLimpia: [
    { es: "¡Caída y limpia! ¡Full puntos!", en: "Caída and limpia! Loads of points!" },
    { es: "Caída, limpia, y tú mirando.", en: "Caída, limpia, and you just watching." },
  ],
  myCaidaEnRonda: [
    { es: "¡Caída en ronda! Te caché la ronda, pana.", en: "Caída en ronda! I figured out your ronda, friend." },
  ],
  myRonda: [
    { es: "¡Ronda! Y no te digo de qué.", en: "Ronda! And I'm not saying which." },
    { es: "Ronda para El Guapo. Cuídate.", en: "Ronda for El Guapo. Watch yourself." },
  ],
  myDobleRonda: [
    { es: "¡Doble ronda! Las cuatro, pana. La chica es mía.", en: "Doble ronda! All four, friend. The chica's mine." },
  ],
  yourCaida: [
    { es: "¡Chuta! Me caíste.", en: "Darn! You got me." },
    { es: "¡Qué bestia, pana!", en: "Wow, friend!" },
    { es: "Pucha, ni la vi venir.", en: "Shoot, didn't see that coming." },
  ],
  yourLimpia: [
    { es: "¡Uy! Me dejaste la mesa pelada.", en: "Ouch! You left the table bare." },
    { es: "Bacán la limpia, no te voy a mentir.", en: "Nice limpia, I won't lie." },
  ],
  yourCaidaLimpia: [
    { es: "¡Chuta! Caída y limpia. Me dolió.", en: "Darn! Caída and limpia. That hurt." },
  ],
  yourCaidaEnRonda: [
    { es: "¡Arrarray! Me cachaste la ronda.", en: "Ouch, that burns! You figured out my ronda." },
  ],
  yourRonda: [
    { es: "¿Ronda? Ya voy a cachar de qué es.", en: "A ronda? I'll figure out which." },
  ],
  yourDobleRonda: [
    { es: "¿Las cuatro? ¡Qué suerte la tuya!", en: "All four? What luck you have!" },
  ],
  count: [
    { es: "Contemos cartón.", en: "Let's count the cartón." },
    { es: "A ver quién tiene más cartas.", en: "Let's see who has more cards." },
  ],
  winChica: [
    { es: "¡Chica para mí! ¿Otra?", en: "The chica's mine! Another?" },
  ],
  loseChica: [
    { es: "Ya pues, ganaste esta. La próxima es mía.", en: "Alright then, you won this one. The next one's mine." },
  ],
  winMesa: [
    { es: "¡Mesa para El Guapo! Gracias por jugar, pana.", en: "The mesa goes to El Guapo! Thanks for playing, friend." },
  ],
  loseMesa: [
    { es: "¡Me ganaste la mesa! Juegas bacán.", en: "You beat me for the mesa! You play great." },
  ],
  zapateroYou: [
    { es: "¡Zapatero! Ni un perro hiciste.", en: "Zapatero! Not a single perro." },
  ],
  zapateroMe: [
    { es: "¡Chuta, zapatero yo! Qué vergüenza.", en: "Darn, I'm the zapatero! How embarrassing." },
  ],
};

export function pickLine(mood: Mood, rng: Rng): Line {
  const lines = LINES[mood];
  return lines[Math.floor(rng() * lines.length)];
}
