import { useState } from "react";
export default function Search({
  projects,
  saved,
  bookmarks = false,
  onProject,
}) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("all");
  const matches = projects.filter(
    (p) =>
      (!bookmarks || saved.includes(p.slug)) &&
      (category === "all" || p.category === category) &&
      [p.title, p.summary, ...p.tags, ...p.stack]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div className="search-panel">
      <label className="search-field">
        搜索项目
        <input
          autoFocus
          type="search"
          placeholder="标题、技术栈或关键词"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div className="filter-buttons" role="group" aria-label="项目分类">
        {["all", ...new Set(projects.map((p) => p.category))].map((c) => (
          <button
            key={c}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c === "all" ? "全部项目" : c}
          </button>
        ))}
      </div>
      <p className="result-count" role="status">
        {matches.length} 份项目档案{bookmarks ? " · 收藏仅保存在本设备" : ""}
      </p>
      <div className="search-results">
        {matches.map((p) => (
          <button onClick={() => onProject(p.slug)} key={p.slug}>
            <span className="search-code">{p.code || "FILE"}</span>
            <span>
              <small>
                {p.category} / {p.status}
              </small>
              <strong>{p.title}</strong>
              <span>{p.summary}</span>
              <span className="search-tags">
                {p.stack.slice(0, 4).join(" / ")}
              </span>
            </span>
            <span>↗</span>
          </button>
        ))}
      </div>
      {!matches.length && (
        <div className="empty">
          <h3>{bookmarks ? "还没有匹配的收藏" : "没有匹配的项目"}</h3>
          <p>
            {bookmarks
              ? "在项目详情中点击“收藏项目”，之后可从这里快速读取。"
              : "尝试其他关键词，或选择全部项目。"}
          </p>
        </div>
      )}
    </div>
  );
}
