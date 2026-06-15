import { API_URL } from "./client";

export async function startSession(scenario) {
  const formData = new FormData();
  formData.append("scenario", scenario);
  const res = await fetch(`${API_URL}/session/start`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to start session");
  return res.json();
}

export async function endSession(sessionId) {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  const res = await fetch(`${API_URL}/session/end`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to end session");
  return res.json();
}
