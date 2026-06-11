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
    const t = clock.elapsedTime;
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    for (let i = 0; i < arr.length; i += 3) {
      const x = base[i], z = base[i + 2];
      arr[i + 1] = Math.sin(x * 0.42 + t * 0.9) * 0.62
                 + Math.cos(z * 0.5 + t * 0.75) * 0.5
                 + Math.sin((x + z) * 0.28 + t * 1.15) * 0.42;
    }
    geo.attributes.position.needsUpdate = true;
    grid.rotation.y = mx * 0.25;
    camera.position.x += (mx * 4 - camera.position.x) * 0.04;
    camera.position.y += (3.2 - my * 1.6 - camera.position.y) * 0.04;
    camera.lookAt(0, -0.4, -3);
    renderer.render(scene, camera);
  })();
})();
