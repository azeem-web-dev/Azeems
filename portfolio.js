/* ===========================================================
   Portfolio interactions
   GSAP scroll + assemble · case-study overlay
   3D developer desk with a LIVE typing terminal
   =========================================================== */

/* ---------- Nav state ---------- */
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 60));

/* ---------- Stat counters ---------- */
const counterIO = new IntersectionObserver((entries) => {
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
}, { threshold: 0.6 });
document.querySelectorAll(".stat-num").forEach((el) => counterIO.observe(el));

/* ===========================================================
   GSAP scroll animations (reveal in/out + assemble-from-stack)
   =========================================================== */
(function scrollAnims() {
  const hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  if (!hasGSAP) { document.querySelectorAll(".reveal").forEach((e) => e.classList.add("shown")); return; }

  gsap.registerPlugin(ScrollTrigger);

  // generic reveals — slow rise, reverses on scroll back
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.fromTo(el, { y: 44, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1.15, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
    });
  });

  // assemble — cards collapse into one stacked point, then split to place on scroll
  function assemble(groupSel) {
    const group = document.querySelector(groupSel);
    if (!group) return;
    const items = gsap.utils.toArray(groupSel + " > .assemble");
    items.forEach((item, i) => {
      const dx = () => { const g = group.getBoundingClientRect(), r = item.getBoundingClientRect(); return (g.left + g.width / 2) - (r.left + r.width / 2); };
      const dy = () => { const g = group.getBoundingClientRect(), r = item.getBoundingClientRect(); return (g.top + g.height / 2) - (r.top + r.height / 2); };
      gsap.fromTo(item,
        { x: dx, y: dy, scale: 0.5, rotation: (i - (items.length - 1) / 2) * 8, opacity: 0, transformOrigin: "center center" },
        { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, ease: "power2.out",
          scrollTrigger: { trigger: group, start: "top 85%", end: "top 38%", scrub: 0.8 } });
    });
  }
  assemble(".projects");
  assemble(".skills");
  assemble(".process-grid");

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();

/* ===========================================================
   Case-study overlay
   =========================================================== */
