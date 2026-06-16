# AI Assistant — setup (5 minutes)

The chat widget on the site talks to a tiny **Cloudflare Worker** that holds your
NVIDIA API key as a secret. The key is **never** in the website code.

## 1. Rotate your key first
Your previous key was shared in plain text — revoke it at https://build.nvidia.com
and create a fresh one. Use the new key below.

## 2. Deploy the Worker
1. Go to https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Create Worker**.
2. Name it e.g. `azeem-assistant`, click **Deploy**, then **Edit code**.
3. Replace the contents with the code from `chatbot-worker.js` in this repo. **Save & Deploy**.
4. **Settings → Variables and Secrets → Add** a secret:
   - Name: `NVIDIA_API_KEY`
   - Value: *(your new NVIDIA key)*
   - Click **Encrypt** / Save, then **Deploy** again.
5. Copy the Worker URL (looks like `https://azeem-assistant.<you>.workers.dev`).

## 3. Point the site at the Worker
In `index.html`, set:
```html
<script>window.AZEEM_CHAT_ENDPOINT = "https://azeem-assistant.<you>.workers.dev";</script>
```
Commit & push. Done — open the site, click the chat bubble, ask a question.

## Notes
- Model is set in `chatbot-worker.js` (`MODEL`). Change it to any NVIDIA model id you like.
- Cost guardrails are built in: max 700 output tokens, last 12 turns only, input capped.
- To lock it to your domain, change `Access-Control-Allow-Origin: "*"` in the Worker to
  `"https://azeem.highflyers.io"`.
