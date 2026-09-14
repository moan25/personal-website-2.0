export default function About({ projects }) {
  return (
    <main className="page about">
      <div className="page-heading">
        <p className="eyebrow">FIELDNOTES / ABOUT THIS ARCHIVE</p>
        <h1>从感知，到行动。</h1>
        <p>记录可被看见、理解与验证的项目实践。</p>
      </div>
      <div className="about-layout">
        <section>
          <h2>关于这个项目档案</h2>
          <p>
            这里收录我的个人项目，从多模态感知与可穿戴设备，到工业场景的数字孪生与任务编排。通过真实照片、系统设计和演示视频，呈现问题、实现思路与当前验证边界。
          </p>
          <p>
            项目会持续更新。所有条目均区分架构设计、原型演示与完成验证的范围，不把构想包装成已经交付的产品。
          </p>
          <div className="about-projects">
            {projects.map((p) => (
              <a key={p.slug} href={`#/project/${p.slug}`}>
                <span>
                  <small>{p.englishTitle}</small>
                  {p.title}
                </span>
                <span>↗</span>
              </a>
            ))}
          </div>
        </section>
        <aside>
          <section>
            <h2>素材说明</h2>
            <p>
              项目影像来自原始录屏、演示文稿与项目资料。APP
              展示已排除带账号及连接信息的页面。立体档案是浏览界面，不是项目硬件的三维模型。
            </p>
          </section>
          <section>
            <h2>设计与开源致谢</h2>
            <p>
              交互参考{" "}
              <a
                href="https://github.com/LBEILC/RhineLabUI"
                target="_blank"
                rel="noreferrer"
              >
                RhineLabUI ↗
              </a>{" "}
              的档案阵列、抽取转场与检索体验。部分运动数学代码依据 MIT
              许可使用。本站与原参考品牌无隶属关系。
            </p>
            <a
              className="text-button"
              href="./licenses/RhineLabUI-MIT.txt"
              target="_blank"
              rel="noreferrer"
            >
              查看代码许可 ↗
            </a>
          </section>
        </aside>
      </div>
    </main>
  );
}
