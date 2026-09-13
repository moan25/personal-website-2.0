import { useEffect, useRef, useState } from "react";
import { asset } from "../lib/content.js";

export default function ArchiveScene({
  projects,
  lane,
  row,
  detail,
  reduced,
  theme,
  active,
  onSelect,
  onOpen,
}) {
  const host = useRef(null),
    engine = useRef(null),
    props = useRef({});
  const [failed, setFailed] = useState(false);
  props.current = {
    projects,
    lane,
    row,
    detail,
    reduced,
    theme,
    active,
    onSelect,
    onOpen,
  };
  useEffect(() => {
    let cancelled = false;
    const begin = () =>
      import("../lib/archive-engine.js")
        .then(({ ArchiveEngine }) => {
          if (!cancelled)
            try {
              engine.current = new ArchiveEngine(
                host.current,
                () => props.current,
              );
            } catch {
              setFailed(true);
            }
        })
        .catch(() => setFailed(true));
    const ticket = window.requestIdleCallback
      ? window.requestIdleCallback(begin, { timeout: 1200 })
      : setTimeout(begin, 120);
    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(ticket);
      else clearTimeout(ticket);
      engine.current?.dispose();
    };
  }, [projects]);
  return (
    <div
      className={`scene ${detail ? "scene-detail" : ""}`}
      ref={host}
      aria-hidden="true"
    >
      {failed && (
        <div className="scene-fallback">
          <img src={asset(projects[lane].cover)} alt="" />
          <span>三维视图不可用，仍可使用项目与影像入口</span>
        </div>
      )}
    </div>
  );
}
