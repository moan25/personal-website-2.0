# 开场动画

## 当前版本

当前开场直接采用 RhineLabUI 公开源码中的启动叙事结构与视觉语言，保留以下阶段：

1. `ACCESS PERMISSION REQUIRED` 权限请求。
2. Rhine Lab 原始几何标志逐笔描线。
3. 身份确认与处理进度。
4. 项目场域扫描环与轨道运动。
5. `WELCOME TO / INTERNAL DATABASE` 欢迎页。
6. 左右白幕收束后进入个人项目档案。

本版本不使用 MirrorSphere 用户品牌图标。个人网站正文、项目数据和媒体内容保持不变。原参考项目代码按 MIT 许可保留说明，开场不加载视频或外部资源。

## 时间线

- 0–27%：权限请求与请求确认。
- 17–41%：原始几何标志描线及字标出现。
- 30–64%：身份确认、处理进度与授权信息。
- 56–82%：项目场域扫描环、轨道和状态信息。
- 75–97%：欢迎页和档案提示。
- 90–100%：白幕收束，组件结束并释放页面操作。

总时长由 `src/components/OpeningSequence.jsx` 中的 `DURATION` 统一控制，并通过 `--opening-duration` 传给 `src/opening.css`。当前为 14.8 秒，用户可以随时点击 `SKIP INTRO`，或按 `Enter`、`Esc` 跳过。

## 交互与可访问性

- 首页首次进入时自动播放，同一标签页会话不重复播放。
- 页脚“重播开场”可以重新观看。
- 开场播放期间焦点锁定在跳过按钮，`Tab` 不会离开弹窗。
- `Enter`、`Esc` 和取消动作都可以进入档案。
- 减少动态效果时不自动播放，手动重播显示静态内容。
- 移动端隐藏次要坐标信息，保留核心启动阶段和跳过入口。

## 修改位置

- `src/components/OpeningSequence.jsx`：阶段结构、开场文案、会话标记、完成时长和键盘交互。
- `src/opening.css`：原参考风格的黑底、几何线、描线动画、扫描环、白幕转场、移动端和静态模式。
- `src/App.jsx`：首次播放条件、重播入口和三维场景预热。
- `src/vendor/rhinelab/LICENSE`：参考代码许可文本。

`public/brand/mirrorsphere-v3.png` 与 `src/components/MirrorSphereMark.jsx` 为上一轮方案遗留文件，当前开场没有引用，也不会显示该图标。后续清理时可以一并删除，不影响当前实现。
