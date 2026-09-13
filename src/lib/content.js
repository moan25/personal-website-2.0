export const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
export const wrap = (x, n) => ((x % n) + n) % n;
export function readLocal(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
export function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export async function loadContent() {
  const res = await fetch(asset("content/projects.json"));
  if (!res.ok) throw new Error("项目资料暂时无法载入");
  const items = await res.json();
  const strings = [
    "slug",
    "title",
    "subtitle",
    "englishTitle",
    "summary",
    "category",
    "status",
    "cover",
    "scope",
    "background",
  ];
  const arrays = ["stack", "tags", "features", "highlights", "media"];
  if (
    !Array.isArray(items) ||
    !items.length ||
    items.some(
      (p) =>
        !p ||
        strings.some((k) => typeof p[k] !== "string" || !p[k].trim()) ||
        arrays.some((k) => !Array.isArray(p[k])) ||
        !p.media.length ||
        p.media.some(
          (m) =>
            !m ||
            !["image", "video"].includes(m.type) ||
            !m.id ||
            !m.src ||
            !m.title ||
            (m.type === "video" && !m.poster),
        ) ||
        p.features.some((f) => !f?.title || !f?.text),
    )
  )
    throw new Error("项目数据不完整，请检查项目配置后重试");
  return items;
}
export function imageProps(media, size = "(max-width: 700px) 94vw, 50vw") {
  return {
    src: asset(media.src),
    srcSet: media.variants
      ?.map((v) => `${asset(v.src)} ${v.width}w`)
      .join(", "),
    sizes: size,
  };
}
