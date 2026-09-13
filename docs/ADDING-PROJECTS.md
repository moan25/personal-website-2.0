# 新增和维护项目

新增项目只编辑 `public/content/projects.json` 并添加媒体，不复制页面组件。先准备可公开的事实、照片、视频和验证边界，再添加一个项目对象。执行 `npm run check`、`npm run build`，部署新的 `dist/`。

## 项目字段

| 字段 | 含义 |
| --- | --- |
| `slug` | 唯一小写英文连字符标识，也是详情 URL，例如 `my-new-project` |
| `code` | 简短可选编目代号，无则自动回退 |
| `title`、`subtitle`、`englishTitle` | 名称、完整名称和英文名称 |
| `category`、`status` | 方向、实际项目状态，不填写未经确认的完成结论 |
| `summary`、`background` | 简短介绍、背景或要解决的问题 |
| `tags`、`stack` | 关键词和真实技术栈数组 |
| `features` | `[{"title":"功能名称","text":"有依据的说明"}]` |
| `highlights` | 简洁的亮点字符串数组 |
| `scope` | 必填验证范围，区分设计、录屏、联调、实机与待验证 |
| `process` | 可选流程节点数组，格式同 features，必须是实际系统关系 |
| `evidence` | 可选事实依据与限制字符串数组 |
| `cover`、`coverAlt` | 清晰封面及准确替代文字 |
| `coverFull`、`coverVariants` | 原尺寸图和响应式多规格 |
| `media` | 至少一条真实媒体，建议视频和图片均有；缺失时如实描述 |

## 图片字段

```json
{
  "id": "my-project-photo",
  "type": "image",
  "src": "media/my-project/photo-1200.webp",
  "full": "media/my-project/photo-full.webp",
  "variants": [
    {"src": "media/my-project/photo-640.webp", "width": 640},
    {"src": "media/my-project/photo-1200.webp", "width": 1200}
  ],
  "width": 2400,
  "height": 1600,
  "title": "真实原型照片",
  "caption": "来源和展示范围说明。",
  "alt": "描述图片中实际可见的内容",
  "fit": "contain"
}
```

多规格不超过原图分辨率。`width/height` 为全尺寸图片宽高；图片列表用 `srcSet`，灯箱用 `full`。结构图使用 `fit: contain`，避免列表裁掉文字。源图本来较小时不要生成放大文件或标为高清。

## 视频字段

```json
{
  "id": "my-project-demo",
  "type": "video",
  "src": "media/my-project/demo.mp4",
  "poster": "media/my-project/demo-poster-1200.webp",
  "posterVariants": [{"src":"media/my-project/demo-poster-640.webp","width":640}],
  "title": "项目真实演示",
  "caption": "说明录制的行为，不将录屏扩大解释为其他验证。",
  "duration": 35,
  "resolution": "1920 × 1080",
  "aspectRatio": "16 / 9"
}
```

视频使用 MP4 + H.264，存在音轨时使用 AAC，启用 faststart。封面来自真实视频帧，不能用生成图冒充录屏。视频不会在列表或灯箱打开时预先设置 `src`，只有点击“播放视频”才加载。主文件建议小于托管平台单文件上限，本项目最大约 10.9 MiB。

所有路径相对于 `public/`，不写 `public/` 前缀、不用开头斜杠，不使用 `C:\`、`file://`、本机 HTTP、外部图片或路径回退 `..`。所有媒体 id 在整个站点内必须唯一。修改顺序即调整默认项目与影像顺序；删除项目对象即从总览、搜索和媒体库同时移除。阵列的重复位置映射真实媒体，不代表额外项目或虚构成果。

企业资料默认不收录。发布前逐个检查截图、视频每个场景、文字和元数据，只有明确可公开的素材才能进入 `public/`。自动扫描只能发现风险信号，不能代替单位授权。
