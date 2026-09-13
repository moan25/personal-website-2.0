import { useEffect, useRef, useState } from "react";
import { MediaTile } from "../components/Media.jsx";
export default function ProjectDocument({
  project: p,
  saved,
  onSave,
  onExport,
  onMedia,
  onNext,
}) {
  const [tab, setTab] = useState("overview"),
    doc = useRef(null);
  useEffect(() => {
    setTab("overview");
    doc.current?.scrollTo({ top: 0 });
  }, [p.slug]);
  const tabs = [
    ["overview", "项目概述"],
    ["system", "系统设计"],
    ["evidence", "验证范围"],
  ];
  return (
    <article className="document" ref={doc}>
      <p className="eyebrow">
        FILE {p.code || p.slug.toUpperCase()} / {p.category}
      </p>
      <h1 tabIndex={-1}>{p.title}</h1>
      <p className="document-en">{p.englishTitle}</p>
      <div className="project-meta">
        <div>
          <span className="eyebrow">TYPE / 项目方向</span>
          <strong>{p.category}</strong>
        </div>
        <div>
          <span className="eyebrow">STATUS / 当前状态</span>
          <strong>{p.status}</strong>
        </div>
      </div>
      <div
        className="tabs"
        role="tablist"
        aria-label="项目内容"
        onKeyDown={(e) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
            return;
          e.preventDefault();
          const i = tabs.findIndex((t) => t[0] === tab),
            next =
              e.key === "Home"
                ? 0
                : e.key === "End"
                  ? 2
                  : (i + (e.key === "ArrowRight" ? 1 : 2)) % 3;
          setTab(tabs[next][0]);
          e.currentTarget.querySelectorAll("button")[next].focus();
        }}
      >
        {tabs.map(([key, label], i) => (
          <button
            key={key}
            role="tab"
            id={`tab-${key}`}
            aria-controls={`panel-${key}`}
            aria-selected={tab === key}
            tabIndex={tab === key ? 0 : -1}
            onClick={() => setTab(key)}
          >
            <small>0{i + 1}</small>
            {label}
          </button>
        ))}
      </div>
      <section
        className="tab-content"
        key={`${p.slug}-${tab}`}
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
      >
        {tab === "overview" ? (
          <>
            <p className="document-summary">{p.summary}</p>
            <h2>项目背景</h2>
            <p>{p.background}</p>
            <h2>核心功能</h2>
            <div className="feature-list">
              {p.features.map((f) => (
                <section key={f.title}>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </section>
              ))}
            </div>
            <h2>项目亮点</h2>
            <ul className="highlights">
              {p.highlights.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </>
        ) : tab === "system" ? (
          <>
            <h2>技术栈</h2>
            <ul className="tags">
              {p.stack.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <h2>系统协作流程</h2>
            <ol className="process">
              {(p.process || p.features).map((step, i) => (
                <li key={step.title}>
                  <span aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <>
            <div className="scope">
              <span className="eyebrow">VERIFICATION BOUNDARY</span>
              <h2>哪些已经展示，哪些仍需验证</h2>
              <p>{p.scope}</p>
            </div>
            <h2>素材与证据</h2>
            <ul className="highlights">
              {(p.evidence || [p.scope]).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="source-note">
              架构图表达设计关系；录屏只证明录制时展示的行为。页面不以方案说明替代完整测试结论。
            </p>
          </>
        )}
      </section>
      <div className="document-actions">
        <button className="solid" aria-pressed={saved} onClick={onSave}>
          {saved ? "✓ 已收藏" : "＋ 收藏项目"}
          <small>本设备</small>
        </button>
        <button className="text-button" onClick={onExport}>
          导出简介 ↓
        </button>
      </div>
      <section className="project-media">
        <div className="section-heading">
          <h2>影像记录</h2>
          <span>{p.media.length} RECORDS</span>
        </div>
        <div className="media-grid">
          {p.media.map((m, i) => (
            <MediaTile
              key={m.id}
              media={m}
              onOpen={() => onMedia(p.media, i)}
            />
          ))}
        </div>
      </section>
      <button className="next-project" onClick={onNext}>
        阅读下一项目 <span>→</span>
      </button>
    </article>
  );
}
