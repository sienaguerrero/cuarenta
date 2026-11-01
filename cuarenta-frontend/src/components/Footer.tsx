import { type Lang, STRINGS } from "../i18n";

export default function Footer({ lang }: { lang: Lang }) {
  const t = STRINGS[lang];

  return (
    <footer className="footer">
      <div className="faja" aria-hidden />
      <div className="footer__inner">
        <p className="footer__dedication" lang="es">
          "Cuarenta" está dedicada a mis abuelos, que dejaron su tierra natal para dar una mejor vida a sus hijos (y
          nietos).
        </p>
        <p className="footer__credit">
          <strong>Cuarenta</strong>. {t.madeBy} <a href="https://sienaguerrero.com">Siena Maria Guerrero</a>.{" "}
          {t.sourceOn} <a href="https://github.com/sienaguerrero/cuarenta">GitHub</a>.
        </p>
      </div>
    </footer>
  );
}
