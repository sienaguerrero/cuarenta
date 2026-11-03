import { type Lang, STRINGS } from "../i18n";
import { Modal } from "./Modal";

interface Props {
  open: boolean;
  lang: Lang;
  onClose: () => void;
}

const SLANG: { word: string; es: string; en: string }[] = [
  { word: "¿Qué fue?", es: "¿Qué tal? El saludo de todos los días.", en: "What's up? The everyday greeting." },
  { word: "pana", es: "Amigo, compañero.", en: "Friend, buddy." },
  { word: "¡Chuta!", es: "Para la sorpresa o la mala suerte.", en: "Darn! For surprise or bad luck." },
  { word: "¡Pucha!", es: "Parecido a chuta.", en: "Shoot! Similar to chuta." },
  { word: "ya mismo", es: "Ahorita, o dentro de un rato.", en: "Right away, or in a while." },
  { word: "de ley", es: "Seguro, sin duda.", en: "For sure, no doubt." },
  { word: "cachar", es: "Entender, darse cuenta.", en: "To get it, to figure it out." },
  { word: "bacán", es: "Bueno, chévere.", en: "Cool, great." },
  { word: "full", es: "Mucho, muy.", en: "A lot, very." },
  { word: "¡Qué bestia!", es: "Para lo que impresiona.", en: "Wow! For anything impressive." },
  { word: "¡Achachay!", es: "¡Qué frío! Viene del kichwa.", en: "Brr, it's cold! From Kichwa." },
  { word: "¡Arrarray!", es: "¡Qué caliente! También para lo que arde.", en: "Ouch, hot! Also for anything that stings." },
  { word: "chulla vida", es: "Una sola vida. Chulla viene del kichwa.", en: "You only live once. Chulla comes from Kichwa." },
  { word: "guambra", es: "Joven, chico o chica. Del kichwa.", en: "Kid, young person. From Kichwa." },
];

