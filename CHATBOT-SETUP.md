# AI Assistant — setup (Hostinger PHP, ~3 minutes)

The chat widget calls **`/chat.php`** on your own domain. That PHP file holds your
NVIDIA key — but the key is **never** committed to GitHub. It's read from a
`secrets.php` file that is gitignored (or from an environment variable).

## 1. Rotate your key first
The key you shared earlier is compromised — revoke it at https://build.nvidia.com
and create a fresh one.

## 2. Create secrets.php on the server (one time)
Because `secrets.php` is gitignored, auto-deploy will never overwrite or expose it.
Create it once on Hostinger:

1. Hostinger **hPanel → Files → File Manager** → open your site's web root
   (where `index.html` / `chat.php` live).
2. Create a new file named **`secrets.php`** with exactly:
   ```php
   <?php
   return 'nvapi-YOUR-NEW-KEY-HERE';
   ```
3. Save. Done — `chat.php` will pick it up automatically.

> Prefer env vars? In hPanel you can instead set an environment variable
> `NVIDIA_API_KEY`; `chat.php` checks that first. The secrets.php file is the
> simplest reliable option on shared hosting.

## 3. Deploy
Your normal PHP auto-deploy to Hostinger ships `chat.php`. The widget is already
wired to `/chat.php` in `index.html`. Open the site, click the chat bubble, ask away.

## Notes
- Model is set at the top of `chat.php` (`$MODEL`).
- Cost guardrails: 700 max output tokens, last 12 turns only, input capped at 1500 chars.
- Same-origin, so no CORS needed. If you ever host the widget on a different domain,
  add `header('Access-Control-Allow-Origin: https://azeem.highflyers.io');` to chat.php.
- Requires PHP cURL (enabled by default on Hostinger).
