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

  // text blocks & headings glide in from the side
  gsap.utils.toArray(".reveal").forEach((el) => {
    if (el.closest(".proof-grid, .edu-grid")) return; // those cards are handled below
    const dir = el.dataset.from === "right" ? 1 : -1;
    gsap.fromTo(el, { x: dir * 60, opacity: 0 }, {
      x: 0, opacity: 1, duration: 1.0, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
    });
  });

  // grid cards slide in from alternating sides, staggered
  function slideCards(groupSel, childSel) {
    const group = document.querySelector(groupSel);
    if (!group) return;
    gsap.utils.toArray(groupSel + " " + childSel).forEach((item, i) => {
      gsap.fromTo(item, { x: (i % 2 ? 1 : -1) * 110, opacity: 0 }, {
        x: 0, opacity: 1, duration: 1.0, ease: "power3.out", delay: (i % 3) * 0.08,
        scrollTrigger: { trigger: group, start: "top 82%", toggleActions: "play none none reverse" },
      });
    });
  }
  slideCards(".projects", "> .assemble");
  slideCards(".skills", "> .assemble");
  slideCards(".process-grid", "> .assemble");
  slideCards(".proof-grid", "> .proof-card");
  slideCards(".edu-grid", "> .edu-card");

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
   3D hero — flowing wave field (grid of glowing points + wireframe)
   =========================================================== */
(function heroScene() {
  if (typeof THREE === "undefined") return;
  const canvas = document.getElementById("deskscene");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0b0b0d, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0b0d, 0.058);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 3.2, 9);

  // soft round sprite for the points
  const dc = document.createElement("canvas"); dc.width = dc.height = 64;
  const dx = dc.getContext("2d");
  const dg = dx.createRadialGradient(32, 32, 0, 32, 32, 32);
  dg.addColorStop(0, "rgba(255,255,255,1)"); dg.addColorStop(0.45, "rgba(230,236,255,0.5)"); dg.addColorStop(1, "rgba(255,255,255,0)");
  dx.fillStyle = dg; dx.fillRect(0, 0, 64, 64);
  const sprite = new THREE.CanvasTexture(dc);

  const W = 46, D = 34, SX = 92, SZ = 68;
  const geo = new THREE.PlaneGeometry(W, D, SX, SZ); geo.rotateX(-Math.PI / 2);
  const base = geo.attributes.position.array.slice(); // store flat x/z
  const grid = new THREE.Group(); scene.add(grid);

  const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x6f7790, wireframe: true, transparent: true, opacity: 0.10, blending: THREE.AdditiveBlending }));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ map: sprite, color: 0xffffff, size: 0.16, transparent: true, opacity: 0.95, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  grid.add(wire); grid.add(pts);

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener("mousemove", (e) => { tmx = e.clientX / window.innerWidth - 0.5; tmy = e.clientY / window.innerHeight - 0.5; });
  function resize() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize); resize();

  const clock = new THREE.Clock();
  const arr = geo.attributes.position.array;
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    mx += (tmx - mx) * 0.09; my += (tmy - my) * 0.09;
    for (let i = 0; i < arr.length; i += 3) {
      const x = base[i], z = base[i + 2];
      // gentle, continuous up/down — like the surface of still water
      arr[i + 1] = Math.sin(x * 0.42 + t * 0.4) * 0.62
                 + Math.cos(z * 0.5 + t * 0.34) * 0.5
                 + Math.sin((x + z) * 0.28 + t * 0.5) * 0.42;
    }
    geo.attributes.position.needsUpdate = true;
    grid.rotation.y = mx * 0.6;
    camera.position.x += (mx * 8 - camera.position.x) * 0.05;
    camera.position.y += (3.2 - my * 3.4 - camera.position.y) * 0.05;
    camera.lookAt(0, -0.4, -3);
    renderer.render(scene, camera);
  })();
})();

/* ===========================================================
   About — flowing dot grid
   Dots drift left → right while a wave travels through the grid,
   so neighbouring dots swap positions on the cross axis one by one.
   =========================================================== */
