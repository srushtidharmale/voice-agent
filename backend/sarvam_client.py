"""Thin wrappers around Sarvam AI's STT/TTS REST APIs."""
import os

import httpx

SARVAM_API_KEY = os.environ["SARVAM_API_KEY"]
BASE_URL = "https://api.sarvam.ai"

_HEADERS_JSON = {
    "api-subscription-key": SARVAM_API_KEY,
    "Content-Type": "application/json",
}
_HEADERS_AUTH = {
    "api-subscription-key": SARVAM_API_KEY,
}


async def speech_to_text(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    """Transcribe audio bytes to text using Sarvam saarika STT."""
    files = {"file": (filename, audio_bytes, "application/octet-stream")}
    data = {"model": "saarika:v2.5", "language_code": "en-IN"}
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{BASE_URL}/speech-to-text",
            headers=_HEADERS_AUTH,
            files=files,
            data=data,
        )
        resp.raise_for_status()
        return resp.json().get("transcript", "")


async def text_to_speech(text: str) -> str:
    """Convert text to speech using Sarvam bulbul TTS. Returns base64-encoded WAV audio."""
    payload = {
        "text": text[:1500],
        "target_language_code": "en-IN",
        "model": "bulbul:v2",
        "speaker": "anushka",
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{BASE_URL}/text-to-speech",
            headers=_HEADERS_JSON,
            json=payload,
        )
        resp.raise_for_status()
        audios = resp.json().get("audios", [])
        return audios[0] if audios else ""
