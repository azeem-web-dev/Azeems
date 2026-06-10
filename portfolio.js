/* ===========================================================
   Portfolio interactions
   typed terminal · VANTA 3D net · reveals · counters · tilt
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
   Typed code terminal
   =========================================================== */
(function typeTerminal() {
  const code = document.getElementById("typed");
  if (!code) return;
  const T = [
    ["const ", "k"], ["developer", ""], [" = {\n", ""],
    ["  name", "p"], [": ", ""], ['"Rayyan Azeem Syed"', "s"], [",\n", ""],
    ["  role", "p"], [": ", ""], ['"Full-Stack & AI Dev"', "s"], [",\n", ""],
    ["  founder", "p"], [": ", ""], ['"HMGenX"', "s"], [",\n", ""],
    ["  stack", "p"], [": [", ""], ['"Python"', "s"], [", ", ""], ['"Flutter"', "s"], [", ", ""], ['"React"', "s"], ["],\n", ""],
    ["  shipped", "p"], [": ", ""], ["3", "n"], [" products,\n", ""],
    ["  revenue", "p"], [": ", ""], ['"₹60k+"', "s"], [",\n", ""],
    ["  build", "p"], [": ", ""], ["() => ", "f"], ['"real things"', "s"], ["\n", ""],
    ["};", "k"],
  ];
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const span = (t, c) => (c ? `<span class="${c}">${esc(t)}</span>` : esc(t));
  let ti = 0, ci = 0, done = "";
  function step() {
    if (ti >= T.length) return;
    const [text, cls] = T[ti];
    ci++;
    code.innerHTML = done + span(text.slice(0, ci), cls);
    const justTyped = text[ci - 1];
    if (ci >= text.length) { done += span(text, cls); ti++; ci = 0; }
    setTimeout(step, justTyped === "\n" ? 110 : 14 + Math.random() * 26);
  }
  setTimeout(step, 600);
})();

/* ===========================================================
   VANTA 3D network backgrounds (graceful fallback)
   =========================================================== */
(function initVanta() {
  if (typeof VANTA === "undefined" || typeof THREE === "undefined") return;
  const common = {
    THREE: THREE,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    scale: 1.0,
    scaleMobile: 1.0,
  };
  if (document.getElementById("vanta-hero")) {
    VANTA.NET({
      el: "#vanta-hero",
      ...common,
      color: 0xc79a4f,
      backgroundColor: 0x0e1118,
      points: 12.0,
      maxDistance: 23.0,
      spacing: 16.0,
      showDots: true,
    });
  }
  if (document.getElementById("vanta-contact")) {
    VANTA.NET({
      el: "#vanta-contact",
      ...common,
      color: 0xb8924d,
      backgroundColor: 0x0e1118,
      points: 9.0,
      maxDistance: 20.0,
      spacing: 18.0,
      showDots: false,
    });
  }
})();
