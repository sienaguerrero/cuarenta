import type { Lang } from "../i18n";
import type { Line } from "../lucho";

export function Sombrero({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="31" fill="var(--amarillo)" />
      <ellipse cx="32" cy="41" rx="25" ry="7.5" fill="var(--paja-oscura)" />
      <ellipse cx="32" cy="39.5" rx="25" ry="7" fill="var(--paja)" />
      <path
        d="M17.5 38.5c0-9 1.6-17.4 6.2-20.1 2.2-1.3 4.3.4 8.3.4s6.1-1.7 8.3-.4c4.6 2.7 6.2 11.1 6.2 20.1-4.4 2-9.3 2.9-14.5 2.9s-10.1-.9-14.5-2.9z"
        fill="var(--paja)"
      />
      <path d="M26 19.5c2 2.6 4 3.5 6 3.5s4-.9 6-3.5" fill="none" stroke="var(--paja-oscura)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M17.8 32.6c4.5 1.7 9.2 2.5 14.2 2.5s9.7-.8 14.2-2.5l.2 4.6c-4.5 1.7-9.3 2.5-14.4 2.5s-9.9-.8-14.4-2.5z" fill="var(--tinta)" />
      <g stroke="var(--paja-oscura)" strokeWidth="0.8" opacity="0.55">
        <path d="M22 26c6 1.4 14 1.4 20 0" fill="none" />
        <path d="M20.5 30c7 1.5 16 1.5 23 0" fill="none" />
        <path d="M10 41c14 4 30 4 44 0" fill="none" />
      </g>
    </svg>
  );
}

interface LuchoProps {
  line: Line | null;
  lineKey: number;
  lang: Lang;
  thinking: boolean;
}

export function LuchoBadge({ line, lineKey, lang, thinking }: LuchoProps) {
  return (
    <div className="lucho">
      <Sombrero className={`lucho__hat${thinking ? " lucho__hat--thinking" : ""}`} />
      <div className="lucho__speech" aria-live="polite">
        {line && (
          <p key={lineKey} className="bubble">
            <span lang="es">{line.es}</span>
            {lang === "en" && <span className="bubble__gloss">{line.en}</span>}
          </p>
        )}
      </div>
    </div>
  );
}