(function aboutDots() {
  const canvas = document.getElementById("about-dots");
  const section = document.getElementById("about");
  if (!canvas || !section) return;
  const ctx = canvas.getContext("2d");

  const GAP = 26, R = 1.3, DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0, cols = 0, rows = 0;

  function resize() {
    W = section.offsetWidth; H = section.offsetHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cols = Math.ceil(W / GAP) + 2;
    rows = Math.ceil(H / GAP) + 2;
  }
  window.addEventListener("resize", resize); resize();

  let visible = true;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(section);

  const t0 = performance.now();
  (function draw(now) {
    requestAnimationFrame(draw);
    if (!visible) return;
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgba(14,14,16,0.14)";
    const drift = (t * 9) % GAP;                       // slow left → right drift
    for (let c = 0; c < cols; c++) {
      const x = c * GAP - GAP + drift;
      // wave travels rightwards: each column is one step behind its neighbour,
      // so dots shift up/down one after another, swapping rows in the cross axis
      const phase = t * 1.6 - c * 0.55;
      const dy = Math.sin(phase) * GAP * 0.5;
      for (let r = 0; r < rows; r++) {
        const y = r * GAP - GAP + (r % 2 ? dy : -dy);  // odd/even rows swap toward each other
        ctx.beginPath();
        ctx.arc(x, y, R, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  })(t0);
})();

/* ===========================================================
   Experience — journey map liquid
   Black liquid flows along the snake path as you scroll,
   reaching each station and lighting it up one by one.
   =========================================================== */
(function journeyLiquid() {
  const path = document.getElementById("j-liquid");
  const journey = document.querySelector(".journey");
  if (!path || !journey) return;

  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;

  // find how far along the path each station sits (sample & match nearest point)
  const stations = [[50, 12], [24, 50], [50, 88]];
  const fractions = stations.map(([sx, sy]) => {
    let best = 0, bestD = Infinity;
    for (let i = 0; i <= 300; i++) {
      const pt = path.getPointAtLength((i / 300) * len);
      const d = (pt.x - sx) ** 2 + (pt.y - sy) ** 2;
      if (d < bestD) { bestD = d; best = i / 300; }
    }
    return best;
  });

  const nodes = [".jn-1", ".jn-2", ".jn-3"].map((s) => document.querySelector(s));
  const cards = [".jc-1", ".jc-2", ".jc-3"].map((s) => document.querySelector(s));

  function setProgress(p) {
    path.style.strokeDashoffset = len * (1 - p);
    fractions.forEach((f, i) => {
      const on = p >= Math.max(f, 0.02);
      if (nodes[i]) nodes[i].classList.toggle("lit", on);
      if (cards[i]) cards[i].classList.toggle("lit", on);
    });
  }

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    const state = { p: 0 };
    gsap.to(state, {
      p: 1, ease: "none",
      scrollTrigger: { trigger: journey, start: "top 80%", end: "bottom 55%", scrub: 0.6 },
      onUpdate: () => setProgress(state.p),
    });
  } else {
    setProgress(1); // no GSAP — show the journey complete
  }
})();

/* ===========================================================
   Hero foreground — morphing icon particles (right side)
   Tiny dots assemble into a silhouette, hold, then scatter and
   reform into the next: programmer at desk → AI/robot → cloud → hacker.
   Shapes are drawn with canvas primitives, then sampled to points.
   =========================================================== */
(function heroParticles() {
  const canvas = document.getElementById("hero-particles");
  const hero = document.getElementById("home");
  if (!canvas || !hero) return;
  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0, box = 0, ox = 0, oy = 0;

  const S = 300;
  function rr(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); c.fill();
  }
  // draw each icon into an offscreen canvas, then collect opaque pixels
  function sample(draw) {
    const oc = document.createElement("canvas"); oc.width = S; oc.height = S;
    const c = oc.getContext("2d"); c.fillStyle = "#fff"; c.strokeStyle = "#fff"; c.lineCap = "round"; c.lineJoin = "round"; draw(c);
    const d = c.getImageData(0, 0, S, S).data, pts = [];
    for (let y = 0; y < S; y += 2)
      for (let x = 0; x < S; x += 2)
        if (d[(y * S + x) * 4 + 3] > 128) pts.push([x / S, y / S]);
    return pts;
  }

  const icons = [
    // 1 — programmer seated at a desk: chair, legs, monitor, keyboard
    (c) => {
      rr(c, 40, 246, 224, 8, 3);                                  // floor
      rr(c, 148, 162, 132, 10, 4); rr(c, 258, 172, 10, 74, 2);    // desk + leg
      rr(c, 186, 104, 76, 52, 6); rr(c, 218, 156, 10, 6, 1);      // monitor + stand
      rr(c, 154, 154, 36, 7, 3);                                  // keyboard
      c.beginPath(); c.arc(84, 82, 20, 0, 7); c.fill();           // head
      c.lineWidth = 26; c.beginPath(); c.moveTo(84, 112); c.lineTo(78, 172); c.stroke();   // torso
      c.lineWidth = 11; c.beginPath(); c.moveTo(84, 124); c.quadraticCurveTo(120, 150, 160, 156); c.stroke(); // arm
      c.lineWidth = 22; c.beginPath(); c.moveTo(78, 178); c.lineTo(130, 182); c.stroke();  // thigh
      c.lineWidth = 12; c.beginPath(); c.moveTo(132, 184); c.lineTo(132, 238); c.stroke(); // shin
      c.lineWidth = 9;  c.beginPath(); c.moveTo(132, 240); c.lineTo(154, 240); c.stroke(); // foot
      rr(c, 46, 116, 10, 78, 4);                                  // chair backrest
      rr(c, 50, 190, 62, 10, 4); rr(c, 76, 200, 8, 32, 2); rr(c, 58, 232, 46, 8, 4); // seat, post, base
    },
    // 2 — AI brain with circuit lines + nodes
    (c) => {
      [[110,128,30],[136,108,34],[166,104,34],[194,124,30],[206,150,26],[120,154,30],[150,150,36],[182,154,30],[150,124,34]]
        .forEach(([x,y,r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }); // bumpy brain
      c.globalCompositeOperation = "destination-out"; c.lineWidth = 5;
      c.beginPath(); c.moveTo(150,86); c.lineTo(150,184); c.stroke();              // central fissure
      c.beginPath(); c.moveTo(120,116); c.quadraticCurveTo(140,134,120,154); c.stroke();
      c.beginPath(); c.moveTo(180,116); c.quadraticCurveTo(160,134,180,154); c.stroke();
      c.globalCompositeOperation = "source-over"; c.lineWidth = 5;
      [[150,86,150,50],[110,128,64,108],[206,148,244,140],[120,180,98,224],[182,180,206,224]]
        .forEach(([a,b,x,y]) => { c.beginPath(); c.moveTo(a,b); c.lineTo(x,y); c.stroke(); c.beginPath(); c.arc(x,y,8,0,7); c.fill(); }); // traces + nodes
    },
    // 3 — cloud
    (c) => {
      c.beginPath(); c.arc(108, 168, 38, 0, 7); c.fill();
      c.beginPath(); c.arc(158, 146, 50, 0, 7); c.fill();
      c.beginPath(); c.arc(206, 170, 40, 0, 7); c.fill();
      rr(c, 92, 164, 132, 44, 22);
    },
    // 4 — Python logo (two interlocking snakes)
    (c) => {
      rr(c, 95, 58, 56, 90, 26); rr(c, 95, 104, 120, 44, 22);    // top snake: left bar + right arm
      rr(c, 149, 152, 56, 90, 26); rr(c, 85, 152, 120, 44, 22);  // bottom snake: right bar + left arm
      c.globalCompositeOperation = "destination-out";
      c.beginPath(); c.arc(119, 80, 6, 0, 7); c.fill();           // top eye
      c.beginPath(); c.arc(181, 220, 6, 0, 7); c.fill();          // bottom eye
      c.globalCompositeOperation = "source-over";
    },
    // 5 — git / network graph (nodes + connecting lines)
    (c) => {
      c.lineWidth = 6;
      const n = [[64,70],[64,150],[64,230],[140,110],[140,200],[214,66],[214,150],[214,232]];
      [[0,1],[1,2],[1,3],[3,4],[0,5],[5,6],[6,7],[3,6],[4,7]]
        .forEach(([a,b]) => { c.beginPath(); c.moveTo(n[a][0],n[a][1]); c.lineTo(n[b][0],n[b][1]); c.stroke(); });
      n.forEach(([x,y]) => { c.beginPath(); c.arc(x, y, 12, 0, 7); c.fill(); });
    },
  ];

  const clouds = icons.map(sample);                 // full uniform grid per icon → crisp
  const N = Math.max(...clouds.map((c) => c.length));
  // every particle maps to a real grid cell; shorter icons wrap (dots overlap, unseen)
  const targets = clouds.map((pts) => Array.from({ length: N }, (_, i) => pts[i % pts.length]));

  const P = Array.from({ length: N }, () => ({
    x: Math.random(), y: Math.random(), tx: 0.5, ty: 0.5, ph: Math.random() * 6.28,
  }));
  let scene = 0;
  const apply = (k) => P.forEach((p, i) => { p.tx = targets[k][i][0]; p.ty = targets[k][i][1]; });
  apply(0);

  function resize() {
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    box = Math.min(W * 0.38, H * 0.58, 440); ox = W * 0.72 - box / 2; oy = H * 0.47 - box / 2;
  }
  window.addEventListener("resize", resize); resize();

  let visible = true;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(hero);

  let last = performance.now(), acc = 0; const HOLD = 2900;
  (function loop(now) {
    requestAnimationFrame(loop);
    if (!visible) { last = now; return; }
    acc += now - last; last = now;
    if (acc > HOLD) { acc = 0; scene = (scene + 1) % targets.length; apply(scene); }
    ctx.clearRect(0, 0, W, H);

    // clean flat-black backing (feathered edge, no visible gradient) so the icon
    // reads against the busy wave without an obvious darkened blob
    const cx = ox + box / 2, cy = oy + box / 2, rad = box * 0.96;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, "rgba(7,7,10,0.98)"); g.addColorStop(0.74, "rgba(7,7,10,0.97)"); g.addColorStop(1, "rgba(7,7,10,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 7); ctx.fill();

    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(236,242,255,0.95)";
    const ts = now / 1000;
    for (let i = 0; i < N; i++) {
      const p = P[i];
      p.x += (p.tx - p.x) * 0.1; p.y += (p.ty - p.y) * 0.1;
      const jx = Math.sin(ts * 1.1 + p.ph) * 0.0004, jy = Math.cos(ts * 0.9 + p.ph) * 0.0004;
      const px = ox + (p.x + jx) * box, py = oy + (p.y + jy) * box;
      ctx.beginPath(); ctx.arc(px, py, 0.8, 0, 7); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  })(last);
})();
