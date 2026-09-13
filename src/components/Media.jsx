import { useEffect, useRef, useState } from "react";
import { asset, imageProps, wrap } from "../lib/content.js";
import Modal from "./Modal.jsx";
export function SafeImage({ media, full = false, ...props }) {
  const [failure, setFailure] = useState("");
  if (failure === media.src)
    return (
      <span className="media-error" role="status">
        图像暂时无法载入<span>可关闭预览后重试，或查看其他影像。</span>
      </span>
    );
  return (
    <img
      {...(full ? { src: asset(media.full || media.src) } : imageProps(media))}
      loading={full ? "eager" : "lazy"}
      decoding="async"
      alt={media.alt || media.title}
      width={media.width}
      height={media.height}
      onError={() => setFailure(media.src)}
      {...props}
    />
  );
}
export function VideoPlayer({ media }) {
  const [started, setStarted] = useState(false),
    [status, setStatus] = useState(""),
    [error, setError] = useState(false);
  const video = useRef(null);
  useEffect(() => {
    if (started && !error)
      video.current?.play().catch(() => setStatus("点击播放控件开始播放"));
  }, [started, error]);
  const reset = () => {
    setError(false);
    setStarted(false);
    setStatus("");
  };
  if (error)
    return (
      <div className="media-error" role="alert">
        <strong>视频暂时无法播放</strong>
        <span>请检查网络，或使用支持 H.264 的浏览器。</span>
        <button className="solid" onClick={reset}>
          重新载入
        </button>
        <a className="text-button" href={asset(media.src)} download>
          下载视频文件 ↓
        </a>
      </div>
    );
  return (
    <div
      className="video-player"
      style={{ aspectRatio: media.aspectRatio || "16 / 9" }}
    >
      {!started ? (
        <button
          className="video-start"
          onClick={() => {
            setStarted(true);
            setStatus("正在加载视频…");
          }}
          aria-label={`播放视频：${media.title}`}
        >
          <img src={asset(media.poster)} alt="" />
          <span className="play-symbol" aria-hidden="true">
            ▷
          </span>
          <span className="play-label">
            点击播放 <small>{media.resolution || ""}</small>
          </span>
        </button>
      ) : (
        <>
          <video
            ref={video}
            src={asset(media.src)}
            poster={asset(media.poster)}
            controls
            playsInline
            preload="none"
            onError={() => setError(true)}
            onWaiting={() => setStatus("正在缓冲…")}
            onCanPlay={() => setStatus("")}
            onPlaying={() => setStatus("")}
            aria-label={media.title}
          />
          {status && (
            <span className="video-status" role="status">
              {status}
            </span>
          )}
        </>
      )}
    </div>
  );
}
export function MediaTile({ media, onOpen, projectTitle }) {
  const thumb =
    media.type === "video"
      ? {
          src: media.poster,
          variants: media.posterVariants,
          title: media.title,
        }
      : media;
  return (
    <button
      className="media-tile"
      onClick={onOpen}
      aria-label={`${media.type === "video" ? "查看视频" : "查看图片"}：${media.title}`}
    >
      <div
        className={`media-thumb ${media.fit === "contain" ? "fit-contain" : ""}`}
      >
        <SafeImage media={thumb} />
        <span className="media-kind">
          {media.type === "video" ? "▷ 视频" : "↗ 图片"}
        </span>
      </div>
      <span className="tile-meta">
        <strong>{media.title}</strong>
        <small>
          {projectTitle ||
            media.resolution ||
            (media.width ? `${media.width} × ${media.height}` : "原始资料")}
        </small>
      </span>
    </button>
  );
}
export function MediaViewer({ items, start = 0, onClose }) {
  const [index, setIndex] = useState(start),
    [zoom, setZoom] = useState(false);
  const gesture = useRef(null);
  const media = items[index];
  const move = (d) => {
    setZoom(false);
    setIndex((v) => wrap(v + d, items.length));
  };
  return (
    <Modal
      title={media.title}
      className="media-modal"
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.target.closest("video,input")) return;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          move(-1);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          move(1);
        }
      }}
    >
      <div
        className={`viewer-body ${zoom ? "zoomed" : ""}`}
        onTouchStart={(e) => {
          if (e.touches.length === 1)
            gesture.current = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
            };
          else gesture.current = null;
        }}
        onTouchEnd={(e) => {
          if (!gesture.current || zoom || e.target.closest("video")) return;
          const dx = e.changedTouches[0].clientX - gesture.current.x,
            dy = e.changedTouches[0].clientY - gesture.current.y;
          gesture.current = null;
          if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5)
            move(dx < 0 ? 1 : -1);
        }}
        key={media.id}
      >
        {media.type === "video" ? (
          <VideoPlayer media={media} />
        ) : (
          <SafeImage media={media} full />
        )}
      </div>
      <div className="viewer-caption">
        <p>{media.caption}</p>
        <div className="viewer-controls">
          <button onClick={() => move(-1)} aria-label="上一条媒体">
            ←
          </button>
          <span aria-live="polite">
            {index + 1} / {items.length}
          </span>
          <button onClick={() => move(1)} aria-label="下一条媒体">
            →
          </button>
          {media.type === "image" && (
            <button onClick={() => setZoom((v) => !v)} aria-pressed={zoom}>
              {zoom ? "适合窗口" : "原始尺寸"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
