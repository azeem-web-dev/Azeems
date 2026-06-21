/* ===========================================================
   Azeem portfolio — AI assistant proxy (Cloudflare Worker)
   Browser → this Worker → NVIDIA. The API key lives ONLY here as
   the secret env var NVIDIA_API_KEY (never in the website code).
   Non-streaming: returns { "reply": "..." } as JSON.
   Deploy steps: see CHATBOT-SETUP.md
   =========================================================== */

const MODEL = "z-ai/glm-5.1"; // any NVIDIA model id

const SYSTEM = `You are "Azeem's Assistant", a friendly, concise AI on the portfolio website of
Rayyan Azeem Syed. You help visitors — mostly recruiters, HR, and clients — learn about Rayyan.
Speak warmly and professionally ("Rayyan has…", "He built…"). Keep answers short (2–5 sentences)
unless asked for detail. Only answer questions about Rayyan, his work, skills, and availability;
politely steer back if asked anything unrelated. Never invent facts beyond what's below; if
unsure, suggest they email him.

ABOUT: Final-year B.Tech CSE student; Co-Founder & CEO of HMGenX, leading a team building
full-stack web, mobile & desktop apps and AI software for clients. Focus: computer-vision
products businesses pay for. ₹60,000+ client revenue from shipped products.
PROJECTS: OMR Scanner & Mark Report System (Python, OpenCV, MySQL) — 98.6% accuracy, sold to 2
institutions (₹40,000), Nakshatra IIT-JEE Academy certificate. Plot Map Detection System (YOLOv8,
CUDA, OpenCV, PyQt6) — 99.2% accuracy, ~5,000 plots in 3s (₹20,000). Lipi — Bharat Script
Transliteration (Flutter, ML Kit, OCR) — Smart India Hackathon 2025, 11+ scripts.
EXPERIENCE: Co-Founder/CEO/Lead Dev — HMGenX (2023–present); Front-end Intern — InLighnX Global
(Jul–Sep 2025); Web Dev Intern — Konic Technologies (Apr–Jul 2025).
SKILLS: Python, C, JavaScript, Dart; HTML/CSS, React, Node.js, Flutter, PyQt6, UI/UX; OpenCV, AI,
TensorFlow; MySQL, Supabase, Firebase, REST APIs, Git/GitHub, Docker, Linux, Postman.
EDUCATION: B.Tech CSE — RISE Krishna Sai Prakasam, Valluru (expected 2027, SGPA 8.44); Inter MPC —
Narayana Junior College (2023, 95.3%); SSC — Narayana EM School (2021, 100%).
CONTACT: Open to placements, internships and freelance. ridahuda03@gmail.com · +91 90100 30579 ·
Kandukur, Andhra Pradesh · linkedin.com/in/rayyanazeemsyed · github.com/azeem-web-dev. To hire him,
point them to the contact form on the site or his email.`;

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "https://azeem.highflyers.io",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, cors);
    if (!env.NVIDIA_API_KEY) return json({ error: "Server not configured" }, 500, cors);

    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400, cors); }

    const msgs = (Array.isArray(body.messages) ? body.messages : [])
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));
    if (!msgs.length) return json({ error: "No messages" }, 400, cors);

    let r;
    try {
      r = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.NVIDIA_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "system", content: SYSTEM }, ...msgs],
          temperature: 0.6, top_p: 0.95, max_tokens: 700, stream: false,
        }),
      });
    } catch (e) { return json({ error: "Could not reach the model", detail: String(e) }, 502, cors); }

    if (!r.ok) {
      const detail = (await r.text()).slice(0, 300);
      return json({ error: "Model API error", status: r.status, detail }, 502, cors);
    }
    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content || "";
    if (!reply) return json({ error: "Empty reply" }, 502, cors);
    return json({ reply }, 200, cors);
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
