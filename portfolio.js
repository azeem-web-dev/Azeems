/* ===========================================================
   Portfolio interactions — 3D scenes, reveals, counters, tilt
   =========================================================== */

/* ---------- Nav state ---------- */
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 60);
});

/* ---------- Scroll reveals ---------- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        e.target.style.transitionDelay = `${(e.target.dataset.idx % 6) * 90}ms`;
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.dataset.idx = i;
  io.observe(el);
});

/* ---------- Stat counters ---------- */
const counterIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const dur = 1600;
      const t0 = performance.now();
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
    card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

/* ===========================================================
   Three.js scenes (guarded — page works fine without WebGL)
   =========================================================== */
function makeScene(canvasId, opts = {}) {
  if (typeof THREE === "undefined") return;
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 7;

  const gold = new THREE.Color(0xb8924d);
  const goldSoft = new THREE.Color(0xd6bb86);

  /* Particle field */
  const N = opts.particles ?? 700;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N * 3; i++) pos[i] = (Math.random() - 0.5) * 18;
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({
    color: goldSoft,
    size: 0.022,
    transparent: true,
    opacity: 0.75,
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  /* Elegant wireframe solids */
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({
    color: gold,
    wireframe: true,
    transparent: true,
    opacity: 0.28,
  });
  const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(2.1, 0), mat);
  group.add(ico);
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(3.1, 0.012, 12, 110),
    new THREE.MeshBasicMaterial({ color: goldSoft, transparent: true, opacity: 0.35 })
  );
  torus.rotation.x = Math.PI / 2.6;
  group.add(torus);
  const torus2 = torus.clone();
  torus2.rotation.x = -Math.PI / 2.9;
  torus2.scale.setScalar(1.18);
  group.add(torus2);
  scene.add(group);

  /* Mouse parallax */
  let mx = 0, my = 0;
  window.addEventListener("mousemove", (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    group.rotation.y = t * 0.12;
    group.rotation.x = Math.sin(t * 0.18) * 0.18;
    points.rotation.y = t * 0.025;
    camera.position.x += (mx * 0.7 - camera.position.x) * 0.04;
    camera.position.y += (-my * 0.45 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  })();
}

makeScene("scene", { particles: 750 });
makeScene("scene2", { particles: 350 });
