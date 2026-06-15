import { API_URL } from "./client";

export async function sendTurn(sessionId, audioBlob) {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("audio", audioBlob, "turn.webm");
  const res = await fetch(`${API_URL}/turn`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to send turn");
  return res.json();
}
