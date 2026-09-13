import * as T from "three";
import { damp, selectionWave } from "../vendor/rhinelab/motion.ts";
import { asset, wrap } from "./content.js";

// Motion helpers © 2026 LBEILC, MIT. Geometry, textures and layout are original.
// Repeated cells are alternative positions of real media, never fabricated records.
export class ArchiveEngine {
  constructor(host, getProps) {
    this.host = host;
    this.getProps = getProps;
    this.cleanups = [];
    this.textures = [];
    this.disposed = false;
    this.renderer = new T.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    host.append(this.renderer.domElement);
    this.canvas = this.renderer.domElement;
    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(32, 1, 0.1, 180);
    this.scene.add(new T.HemisphereLight(0xffffff, 0x919a90, 3));
    const key = new T.DirectionalLight(0xfff8eb, 3.2);
    key.position.set(-7, 18, 12);
    this.scene.add(key);
    const fill = new T.DirectionalLight(0xffffff, 1.8);
    fill.position.set(10, 8, -5);
    this.scene.add(fill);
    this.body = new T.MeshStandardMaterial({
      color: 0xe3e1d9,
      roughness: 0.48,
      metalness: 0.12,
    });
    this.edge = new T.MeshStandardMaterial({
      color: 0xb9bcb4,
      roughness: 0.3,
      metalness: 0.4,
    });
    this.accent = new T.MeshStandardMaterial({
      color: 0xbf7a40,
      roughness: 0.35,
      metalness: 0.35,
    });
    this.box = new T.BoxGeometry(4.7, 3.12, 0.17);
    this.side = new T.BoxGeometry(0.055, 3.03, 0.185);
    this.plane = new T.PlaneGeometry(4.48, 2.58);
    this.groups = [];
    this.mediaMaps = new Map();
    const { projects } = getProps();
    this.count = projects.length;
    this.getTexture = (m) => {
      if (this.mediaMaps.has(m.id)) return this.mediaMaps.get(m.id);
      const variants = m.type === "video" ? m.posterVariants : m.variants;
      const src =
        variants?.find((v) => v.width >= 960)?.src ??
        (m.type === "video" ? m.poster : m.src);
      const texture = new T.TextureLoader().load(asset(src), () =>
        this.invalidate(),
      );
      texture.colorSpace = T.SRGBColorSpace;
      texture.anisotropy = Math.min(
        4,
        this.renderer.capabilities.getMaxAnisotropy(),
      );
      this.textures.push(texture);
      this.mediaMaps.set(m.id, texture);
      return texture;
    };
    for (let c = -2; c <= 2; c++)
      for (let r = -7; r <= 7; r++) {
        const group = new T.Group();
        group.userData = { offsetLane: c, offsetRow: r, lane: 0, row: 0 };
        const body = new T.Mesh(this.box, this.body);
        group.add(body);
        for (const x of [-2.27, 2.27]) {
          const edge = new T.Mesh(this.side, this.edge);
          edge.position.set(x, 0, 0);
          group.add(edge);
        }
        const strip = new T.Mesh(
          new T.BoxGeometry(0.06, 0.75, 0.2),
          this.accent,
        );
        strip.position.set(2.25, 1.04, 0);
        group.add(strip);
        const face = new T.Mesh(
          this.plane,
          new T.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.65,
          }),
        );
        face.position.set(0, -0.08, 0.095);
        group.add(face);
        group.userData.face = face;
        this.groups.push(group);
        this.scene.add(group);
      }
    this.clock = new T.Clock();
    this.lift = { value: 0, velocity: 0 };
    this.travel = { value: 0, velocity: 0 };
    this.slide = { value: 0, velocity: 0 };
    this.phase = 0;
    this.lastKey = "";
    this.yaw = 0;
    this.pitch = 0;
    this.distance = 1;
    this.rotating = false;
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(host);
    this.resize();
    this.raycaster = new T.Raycaster();
    this.pointer = new T.Vector2();
    const listen = (event, fn, options) => {
      this.canvas.addEventListener(event, fn, options);
      this.cleanups.push(() =>
        this.canvas.removeEventListener(event, fn, options),
      );
    };
    listen("pointerdown", (e) => {
      if (e.button !== 0) return;
      this.down = { x: e.clientX, y: e.clientY, time: performance.now() };
      this.origin = { yaw: this.yaw, pitch: this.pitch };
    });
    listen("pointermove", (e) => {
      if (this.down && getProps().detail) {
        this.yaw = this.origin.yaw + (e.clientX - this.down.x) * 0.006;
        this.pitch = T.MathUtils.clamp(
          this.origin.pitch + (e.clientY - this.down.y) * 0.004,
          -0.6,
          0.6,
        );
        this.invalidate();
      }
    });
    listen("pointercancel", () => (this.down = null));
    listen("pointerup", (e) => {
      if (!this.down) return;
      const dx = e.clientX - this.down.x,
        dy = e.clientY - this.down.y;
      const props = getProps();
      this.down = null;
      if (Math.hypot(dx, dy) > 36 && !props.detail) {
        props.onSelect(
          Math.abs(dx) > Math.abs(dy) ? "lane" : "row",
          Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : -1) : dy < 0 ? 1 : -1,
        );
        return;
      }
      if (Math.hypot(dx, dy) > 10) return;
      if (props.detail) {
        props.onOpen();
        return;
      }
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        (-(e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hits = this.raycaster.intersectObjects(this.groups, true);
      if (hits[0]) {
        let g = hits[0].object;
        while (g.parent && g.parent !== this.scene) g = g.parent;
        props.onSelect("cell", { lane: g.userData.lane, row: g.userData.row });
      }
    });
    listen(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaY) < 12) return;
        e.preventDefault();
        const p = getProps();
        if (p.detail) {
          this.distance = T.MathUtils.clamp(
            this.distance + e.deltaY * 0.001,
            0.8,
            1.4,
          );
          this.invalidate();
        } else if (performance.now() - (this.lastWheel ?? 0) > 200) {
          p.onSelect(e.shiftKey ? "lane" : "row", Math.sign(e.deltaY));
          this.lastWheel = performance.now();
        }
      },
      { passive: false },
    );
    this.onReset = () => {
      this.yaw = 0;
      this.pitch = 0;
      this.distance = 1;
      this.invalidate();
    };
    window.addEventListener("archive-reset", this.onReset);
    this.resize();
    this.animate();
  }
  invalidate() {
    this.wake = performance.now() + 1800;
  }
  resize() {
    const { width, height } = this.host.getBoundingClientRect();
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    this.invalidate();
  }
  animate = () => {
    if (this.disposed) return;
    this.frame = requestAnimationFrame(this.animate);
    const props = this.getProps();
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const key = `${props.lane}:${props.row}:${props.detail}:${props.theme}:${props.reduced}:${props.active}`;
    if (key !== this.lastKey) {
      if (this.previousSelection && !props.detail && !props.reduced) {
        if (this.previousSelection.lane !== props.lane)
          this.slide.value =
            props.lane > this.previousSelection.lane ? 1.2 : -1.2;
        else if (this.previousSelection.row !== props.row)
          this.travel.value =
            props.row > this.previousSelection.row ? 0.65 : -0.65;
      }
      this.previousSelection = { lane: props.lane, row: props.row };
      this.phase = 0;
      this.lastKey = key;
      this.invalidate();
      if (!props.detail) {
        this.yaw = 0;
        this.pitch = 0;
        this.distance = 1;
      }
    }
    if (
      !props.active ||
      document.hidden ||
      (performance.now() > (this.wake ?? 0) && !this.down)
    )
      return;
    this.phase += dt;
    damp(this.lift, props.detail ? 1 : 0, props.reduced ? 1000 : 5.5, dt);
    damp(this.slide, 0, props.reduced ? 1000 : 7, dt);
    damp(this.travel, 0, props.reduced ? 1000 : 7, dt);
    const d = this.lift.value;
    const narrow = this.width < 760;
    const light = props.theme !== "dark";
    this.body.color.set(light ? 0xe3e1d9 : 0x38433d);
    this.edge.color.set(light ? 0xb9bcb4 : 0x64766c);
    this.scene.fog = new T.Fog(light ? 0xe9e7e2 : 0x1d2622, 35, 65);
    for (const g of this.groups) {
      const { offsetLane: c, offsetRow: r, face } = g.userData;
      const lane = wrap(props.lane + c, this.count),
        project = props.projects[lane],
        row = wrap(props.row + r, project.media.length);
      g.userData.lane = lane;
      g.userData.row = row;
      const selected = c === 0 && r === 0;
      const wave = props.reduced
        ? 0
        : selectionWave(Math.abs(r) + Math.abs(c) * 2, this.phase);
      const shoulder = (0.46 * Math.exp(-(r * r) / 10)) / (1 + Math.abs(c));
      g.position.set(
        c * 5.35 + this.slide.value,
        shoulder + wave + (selected ? 2.2 + d * 3.35 : 0),
        r * 0.75 + this.travel.value,
      );
      g.rotation.set(
        selected ? this.pitch * d : 0,
        selected ? this.yaw * d : 0,
        0,
      );
      const texture =
        selected || Math.abs(c) + Math.abs(r) <= 1
          ? this.getTexture(project.media[row])
          : null;
      if (face.material.map !== texture) {
        face.material.map = texture;
        face.material.needsUpdate = true;
      }
      const aspect = texture?.image?.width / texture?.image?.height;
      face.scale.set(
        aspect ? Math.min(1, aspect / (4.48 / 2.58)) : 1,
        aspect ? Math.min(1, 4.48 / 2.58 / aspect) : 1,
        1,
      );
      face.material.opacity = selected ? 1 : 0.1;
      face.material.color.set(light ? 0xffffff : 0xbed0c5);
    }
    const from = new T.Vector3(19, 13, 22),
      to = new T.Vector3(2.6, 7.6, 21 * this.distance);
    this.camera.position.copy(from.lerp(to, d));
    const target = new T.Vector3(narrow ? 0 : 3.2, 1.4, 0).lerp(
      new T.Vector3(narrow ? 0 : 5.8, 5.8, 0),
      d,
    );
    this.camera.lookAt(target);
    this.camera.fov = narrow ? 48 : 32;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  };
  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    this.cleanups.forEach((fn) => fn());
    window.removeEventListener("archive-reset", this.onReset);
    this.scene.traverse((o) => {
      o.geometry?.dispose();
      if (o.material) {
        for (const m of [o.material].flat()) m.dispose();
      }
    });
    this.textures.forEach((t) => t.dispose());
    this.renderer.dispose();
    this.canvas.remove();
  }
}
