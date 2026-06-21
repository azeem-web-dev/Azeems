# AI Assistant — setup (Cloudflare Worker, ~5 min)

## Why not PHP on Hostinger?
Hostinger's servers **cannot make outbound calls to the NVIDIA API** (the request
times out — verified). So a PHP proxy on Hostinger can never reach the model.
Instead the browser talks to a tiny **Cloudflare Worker**, which calls NVIDIA.
Hostinger only serves the static site, so its outbound block doesn't matter.

Flow:  browser → Cloudflare Worker (holds the key) → NVIDIA

## 1. Create the Worker
1. https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Create Worker**.
2. Name it `azeem-assistant` → **Deploy** → **Edit code**.
3. Replace everything with the contents of **`chatbot-worker.js`** (in this repo).
   **Save and deploy.**

## 2. Add the API key as a secret
1. In the Worker → **Settings → Variables and Secrets → + Add**.
2. Type **Secret**, Name `NVIDIA_API_KEY`, Value = your NVIDIA key
   (`nvapi-…`). Save, then **Deploy** again.

## 3. Point the site at the Worker
Copy the Worker URL (looks like `https://azeem-assistant.<you>.workers.dev`).
In `index.html`, set:
```html
<script>window.AZEEM_CHAT_ENDPOINT = "https://azeem-assistant.<you>.workers.dev";</script>
```
Commit & push (auto-deploys to Hostinger). Open the site → chat works.

## Notes
- Non-streaming: returns the full reply as JSON `{ "reply": "..." }`.
- Model is set at the top of `chatbot-worker.js` (`MODEL`). Cost guardrails:
  700 max tokens, last 12 turns, input capped.
- To lock it to your site, change `Access-Control-Allow-Origin: "*"` to
  `"https://azeem.highflyers.io"`.
- `chat.php` / `secrets.php` are now unused (kept for reference). You can delete
  them: `git rm chat.php secrets.php`.
