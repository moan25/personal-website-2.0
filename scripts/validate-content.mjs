import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const projects = JSON.parse(
  fs.readFileSync(path.join(publicDir, "content/projects.json"), "utf8"),
);
const site = JSON.parse(
  fs.readFileSync(path.join(publicDir, "content/site.json"), "utf8"),
);
const errors = [];
const slugs = new Set();
const ids = new Set();
let checkedAssets = 0;
function asset(p) {
  if (typeof p !== "string" || !p) {
    errors.push("媒体路径缺失");
    return;
  }
  if (/^(?:[a-z]+:|\/|\\)/i.test(p) || p.split(/[\\/]/).includes(".."))
    errors.push(`非可移植路径: ${p}`);
  const resolved = path.resolve(publicDir, p);
  if (
    !resolved.startsWith(publicDir + path.sep) ||
    !fs.existsSync(resolved) ||
    fs.statSync(resolved).size === 0
  )
    errors.push(`媒体不存在或为空: ${p}`);
  checkedAssets++;
}
if (!site.name || !Array.isArray(site.headline) || !site.headline.length)
  errors.push("网站名称或首页标题缺失");
if (!Array.isArray(projects)) throw new Error("projects.json 必须是数组");
for (const project of projects) {
  for (const key of [
    "slug",
    "title",
    "subtitle",
    "englishTitle",
    "category",
    "summary",
    "status",
    "cover",
    "coverAlt",
    "background",
  ])
    if (typeof project[key] !== "string" || !project[key].trim())
      errors.push(`${project.slug}: 缺少 ${key}`);
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug) ||
    slugs.has(project.slug)
  )
    errors.push(`slug 无效或重复: ${project.slug}`);
  slugs.add(project.slug);
  for (const key of ["tags", "stack", "features", "highlights", "media"])
    if (!Array.isArray(project[key]))
      errors.push(`${project.slug}: ${key} 必须是数组`);
  asset(project.cover);
  if (project.coverFull) asset(project.coverFull);
  for (const v of project.coverVariants || []) {
    asset(v.src);
    if (!(v.width > 0)) errors.push("封面尺寸无效");
  }
  for (const feature of project.features || [])
    if (!feature.title || !feature.text)
      errors.push(`${project.slug}: 功能缺少标题或正文`);
  for (const item of project.media || []) {
    if (!item.id || ids.has(item.id))
      errors.push(`媒体 id 缺失或重复: ${item.id}`);
    ids.add(item.id);
    if (!["image", "video"].includes(item.type) || !item.title || !item.caption)
      errors.push(`${item.id}: 媒体类型、标题或描述缺失`);
    asset(item.src);
    if (item.full) asset(item.full);
    for (const v of [
      ...(item.variants || []),
      ...(item.posterVariants || []),
    ]) {
      asset(v.src);
      if (!(v.width > 0)) errors.push("图片尺寸无效");
    }
    if (item.type === "video") {
      asset(item.poster);
      if (!(item.duration > 0)) errors.push(`${item.id}: 时长无效`);
    } else if (!item.alt) errors.push(`${item.id}: 缺少替代文字`);
  }
}
if (site.featuredProject && !slugs.has(site.featuredProject))
  errors.push("首页精选项目不存在");
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Content OK: ${projects.length} projects, ${ids.size} media items, ${checkedAssets} local asset references.`,
);
