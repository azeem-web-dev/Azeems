/**
 * Azeem's Assistant — Cloudflare Worker (self-updating)
 *
 * The bot's knowledge is NOT hardcoded. On each request it reads the live
 * portfolio (index.html, resume.html and the case-study data in portfolio.js),
 * strips them to plain text, and feeds that to the model as context.
 *
 * => Update the website, redeploy the site, and the bot is instantly current.
 *    You never touch this file again.
 *
 * Edge-cached for KB_TTL seconds, so it costs one subrequest per source per
 * TTL window, not one per chat message.
 *
 * Required secret:  NVIDIA_API_KEY
 * Optional vars:    SITE_BASE      (defaults to the production site)
 *                   ALLOWED_ORIGIN (defaults to the production site)
 */

/* Models are tried in order; the first one that answers wins. NVIDIA retires
   models without warning (qwen3-next-80b died 2026-07-27 and took the bot
   offline), so a single hardcoded id is a guaranteed future outage.
   Live catalogue: https://integrate.api.nvidia.com/v1/models (no key needed)

   IMPORTANT: use NON-REASONING instruct models only. Reasoning models
   (nemotron-3.5-lightning, nemotron-3-super, ...) stream their chain of
   thought in `reasoning_content` and then dump the whole transcript into
   `content` as ONE final chunk — which kills token-by-token streaming, shows
   the thinking to visitors, and burns max_tokens before writing an answer. */
const MODELS = [
  "meta/llama-3.3-70b-instruct",       // non-reasoning, fast, known-good
  "meta/llama-3.1-70b-instruct",       // non-reasoning fallback
  "mistralai/mistral-large-2-instruct",// non-reasoning fallback
  "meta/llama-3.1-8b-instruct",        // last resort, always available
];
const DEFAULT_SITE = "https://azeem.highflyers.io";
const KB_TTL = 1800;        // seconds to edge-cache the scraped knowledge (30 min)
const KB_MAX_CHARS = 20000; // hard cap so the site can never blow the context

/* ===========================================================
   Persona — the only thing you would ever hand-edit.
   Facts live on the website, not here.
   =========================================================== */
const PERSONA = `You are "Azeem's Assistant" — the friendly, sharp AI host on Rayyan Azeem Syed's
portfolio. Your job: help visitors (recruiters, HR, founders, potential clients) quickly understand
who Rayyan is and why he's worth contacting.

STYLE: Warm, confident, concise. Default to 2-4 sentences; expand only when asked. Refer to him in
the third person ("Rayyan...", "He..."). Plain language, no buzzword salad. Only discuss Rayyan —
his work, skills, projects, education and availability. If asked anything off-topic, briefly and
politely steer back to Rayyan. If a visitor seems like a good fit (hiring or a project), warmly
encourage them to reach out.

GROUNDING — this matters: everything you say about Rayyan MUST come from the LIVE PORTFOLIO CONTENT
below, which is scraped fresh from his website. Never invent details that aren't there. If you are
asked something the content doesn't cover (exact salary, notice period, a technology not listed),
say plainly that you're not certain and suggest emailing ridahuda03@gmail.com or using the contact
form. Use the specific numbers and project names exactly as they appear in the content — they are
current by definition. If two figures appear to conflict, quote the one stated on the project itself
rather than a summary statistic.`;

/* Minimal safety net — only used if the site is unreachable. */
const FALLBACK = `Rayyan Azeem Syed — final-year B.Tech Computer Science student and Co-Founder &
CEO of HMGenX, building full-stack web, mobile and AI products for paying clients. Based in
Kandukur, Andhra Pradesh, India.
Contact: ridahuda03@gmail.com - +91 90100 30579 - linkedin.com/in/rayyanazeemsyed -
github.com/azeem-web-dev
(The live site could not be reached just now, so detail is limited — encourage the visitor to email
him or browse the page directly.)`;

/* ===========================================================
   Scrape + clean
   =========================================================== */
