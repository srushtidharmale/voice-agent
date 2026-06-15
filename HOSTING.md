# Host on GitHub — simple 3-step guide

Your live app URL will be: **https://srushtidharmale.github.io/voice-agent/**

GitHub can only host the **website** (frontend). The **API** (Python backend) runs on Render (free).

---

## Step 1 — Deploy the backend on Render (5 min)

1. Go to **https://render.com** and sign up with GitHub
2. Click **New +** → **Blueprint**
3. Connect repo **srushtidharmale/voice-agent**
4. Render will read `render.yaml` automatically
5. It will ask for 3 secrets — paste the **values** from your `backend/.env` (the part after `=`):
   - `SARVAM_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `DATABASE_URL`
6. Click **Apply** and wait until status is **Live**
7. Copy your Render URL, e.g. `https://voice-agent-api.onrender.com`

---

## Step 2 — Add the URL to GitHub (1 min)

1. Open: https://github.com/srushtidharmale/voice-agent/settings/secrets/actions
2. Click **New repository secret**
3. **Name:** `VITE_API_URL`
4. **Secret:** paste your Render URL (Step 1, step 7)
5. Click **Add secret**

---

## Step 3 — Turn on GitHub Pages (2 min)

1. Open: https://github.com/srushtidharmale/voice-agent/settings/pages
2. **Source** → choose **GitHub Actions**
3. Go to **Actions** tab → **Deploy frontend to GitHub Pages** → **Run workflow**
4. Wait for green checkmark (~1 min)
5. Open **https://srushtidharmale.github.io/voice-agent/**

---

## Done!

| What | URL |
|------|-----|
| Your public app | https://srushtidharmale.github.io/voice-agent/ |
| Your API (Render) | https://voice-agent-api.onrender.com (yours may differ) |

---

## What goes where (cheat sheet)

| From `backend/.env` | Where |
|---------------------|--------|
| `SARVAM_API_KEY` | Render (Step 1) |
| `ANTHROPIC_API_KEY` | Render (Step 1) |
| `DATABASE_URL` | Render (Step 1) |
| `ALLOWED_ORIGIN` | Already set in `render.yaml` |
| Render URL | GitHub secret `VITE_API_URL` (Step 2) |

**Do not put API keys in GitHub secrets.**
