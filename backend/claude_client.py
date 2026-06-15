"""Thin wrapper around Anthropic's Claude Messages API for chat completions."""
import os

import httpx

ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
BASE_URL = "https://api.anthropic.com"
MODEL = "claude-sonnet-4-6"

_HEADERS = {
    "x-api-key": ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
    "Content-Type": "application/json",
}


async def chat(messages: list[dict]) -> str:
    """Send a chat completion request to Claude. `messages` may include a leading system message."""
    system_prompt = None
    turns = []
    for m in messages:
        if m["role"] == "system":
            system_prompt = m["content"]
        else:
            turns.append(m)

    payload = {
        "model": MODEL,
        "max_tokens": 200,
        "temperature": 0.7,
        "messages": turns,
    }
    if system_prompt:
        payload["system"] = system_prompt

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{BASE_URL}/v1/messages",
            headers=_HEADERS,
            json=payload,
        )
        if resp.status_code >= 400:
            raise httpx.HTTPStatusError(
                f"Claude chat error {resp.status_code}: {resp.text}",
                request=resp.request,
                response=resp,
            )
        data = resp.json()
        return "".join(block["text"] for block in data["content"] if block["type"] == "text")
