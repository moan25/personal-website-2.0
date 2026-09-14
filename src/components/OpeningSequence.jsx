import { useEffect, useId, useRef } from "react";
import "../opening.css";

export const OPENING_SESSION_KEY = "rhinelab-opening-v1";

export function shouldPlayOpening(reduced) {
  if (reduced || (location.hash && location.hash !== "#/")) return false;
  try {
    return sessionStorage.getItem(OPENING_SESSION_KEY) !== "seen";
  } catch {
    return true;
  }
}

// Same access → logo → auth → scan → welcome rhythm as RhineLabUI, shortened
// for a portfolio entry while keeping the original visual language intact.
const DURATION = 14800;

export default function OpeningSequence({ projects, reduced, onReveal, onFinish }) {
  const dialog = useRef(null);
  const skip = useRef(null);
  const callbacks = useRef({ onReveal, onFinish });
  const completed = useRef(false);
  const titleId = useId();
  callbacks.current = { onReveal, onFinish };

  function finish() {
    if (completed.current) return;
    completed.current = true;
    callbacks.current.onFinish();
  }

  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    completed.current = false;
    node.showModal();
    skip.current?.focus({ preventScroll: true });
    try {
      sessionStorage.setItem(OPENING_SESSION_KEY, "seen");
    } catch {
      // Storage restrictions must never block the archive.
    }
    const cancel = (event) => {
      event.preventDefault();
      finish();
    };
    node.addEventListener("cancel", cancel);
    const reveal = setTimeout(
      () => callbacks.current.onReveal(),
      reduced ? 0 : DURATION * 0.69,
    );
    const end = reduced ? null : setTimeout(finish, DURATION);
    return () => {
      clearTimeout(reveal);
      clearTimeout(end);
      node.removeEventListener("cancel", cancel);
      if (node.open) node.close();
      document.body.style.overflow = overflow;
      const target = previous?.isConnected && previous !== document.body
        ? previous
        : document.getElementById("main-content");
      target?.focus({ preventScroll: true });
    };
  }, [reduced]);

  const mediaCount = projects.reduce((sum, project) => sum + project.media.length, 0);
  return (
    <dialog
      ref={dialog}
      className="opening"
      data-still={reduced ? "true" : undefined}
      aria-labelledby={titleId}
      style={{ "--opening-duration": `${DURATION}ms` }}
      onKeyDown={(event) => {
        if (event.key === "Tab") {
          event.preventDefault();
          skip.current?.focus({ preventScroll: true });
        }
        if (event.key === "Enter" || event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          finish();
        }
      }}
    >
      <h2 id={titleId} className="sr-only">Rhine Lab interface boot sequence</h2>
      <div className="opening-shutter opening-shutter-left" aria-hidden="true" />
      <div className="opening-shutter opening-shutter-right" aria-hidden="true" />

      <div className="opening-topline">
        <span className="opening-label">RHINE·LAB <span>/ INTERNAL DATABASE</span></span>
        <button ref={skip} className="opening-skip" onClick={finish}>
          {reduced ? "ENTER ARCHIVE" : "SKIP INTRO"} <span aria-hidden="true">↗</span>
          <kbd aria-hidden="true">ESC</kbd>
        </button>
      </div>

      <div className="rhinelab-boot" aria-hidden="true">
        <div className="boot-grid" />
        <span className="boot-cross boot-cross-x" />
        <span className="boot-cross boot-cross-y" />
        <p className="boot-coordinate boot-coordinate-top">SYSTEM / 00.01.02</p>
        <p className="boot-coordinate boot-coordinate-bottom">SYNCING ARCHIVE FIELD</p>

        <div className="boot-access">
          <span className="boot-access-line">ACCESS PERMISSION REQUIRED</span>
          <span className="boot-access-rule" />
          <span className="boot-access-subline">REQUEST RECEIVED <i>· · ·</i></span>
        </div>

        <div className="boot-logo-stage">
          <svg className="boot-logo" viewBox="0 0 310 185" fill="none">
            <path
              className="boot-logo-contour"
              d="M295 73C295 41 273 15 240 15C221 15 207 23 192 38C186 43 181 47 176 52C127 96 103 128 70 128C38 128 15 101 15 70C15 39 37 15 70 15C103 15 127 48 156 75C182 99 208 128 240 128C273 128 295 105 295 73Z"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <path className="boot-logo-symbol boot-logo-plus" d="M44 70h50M69 45v50" stroke="currentColor" strokeWidth="2" />
            <path className="boot-logo-symbol boot-logo-minus" d="M219 70h44" stroke="currentColor" strokeWidth="2" />
            <text x="155" y="174" textAnchor="middle" className="boot-logo-wordmark">RHINE·LAB</text>
          </svg>
          <span className="boot-logo-caption">SYNTHESIZE INFORMATION</span>
        </div>

        <div className="boot-auth">
          <p className="boot-auth-heading">ID CONFIRMED <span>:</span> <strong>JOYCE MOORE</strong></p>
          <p>REQUEST RECEIVED <span className="boot-blink">· · ·</span></p>
          <p>START PROCESSING...</p>
          <div className="boot-progress"><span /></div>
        </div>

        <div className="boot-scan">
          <svg viewBox="0 0 720 720" className="boot-scan-art" fill="none">
            <circle className="boot-ring boot-ring-outer" cx="360" cy="360" r="318" />
            <circle className="boot-ring boot-ring-white" cx="360" cy="360" r="250" />
            <circle className="boot-ring boot-ring-inner" cx="360" cy="360" r="168" />
            <path className="boot-scan-arc" d="M360 75a285 285 0 0 1 250 147" />
            <path className="boot-scan-arc boot-scan-arc-second" d="M110 498a285 285 0 0 1 0-276" />
            <circle className="boot-dot" cx="360" cy="42" r="7" />
            <circle className="boot-dot boot-dot-second" cx="642" cy="360" r="7" />
            <path className="boot-scan-sweep" d="M360 360L360 36" />
          </svg>
          <span className="boot-scan-label">SCANNING PROJECT FIELD</span>
          <span className="boot-scan-status">{String(projects.length).padStart(2, "0")} PROJECTS / {String(mediaCount).padStart(2, "0")} RECORDS</span>
        </div>

        <div className="boot-welcome">
          <span className="boot-welcome-kicker">PERMISSION AUTHORIZED</span>
          <strong>WELCOME TO</strong>
          <span className="boot-welcome-company">INTERNAL DATABASE</span>
          <span className="boot-welcome-company boot-welcome-company-small">RHINE LAB.LLC.</span>
          <span className="boot-welcome-line" />
          <span className="boot-welcome-database">SELECTED PROJECT ARCHIVE</span>
        </div>
      </div>

      <div className="opening-bottomline">
        <p>PROJECT ARCHIVE · EST. 2026</p>
        <p><span>{String(projects.length).padStart(2, "0")}</span> PROJECTS <i>/</i> <span>{String(mediaCount).padStart(2, "0")}</span> RECORDS</p>
      </div>
    </dialog>
  );
}
