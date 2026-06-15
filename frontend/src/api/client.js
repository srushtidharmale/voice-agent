export const API_URL = import.meta.env.VITE_API_URL;

export function playBase64Audio(base64Audio) {
  const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
  audio.play();
  return audio;
}