function Points({ rows }: { rows: [string, string, string][] }) {
  return (
    <table className="points-table">
      <tbody>
        {rows.map(([name, pts, what]) => (
          <tr key={name}>
            <th scope="row">{name}</th>
            <td className="points-table__pts">{pts}</td>
            <td>{what}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function HowToPlayModal({ open, lang, onClose }: Props) {
  const t = STRINGS[lang];

  return (
    <Modal open={open} title={t.howTo} closeLabel={t.close} onClose={onClose}>
      {lang === "es" ? (
        <>
          <h3>La baraja</h3>
          <p>
            Cuarenta cartas: se sacan los 8, 9 y 10. El orden es A, 2, 3, 4, 5, 6, 7, J, Q, K, y el as vale 1.
          </p>
          <h3>El reparto</h3>
          <p>
            Cinco cartas para cada uno y cuatro repartos por mano. Juega primero quien no reparte, y el que reparte
            cambia en cada mano.
          </p>
          <h3>Llevar cartas</h3>
          <p>En tu turno juegas una carta y te llevas:</p>
          <ul>
            <li>
              <strong>Por pareja:</strong> una carta del mismo valor.
            </li>
            <li>
              <strong>Por suma:</strong> cartas de A a 7 que suman tu carta. Un 7 se lleva A, 2 y 4. Las figuras no
              suman.
            </li>
            <li>
              <strong>Escalera:</strong> después de la pareja o la suma, también te llevas la carta que sigue a la
              tuya, y la siguiente, mientras no haya hueco. Después del 7 viene la J.
            </li>
          </ul>
          <p>Pareja o suma, no las dos a la vez. Si no te llevas nada, tu carta se queda en la mesa.</p>
          <h3>Los puntos</h3>
          <Points
            rows={[
              ["Caída", "2", "Llevarte por pareja la carta que tu rival acaba de jugar."],
              ["Limpia", "2", "Dejar la mesa vacía."],
              ["Caída y limpia", "4", "Las dos en la misma jugada."],
              ["Ronda", "4", "Recibir tres cartas del mismo valor. Se canta, pero no se dice de qué."],
              ["Caída en ronda", "10", "Caerle a una carta de la ronda de tu rival."],
              ["Doble ronda", "40", "Recibir las cuatro te da la chica."],
              ["Cartón", "6+", "Al final de la mano, 20 cartas valen 6 y cada carta extra suma 1, redondeando a par: 21 o 22 cartas valen 8. Si nadie llega a 20, quien tenga más gana 2."],
            ]}
          />
          <p>No hay caída en la primera jugada de un reparto.</p>
          <h3>Los 30 y los 38</h3>
          <p>
            Desde los 30 puntos la ronda ya no cuenta, y caerle a una ronda vale 2, como cualquier caída. Si la ronda
            de tu rival no contó, caerle tampoco vale 10. A los 38 la limpia ya no cuenta: hay que cerrar con caída o
            con cartón.
          </p>
          <h3>Ganar</h3>
          <p>
            Con 40 puntos ganas la chica, y con dos chicas ganas la mesa. Si ganas una chica y tu rival no llegó a 10,
            es zapatería y te llevas la mesa entera.
          </p>
          <h3>En esta mesa</h3>
          <p>
            Si tu carta puede llevar, lleva. Si hay varias formas de llevar, eliges tú. La escalera se toma sola.
          </p>
          <h3>Habla como Don Lucho</h3>
          <dl className="slang">
            {SLANG.map((s) => (
              <div key={s.word}>
                <dt>{s.word}</dt>
                <dd>{s.es}</dd>
              </div>
            ))}
          </dl>
          <p className="fine">
            Reglas según <a href="https://www.pagat.com/fishing/cuarenta.html">pagat.com</a>.
          </p>
        </>
      ) : (
        <>
          <h3>The deck</h3>
          <p>Forty cards: take out the 8s, 9s, and 10s. The order is A, 2, 3, 4, 5, 6, 7, J, Q, K, and the ace is 1.</p>
          <h3>The deal</h3>
          <p>
            Five cards each, four deals per hand. Whoever didn't deal plays first, and the deal changes hands every
            hand.
          </p>
          <h3>Capturing</h3>
          <p>On your turn you play one card and capture:</p>
          <ul>
            <li>
              <strong>By pair:</strong> one card of the same rank.
            </li>
            <li>
              <strong>By sum:</strong> cards from A to 7 that add up to your card. A 7 takes an A, a 2, and a 4. Face
              cards never add.
            </li>
            <li>
              <strong>Escalera:</strong> after a pair or a sum, you also take the next rank up from your card, and the
              next, as long as there's no gap. J comes right after 7.
            </li>
          </ul>
          <p>A pair or a sum, never both at once. If you capture nothing, your card stays on the table.</p>
          <h3>Points</h3>
          <Points
            rows={[
              ["Caída", "2", "Catch the card your rival just played, by pair."],
              ["Limpia", "2", "Clear the table."],
              ["Caída y limpia", "4", "Both in the same play."],
              ["Ronda", "4", "Get dealt three of a kind. You announce it, but not the rank."],
              ["Caída en ronda", "10", "Catch a card from your rival's ronda."],
              ["Doble ronda", "40", "Get dealt all four and the chica is yours."],
              ["Cartón", "6+", "At the end of the hand, 20 cards are worth 6 and each extra card adds 1, rounded up to even: 21 or 22 cards are worth 8. If nobody reaches 20, whoever has more gets 2."],
            ]}
          />
          <p>The first play of a deal can't be a caída.</p>
          <h3>The 30 and 38 rules</h3>
          <p>
            From 30 points up, rondas don't count, and catching a ronda card is a plain caída worth 2. If your rival's
            ronda didn't count, catching it isn't worth 10 either. At 38, limpias don't count: you have to finish with
            a caída or the cartón.
          </p>
          <h3>Winning</h3>
          <p>
            40 points wins the chica, and two chicas win the mesa. Win a chica while your rival is under 10 and it's
            zapatería: you take the whole mesa.
          </p>
          <h3>At this table</h3>
          <p>
            If your card can capture, it captures. If there's more than one way, you pick. The escalera is taken for
            you.
          </p>
          <h3>Talk like Don Lucho</h3>
          <dl className="slang">
            {SLANG.map((s) => (
              <div key={s.word}>
                <dt lang="es">{s.word}</dt>
                <dd>{s.en}</dd>
              </div>
            ))}
          </dl>
          <p className="fine">
            Rules follow <a href="https://www.pagat.com/fishing/cuarenta.html">pagat.com</a>.
          </p>
        </>
      )}
    </Modal>
  );
}
