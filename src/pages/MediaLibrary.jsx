import { useState } from "react";
import { MediaTile } from "../components/Media.jsx";
export default function MediaLibrary({ projects, onMedia }) {
  const [project, setProject] = useState("all"),
    [type, setType] = useState("all"),
    [query, setQuery] = useState("");
  const items = projects
    .flatMap((p) =>
      p.media.map((m) => ({ ...m, project: p.title, slug: p.slug })),
    )
    .filter(
      (m) =>
        (project === "all" || m.slug === project) &&
        (type === "all" || m.type === type) &&
        `${m.title} ${m.caption} ${m.project}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
  return (
    <main className="library page">
      <div className="page-heading">
        <p className="eyebrow">FIELDNOTES / MEDIA LIBRARY</p>
        <h1>影像记录</h1>
        <p>从原型实拍到虚拟场景，查看项目发生的过程。</p>
      </div>
      <div className="library-toolbar">
        <label>
          项目
          <select value={project} onChange={(e) => setProject(e.target.value)}>
            <option value="all">全部项目</option>
            {projects.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <div className="filter-buttons" role="group" aria-label="媒体类型">
          {[
            ["all", "全部影像"],
            ["video", "视频"],
            ["image", "图片"],
          ].map(([v, t]) => (
            <button
              key={v}
              aria-pressed={type === v}
              onClick={() => setType(v)}
            >
              {t}
            </button>
          ))}
        </div>
        <label className="search-field">
          搜索影像
          <input
            type="search"
            placeholder="搜索标题或描述"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <p className="result-count" role="status">
        {items.length} 条记录
      </p>
      {items.length ? (
        <div className="library-grid">
          {items.map((m, i) => (
            <MediaTile
              key={m.id}
              media={m}
              projectTitle={m.project}
              onOpen={() => onMedia(items, i)}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>没有匹配的影像</h2>
          <p>更换关键词或清除筛选后重试。</p>
          <button
            className="text-button"
            onClick={() => {
              setQuery("");
              setProject("all");
              setType("all");
            }}
          >
            清除筛选 ↗
          </button>
        </div>
      )}
    </main>
  );
}
