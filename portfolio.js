/* ===========================================================
   Portfolio interactions
   reveals · counters · tilt · 3D developer-at-desk scene
   =========================================================== */

/* ---------- Nav state ---------- */
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 60));

/* ---------- Scroll reveals ---------- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.transitionDelay = `${(e.target.dataset.idx % 5) * 80}ms`;
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.14 }
);
document.querySelectorAll(".reveal").forEach((el, i) => { el.dataset.idx = i; io.observe(el); });

/* ---------- Stat counters ---------- */
const counterIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, dur = 1600, t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll(".stat-num").forEach((el) => counterIO.observe(el));

/* ---------- 3D tilt on project cards ---------- */
document.querySelectorAll("[data-tilt]").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
  });
  card.addEventListener("mouseleave", () => { card.style.transform = ""; });
});

/* ===========================================================
   3D scene — a developer at a desk, monitor with live code
   (Three.js; graceful fallback if WebGL/THREE unavailable)
   =========================================================== */
(function deskScene() {
  if (typeof THREE === "undefined") return;
  const canvas = document.getElementById("deskscene");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0b0b0d, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b0b0d, 10, 22);

  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
  const camBase = new THREE.Vector3(2.6, 2.55, 6.6);
  camera.position.copy(camBase);
  const lookTarget = new THREE.Vector3(0.3, 1.9, -0.5);

  /* ---- monochrome materials ---- */
  const mat = (c, r = 0.75, m = 0.05) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const matDesk = mat(0x242428, 0.6);
  const matMetal = mat(0x3a3a40, 0.4, 0.6);
  const matBody = mat(0x141417, 0.9);
  const matSkin = mat(0x4a4a50, 0.85);
  const matLight = mat(0xdedee2, 0.5);
  const matChair = mat(0x1b1b1f, 0.8);

  const round = (w, h, d) => new THREE.BoxGeometry(w, h, d); // simple boxes read clean in mono

  /* ---- screen with live code (canvas texture) ---- */
  const sc = document.createElement("canvas");
  sc.width = 512; sc.height = 300;
  const sx = sc.getContext("2d");
  const codeLines = buildCodeLines(60);
  const tex = new THREE.CanvasTexture(sc);
  let scroll = 0;

  function buildCodeLines(n) {
    const kw = ["const", "let", "function", "return", "import", "for", "if", "await", "class", "export"];
    const ids = ["model", "img", "data", "result", "scan", "plot", "score", "frame", "net", "out", "rayyan", "build"];
    const strs = ['"OpenCV"', '"YOLOv8"', '"Flutter"', '"detect"', '"₹60k+"', '"ship"', '"./assets"'];
    const lines = [];
    for (let i = 0; i < n; i++) {
      const indent = "  ".repeat(Math.floor(Math.random() * 4));
      const r = Math.random();
      let segs = [];
      if (r < 0.12) { segs = [["// " + pick(["train the model", "process frame", "grade sheet", "detect plots", "ship it"]), "#a6a6ad"]]; }
      else if (r < 0.5) {
        segs = [[pick(kw) + " ", "#111116"], [pick(ids), "#3c3c45"], [" = ", "#8a8a90"], [pick(ids) + "(", "#3c3c45"], [pick(strs), "#5a5a64"], [")", "#3c3c45"]];
      } else if (r < 0.75) {
        segs = [[pick(kw) + " ", "#111116"], [pick(ids) + " ", "#3c3c45"], ["of ", "#8a8a90"], [pick(ids), "#3c3c45"], [" {", "#8a8a90"]];
      } else {
        segs = [[pick(ids) + ".", "#3c3c45"], [pick(["fit", "predict", "scan", "render", "save"]), "#111116"], ["(", "#8a8a90"], [pick(strs), "#5a5a64"], [");", "#8a8a90"]];
      }
      lines.push({ indent, segs });
    }
    return lines;
    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  }

  function drawScreen() {
    sx.fillStyle = "#f6f6f8"; sx.fillRect(0, 0, 512, 300);
    // title bar
    sx.fillStyle = "#e7e7ec"; sx.fillRect(0, 0, 512, 24);
    const dots = ["#b4b4ba", "#b4b4ba", "#b4b4ba"];
    dots.forEach((c, i) => { sx.fillStyle = c; sx.beginPath(); sx.arc(16 + i * 16, 12, 4, 0, 7); sx.fill(); });
    sx.font = "11px JetBrains Mono, monospace"; sx.fillStyle = "#9a9aa2"; sx.fillText("developer.js", 60, 16);
    // code
    sx.font = "15px JetBrains Mono, monospace"; sx.textBaseline = "top";
    const lh = 21, top = 34, rows = 13;
    const startIdx = Math.floor(scroll / lh);
    const sub = scroll % lh;
    for (let i = 0; i < rows; i++) {
      const ln = codeLines[(startIdx + i) % codeLines.length];
      const y = top + i * lh - sub;
      let x = 12 + ln.indent.length * 7;
      // line number
      sx.fillStyle = "#c6c6cc"; sx.fillText(String((startIdx + i) % codeLines.length + 1).padStart(2, "0"), 0, y);
      for (const [t, col] of ln.segs) { sx.fillStyle = col; sx.fillText(t, x, y); x += sx.measureText(t).width; }
    }
    tex.needsUpdate = true;
  }
  drawScreen();

  /* ---- build the set ---- */
  const root = new THREE.Group();
  scene.add(root);

  // floor
  const floor = new THREE.Mesh(round(40, 0.2, 40), mat(0x101012, 0.95));
  floor.position.y = -1.6; root.add(floor);

  // desk top + legs
  const desk = new THREE.Group();
  const top = new THREE.Mesh(round(7, 0.25, 3), matDesk); top.position.y = 0; desk.add(top);
  [[-3.3, -1.3], [3.3, -1.3], [-3.3, 1.3], [3.3, 1.3]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(round(0.2, 1.5, 0.2), matMetal); leg.position.set(x, -0.85, z); desk.add(leg);
  });
  root.add(desk);

  // monitor (screen faces +Z toward camera)
  const monitor = new THREE.Group();
  monitor.add(meshAt(round(1.4, 0.1, 0.7), matMetal, 0, 0.18, -0.85));   // base
  monitor.add(meshAt(round(0.22, 1.15, 0.2), matMetal, 0, 0.78, -0.85));  // neck
  monitor.add(meshAt(round(4.0, 2.35, 0.14), mat(0x101012, 0.5), 0, 2.0, -0.72)); // bezel
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 2.05), new THREE.MeshBasicMaterial({ map: tex }));
  screen.position.set(0, 2.0, -0.64); monitor.add(screen);
  root.add(monitor);

  // soft glow halo behind the monitor (light spill)
  const gc = document.createElement("canvas"); gc.width = gc.height = 256;
  const gx = gc.getContext("2d");
  const grd = gx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grd.addColorStop(0, "rgba(255,255,255,0.6)"); grd.addColorStop(1, "rgba(255,255,255,0)");
  gx.fillStyle = grd; gx.fillRect(0, 0, 256, 256);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(9, 7),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.position.set(0, 2.1, -1.0); root.add(glow);

  // keyboard + mug + lamp + plant
  root.add(meshAt(round(1.9, 0.07, 0.6), matLight, 0, 0.18, 0.5));
  root.add(meshAt(new THREE.CylinderGeometry(0.16, 0.14, 0.34, 16), matLight, 2.1, 0.32, 0.5)); // mug
  // lamp
  root.add(meshAt(new THREE.CylinderGeometry(0.22, 0.26, 0.08, 16), matMetal, -2.5, 0.18, -0.6));
  const lampArm = meshAt(round(0.07, 1.2, 0.07), matMetal, -2.5, 0.78, -0.6); lampArm.rotation.z = 0.5; root.add(lampArm);
  root.add(meshAt(new THREE.ConeGeometry(0.26, 0.34, 16), matMetal, -2.95, 1.3, -0.6));
  // plant
  root.add(meshAt(new THREE.CylinderGeometry(0.2, 0.16, 0.34, 12), matMetal, 2.7, 0.32, -0.7));
  [[0, 0.7], [0.16, 0.62], [-0.16, 0.62]].forEach(([dx, dy]) =>
    root.add(meshAt(new THREE.IcosahedronGeometry(0.22, 0), matLight, 2.7 + dx, 0.32 + dy, -0.7)));

  // chair back (behind person)
  root.add(meshAt(round(1.7, 1.7, 0.2), matChair, 0, 1.0, 2.05));

  // ---- the developer (back / three-quarter view) ----
  const person = new THREE.Group(); person.position.set(0.1, 0, 1.35); person.scale.setScalar(1.02);
  const torso = meshAt(round(1.3, 1.5, 0.68), matBody, 0, 1.3, 0); torso.rotation.x = -0.14; person.add(torso);
  const shoulders = meshAt(round(1.7, 0.5, 0.74), matBody, 0, 2.05, -0.06); person.add(shoulders);
  const neck = meshAt(new THREE.CylinderGeometry(0.17, 0.19, 0.25, 12), matSkin, 0, 2.32, -0.04); person.add(neck);
  const head = meshAt(new THREE.SphereGeometry(0.36, 24, 24), matSkin, 0, 2.68, -0.02); person.add(head);
  const hair = meshAt(new THREE.SphereGeometry(0.39, 24, 24), matBody, 0, 2.76, 0.04); hair.scale.set(1, 0.95, 1.08); person.add(hair);
  // arms reaching toward keyboard
  const armL = meshAt(round(0.28, 1.0, 0.28), matBody, -0.66, 1.6, 0.4); armL.rotation.x = 0.98; person.add(armL);
  const armR = meshAt(round(0.28, 1.0, 0.28), matBody, 0.66, 1.6, 0.4); armR.rotation.x = 0.98; person.add(armR);
  root.add(person);

  /* ---- lights (screen is the key light) ---- */
  scene.add(new THREE.AmbientLight(0x33343c, 0.8));
  const screenLight = new THREE.PointLight(0xffffff, 2.8, 16, 2); screenLight.position.set(0, 2.0, -0.2); scene.add(screenLight);
  const rim = new THREE.DirectionalLight(0xaab4c8, 0.9); rim.position.set(6, 6, 7); scene.add(rim);   // rims the developer's edge
  const fill = new THREE.DirectionalLight(0xffffff, 0.35); fill.position.set(-4, 4, 6); scene.add(fill);
  const back = new THREE.PointLight(0xffffff, 0.6, 12, 2); back.position.set(3, 4, 6); scene.add(back);

  /* ---- helpers ---- */
  function meshAt(geo, material, x, y, z) { const m = new THREE.Mesh(geo, material); m.position.set(x, y, z); return m; }

  /* ---- interaction + resize ---- */
  let mx = 0, my = 0;
  window.addEventListener("mousemove", (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; });

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    // shift framing right on wide screens so text has room on the left
    root.position.x = w > 980 ? 1.1 : 0;
  }
  window.addEventListener("resize", resize); resize();

  const clock = new THREE.Clock();
  let frame = 0;
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    frame++;

    // live code scroll (every other frame for perf)
    scroll += 0.5; if (frame % 2 === 0) drawScreen();

    // subtle life: breathing, typing, head bob, gentle float
    const breathe = 1 + Math.sin(t * 1.6) * 0.012;
    torso.scale.y = breathe; shoulders.position.y = 1.95 + Math.sin(t * 1.6) * 0.01;
    armL.rotation.x = 0.95 + Math.sin(t * 7.0) * 0.06;
    armR.rotation.x = 0.95 + Math.sin(t * 7.0 + 1.3) * 0.06;
    head.position.y = 2.55 + Math.sin(t * 1.2) * 0.012;
    person.rotation.y = Math.sin(t * 0.4) * 0.03;
    root.position.y = Math.sin(t * 0.6) * 0.04;
    screenLight.intensity = 1.5 + Math.sin(t * 9) * 0.06; // faint screen flicker

    // camera parallax
    camera.position.x += (camBase.x + mx * 1.4 - camera.position.x) * 0.05;
    camera.position.y += (camBase.y - my * 0.9 - camera.position.y) * 0.05;
    camera.lookAt(root.position.x + lookTarget.x, lookTarget.y, lookTarget.z);

    renderer.render(scene, camera);
  })();
})();
