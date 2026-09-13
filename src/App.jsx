import { useEffect, useRef, useState } from "react";
import ArchiveScene from "./components/ArchiveScene.jsx";
import OpeningSequence, { shouldPlayOpening } from "./components/OpeningSequence.jsx";
import Modal from "./components/Modal.jsx";
import Search from "./components/Search.jsx";
import { MediaViewer } from "./components/Media.jsx";
import ProjectDocument from "./pages/ProjectDocument.jsx";
import MediaLibrary from "./pages/MediaLibrary.jsx";
import About from "./pages/About.jsx";
import { loadContent, readLocal, writeLocal, wrap } from "./lib/content.js";
function parseRoute() {
  const path = location.hash.slice(1) || "/";
  if (path === "/") return { view: "home" };
  if (path === "/media") return { view: "media" };
  if (path === "/about") return { view: "about" };
  const m = path.match(/^\/project\/([a-z0-9-]+)$/);
  return m ? { view: "project", slug: m[1] } : { view: "404" };
}
export default function App() {
  const [projects, setProjects] = useState(null),
    [error, setError] = useState("");
  const reload = () => {
    setError("");
    loadContent()
      .then(setProjects)
      .catch((e) => setError(e.message));
  };
  useEffect(reload, []);
  if (error)
    return (
      <main className="error-page">
        <p className="eyebrow">FIELDNOTES / CONNECTION</p>
        <h1>档案暂时无法打开</h1>
        <p>{error}</p>
        <button className="solid" onClick={reload}>
          重新载入
        </button>
      </main>
    );
  if (!projects)
    return (
      <main className="error-page" role="status">
        <span className="loader" />
        <h1>正在打开项目档案</h1>
      </main>
    );
  return <Workbench projects={projects} />;
}
function Workbench({ projects }) {
  const [route, setRoute] = useState(parseRoute),
    [lane, setLane] = useState(() =>
      Math.max(
        0,
        projects.findIndex((p) => p.slug === parseRoute().slug),
      ),
    ),
    [rows, setRows] = useState({});
  const [modal, setModal] = useState(null),
    [toast, setToast] = useState(""),
    [saved, setSaved] = useState(() => {
      const s = readLocal("fieldnotes-saved", []);
      return Array.isArray(s) ? s.filter((v) => typeof v === "string") : [];
    });
  const [prefs, setPrefs] = useState(() => ({
    ...{ theme: "light", reduced: false },
    ...readLocal("fieldnotes-prefs", {}),
  }));
  const [sysReduced, setSysReduced] = useState(
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [boot, setBoot] = useState(() => shouldPlayOpening(prefs.reduced || sysReduced)),
    [bootRevealing, setBootRevealing] = useState(false);
  const reduced = prefs.reduced || sysReduced,
    detail = route.view === "project",
    isArchive = route.view === "home" || detail;
  const laneRef = useRef(lane),
    main = useRef(null);
  laneRef.current = lane;
  useEffect(() => {
    const h = () => {
      const r = parseRoute();
      setRoute(r);
      setModal(null);
      if (r.view !== "home") setBoot(false);
      const i = projects.findIndex((p) => p.slug === r.slug);
      if (i >= 0) setLane(i);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, [projects]);
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)");
    const h = (e) => setSysReduced(e.matches);
    q.addEventListener("change", h);
    return () => q.removeEventListener("change", h);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme;
    document.documentElement.dataset.reduced = reduced;
    writeLocal("fieldnotes-prefs", prefs);
  }, [prefs, reduced]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    document.title = `${detail ? projects[lane].title : route.view === "media" ? "影像记录" : route.view === "about" ? "关于项目档案" : "项目档案"} · FIELDNOTES`;
    if (route.view !== "home") main.current?.focus({ preventScroll: true });
  }, [route, lane]);
  function select(axis, value) {
    if (axis === "lane") setLane((v) => wrap(v + value, projects.length));
    else if (axis === "row")
      setRows((v) => ({
        ...v,
        [laneRef.current]: wrap(
          (v[laneRef.current] ?? 0) + value,
          projects[laneRef.current].media.length,
        ),
      }));
    else {
      setLane(value.lane);
      setRows((v) => ({ ...v, [value.lane]: value.row }));
    }
  }
  function goProject(slug) {
    setModal(null);
    location.hash = `/project/${slug}`;
  }
  function openMedia(items, start = 0) {
    setModal({ type: "media", items, start });
  }
  useEffect(() => {
    function keys(e) {
      if (
        modal ||
        boot ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.target.closest("input,select,textarea,video,[contenteditable=true]")
      )
        return;
      if (e.key === "/") {
        e.preventDefault();
        setModal({ type: "search" });
      }
      if (e.key === "Escape" && detail) {
        location.hash = "/";
      }
      if (route.view !== "home") return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        select(
          ["ArrowLeft", "ArrowRight"].includes(e.key) ? "lane" : "row",
          ["ArrowLeft", "ArrowUp"].includes(e.key) ? -1 : 1,
        );
      }
      if (e.key === "Enter" && !e.target.closest("button,a"))
        goProject(projects[lane].slug);
    }
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [modal, boot, route, lane, detail]);
  function bookmark() {
    const slug = projects[lane].slug;
    const next = saved.includes(slug)
      ? saved.filter((s) => s !== slug)
      : [...saved, slug];
    setSaved(next);
    const ok = writeLocal("fieldnotes-saved", next);
    setToast(
      ok
        ? next.includes(slug)
          ? "已收藏到本设备"
          : "已取消收藏"
        : "浏览器不允许保存，本次浏览仍可使用收藏",
    );
  }
  function exportProject() {
    const p = projects[lane];
    const txt = `${p.title}\n${p.subtitle}\n\n${p.summary}\n\n项目背景\n${p.background}\n\n核心功能\n${p.features.map((f) => `${f.title}\n${f.text}`).join("\n\n")}\n\n技术栈\n${p.stack.join(" / ")}\n\n验证范围\n${p.scope}\n`;
    const blob = new Blob(["\ufeff", txt], {
        type: "text/plain;charset=utf-8",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `${p.slug}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setToast("项目简介已导出");
  }
  const p = projects[lane],
    row = rows[lane] ?? 0,
    m = p.media[row];
  const missing =
    route.view === "404" ||
    (detail && !projects.some((x) => x.slug === route.slug));
  return (
    <div
      className={`app ${detail ? "is-detail" : ""} ${!isArchive ? "is-page" : ""}`}
    >
      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        跳到主要内容
      </a>
      {isArchive && !missing && (
        <ArchiveScene
          {...{ projects, lane, row, detail, reduced, theme: prefs.theme }}
          active={isArchive && !modal && (!boot || bootRevealing) && !missing}
          onSelect={select}
          onOpen={() => (detail ? openMedia(p.media, row) : goProject(p.slug))}
        />
      )}
      <header className="header">
        <a className="brand" href="#/" title="项目档案首页">
          <strong>
            FIELDNOTES<span aria-hidden="true">↗</span>
          </strong>
          <span>PERSONAL PROJECT ARCHIVE</span>
          <small>
            项目档案 <b>2.0</b>
          </small>
        </a>
        <nav aria-label="主导航">
          <button onClick={() => setModal({ type: "search" })}>
            检索档案 <kbd>/</kbd>
          </button>
          <a
            href="#/media"
            aria-current={route.view === "media" ? "page" : undefined}
          >
            影像
          </a>
          <a
            href="#/about"
            aria-current={route.view === "about" ? "page" : undefined}
          >
            关于
          </a>
          <button
            onClick={() => setModal({ type: "saved" })}
            title="查看本设备收藏项目"
          >
            ＋ 收藏{" "}
            <span className="nav-count">
              {String(
                saved.filter((s) => projects.some((p) => p.slug === s)).length,
              ).padStart(2, "0")}
            </span>
          </button>
          <button
            className="settings-button"
            onClick={() => setModal({ type: "settings" })}
            aria-label="设置"
          >
            ◷ <span>设置</span>
          </button>
        </nav>
      </header>
      <div ref={main} id="main-content" tabIndex={-1}>
        {missing ? (
          <main className="page empty">
            <h1>没有找到这份档案</h1>
            <p>项目可能已更新，返回总览查看现有项目。</p>
            <a className="text-button" href="#/">
              返回项目总览 ↗
            </a>
          </main>
        ) : route.view === "home" ? (
          <main className="overview">
            <section className="callout" key={p.slug}>
              <p className="eyebrow">
                PROJECT {p.code || String(lane + 1).padStart(2, "0")} /{" "}
                {p.category}
              </p>
              <h1>{p.title}</h1>
              <div className="callout-rule" />
              <p className="summary">{p.summary}</p>
              <span className="status">{p.status}</span>
              <ul className="overview-tags">
                {p.stack.slice(0, 4).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <a className="access" href={`#/project/${p.slug}`}>
                读取项目档案 <span>↗</span>
              </a>
            </section>
            <div className="selected-media">
              <span className="eyebrow">SELECTED RECORD</span>
              <strong>{m.title}</strong>
              <button
                className="text-button"
                onClick={() => openMedia(p.media, row)}
              >
                {m.type === "video" ? "▷ 查看视频" : "↗ 查看图片"}
              </button>
            </div>
            <div className="archive-controls">
              <div className="counter">
                <span className="eyebrow">MEDIA / SELECT</span>
                <div aria-live="polite">
                  {String(row + 1).padStart(2, "0")}
                  <small>/ {String(p.media.length).padStart(2, "0")}</small>
                </div>
              </div>
              <div className="axis-controls">
                <button
                  aria-label="上一条影像"
                  onClick={() => select("row", -1)}
                >
                  ↑
                </button>
                <span>{m.title}</span>
                <button
                  aria-label="下一条影像"
                  onClick={() => select("row", 1)}
                >
                  ↓
                </button>
              </div>
              <div className="axis-controls">
                <button
                  aria-label="上一项目"
                  onClick={() => select("lane", -1)}
                >
                  ←
                </button>
                <span>
                  <small>
                    PROJECT {String(lane + 1).padStart(2, "0")} /{" "}
                    {String(projects.length).padStart(2, "0")}
                  </small>
                  {p.category}
                </span>
                <button aria-label="下一项目" onClick={() => select("lane", 1)}>
                  →
                </button>
              </div>
            </div>
          </main>
        ) : detail ? (
          <main className="detail">
            <div className="object-actions">
              <a className="text-button" href="#/">
                ← 返回项目总览 <small>ESC</small>
              </a>
              <div>
                <p className="eyebrow">
                  {m.type === "video" ? "VIDEO RECORD" : "IMAGE RECORD"} /{" "}
                  {p.code}
                </p>
                <h2>{m.title}</h2>
                <button
                  className="solid"
                  onClick={() => openMedia(p.media, row)}
                >
                  {m.type === "video" ? "▷ 打开演示视频" : "↗ 查看高清图片"}
                </button>
                <p className="object-hint">拖动旋转档案 · 滚轮调整距离</p>
                <button
                  className="text-button"
                  onClick={() =>
                    window.dispatchEvent(new Event("archive-reset"))
                  }
                >
                  复位档案视角 ↻
                </button>
                <div className="object-navigation">
                  <button
                    onClick={() => select("row", -1)}
                    aria-label="上一条影像"
                  >
                    ←
                  </button>
                  <span>
                    {row + 1} / {p.media.length}
                  </span>
                  <button
                    onClick={() => select("row", 1)}
                    aria-label="下一条影像"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
            <ProjectDocument
              project={p}
              saved={saved.includes(p.slug)}
              onSave={bookmark}
              onExport={exportProject}
              onMedia={openMedia}
              onNext={() =>
                goProject(projects[wrap(lane + 1, projects.length)].slug)
              }
            />
          </main>
        ) : route.view === "media" ? (
          <MediaLibrary projects={projects} onMedia={openMedia} />
        ) : (
          <About projects={projects} />
        )}
      </div>
      <footer className="footer">
        <span>个人项目 · 资料选编</span>
        <span>
          {isArchive
            ? "← → 切换项目 / ↑ ↓ 切换影像"
            : "真实影像 · 明确验证边界"}
        </span>
        <button
          onClick={() => {
            setBootRevealing(false);
            setBoot(true);
            if (route.view !== "home") location.hash = "/";
            setModal(null);
          }}
        >
          重播开场 ↗
        </button>
      </footer>
      {modal?.type === "media" && (
        <MediaViewer
          key={modal.items[modal.start].id}
          items={modal.items}
          start={modal.start}
          onClose={() => setModal(null)}
        />
      )}
      {["search", "saved"].includes(modal?.type) && (
        <Modal
          title={modal.type === "saved" ? "已收藏的项目" : "项目索引"}
          onClose={() => setModal(null)}
        >
          <Search
            projects={projects}
            saved={saved}
            bookmarks={modal.type === "saved"}
            onProject={goProject}
          />
        </Modal>
      )}
      {modal?.type === "settings" && (
        <Modal title="浏览设置" onClose={() => setModal(null)}>
          <div className="settings">
            <label>
              界面主题
              <select
                value={prefs.theme}
                onChange={(e) =>
                  setPrefs((v) => ({ ...v, theme: e.target.value }))
                }
              >
                <option value="light">浅色 · 档案室</option>
                <option value="dark">深色 · 夜间</option>
              </select>
            </label>
            <label>
              <span>
                减少动态效果
                <small>
                  {sysReduced
                    ? "系统已开启减少动态效果"
                    : "关闭阵列波动与界面过渡"}
                </small>
              </span>
              <input
                type="checkbox"
                checked={reduced}
                disabled={sysReduced}
                onChange={(e) =>
                  setPrefs((v) => ({ ...v, reduced: e.target.checked }))
                }
              />
            </label>
            <button
              className="text-button"
              onClick={async () => {
                try {
                  if (document.fullscreenElement)
                    await document.exitFullscreen();
                  else await document.documentElement.requestFullscreen();
                } catch {
                  setToast("此浏览器不支持页面全屏");
                }
              }}
            >
              切换页面全屏 ↗
            </button>
            <p>
              设置与收藏只保存在此浏览器，不会上传。视频默认不自动下载或播放。
            </p>
            <a
              href="./licenses/RhineLabUI-MIT.txt"
              className="text-button"
              target="_blank"
              rel="noreferrer"
            >
              开源代码许可 ↗
            </a>
          </div>
        </Modal>
      )}
      {boot && (
        <OpeningSequence
          projects={projects}
          reduced={reduced}
          onReveal={() => setBootRevealing(true)}
          onFinish={() => setBoot(false)}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
