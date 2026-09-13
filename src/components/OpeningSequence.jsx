import { useEffect, useId, useRef } from "react";
import MirrorSphereMark from "./MirrorSphereMark.jsx";
import "../opening.css";

export const OPENING_SESSION_KEY = "mirrorsphere-opening-v3.1";

export function shouldPlayOpening(reduced) {
  if (reduced || (location.hash && location.hash !== "#/")) return false;
  try {
    return sessionStorage.getItem(OPENING_SESSION_KEY) !== "seen";
  } catch {
    return true;
  }
}

// One finite timeline. CSS and the completion timer share this duration.
const DURATION = 5200;

export default function OpeningSequence({ projects, reduced, onReveal, onFinish }) {
  const dialog = useRef(null),
    skip = useRef(null),
    callbacks = useRef({ onReveal, onFinish }),
    completed = useRef(false),
    titleId = useId();
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
      // Private or restricted storage must never prevent entry.
    }
    const cancel = (event) => {
      event.preventDefault();
      finish();
    };
    node.addEventListener("cancel", cancel);
    // Warm the actual archive before the shutters reveal it.
    const reveal = setTimeout(() => callbacks.current.onReveal(), reduced ? 0 : DURATION * 0.6);
    const end = reduced ? null : setTimeout(finish, DURATION);
    return () => {
      clearTimeout(reveal);
      clearTimeout(end);
      node.removeEventListener("cancel", cancel);
      node.close();
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
          // One control: keep keyboard focus in the opening, including Shift+Tab.
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
      <h2 id={titleId} className="sr-only">镜界 MirrorSphere 品牌开场</h2>
      <div className="opening-shutter opening-shutter-left" aria-hidden="true" />
      <div className="opening-shutter opening-shutter-right" aria-hidden="true" />
      <div className="opening-topline">
        <span className="opening-label">MIRRORSPHERE <span>/ PERSONAL ARCHIVE</span></span>
        <button ref={skip} className="opening-skip" onClick={finish}>
          {reduced ? "进入档案" : "跳过开场"} <span aria-hidden="true">↗</span>
          <kbd aria-hidden="true">ESC</kbd>
        </button>
      </div>
      <div className="opening-composition" aria-hidden="true">
        <div className="mirror-signature">
          <MirrorSphereMark />
          <div className="mirror-wordmark">
            <div className="mirror-name">镜界</div>
            <div className="mirror-english">MirrorSphere</div>
            <div className="mirror-caption">从感知，到行动。</div>
          </div>
        </div>
      </div>
      <div className="opening-bottomline">
        <p>个人项目 · 资料选编</p>
        <p><span>{String(projects.length).padStart(2, "0")}</span> 份项目 <i>/</i> <span>{String(mediaCount).padStart(2, "0")}</span> 条影像</p>
      </div>
    </dialog>
  );
}
