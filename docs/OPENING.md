# 镜界 MirrorSphere 开场

## 当前实现与边界

本次将上一版自行编排的 14.8 秒黑底动画替换为原版轨迹驱动的开场。沿用 RhineLabUI 的阶段顺序、Logo 居中后向左移动、逐字揭示、双层扫描环收束、轨道点、欢迎页文字反白扫入和白幕退出。不是逐帧视频复制，也不声称与无法读取的视频完全一致。

唯一图标源为用户提供的 `MirrorSphere_icon_cobalt-cyan_v3.png`，复制一次到 `public/brand/mirrorsphere-v3.png`。SHA-256：`8DD48D450FA11496C6DF1A42802FA3EC996AC6BBF6D0F6744DF0F48716BA6D59`。原稿不修改。通过 SVG 路径遮罩逐段显露 PNG，再以 CSS brightness(0) 单色显示；路径只是揭示导轨，不作为新 Logo 绘制。最终完整遮罩保留原始透明度、比例、缺口和前后遮挡关系。两处 Logo 共用此组件。

品牌名称“镜界 / MirrorSphere”取自用户品牌设计图。网站所有者“墨安”取自用户要求，不虚构公司。欢迎页保留 WELCOME TO，中心黑色反白标签改为“墨安 · 项目档案”，左上角改为“墨安 / SELECTED PROJECTS / 个人项目档案”，右下为“CURATED BY MOAN”。启动权限、身份状态仅为视觉叙事，不请求浏览器权限，不验证访客身份。

## 可核实来源与许可

- GitHub：https://github.com/LBEILC/RhineLabUI
- 检查版本：`8799b03179a9a0ebd2611843e644a5a0530b24bf`。
- 检查 README、MIT LICENSE、package.json、main.ts、style.css、boot.ts、boot-motion.ts、boot-lettering.ts 与三份轨迹模块。
- 原仓库使用 TypeScript、Vite、Three.js；原版 boot 由 DOM/SVG 及逐帧状态驱动，不需要嵌入开场视频。本次未运行其 postinstall、字体准备或模型脚本。
- MIT Copyright (c) 2026 LBEILC 保留在 `src/vendor/rhinelab/LICENSE`，并随构建发布 `public/licenses/RhineLabUI-MIT.txt`。

直接复用、未改动的源码：

| 文件 | 实际使用部分 |
| --- | --- |
| boot-tracks.ts | 单调三次插值 track、角落文字滑入 brandTrack、欢迎页反白 companyTrack、扫描环尺寸/弧角/轨道 scanTrack |
| boot-logo-tracks.ts | Logo 绘制加速曲线与居中转向侧边的位移轨迹；不使用原版无限符号、加减号或后期移位缺口 |
| boot-orbit-tracks.ts | 左右弧线位置与半径、六颗卫星点的相位和生长轨迹 |

时间映射参照 boot-motion.ts 的 25 fps 帧号。圆弧绘制采用同类 SVG 圆弧表示，全圆用两段 A 指令。React 状态驱动、PNG 遮罩和系统字形揭示为本网站适配代码。

未使用：

- B 站用户参考 `BV1jebG6zE1E`：本次网页读取失败，未声称观看或提取帧；该 BV 与仓库 README 所列源 PV 编号不同，不把两者视为同一视频。
- 夸克 https://pan.quark.cn/s/762d9ee9dfc3 ：未能读取，无须依赖其下载内容。
- 未复制商业 Novecento 字体、仓库导出的字形路径、原品牌 Logo、角色、美术、PV 音视频或 Blender/GLB 资源。字体使用 Arial、Microsoft YaHei、PingFang SC 和 sans-serif 系统回退，字距和字重参照原版气质，并非原字体。
- 原版的几帧黑白闪屏、核心点闪大及文字乱码改为短时连续显隐，避免生硬跳切。结尾增加 0.64 秒白幕收束以衔接现有档案首页。
- 手机端 Logo 由横向位移改为向上收拢，状态文字放到下方，保持浏览层级而不强行裁剪桌面文本。

