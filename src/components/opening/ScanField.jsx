import { scanTrack, track } from "../../vendor/rhinelab/boot-tracks";
import { scanOrbitTrack } from "../../vendor/rhinelab/boot-orbit-tracks";
import { arc, between } from "../../lib/opening-timeline.js";

export default function ScanField({ frame }) {
  const s = scanTrack(frame), orbit = scanOrbitTrack(frame);
  const cap = (r, a, size, white, key) => <circle key={key} cx={960 + Math.cos(a) * r} cy={540 + Math.sin(a) * r} r={size} fill={white ? "#f7f5f0" : "#090a08"} />;
  return <svg className="ms-scan-art" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <path d={arc(s.radius, s.outerStart, s.outerSweep)} stroke="#090a08" strokeWidth="2.4" />
    <path d={arc(s.whiteRadius, s.whiteStart, s.whiteSweep)} stroke="#f7f5f0" strokeWidth="4" />
    {[0, Math.PI].map((a) => <path key={a} d={arc(s.innerRadius, s.innerStart + a, s.innerSweep)} stroke="#090a08" strokeWidth="2.4" />)}
    {orbit.sides.map((side, i) => <path key={i} d={arc(side.radius, side.start, side.sweep, side.x, side.y)} stroke="#090a08" strokeWidth="2.4" opacity={between(frame, 543, 546)} />)}
    {orbit.satellites.map((dot, i) => <circle key={i} cx={dot.x} cy={dot.y} r={dot.radius} fill="#090a08" />)}
    <circle cx="959.5" cy="539.5" r={track([[545, 0], [548, 7.96], [551, 9.89], [559, 11.45], [568, 11.27]], frame)} fill="#090a08" />
    {[0, Math.PI].map((a, i) => cap(s.orbitRadius, s.orbit + a, s.dotRadius, false, `orbit-${i}`))}
    {cap(s.radius, s.outerStart + s.outerSweep, s.blackCap, false, "cap-black")}
    {cap(s.whiteRadius, s.whiteStart, s.whiteCap, true, "cap-white")}
  </svg>;
}
