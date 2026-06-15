import os
import uuid
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

import db
from claude_client import chat
from sarvam_client import speech_to_text, text_to_speech

ALLOWED_ORIGIN = os.environ["ALLOWED_ORIGIN"]

MAX_AUDIO_BYTES = 3 * 1024 * 1024  # 3 MB
MAX_TURNS_PER_SESSION = 30

SCENARIOS = {
    "coffee": "Ordering coffee at a busy cafe",
    "library": "Asking a librarian for help finding a book",
    "hotel": "Checking in at a hotel front desk",
    "interview": "A friendly job interview",
    "small_talk": "Casual small talk with a new acquaintance",
}

SYSTEM_PROMPT_TEMPLATE = """You are Coco, a friendly, patient, and playful English tutor who helps people practice \
spoken English through roleplay. The current scenario is: {scenario_desc}.

Warmly greet the user, confirm the scenario, then roleplay as the other character in that \
scenario (e.g. a barista, librarian, hotel receptionist, interviewer, or new acquaintance). \
Keep replies short, natural, and spoken-style, like a real conversation. Gently correct only \
major grammar or vocabulary mistakes, weaving the correction in encouragingly without lecturing. \
Never break character for long explanations. Keep the conversation moving and fun."""

limiter = Limiter(key_func=get_remote_address)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# In-memory conversation history, keyed by session_id. Persisted to Supabase each turn.
_conversations: dict[str, list[dict]] = {}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _sanitize_text(text: str) -> str:
    """Strip null bytes and trim length for safe storage."""
    return text.replace("\x00", "").strip()[:2000]


@app.post("/session/start")
@limiter.limit("5/minute")
async def start_session(request: Request, scenario: str = Form(...)):
    if scenario not in SCENARIOS:
        raise HTTPException(status_code=400, detail="Invalid scenario")

    session_id = str(uuid.uuid4())
    started_at = _now_iso()

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(scenario_desc=SCENARIOS[scenario])
    messages = [{"role": "system", "content": system_prompt}]

    greeting = await chat(messages + [{"role": "user", "content": "Start the roleplay with a warm greeting."}])
    greeting = _sanitize_text(greeting)
    audio_b64 = await text_to_speech(greeting)

    transcript = [{"role": "agent", "text": greeting, "timestamp": _now_iso()}]
    messages.append({"role": "assistant", "content": greeting})
    _conversations[session_id] = messages

    db.insert_session(session_id, scenario, started_at, transcript)

    return {"session_id": session_id, "agent_text": greeting, "audio": audio_b64}


@app.post("/turn")
@limiter.limit("20/minute")
async def turn(request: Request, session_id: str = Form(...), audio: UploadFile = None):
    if session_id not in _conversations:
        raise HTTPException(status_code=404, detail="Unknown session_id")

    if audio is None:
        raise HTTPException(status_code=400, detail="Missing audio")

    audio_bytes = await audio.read()
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio file too large")
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file")

    row = db.get_session(session_id)
    turn_count = row["turn_count"] if row else 0
    if turn_count >= MAX_TURNS_PER_SESSION:
        raise HTTPException(status_code=429, detail="Session turn limit reached")

    user_text = _sanitize_text(await speech_to_text(audio_bytes, audio.filename or "audio.webm"))

    messages = _conversations[session_id]
    messages.append({"role": "user", "content": user_text})

    agent_text = _sanitize_text(await chat(messages))
    messages.append({"role": "assistant", "content": agent_text})

    audio_b64 = await text_to_speech(agent_text)

    now = _now_iso()
    row = db.get_session(session_id)
    transcript = row["transcript"] if row else []
    transcript.append({"role": "user", "text": user_text, "timestamp": now})
    transcript.append({"role": "agent", "text": agent_text, "timestamp": now})

    db.update_turn(session_id, transcript, turn_count + 1)

    return {"user_text": user_text, "agent_text": agent_text, "audio": audio_b64}


@app.post("/session/end")
@limiter.limit("10/minute")
async def end_session(request: Request, session_id: str = Form(...)):
    row = db.get_session(session_id)
    if not row:
        raise HTTPException(status_code=404, detail="Unknown session_id")

    ended_at = datetime.now(timezone.utc)
    started_at = row["started_at"]
    if isinstance(started_at, str):
        started_at = datetime.fromisoformat(started_at)
    duration_seconds = int((ended_at - started_at).total_seconds())

    db.finalize_session(session_id, ended_at.isoformat(), duration_seconds)

    _conversations.pop(session_id, None)

    return {
        "session_id": session_id,
        "duration_seconds": duration_seconds,
        "transcript": row["transcript"],
    }


@app.get("/")
async def root():
    return {"status": "ok"}