function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|section|article|li|h[1-6]|tr|td)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/* Pull the case-study DATA object out of portfolio.js — it holds the richest
   per-project detail (challenge / approach / metrics / result / links). */
function extractCaseStudies(js) {
  const start = js.indexOf("const DATA = {");
  if (start === -1) return "";
  const end = js.indexOf("function render", start);
  const block = js.slice(start, end === -1 ? start + 16000 : end);
  return block
    .replace(/^\s*const DATA = \{/, "")
    .replace(/<[^>]+>/g, "")        // strip inline HTML inside the strings
    .replace(/&amp;/g, "&")
    .replace(/["`]/g, "")
    .replace(/,\s*$/gm, "")
    .replace(/^\s*[}\],]+\s*$/gm, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/* The headline stats render as "0" in the HTML — the real value lives in the
   data-count attribute and is only animated in by JS. Recover them explicitly. */
function extractStats(html) {
  const re = /data-count="([\d.]+)"[^>]*>[\s\S]*?stat-unit">([^<]*)<\/span>\s*<p>([^<]+)<\/p>/g;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push("- " + m[3].trim() + ": " + m[1] + m[2].trim());
  }
  return out.length ? "HEADLINE STATS\n" + out.join("\n") : "";
}

async function fetchSource(url) {
  try {
    const r = await fetch(url, {
      cf: { cacheTtl: KB_TTL, cacheEverything: true },
      headers: { "User-Agent": "AzeemAssistant-KB/1.0" },
    });
    return r.ok ? await r.text() : "";
  } catch {
    return "";
  }
}

async function buildKnowledge(base) {
  const [index, resume, js] = await Promise.all([
    fetchSource(base + "/index.html"),
    fetchSource(base + "/resume.html"),
    fetchSource(base + "/portfolio.js"),
  ]);

  const parts = [];
  if (index) {
    const stats = extractStats(index);
    parts.push("--- PORTFOLIO HOME PAGE ---\n" + (stats ? stats + "\n" : "") + htmlToText(index));
  }
  if (resume) parts.push("--- RESUME PAGE ---\n" + htmlToText(resume));
  const cs = js ? extractCaseStudies(js) : "";
  if (cs) parts.push("--- PROJECT CASE STUDIES ---\n" + cs);

  if (!parts.length) return FALLBACK;
  return parts.join("\n\n").slice(0, KB_MAX_CHARS);
}

/* ===========================================================
   Worker
   =========================================================== */
export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || DEFAULT_SITE;
    const cors = {
      "Access-Control-Allow-Origin": origin, // your site only (use "*" to allow any)
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

    // Live, self-updating knowledge base
    const knowledge = await buildKnowledge(env.SITE_BASE || DEFAULT_SITE);
    const system = PERSONA +
      "\n\n=== LIVE PORTFOLIO CONTENT (scraped from the website) ===\n" + knowledge;

    let r = null, used = "", lastErr = "no model attempted";
    for (const model of MODELS) {
      try {
        r = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + env.NVIDIA_API_KEY,
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "system", content: system }, ...msgs],
            temperature: 0.6, top_p: 0.95, max_tokens: 800, stream: true,
          }),
        });
      } catch (e) { lastErr = String(e); r = null; continue; }

      if (r.ok) { used = model; break; }

      // 404/410 = retired or unknown model, 400 = rejected request shape.
      // Any of those: move on to the next candidate.
      if (r.status === 404 || r.status === 410 || r.status === 400) {
        lastErr = model + " -> " + r.status + " " + (await r.text()).slice(0, 200);
        r = null;
        continue;
      }
      break; // 401/429/5xx are real failures worth surfacing as-is
    }

    if (!r) return json({ error: "No model available", detail: lastErr }, 502, cors);
    if (!r.ok) {
      const detail = (await r.text()).slice(0, 300);
      return json({ error: "Model API error", status: r.status, detail }, 502, cors);
    }
    return new Response(r.body, {
      headers: {
        ...cors,
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Model-Used": used, // handy when debugging which model answered
      },
    });
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
