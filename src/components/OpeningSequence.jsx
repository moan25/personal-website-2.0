import { useEffect, useId, useRef, useState } from "react";
import { OPENING_DURATION, openingFrame } from "../lib/opening-timeline.js";
import DrawText from "./opening/DrawText.jsx";
import MirrorSphereMark from "./opening/MirrorSphereMark.jsx";
import ScanField from "./opening/ScanField.jsx";
import "../opening.css";

// Versioned so visitors who saw the superseded opener see this replacement.
export const OPENING_SESSION_KEY = "mirrorsphere-opening-v2";
export function shouldPlayOpening(reduced) {
  if (reduced || (location.hash && location.hash !== "#/")) return false;
  try { return sessionStorage.getItem(OPENING_SESSION_KEY) !== "seen"; }
  catch { return true; }
}

export default function OpeningSequence({ reduced, onReveal, onFinish }) {
  const dialog = useRef(null), skip = useRef(null), callbacks = useRef({ onReveal, onFinish });
  const completed = useRef(false), closing = useRef(false), exitTimer = useRef(null);
  const [elapsed, setElapsed] = useState(0), [skipping, setSkipping] = useState(false);
  const titleId = useId();
  callbacks.current = { onReveal, onFinish };
  const s = openingFrame(elapsed, reduced);

  function finish() {
    if (completed.current) return;
    completed.current = true;
    callbacks.current.onFinish();
  }
  function requestExit() {
    if (closing.current || completed.current) return;
    closing.current = true;
    callbacks.current.onReveal();
    if (reduced) { finish(); return; }
    setSkipping(true);
    exitTimer.current = setTimeout(finish, 220);
  }

  useEffect(() => {
    const node = dialog.current, previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    completed.current = false;
    closing.current = false;
    setSkipping(false);
    node.showModal();
    skip.current?.focus({ preventScroll: true });
    try { sessionStorage.setItem(OPENING_SESSION_KEY, "seen"); } catch { /* optional storage */ }
    const cancel = (event) => { event.preventDefault(); requestExit(); };
    node.addEventListener("cancel", cancel);
    // The mounted app prewarms its archive scene underneath the sequence.
    // The sequence never waits for media downloads or an external service.
    callbacks.current.onReveal();
    let raf, deadline;
    const start = performance.now();
    const tick = (now) => {
      const time = Math.min(now - start, OPENING_DURATION);
      setElapsed(time);
      if (time >= OPENING_DURATION) finish();
      else raf = requestAnimationFrame(tick);
    };
    if (!reduced) {
      raf = requestAnimationFrame(tick);
      // Independent fail-safe also releases the modal if rendering is paused.
      deadline = setTimeout(finish, OPENING_DURATION + 150);
    }
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(deadline);
      clearTimeout(exitTimer.current);
      node.removeEventListener("cancel", cancel);
      if (node.open) node.close();
      document.body.style.overflow = overflow;
      const target = previous?.isConnected && previous !== document.body ? previous : document.getElementById("main-content");
      target?.focus({ preventScroll: true });
    };
  }, [reduced]);

  return <dialog ref={dialog} className={`opening ms-opening${skipping ? " ms-skipping" : ""}`} data-phase={s.phase} data-still={reduced || undefined} aria-labelledby={titleId}
    onKeyDown={(event) => {
      if (event.key === "Tab") { event.preventDefault(); skip.current?.focus({ preventScroll: true }); }
      if (event.key === "Enter" || event.key === "Escape") { event.preventDefault(); event.stopPropagation(); requestExit(); }
    }}>
    <h2 id={titleId} className="sr-only">镜界 MirrorSphere · 墨安项目档案开场</h2>
    <p className="sr-only">启动文字为视觉叙事，不会请求设备权限或验证访客身份。可随时跳过。</p>
    <div className="ms-paper" style={{ opacity: 1 - s.open }} aria-hidden="true" />
    <div className="ms-cinema" style={{ opacity: 1 - s.open }} aria-hidden="true">
      <div className="ms-corner">
        {["墨安", "SELECTED PROJECTS", "个人项目档案"].map((text, i) => <div key={text} style={{ opacity: s.corner[i].opacity, transform: `translateX(${s.corner[i].x * 0.4}px)` }}>{text}</div>)}
      </div>
      <div className="ms-access" style={{ opacity: s.access }}><DrawText text="ACCESS PERMISSION REQUIRED" progress={s.accessDraw} /><span className="ms-access-rule" style={{ transform: `scaleX(${s.accessDraw})` }} /></div>
      <div className="ms-logo-stage" style={{ opacity: s.logoOpacity, "--move": s.logoMove }}>
        <MirrorSphereMark progress={s.logoDraw} />
        <div className="ms-brand-cn"><DrawText text="镜界" progress={s.wordmark} /></div>
        <div className="ms-brand-en"><DrawText text="MirrorSphere" progress={s.wordmark} /></div>
      </div>
      <div className="ms-auth">{s.auth.map((line) => <div key={line.text} style={{ opacity: line.opacity }}><DrawText text={line.text} progress={line.draw} /><i /></div>)}</div>
      <div className="ms-scan" style={{ opacity: s.scan }}>
        {s.scan > 0 && <ScanField frame={s.frame} />}
        <span className="ms-permission" style={{ opacity: s.permission, letterSpacing: `${s.scanTracking * 0.55}px` }}>ARCHIVE READY</span>
      </div>
      <div className="ms-welcome" style={{ opacity: s.welcome, "--welcome-scale": s.welcomeScale, filter: `blur(${s.welcomeBlur}px)` }}>
        <div className="ms-welcome-heading"><DrawText text="WELCOME TO" progress={s.welcomeDraw} /></div>
        <div className="ms-welcome-company" style={{ opacity: s.company }}>
          <span>墨安 · 项目档案</span>
          <span className="ms-highlight" style={{ clipPath: `inset(0 ${100 * (1 - s.highlight)}% 0 0)` }}>墨安 · 项目档案</span>
        </div>
        <div className="ms-welcome-brand" style={{ opacity: s.welcomeLogo, transform: `translateY(${(1 - s.welcomeLogo) * 8}px)` }}>
          <MirrorSphereMark />
          <div className="ms-brand-cn">镜界</div><div className="ms-brand-en">MirrorSphere</div>
        </div>
        <span className="ms-welcome-records" style={{ opacity: s.database }}>SELECTED PROJECTS / INTERACTIVE WORKS</span>
      </div>
      <div className="ms-signature" style={{ opacity: s.signature }}>CURATED BY <b>MOAN</b><i /></div>
    </div>
    <div className="ms-curtain" aria-hidden="true" style={{ opacity: s.curtain, clipPath: `inset(0 ${s.open * 50}% 0 ${s.open * 50}%)` }} />
    <button ref={skip} className="ms-skip" onClick={requestExit}>{reduced ? "进入档案" : "跳过开场"}<span aria-hidden="true">↗</span><kbd aria-hidden="true">ESC</kbd></button>
  </dialog>;
}
