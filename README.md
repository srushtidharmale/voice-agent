# SpeakEasy — Talk to Coco 🦜

Practice spoken English with Coco, an AI voice tutor, through real-world roleplay
scenarios (ordering coffee, asking a librarian, hotel check-in, job interview, small talk).

## Architecture

```
React (Vite) ──push-to-talk audio──> FastAPI backend ──> Sarvam STT
   ▲                                       │              Sarvam Chat LLM (sarvam-m)
   │                                       │              Sarvam TTS (bulbul)
   └──────── audio reply + transcript ─────┘                  │
                                           └──> Supabase (sessions table)
```

## Project structure

- `backend/` — FastAPI app, Sarvam API wrappers, Supabase persistence
- `frontend/` — React + Vite UI
- `backend/schema.sql` — Supabase table schema (RLS enabled, service-key only)

## Setup

### 1. Supabase

Run `backend/schema.sql` against your Supabase Postgres database (SQL editor or psql).
This creates the `sessions` table with RLS enabled and no public policies — only the
service key can read/write.

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env     # then fill in values below
uvicorn main:app --reload
```

**Required env vars** (`backend/.env`):

| Variable | Description |
|---|---|
| `SARVAM_API_KEY` | Get from [sarvam.ai](https://www.sarvam.ai/) dashboard |
| `DATABASE_URL` | Supabase Postgres connection string (Project Settings → Database) — **server only, never expose** |
| `ALLOWED_ORIGIN` | Your deployed frontend origin, e.g. `https://your-app.vercel.app` |

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev
```

## API Endpoints

- `POST /session/start` — form field `scenario` (one of `coffee`, `library`, `hotel`,
  `interview`, `small_talk`). Returns `session_id`, Coco's opening line, and TTS audio.
- `POST /turn` — multipart form: `session_id` + `audio` (webm/wav blob, max 3MB).
  Returns `user_text`, `agent_text`, and TTS `audio` (base64 WAV).
- `POST /session/end` — form field `session_id`. Finalizes the session and returns
  duration + full transcript.

## Security

- All Sarvam/Supabase credentials live only in backend env vars — never sent to the client.
- CORS restricted to `ALLOWED_ORIGIN`.
- Rate limiting via `slowapi` (5 sessions/min, 20 turns/min per IP).
- Audio uploads capped at 3MB; sessions capped at 30 turns.
- Supabase RLS enabled with no anonymous policies — only the service key can access `sessions`.

## Deployment

1. **Backend → Render/Railway**: new web service from `backend/`, build command
   `pip install -r requirements.txt`, start command
   `uvicorn main:app --host 0.0.0.0 --port $PORT`. Add all env vars from the table above.
2. **Frontend → Vercel**: import `frontend/`, set `VITE_API_URL` to your Render URL, deploy.
3. Update `ALLOWED_ORIGIN` on the backend to the final Vercel URL and redeploy.
