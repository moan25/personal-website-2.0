# 个人网站 2.0 · FIELDNOTES

独立可运行的个人项目作品集。React + Vite + Three.js，静态部署，无数据库、登录接口或本机 API。RhineLabUI 的档案阵列、抽取式详情、方向导航、检索和收藏作为交互参考，立体影像载体为原创几何，不是机器人或眼镜的模型。

## 本机打开

安装 Node.js 22.12 以上版本，推荐当前 Node.js 24。双击 `start-website.cmd`，访问 http://127.0.0.1:5174/。脚本按需构建，后台隐藏运行，再次启动复用本项目实例。此地址只能用于本机，不是分享链接。

开发：

```powershell
npm ci
npm run dev
```

生产：

```powershell
npm run build
npm start
```

生产构建位于 `dist/`。已构建的产物只需静态托管，不要求访问者安装 Node.js。不要通过 `file://` 双击 HTML，浏览器会限制模块与 JSON 加载。不要同时运行两个占用 5174 的服务；测试其他端口可用 `$env:PORT='5176'; npm start`。

## 页面与操作

- `#/`：立体项目档案，左右切项目，上下切影像；阵列支持点击、滚轮和水平滑动。
- `#/project/digital-twin`、`#/project/smart-glasses`：抽取式详情，项目概述、系统设计、验证范围、影像记录、收藏和文本导出。
- `#/media`：独立媒体库，可按项目、类型和关键词筛选。
- `#/about`：项目说明、展示边界和开源致谢。
- `/` 键打开检索，Escape 关闭弹窗或返回总览；灯箱左右方向键切影像。
- 视频点击播放后才设置视频 URL。原生控件支持播放、暂停、静音、进度拖动与全屏。
- 收藏与主题只存本设备。系统减少动态效果始终优先。

## 维护位置

| 位置 | 职责 |
| --- | --- |
| `public/content/projects.json` | 唯一项目数据入口 |
| `public/media/` | 网站实际使用的精选、脱敏媒体 |
| `src/components/` | 阵列入口、弹窗、搜索和媒体交互 |
| `src/pages/` | 详情、媒体库、关于页面 |
| `src/lib/archive-engine.js` | 原创 Three.js 几何、交互与镜头 |
| `src/vendor/rhinelab/` | 保留 MIT 许可的运动数学辅助函数 |
| `src/styles.css`、`interface.css`、`responsive.css` | 基础、组件与响应式样式 |
| `scripts/validate-content.mjs` | 构建前项目与全部媒体引用检查 |
| `docs/ADDING-PROJECTS.md` | 新增项目的数据字段及规则 |
| `docs/SOURCES.md` | 素材来源、实际分辨率与事实边界 |
| `docs/PRIVACY.md` | 企业资料排除与 APP 裁切评估 |
| `docs/DEPLOYMENT.md` | 静态部署、线上权限和分享方式 |

1.0 归档位于同级 `个人网站 1.0`。原始工作区 `outputs/portfolio` 未修改。不要将 1.0 原媒体或原始项目资料一并上传，本次公开输出只使用 2.0 的 `dist/`。
