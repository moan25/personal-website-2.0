import { brandTrack, companyTrack, track } from "../vendor/rhinelab/boot-tracks";
import { bootLogoTrack } from "../vendor/rhinelab/boot-logo-tracks";

// Upstream PV starts on the white frame at 6.76s; measured tracks use 25fps.
export const PV_START = 6.76;
export const OPENING_DURATION = 20760;
export const clamp = (n) => Math.max(0, Math.min(1, n));
export const ease = (n) => { const p = clamp(n); return p * p * (3 - 2 * p); };
export const between = (t, a, b) => ease((t - a) / (b - a));
const envelope = (t, a, b, c, d) => between(t, a, b) * (1 - between(t, c, d));

export function openingFrame(elapsed, reduced = false) {
  const t = reduced ? 25.65 : elapsed / 1000 + PV_START;
  const frame = t * 25, logo = bootLogoTrack(frame);
  const exit = between(t, 26.56, 26.92);
  return {
    t, frame,
    phase: reduced ? "still" : t < 9.12 ? "access" : t < 11.12 ? "logo" : t < 19.48 ? "auth" : t < 22.76 ? "scan" : t < 26.16 ? "welcome" : "exit",
    access: envelope(t, 6.76, 6.94, 9.02, 9.24),
    accessDraw: between(frame, 170, 189),
    logoOpacity: envelope(t, 9.12, 9.28, 19.34, 19.64),
    // Only draw acceleration and displacement are reused, not infinity geometry
    // or its later moving cut (which would change the supplied user's mark).
    logoDraw: clamp(logo.length / 0.9725),
    logoMove: clamp((294 - logo.offsetX) / 296),
    wordmark: between(frame, 238, 264),
    corner: [0, 1, 2].map((i) => brandTrack(frame, i)),
    signature: between(frame, 279, 295),
    auth: [
      { text: "ARCHIVE IDENTIFIED : MOAN", opacity: envelope(frame, 282, 288, 360, 365), draw: between(frame, 282, 339) },
      { text: "REQUEST RECEIVED", opacity: envelope(frame, 363, 369, 419, 425), draw: between(frame, 367, 390) },
      { text: "START PROCESSING…", opacity: envelope(frame, 421, 427, 483, 488), draw: between(frame, 423, 450) },
    ],
    scan: envelope(t, 19.48, 19.76, 22.66, 22.94),
    permission: envelope(t, 19.48, 19.88, 21.8, 22.08),
    scanTracking: track([[487, 40], [492, 28], [497, 18], [500, 14], [505, 8], [510, 4], [515, 1.7], [520, 0.5], [527, 0], [568, 0]], frame),
    welcome: between(t, 22.76, 23.0) * (1 - exit ** 3),
    welcomeScale: 1 - 0.46 * exit,
    welcomeBlur: 8 * exit,
    welcomeDraw: between(frame, 569, 585),
    company: between(frame, 585, 591),
    highlight: companyTrack(frame),
    welcomeLogo: between(frame, 588, 600),
    database: between(frame, 626, 633),
    curtain: between(t, 26.16, 26.88),
    open: between(t, 26.88, 27.52),
  };
}

export function arc(radius, start, sweep, x = 960, y = 540) {
  if (radius <= 0 || sweep <= 0) return "M0 0";
  const point = (a) => `${x + Math.cos(a) * radius} ${y + Math.sin(a) * radius}`;
  if (sweep >= Math.PI * 1.999) return `M${point(start)}A${radius} ${radius} 0 1 1 ${point(start + Math.PI)}A${radius} ${radius} 0 1 1 ${point(start + Math.PI * 2)}`;
  return `M${point(start)}A${radius} ${radius} 0 ${sweep > Math.PI ? 1 : 0} 1 ${point(start + sweep)}`;
}
