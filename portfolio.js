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
   3D hero — morphing liquid-glass blob (GPU noise + reflections)
   =========================================================== */
(function heroScene() {
  if (typeof THREE === "undefined") return;
  const canvas = document.getElementById("deskscene");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0b0b0d, 1);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 7.6);

  /* ---- iridescent environment (drives the glass reflections) ---- */
  const ec = document.createElement("canvas"); ec.width = 1024; ec.height = 512;
  const ex = ec.getContext("2d");
  const vg = ex.createLinearGradient(0, 0, 0, 512);
  vg.addColorStop(0, "#070710"); vg.addColorStop(0.42, "#33408a"); vg.addColorStop(0.5, "#e6ecff");
  vg.addColorStop(0.58, "#8a5cff"); vg.addColorStop(1, "#070710");
  ex.fillStyle = vg; ex.fillRect(0, 0, 1024, 512);
  ex.globalCompositeOperation = "lighter";
  const glow = (x, y, r, c) => { const g = ex.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, "rgba(0,0,0,0)"); ex.fillStyle = g; ex.fillRect(0, 0, 1024, 512); };
  glow(300, 150, 280, "rgba(120,165,255,0.95)");
  glow(770, 360, 260, "rgba(255,120,205,0.8)");
  glow(540, 80, 200, "rgba(120,255,235,0.6)");
  const envTex = new THREE.CanvasTexture(ec); envTex.mapping = THREE.EquirectangularReflectionMapping; envTex.encoding = THREE.sRGBEncoding;

  scene.add(new THREE.AmbientLight(0x404860, 0.55));
  const d1 = new THREE.DirectionalLight(0xffffff, 1.0); d1.position.set(5, 6, 5); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0x6a7bff, 0.9); d2.position.set(-6, -2, 3); scene.add(d2);

  const SNOISE = `
  vec3 sn_mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 sn_mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 sn_permute(vec4 x){return sn_mod289(((x*34.0)+1.0)*x);}
  vec4 sn_tisqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy; i=sn_mod289(i);
    vec4 p=sn_permute(sn_permute(sn_permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=sn_tisqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3))); p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }`;

  const uniforms = { uTime: { value: 0 }, uAmp: { value: 0.5 }, uFreq: { value: 0.52 }, uMouse: { value: new THREE.Vector2(0, 0) } };
  const mat = new THREE.MeshPhysicalMaterial({ color: 0x222a55, metalness: 0.35, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.14, envMap: envTex, envMapIntensity: 1.5, reflectivity: 1.0 });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime; shader.uniforms.uAmp = uniforms.uAmp;
    shader.uniforms.uFreq = uniforms.uFreq; shader.uniforms.uMouse = uniforms.uMouse;
    shader.vertexShader = "uniform float uTime; uniform float uAmp; uniform float uFreq; uniform vec2 uMouse;\n" + SNOISE +
      "\nvec3 sn_disp(vec3 p){ float n = snoise(p*uFreq + vec3(uMouse*1.4, uTime*0.28)); float n2 = snoise(p*uFreq*2.1 + vec3(0.0, uTime*0.18, 0.0)); return p + normalize(p)*((n*0.8 + n2*0.3)*uAmp); }\n" +
      shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace("#include <beginnormal_vertex>",
      "vec3 sn_p0 = sn_disp(position); vec3 sn_N = normalize(position);" +
      "vec3 sn_t = normalize(cross(sn_N, vec3(0.0,1.0,0.0)) + vec3(0.0001));" +
      "vec3 sn_b = normalize(cross(sn_N, sn_t)); float sn_e = 0.06;" +
      "vec3 sn_pa = sn_disp(position + sn_t*sn_e); vec3 sn_pb = sn_disp(position + sn_b*sn_e);" +
      "vec3 objectNormal = normalize(cross(sn_pa - sn_p0, sn_pb - sn_p0));");
    shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", "vec3 transformed = sn_disp(position);");
  };

  const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 12), mat);
  const group = new THREE.Group(); group.add(blob); scene.add(group);

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener("mousemove", (e) => { tmx = e.clientX / window.innerWidth - 0.5; tmy = e.clientY / window.innerHeight - 0.5; });
  function resize() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    group.position.x = w > 980 ? 2.7 : 0;   // sit to the right, clear of the hero text
  }
  window.addEventListener("resize", resize); resize();

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.elapsedTime;
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    uniforms.uTime.value = t;
    uniforms.uMouse.value.set(mx * 2.0, my * 2.0);
    uniforms.uAmp.value = 0.5 + Math.hypot(mx, my) * 0.4;   // warps more as the cursor moves
    group.rotation.y = t * 0.12 + mx * 0.8;
    group.rotation.x = -my * 0.5;
    camera.lookAt(group.position.x * 0.55, 0, 0);
    renderer.render(scene, camera);
  })();
})();
