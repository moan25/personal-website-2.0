# 部署与分享

网站完全静态，构建产物为 `dist/`，包含 HTML、JS、CSS、项目 JSON、实际使用的图片与视频、图标与开源许可。不依赖 Windows 盘符、本机接口、LAN 服务、远程图床或临时开发环境。Hash 路由可在根路径或子目录刷新，`base: './'` 保证资源相对路径可迁移。

## 最少操作的对外发布

登录选定静态托管平台，把 `dist/` 内容上传为站点根目录。必须让 `index.html` 位于发布根，不要上传包含“个人网站 1.0”的父目录。若使用交付的 `personal-website-2.0-static.zip`，先解压，再上传解压后的目录。

当前版本已通过 GitHub Pages 工作流发布为公共 HTTPS 网页：[https://moan25.github.io/personal-website-2.0/](https://moan25.github.io/personal-website-2.0/)。后续修改推送到 `main` 后会自动重新构建。没有绑定自定义域名，也没有启用付费服务。

## 平台配置

| 平台 | 构建或上传方式 |
| --- | --- |
| Cloudflare Pages | Direct Upload 上传 `dist/`，或 Git 集成设置构建命令 `npm run build`、输出 `dist` |
| Netlify | 手动发布上传 `dist/`；Git 集成可直接读取根目录 `netlify.toml` |
| Vercel | 导入已授权的代码仓库，框架 Vite，命令 `npm run build`，输出 `dist` |
| GitHub Pages | 已启用 Pages 的 GitHub Actions；推送 `main` 后自动构建并发布 |

访问者不需要运行 npm 或安装 Node.js。媒体使用静态地址，托管方应正确返回 MP4 MIME 与 Range 响应。所有单文件小于 25 MiB，但选择平台前仍应核对账号流量、存储和地区可达性；不要为了免费域名选择而公开企业资料。

## Sites 线上副本

`.openai/hosting.json` 保存当前站点身份，用于后续更新，不要重复创建。发布结果与实际访问地址以工作区交付报告为准。私有访问只允许当前账号，不等于任何人持链接都可访问；对外分享还需在站点分享设置中添加允许访问者，或由你确认公开访问范围。没有把私有地址描述为免登录公开链接。

## 发布后检查

平台参考：[GitHub Pages 官方工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Cloudflare Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)、[Netlify 文件配置](https://docs.netlify.com/build/configure-builds/file-based-configuration/)。Cloudflare Direct Upload 项目不能直接改为 Git 集成，后续要自动部署需另建 Git 集成项目。

从非本机设备访问线上地址，进入两个详情页与媒体库，刷新 `#/project/digital-twin`，播放并拖动视频进度，放大图像。若看到登录页，先检查站点分享权限；若页面存在但素材 404，检查是否只上传了 HTML 而漏掉 `assets/`、`content/`、`media/`、`licenses/`。不要使用本机 `127.0.0.1` 地址分享。
