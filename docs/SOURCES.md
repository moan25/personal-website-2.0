# 素材来源与事实边界

## 来源目录

- 智能眼镜：C:/Users/moan/Desktop/项目/以镜为瞳——基于多模态交互的视障辅助智能眼镜/
- 数字孪生：C:/Users/moan/Desktop/项目/基于 Unity 3D 的工业机器人数字孪生系统/
- 数字孪生原视频：C:/OBS_Library/Unity3D数字孪生项目视频/Unity+ROS/

目录中的文件仅作资料，未执行其脚本。以下路径只用于维护记录，不进入浏览器 URL。

## 图片和封面

| 导出名称 | 实际尺寸 | 原始来源 | 处理说明 |
| --- | --- | --- | --- |
| glasses/prototype | 2400 × 1080 | 1以镜为瞳陈传涛.pptx#ppt/media/image11.jpeg | 仅格式转换与缩小多规格，不超分放大 |
| glasses/prototype-side | 1080 × 2400 | 1以镜为瞳陈传涛.pptx#ppt/media/image12.jpeg | 仅格式转换与缩小多规格，不超分放大 |
| glasses/app | 2528 × 2780 | 1以镜为瞳陈传涛.pptx#ppt/media/image15.png | 仅裁取首页与会话页，排除带手机号、设备标识、验证码与服务器地址的登录/设置页。 |
| glasses/grasp | 545 × 546 | 1以镜为瞳陈传涛.pptx#ppt/media/image17.png | 仅格式转换与缩小多规格，不超分放大 |
| glasses/services | 1383 × 735 | 1以镜为瞳陈传涛.pptx#ppt/media/image14.png | 仅格式转换与缩小多规格，不超分放大 |
| glasses/architecture | 1232 × 992 | 整体框架.png | 仅格式转换与缩小多规格，不超分放大 |
| glasses/agents | 772 × 594 | 多智能体层.png | 仅格式转换与缩小多规格，不超分放大 |
| glasses/circuit | 1920 × 1920 | 电路关系图.jpg | 仅格式转换与缩小多规格，不超分放大 |
| twin/architecture | 831 × 526 | Unity+ROS资料/图5-4 Unity-ROS-Agent协同交互架构.png | 仅格式转换与缩小多规格，不超分放大 |
| glasses/demo-poster | 1280 × 960 | media1.mp4 | 原视频 19.25s 帧；不裁切、不生成场景。 |
| twin/sequence-poster | 1920 × 1080 | Unity从左到右完成装箱任务.mp4 | 原视频 37.36s 帧；不裁切、不生成场景。 |
| twin/dense-poster | 1920 × 1080 | Unity密集区域装箱.mp4 | 原视频 23.32s 帧；不裁切、不生成场景。 |
| twin/target-poster | 1920 × 1080 | Unity指定落点装箱.mp4 | 原视频 17.80s 帧；不裁切、不生成场景。 |
| twin/full-poster | 1920 × 1080 | Unity装满停止.mp4 | 原视频 16.66s 帧；不裁切、不生成场景。 |

项目图像本身小于高清尺寸时，保留原尺寸作为辅助图片，不冒充高清。原型主图为 2400×1080，APP 裁切图为 2520×2780。数字孪生封面与场景图以原始 1920×1080 录屏帧替换 1.0 的小图。多规格为 640、1200、1920 宽度和原尺寸，尺寸以原图上限为准，WebP 质量 92/96，移除 EXIF 元数据。

## 视频

| 导出 | 来源 | 内容范围 |
| --- | --- | --- |
| glasses/demo.mp4 | 1以镜为瞳陈传涛.pptx 内嵌 ppt/media/media1.mp4 | 完整 35 秒，1280×960 原始分辨率 |
| twin/sequence.mp4 | Unity从左到右完成装箱任务.mp4 | 完整约 124.53 秒，1920×1080 |
| twin/dense.mp4 | Unity密集区域装箱.mp4 | 完整约 77.72 秒，1920×1080 |
| twin/target.mp4 | Unity指定落点装箱.mp4 | 完整约 59.35 秒，1920×1080 |
| twin/full.mp4 | Unity装满停止.mp4 | 完整约 55.53 秒，1920×1080 |

全部使用 H.264、30 fps、CRF 20、yuv420p 和 faststart；存在音轨时转 AAC 160k。数字孪生原录屏 60 fps，网页输出保留分辨率、完整时长，帧率优化至 30 fps。5 段视频共 27,657,401 字节，约 26.38 MiB。不会在点击播放前设置 video.src。

## 事实依据

眼镜：项目演示文稿第 5 至 11 页、原项目 README。盲道导航和红绿灯检测没有实机验证，网页保留研究原型边界。没有引用未核实的成功率、统计或把汇报人姓名推断为网站所有者身份。

数字孪生：2.0test/项目上报材料_Unity-ROS-Agent数字孪生系统_证据版_2026-09-02.md。描述 Unity 物理场景、ROS/MoveIt 规划、Agent 任务编排与关键帧观测。明确没有实体机械臂验证、未完成目标 ROS 环境三端实网往返验证。已有录屏不能证明新增 Agent 全链路已经实网运行。

企业实习项目全部排除，详见 PRIVACY.md。未引入参考仓库模型、品牌和美术；参考源码检查版本：8799b03179a9a0ebd2611843e644a5a0530b24bf。
