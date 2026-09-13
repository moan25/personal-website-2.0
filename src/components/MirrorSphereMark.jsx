import { useId, useState } from "react";
import { asset } from "../lib/content.js";

// Reveal guides follow the supplied 1024px V3 icon. Every visible pixel comes
// from the unmodified brand asset; these guides are a mask, not a new logo.
export default function MirrorSphereMark() {
  const id = useId().replace(/:/g, ""),
    [failed, setFailed] = useState(false);
  return (
    <div className="mirror-mark">
      {failed ? <p className="mirror-fallback">MirrorSphere</p> : (
        <svg viewBox="40 190 940 650" className="mirror-art" aria-hidden="true">
          <defs>
            <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024" style={{ maskType: "luminance" }}>
              <g fill="none" stroke="white" strokeWidth="44" strokeLinecap="round" strokeLinejoin="round">
                <path className="mirror-trace mirror-trace-axis" strokeWidth="24" pathLength="100" d="M536 274 L536 765" />
                <path className="mirror-trace mirror-trace-core" pathLength="100" d="M507 344 L338 511 L507 679" />
                <path className="mirror-trace mirror-trace-core" pathLength="100" d="M565 344 L725 511 L565 679" />
                <path className="mirror-trace mirror-trace-shell" pathLength="100" d="M516 232 C345 231 205 355 207 510 C209 668 342 792 510 791" />
                <path className="mirror-trace mirror-trace-shell" pathLength="100" d="M568 238 C724 237 843 362 842 513 C841 663 720 786 567 790" />
                <path className="mirror-trace mirror-trace-back" pathLength="100" d="M740 290 C874 298 951 344 943 423" />
                <path className="mirror-trace mirror-trace-front" pathLength="100" d="M204 448 C91 548 40 639 107 707 C183 801 473 780 692 678 C848 608 935 504 943 423" />
              </g>
              <rect className="mirror-complete" width="1024" height="1024" fill="white" />
            </mask>
          </defs>
          <image href={asset("brand/mirrorsphere-v3.png")} width="1024" height="1024" mask={`url(#${id})`} onError={() => setFailed(true)} />
        </svg>
      )}
    </div>
  );
}
