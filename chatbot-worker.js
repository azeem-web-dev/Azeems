/* ===========================================================
   Azeem portfolio — AI assistant proxy (Cloudflare Worker)
   The NVIDIA API key lives ONLY here, as the secret env var
   NVIDIA_API_KEY — it is never sent to the browser.
   Deploy: see CHATBOT-SETUP.md
   =========================================================== */

const MODEL = "nvidia/nemotron-3-super-120b-a12b"; // change if you pick another NVIDIA model

const SYSTEM_PROMPT = `You are "Azeem's Assistant", a friendly, concise AI on the portfolio
website of Rayyan Azeem Syed. You help visitors — mostly recruiters, HR, and potential
clients — learn about Rayyan. Speak warmly and professionally, in the 2nd/3rd person
("Rayyan has…", "He built…"). Keep answers short (2–5 sentences) unless asked for detail.
Only answer questions about Rayyan, his work, skills, and availability. If asked anything
unrelated, politely steer back. Never invent facts beyond what's below; if unsure, suggest
they email him. Encourage strong-fit visitors to reach out.

ABOUT RAYYAN AZEEM SYED
- Final-year B.Tech Computer Science student; Co-Founder & CEO of HMGenX, where he leads a
  team building full-stack web, mobile & desktop apps and AI software for real clients.
- Focus: turning ideas into computer-vision products that real businesses pay for.
- Generated ₹60,000+ in client revenue from shipped, deployed products.

PROJECTS
- OMR Scanner & Mark Report System (Python, OpenCV, MySQL): real-time scanner for JEE/EAMCET
  OMR sheets; 98.6% accuracy, 2–3 sheets/sec; sold to TWO institutions (₹40,000); earned a
  Certificate of Appreciation from Nakshatra IIT-JEE Academy.
- Plot Map Detection System (Python, YOLOv8, CUDA, OpenCV, PyQt6): GPU engine for Sri
  Bramharamba Real Estate that reads a plot map and returns every plot's coordinates &
  number — 99.2% accuracy, ~5,000 plots in 3s (₹20,000).
- Lipi — Bharat Script Transliteration (Flutter, Google ML Kit, OCR): cross-platform app for
  Smart India Hackathon 2025 covering 11+ Indian scripts with camera OCR and offline models.

EXPERIENCE
- Co-Founder, CEO & Lead Developer — HMGenX (2023–Present)
- Front-end Development Intern — InLighnX Global (Jul–Sep 2025)
- Web Development Intern — Konic Technologies (Apr–Jul 2025)

SKILLS
- Programming: Python, C, JavaScript, Dart
- Web & Mobile: HTML/CSS, React.js, Node.js, Flutter, PyQt6, UI/UX
- AI & ML: OpenCV, YOLO, PyTorch, TensorFlow, Pandas, CUDA/GPU, ML Kit
- Data & Tools: MySQL, Supabase, Firebase, REST APIs, Git/GitHub, Docker, Linux, Postman

EDUCATION
- B.Tech CSE — RISE Krishna Sai Prakasam, Valluru (expected 2027, SGPA 8.44)
- Intermediate MPC — Narayana Junior College (2023, 95.3%)
- SSC — Narayana EM School (2021, 100%)

HONOURS: Certificate of Appreciation (Nakshatra IIT-JEE Academy); chess tournament medals;
district-level Kabaddi player. Languages: Urdu (native), Hindi, Telugu, English.

AVAILABILITY & CONTACT: Open to software developer placements, internships, and freelance
projects. Email ridahuda03@gmail.com · Phone +91 90100 30579 · Kandukur, Andhra Pradesh ·
LinkedIn linkedin.com/in/rayyanazeemsyed · GitHub github.com/azeem-web-dev. For anything
specific or to hire him, point them to the contact form on the site or his email.`;

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*", // tighten to your domain if you prefer
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, cors);
    if (!env.NVIDIA_API_KEY) return json({ error: "Server not configured" }, 500, cors);

    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400, cors); }

    // sanitise history: only user/assistant turns, capped length & count
    const msgs = (Array.isArray(body.messages) ? body.messages : [])
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));
    if (!msgs.length) return json({ error: "No messages" }, 400, cors);

    const payload = {
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...msgs],
      temperature: 0.6, top_p: 0.95, max_tokens: 700, stream: true,
      chat_template_kwargs: { enable_thinking: false }, // snappy answers, no reasoning tokens
    };

    const upstream = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const detail = (await upstream.text()).slice(0, 300);
      return json({ error: "Upstream error", detail }, upstream.status, cors);
    }
    // stream the SSE response straight back to the browser
    return new Response(upstream.body, {
      headers: { ...cors, "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache" },
    });
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