(function overlay() {
  const ov = document.getElementById("overlay");
  const content = document.getElementById("overlay-content");
  if (!ov || !content) return;

  const DATA = {
    omr: {
      eyebrow: "Computer Vision · Deployed Product",
      title: "OMR Scanner & Mark Report System",
      badges: ["Python", "OpenCV", "MySQL", "Desktop & Mobile", "₹40,000 revenue"],
      overview: "A real-time application that scans JEE &amp; EAMCET OMR answer sheets with a camera and instantly produces detailed, per-student mark reports — replacing slow, error-prone manual grading at coaching institutes.",
      challenge: "Coaching centres grade thousands of OMR sheets by hand after every mock exam. It is slow, inconsistent, and delays feedback to students.",
      approach: "I built an OpenCV pipeline that aligns each sheet, detects filled bubbles, and maps them to an answer key. Results are stored in a database and compiled into individual and consolidated mark reports, packaged as an easy desktop &amp; mobile app for non-technical staff.",
      metrics: [["98.6%", "Accuracy"], ["2–3/sec", "Scan speed"], ["2", "Institutions"]],
      result: "Deployed and sold to <strong>two institutions</strong> (₹20,000 each) and recognised with a <strong>Certificate of Appreciation from Nakshatra IIT-JEE Academy</strong>.",
      shots: ["assets/cert-nakshatra.jpg"],
      links: [["GitHub Repository", "https://github.com/azeem-web-dev/omr-scanner", true]],
    },
    plot: {
      eyebrow: "Deep Learning · Client Project",
      title: "Plot Map Detection System",
      badges: ["Python", "YOLOv8", "CUDA", "OpenCV", "PyQt6", "₹20,000 revenue"],
      overview: "A GPU-accelerated tool that reads a real-estate plot map image and automatically returns the precise coordinates and plot number of every single plot.",
      challenge: "Sri Bramharamba Real Estate in Guntur manually traced plot boundaries and numbers from layout maps — tedious work that doesn't scale across large layouts.",
      approach: "I trained a YOLOv8 object-detection model running on CUDA GPU, paired with OpenCV pre-processing, to detect each plot. A PyQt6 desktop app lets the team load a map, run batch detection, and view/export coordinates instantly.",
      metrics: [["99.2%", "Accuracy"], ["~5,000", "Plots / run"], ["3.0s", "Per run"]],
      result: "Delivered to the client as a ready desktop application that turns hours of manual plotting into a <strong>3-second</strong> batch job.",
      shots: [],
      links: [["GitHub Repository", "https://github.com/azeem-web-dev/plot-area-detector", true]],
    },
    lipi: {
      eyebrow: "Mobile · AI · Smart India Hackathon 2025",
      title: "Lipi — Bharat Script Transliteration",
      badges: ["Flutter", "Google ML Kit", "Tesseract / OpenCV OCR", "REST API"],
      overview: "A cross-platform Flutter app that transliterates and translates across Indian scripts and English — including camera-based OCR to read signboards and nameplates in any Bharatiya script.",
      challenge: "Built for <strong>Smart India Hackathon 2025, Problem Statement #25155</strong>: develop a Bharat-script transliteration tool for signboards and nameplates using Indian languages.",
      approach: "Lipi combines on-device Google ML Kit models, Tesseract/OpenCV OCR and a translation API, with real-time typing, auto script-detection, offline downloadable models, text-to-speech and an exportable history — all in a clean, responsive Flutter UI.",
      metrics: [["11+", "Scripts"], ["~78%", "Transliteration"], ["Offline", "On-device"]],
      result: "A complete, installable product covering Devanagari, Tamil, Telugu, Bengali, Kannada, Urdu and more — with camera OCR and offline support.",
      shots: ["assets/lipi-1.jpg", "assets/lipi-2.jpg"],
      links: [],
    },
  };

  function render(p) {
    const badges = p.badges.map((b) => `<span class="cs-badge">${b}</span>`).join("");
    const metrics = p.metrics.map((m) => `<div class="cs-metric"><b>${m[0]}</b><span>${m[1]}</span></div>`).join("");
    const shots = p.shots.length ? `<div class="cs-shots">${p.shots.map((s) => `<img src="${s}" alt="${p.title} screenshot" loading="lazy" />`).join("")}</div>` : "";
    const links = p.links.length ? `<div class="cs-links">${p.links.map((l) => `<a class="cs-link ${l[2] ? "primary" : ""}" href="${l[1]}" target="_blank" rel="noopener">${l[0]} →</a>`).join("")}</div>` : "";
    return `<div class="cs">
      <p class="cs-eyebrow">${p.eyebrow}</p>
      <h2 class="cs-title">${p.title}</h2>
      <div class="cs-badges">${badges}</div>
      <p>${p.overview}</p>
      <div class="cs-metrics">${metrics}</div>
      <h4>The Challenge</h4><p>${p.challenge}</p>
      <h4>My Approach</h4><p>${p.approach}</p>
      ${shots}
      <h4>The Result</h4><p>${p.result}</p>
      ${links}
    </div>`;
  }

  const panel = ov.querySelector(".overlay-panel");
  const backdrop = ov.querySelector(".overlay-backdrop");
  const hasG = typeof gsap !== "undefined";

  function open(id) {
    const p = DATA[id]; if (!p) return;
    content.innerHTML = render(p);
    ov.classList.add("open"); ov.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    panel.scrollTop = 0;
    if (hasG) {
      gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
      gsap.fromTo(panel, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" });
    } else { backdrop.style.opacity = 1; panel.style.opacity = 1; }
  }
  function close() {
    if (hasG) {
      gsap.to(panel, { opacity: 0, y: 30, scale: 0.97, duration: 0.3, ease: "power2.in" });
      gsap.to(backdrop, { opacity: 0, duration: 0.3, onComplete: finish });
    } else { finish(); }
  }
  function finish() { ov.classList.remove("open"); ov.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }

  document.querySelectorAll("[data-project]").forEach((card) => {
    card.addEventListener("click", () => open(card.dataset.project));
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(card.dataset.project); } });
  });
  ov.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && ov.classList.contains("open")) close(); });
})();

