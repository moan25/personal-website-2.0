import { useId, useState } from "react";
import { asset } from "../../lib/content.js";
import { between } from "../../lib/opening-timeline.js";

// Reveal guides, NOT artwork. Every visible pixel comes from the original PNG.
// Fully white final mask preserves all original alpha, proportions and gaps.
const guides = [
  [0, 0.60, 48, "M516 232 C345 231 205 355 207 510 C209 668 342 792 510 791"],
  [0.10, 0.70, 48, "M568 238 C724 237 843 362 842 513 C841 663 720 786 567 790"],
  [0.24, 0.72, 28, "M536 274 L536 765"],
  [0.38, 0.82, 46, "M507 344 L338 511 L507 679"],
  [0.44, 0.87, 46, "M565 344 L725 511 L565 679"],
  [0.53, 0.88, 44, "M740 290 C874 298 951 344 943 423"],
  [0.54, 1, 48, "M204 448 C91 548 40 639 107 707 C183 801 473 780 692 678 C848 608 935 504 943 423"],
];

export default function MirrorSphereMark({ progress = 1, className = "" }) {
  const id = `ms-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="ms-mark-fallback">镜界 / MirrorSphere</span>;
  return <svg className={`ms-mark ${className}`} viewBox="40 190 940 650" role="img" aria-label="镜界 MirrorSphere 原始图标">
    <defs><mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024" style={{ maskType: "luminance" }}>
      <g fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round">
        {guides.map(([start, end, width, d], i) => <path key={i} d={d} pathLength="100" strokeWidth={width} strokeDasharray="100 100" strokeDashoffset={100 * (1 - between(progress, start, end))} opacity={progress > start ? 1 : 0} />)}
      </g>
      <rect width="1024" height="1024" fill="white" opacity={between(progress, 0.97, 1)} />
    </mask></defs>
    <image href={asset("brand/mirrorsphere-v3.png")} width="1024" height="1024" style={{ filter: "brightness(0)" }} mask={`url(#${id})`} onError={() => setFailed(true)} />
  </svg>;
}
