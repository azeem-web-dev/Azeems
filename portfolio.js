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
   3D hero — anime character showcase (game character-select)
   =========================================================== */
(function characterScene() {
  if (typeof THREE === "undefined" || typeof THREE.OBJLoader === "undefined" || typeof THREE.MTLLoader === "undefined") return;
  const canvas = document.getElementById("deskscene");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0b0b0d, 1);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b0b0d, 10, 28);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const camBase = new THREE.Vector3(0, 1.95, 6.7);
  camera.position.copy(camBase);
  const lookTarget = new THREE.Vector3(0, 2.05, 0);
  const mk = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };

  /* ---- dramatic character lighting ---- */
  scene.add(new THREE.AmbientLight(0x3a4150, 0.8));
  const key = new THREE.DirectionalLight(0xfff0dc, 1.55); key.position.set(-5, 7, 6); scene.add(key);
  const rimBlue = new THREE.DirectionalLight(0x5a7cff, 2.0); rimBlue.position.set(7, 4, -5); scene.add(rimBlue);
  const rimRed = new THREE.DirectionalLight(0xff3a3a, 1.3); rimRed.position.set(-7, 3, -4); scene.add(rimRed);
  const front = new THREE.DirectionalLight(0xffffff, 0.55); front.position.set(2, 2.5, 9); scene.add(front);

  /* ---- backdrop halo (additive radial glow) ---- */
  const gc = document.createElement("canvas"); gc.width = gc.height = 256;
  const gx = gc.getContext("2d");
  const grd = gx.createRadialGradient(128, 128, 8, 128, 128, 128);
  grd.addColorStop(0, "rgba(96,116,210,0.6)"); grd.addColorStop(0.5, "rgba(60,72,150,0.22)"); grd.addColorStop(1, "rgba(0,0,0,0)");
  gx.fillStyle = grd; gx.fillRect(0, 0, 256, 256);
  const halo = mk(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), 0, 2.6, -4);
  scene.add(halo);

  /* ---- pedestal + spinning glow ring ---- */
  scene.add(mk(new THREE.CylinderGeometry(2.1, 2.4, 0.3, 56), new THREE.MeshStandardMaterial({ color: 0x111218, roughness: 0.5, metalness: 0.6 }), 0, 0.0, 0));
  scene.add(mk(new THREE.CylinderGeometry(1.75, 1.75, 0.06, 56), new THREE.MeshStandardMaterial({ color: 0x1b1d26, roughness: 0.3, metalness: 0.7 }), 0, 0.17, 0));
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x5a7cff, emissive: 0x5a7cff, emissiveIntensity: 1.5, roughness: 0.4 });
  const ringGroup = new THREE.Group(); scene.add(ringGroup);
  const ring = mk(new THREE.TorusGeometry(1.95, 0.045, 16, 80), ringMat, 0, 0.2, 0); ring.rotation.x = Math.PI / 2; ringGroup.add(ring);

  /* ---- the character (OBJ + textures) ---- */
  const charGroup = new THREE.Group(); scene.add(charGroup);
  let charReady = false;
  const CHAR = window.CHAR = { ry: 0, x: 0, y: 0.2, scale: 3.7 };
  function applyChar() { charGroup.rotation.y = CHAR.ry; charGroup.position.set(CHAR.x, CHAR.y, 0); }
  window.__applyChar = applyChar; applyChar();

  const mtl = new THREE.MTLLoader(); mtl.setPath("character/");
  mtl.load("Madara_Uchiha.mtl", (mats) => {
    mats.preload();
    const ol = new THREE.OBJLoader(); ol.setMaterials(mats); ol.setPath("character/");
    ol.load("Madara_Uchiha.obj", (o) => {
      o.traverse((m) => {
        if (!m.isMesh) return;
        const fix = (mt) => { if (mt.map) { mt.color.setRGB(1, 1, 1); mt.map.encoding = THREE.sRGBEncoding; } if ("shininess" in mt) mt.shininess = 8; if (mt.specular) mt.specular.setRGB(0.05, 0.05, 0.05); mt.needsUpdate = true; };
        Array.isArray(m.material) ? m.material.forEach(fix) : fix(m.material);
      });
      const box = new THREE.Box3().setFromObject(o), sz = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
      o.position.set(-ctr.x, -box.min.y, -ctr.z);     // centre x/z, feet on the floor
      const wrap = new THREE.Group(); wrap.add(o); wrap.scale.setScalar(4.0 / sz.y);
      charGroup.add(wrap);
      window.__model = o; charReady = true;
    });
  });

  /* ---- interaction + render loop ---- */
  let mx = 0, my = 0;
  window.addEventListener("mousemove", (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; });
  function resize() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    lookTarget.x = w > 980 ? -1.9 : 0;   // push the figure to the right, clear of the hero text
  }
  window.addEventListener("resize", resize); resize();

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.elapsedTime;
    if (charReady) {
      charGroup.rotation.y = CHAR.ry + Math.sin(t * 0.4) * 0.2 + mx * 0.55;   // gentle sway + mouse parallax
      charGroup.position.y = CHAR.y + Math.sin(t * 0.9) * 0.04;               // subtle float
    }
    ringGroup.rotation.y = t * 0.35;
    ringMat.emissiveIntensity = 1.4 + Math.sin(t * 2) * 0.45;
    camera.position.x += (mx * 0.8 - camera.position.x) * 0.05;
    camera.position.y += (camBase.y - my * 0.6 - camera.position.y) * 0.05;
    camera.lookAt(lookTarget.x, lookTarget.y, lookTarget.z);
    renderer.render(scene, camera);
  })();
})();