/* ===========================================================
   3D scene — developer at a desk, monitor runs a live terminal
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

  const mat = (c, r = 0.75, m = 0.05) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const matDesk = mat(0x242428, 0.6), matMetal = mat(0x3a3a40, 0.4, 0.6), matBody = mat(0x141417, 0.9),
        matSkin = mat(0x4a4a50, 0.85), matLight = mat(0xdedee2, 0.5), matChair = mat(0x1b1b1f, 0.8);
  const round = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const meshAt = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); return o; };

  /* ---- monitor: a live terminal (canvas texture) ---- */
  const sc = document.createElement("canvas"); sc.width = 512; sc.height = 300;
  const sx = sc.getContext("2d");
  const tex = new THREE.CanvasTexture(sc);

  const terminal = (function () {
    const script = [
      { cmd: "python omr_scan.py --in sheets/", out: ["loaded 240 sheets", "accuracy 98.6%  ·  2–3/sec", "reports written → ./out"] },
      { cmd: "yolo detect plots.pt map.png", out: ["5,000 plots  ·  99.2%  ·  3.0s"] },
      { cmd: "flutter run lipi --release", out: ["11 Bharat scripts ready", "offline OCR models ok"] },
      { cmd: 'git commit -m "ship it"', out: ["[main 9f2c1a] ship it", "deployed to production"] },
    ];
    let lines = [], idx = 0, mode = "type", timer = 0, outShown = 0, active = null, clock = 0;
    function startCmd() { active = { k: "cmd", s: script[idx].cmd, typed: 0, on: true }; lines.push(active); mode = "type"; }
    startCmd();

    function update(dt) {
      clock += dt;
      const step = script[idx];
      if (mode === "type") {
        active.typed += dt / 0.05;
        if (active.typed >= step.cmd.length) { active.typed = step.cmd.length; active.on = false; mode = "wait"; timer = 0.4; }
      } else if (mode === "wait") { timer -= dt; if (timer <= 0) { mode = "out"; outShown = 0; timer = 0; } }
      else if (mode === "out") {
        timer -= dt;
        if (outShown < step.out.length) { if (timer <= 0) { lines.push({ k: "out", s: step.out[outShown] }); outShown++; timer = 0.22; } }
        else { mode = "pause"; timer = 1.2; }
      } else if (mode === "pause") { timer -= dt; if (timer <= 0) { idx++; if (idx >= script.length) { mode = "clear"; timer = 1.0; } else startCmd(); } }
      else if (mode === "clear") { timer -= dt; if (timer <= 0) { lines = []; idx = 0; startCmd(); } }
      if (lines.length > 12) lines = lines.slice(-12);
      draw();
    }

    function draw() {
      sx.fillStyle = "#f6f6f8"; sx.fillRect(0, 0, 512, 300);
      sx.fillStyle = "#e7e7ec"; sx.fillRect(0, 0, 512, 26);
      ["#c2585a", "#c9a23c", "#5f9e5f"].forEach((c, i) => { sx.fillStyle = c; sx.beginPath(); sx.arc(16 + i * 16, 13, 4.5, 0, 7); sx.fill(); });
      sx.font = "11px JetBrains Mono, monospace"; sx.fillStyle = "#9a9aa2"; sx.fillText("rayyan@hmgenx — zsh", 70, 17);

      sx.font = "14px JetBrains Mono, monospace"; sx.textBaseline = "top";
      const lh = 19, top = 36, blink = Math.floor(clock / 0.5) % 2 === 0;
      lines.forEach((ln, i) => {
        const y = top + i * lh;
        if (ln.k === "cmd") {
          sx.fillStyle = "#5f9e5f"; sx.fillText("➜", 12, y);
          sx.fillStyle = "#7a7aa0"; sx.fillText("~", 32, y);
          const shown = ln.on ? ln.s.slice(0, Math.floor(ln.typed)) : ln.s;
          sx.fillStyle = "#15151a"; sx.fillText(shown, 50, y);
          if (ln.on && blink) { const w = sx.measureText(shown).width; sx.fillStyle = "#15151a"; sx.fillRect(52 + w, y, 8, 15); }
        } else {
          sx.fillStyle = "#73737c"; sx.fillText("  " + ln.s, 12, y);
        }
      });
      tex.needsUpdate = true;
    }
    return { update };
  })();

  /* ---- set dressing ---- */
  const root = new THREE.Group(); scene.add(root);
  root.add(meshAt(round(40, 0.2, 40), mat(0x101012, 0.95), 0, -1.6, 0)); // floor

  const top = meshAt(round(7, 0.25, 3), matDesk, 0, 0, 0); root.add(top);
  [[-3.3, -1.3], [3.3, -1.3], [-3.3, 1.3], [3.3, 1.3]].forEach(([x, z]) => root.add(meshAt(round(0.2, 1.5, 0.2), matMetal, x, -0.85, z)));

  const monitor = new THREE.Group();
  monitor.add(meshAt(round(1.4, 0.1, 0.7), matMetal, 0, 0.18, -0.85));
  monitor.add(meshAt(round(0.22, 1.15, 0.2), matMetal, 0, 0.78, -0.85));
  monitor.add(meshAt(round(4.0, 2.35, 0.14), mat(0x101012, 0.5), 0, 2.0, -0.72));
  monitor.add(new THREE.Mesh(new THREE.PlaneGeometry(3.7, 2.05), new THREE.MeshBasicMaterial({ map: tex })));
  monitor.children[monitor.children.length - 1].position.set(0, 2.0, -0.64);
  root.add(monitor);

  // glow spill
  const gc = document.createElement("canvas"); gc.width = gc.height = 256;
  const gx = gc.getContext("2d");
  const grd = gx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grd.addColorStop(0, "rgba(255,255,255,0.6)"); grd.addColorStop(1, "rgba(255,255,255,0)");
  gx.fillStyle = grd; gx.fillRect(0, 0, 256, 256);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.position.set(0, 2.1, -1.0); root.add(glow);

  root.add(meshAt(round(3.0, 0.07, 0.72), matLight, 0.4, 0.2, 0.55));   // keyboard (wide, under the hands)
  root.add(meshAt(round(0.42, 0.05, 0.6), matLight, 2.3, 0.2, 0.5));    // mouse + pad
  root.add(meshAt(new THREE.CylinderGeometry(0.16, 0.14, 0.34, 16), matLight, 2.9, 0.34, -0.3)); // mug (moved back)
  root.add(meshAt(new THREE.CylinderGeometry(0.22, 0.26, 0.08, 16), matMetal, -2.5, 0.18, -0.6));
  const lampArm = meshAt(round(0.07, 1.2, 0.07), matMetal, -2.5, 0.78, -0.6); lampArm.rotation.z = 0.5; root.add(lampArm);
  root.add(meshAt(new THREE.ConeGeometry(0.26, 0.34, 16), matMetal, -2.95, 1.3, -0.6));
  root.add(meshAt(new THREE.CylinderGeometry(0.2, 0.16, 0.34, 12), matMetal, -1.9, 0.32, -0.75)); // pen pot (left)
  [[0, 0.7], [0.16, 0.62], [-0.16, 0.62]].forEach(([dx, dy]) => root.add(meshAt(new THREE.IcosahedronGeometry(0.2, 0), matLight, -1.9 + dx, 0.32 + dy, -0.75)));
  root.add(meshAt(round(1.7, 1.7, 0.2), matChair, 0, 1.0, 2.05));

  // desk modesty front panel — hides the seated lower body
  root.add(meshAt(round(6.6, 1.75, 0.18), matDesk, 0, -0.8, 1.5));

  /* ---- developer: a REAL rigged character (Xbot), posed & typing ---- */
  // tweak live in console via window.POSE + window.__applyPose()
  const POSE = window.POSE = {
    pos: [0.15, -2.2, 0.88], scale: 4.4,
    spine: [0.24, 0, 0], spine1: [0.14, 0, 0], spine2: [0.10, 0, 0],
    neck: [0.12, 0, 0], head: [0.18, 0, 0],
    lShoulder: [0, 0, 0], rShoulder: [0, 0, 0],
    lArm: [0.12, 0.30, 1.60], rArm: [0.12, -0.30, -1.60],
    lFore: [0.0, 0.70, 0.95], rFore: [0.0, -0.70, -0.95],
    lHand: [-0.50, 0.10, 0.0], rHand: [-0.50, -0.10, 0.0],
    fingerCurl: 0.5, fingerAxis: "x",
  };
  let bones = null, fingersL = [], fingersR = [], baseHandL = 0, baseHandR = 0, charReady = false;
  const charMat = new THREE.MeshStandardMaterial({ color: 0x34373f, roughness: 0.45, metalness: 0.45 });
  const pivot = new THREE.Group(); pivot.rotation.y = Math.PI; root.add(pivot); // face the monitor

  function applyPose(model) {
    const B = (n) => model.getObjectByName(n);
    const setR = (n, r) => { const b = B(n); if (b && r) b.rotation.set(r[0], r[1], r[2]); };
    pivot.position.set(POSE.pos[0], POSE.pos[1], POSE.pos[2]);
    setR("mixamorigSpine", POSE.spine); setR("mixamorigSpine1", POSE.spine1); setR("mixamorigSpine2", POSE.spine2);
    setR("mixamorigNeck", POSE.neck); setR("mixamorigHead", POSE.head);
    setR("mixamorigLeftShoulder", POSE.lShoulder); setR("mixamorigRightShoulder", POSE.rShoulder);
    setR("mixamorigLeftArm", POSE.lArm); setR("mixamorigRightArm", POSE.rArm);
    setR("mixamorigLeftForeArm", POSE.lFore); setR("mixamorigRightForeArm", POSE.rFore);
    setR("mixamorigLeftHand", POSE.lHand); setR("mixamorigRightHand", POSE.rHand);
    baseHandL = POSE.lHand[0]; baseHandR = POSE.rHand[0];
    bones = { spine2: B("mixamorigSpine2"), head: B("mixamorigHead"), neck: B("mixamorigNeck"),
              lHand: B("mixamorigLeftHand"), rHand: B("mixamorigRightHand") };
    fingersL = []; fingersR = [];
    ["Thumb", "Index", "Middle", "Ring", "Pinky"].forEach((f) => {
      [1, 2, 3].forEach((j) => {
        const c = f === "Thumb" ? POSE.fingerCurl * 0.4 : POSE.fingerCurl;
        const bl = B("mixamorigLeftHand" + f + j), br = B("mixamorigRightHand" + f + j);
        if (bl) { bl.rotation[POSE.fingerAxis] = c; fingersL.push({ b: bl, base: c, ph: Math.random() * 6.28, sp: 9 + Math.random() * 6 }); }
        if (br) { br.rotation[POSE.fingerAxis] = c; fingersR.push({ b: br, base: c, ph: Math.random() * 6.28, sp: 9 + Math.random() * 6 }); }
      });
    });
  }

  new THREE.GLTFLoader().load("xbot.glb", (gltf) => {
    const model = window.__model = gltf.scene;
    model.traverse((o) => { if (o.isMesh) { o.material = charMat; o.frustumCulled = false; } });
    const box = new THREE.Box3().setFromObject(model);
    const h = box.getSize(new THREE.Vector3()).y || 1;
    model.scale.setScalar(POSE.scale / h);
    pivot.add(model);
    applyPose(model);
    window.__applyPose = () => applyPose(model);
    charReady = true;
  });

  scene.add(new THREE.AmbientLight(0x2a2b33, 0.7));
  const screenLight = new THREE.PointLight(0xdfe6ff, 3.2, 18, 2); screenLight.position.set(0, 2.0, 0.1); scene.add(screenLight);
  const rim = new THREE.DirectionalLight(0xaab4c8, 1.0); rim.position.set(6, 6, 7); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.3); fill.position.set(-5, 4, 5); scene.add(fill);
  const backRim = new THREE.DirectionalLight(0x7d93ff, 1.1); backRim.position.set(-4, 6, -5); scene.add(backRim); // cool rim to separate the figure

  let mx = 0, my = 0;
  window.addEventListener("mousemove", (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; });
  function resize() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    root.position.x = w > 980 ? 1.1 : 0;
  }
  window.addEventListener("resize", resize); resize();

  const clock = new THREE.Clock();
  let frame = 0;
  (function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime; frame++;
    if (frame % 2 === 0) terminal.update(dt * 2);
    if (charReady && bones) {
      if (bones.spine2) bones.spine2.rotation.x = POSE.spine2[0] + Math.sin(t * 1.5) * 0.02;     // breathing
      if (bones.head) bones.head.rotation.y = Math.sin(t * 0.5) * 0.06;                            // glance
      if (bones.lHand) bones.lHand.rotation.x = baseHandL + Math.abs(Math.sin(t * 5.5)) * 0.10;    // wrist bob
      if (bones.rHand) bones.rHand.rotation.x = baseHandR + Math.abs(Math.sin(t * 5.5 + 1.1)) * 0.10;
      const ax = POSE.fingerAxis;
      fingersL.forEach((f) => { f.b.rotation[ax] = f.base + Math.max(0, Math.sin(t * f.sp + f.ph)) * 0.28; });
      fingersR.forEach((f) => { f.b.rotation[ax] = f.base + Math.max(0, Math.sin(t * f.sp + f.ph)) * 0.28; });
    }
    root.position.y = Math.sin(t * 0.6) * 0.04;
    screenLight.intensity = 3.2 + Math.sin(t * 9) * 0.08;
    camera.position.x += (camBase.x + mx * 1.4 - camera.position.x) * 0.05;
    camera.position.y += (camBase.y - my * 0.9 - camera.position.y) * 0.05;
    camera.lookAt(root.position.x + lookTarget.x, lookTarget.y, lookTarget.z);
    renderer.render(scene, camera);
  })();
})();