## 时间线

以首次白屏作为 0 秒。上游 README 标记其为源 PV 6.76 秒，内部以 `(elapsed / 1000 + 6.76) * 25` 采样。总时长 20.76 秒。

| 本站时间 | 画面 |
| --- | --- |
| 0–2.36 秒 | ACCESS PERMISSION REQUIRED 逐字轮廓与墨色揭示 |
| 2.36–4.36 秒 | 原稿外圈、中轴、镜像线、轨道依次显露；中英字标跟进，Logo 按原曲线开始侧移 |
| 4.36–12.72 秒 | 角落字标进入，依次 ARCHIVE IDENTIFIED : MOAN、REQUEST RECEIVED、START PROCESSING |
| 12.72–16 秒 | 原版大环收束、黑白弧线、轨道点、左右弧与六颗卫星 |
| 16–19.4 秒 | WELCOME TO，个人项目档案反白扫入，原稿 Logo 与中英品牌、作品记录小字 |
| 19.4–20.76 秒 | 欢迎层轻微缩小和虚化，白幕覆盖后收束进入首页 |

交界处有约 0.2 秒交叠包络。所有状态来自统一时钟，没有独立循环动画累积漂移。

## 交互和加载

- 首页首次进入播放，会话键 `mirrorsphere-opening-v2`，与旧版区分；刷新同一标签页不重复。
- 页脚“重播开场”重播。按钮、Enter、Esc 均可跳过，正常动效模式有 220 ms 退出过渡。
- 使用原生 dialog 锁定焦点；退出恢复原焦点及 body 滚动；卸载清理 rAF 和所有计时器。MirrorSphere PNG 在开场前预加载；绘制遮罩未完成时保留低透明度完整轮廓，避免中间帧看起来像资源截断，完成后仍以原稿全量像素显示。
- 系统或网站减少动态效果设置会跳过自动播放；手动重播只显示完整静态欢迎画面。
- 深层项目/媒体路由不被开场打断。
- 首页保持挂载并立即预热场景；开场不等待外部请求、不加载视频。图片失效提供品牌文字降级，独立截止计时避免页面锁死。

## 维护位置

- `src/components/OpeningSequence.jsx`：场景层级、文案、会话及键盘、焦点、退出行为。
- `src/lib/opening-timeline.js`：阶段、采样帧号、包络和时间轴。
- `src/components/opening/MirrorSphereMark.jsx`：原稿遮罩导轨和失败降级。
- `src/components/opening/DrawText.jsx`：逐字轮廓与方向揭示。
- `src/components/opening/ScanField.jsx`：扫描环和轨道 SVG。
- `src/opening.css`：浅灰黑色排版、画面位置、响应式和减少动态效果。
- `src/vendor/rhinelab/`：原版轨迹和 MIT 许可；修改应在适配层完成。
- `public/brand/mirrorsphere-v3.png`：唯一站内原稿副本，路径经过 BASE_URL，兼容 GitHub Pages 子目录。
- `src/App.jsx`、全站样式、项目 JSON、媒体和 Pages 工作流未改动。

## 验证

本地生产浏览器逐阶段截图覆盖权限、早中晚绘制、身份、请求、处理、扫描、欢迎及白幕；已对比完整 Logo 加遮罩和不加遮罩的截图，像素一致。检查 1440×900、390×844、320×568、844×390、768×1024，测试键盘、触控、会话、减少动态效果、图标缺失；两个项目视频实际播放与拖动、高清灯箱、详情和关于路由回归。构建仍检查 2 项目、17 媒体条目及 90 本地素材引用。

本轮共通过 91 项检查，其中生产逐阶段与交互回归 78 项，开发版真实计时、动态减少动效切换及 `/personal-website-2.0/` 生产子目录检查 13 项。两个详情标题与项目数据匹配，子路径视频支持 HTTP Range，未发现控制台或运行时错误。

测试过程和截图保留在本地工作区 `work/personal-opener-qa/`，不发布到个人网站。外部部署是否完成，以交付时的实际部署状态为准。
