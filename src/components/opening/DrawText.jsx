import { clamp, ease } from "../../lib/opening-timeline.js";

// Per-glyph outline → directional ink reveal, using native system glyphs.
// No upstream commercial fonts or their exported outlines are shipped.
export default function DrawText({ text, progress, className = "" }) {
  return <span className={`ms-lettering ${className}`} aria-label={text}>
    {Array.from(text).map((letter, i, letters) => {
      const p = ease(clamp(progress * 1.45 - i / Math.max(1, letters.length - 1) * 0.45));
      return <span className="ms-glyph" key={i} aria-hidden="true" style={{
        "--ink": `${p * 100}%`, "--outline": Math.sin(p * Math.PI) * 0.8,
        "--lift": `${(1 - p) * 0.11}em`,
      }}>
        <span className="ms-glyph-outline">{letter === " " ? "\u00a0" : letter}</span>
        <span className="ms-glyph-ink" style={p === 1 ? { clipPath: "none" } : undefined}>{letter === " " ? "\u00a0" : letter}</span>
      </span>;
    })}
  </span>;
}
