import { useEffect, useRef, useState } from "react";
import { sendTurn, playBase64Audio } from "../api";

export default function Conversation({ session, onEndSession }) {
  const [transcript, setTranscript] = useState(session.transcript);
  const [recording, setRecording] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [micError, setMicError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) return;

        setThinking(true);
        try {
          const result = await sendTurn(session.session_id, blob);
          setTranscript((prev) => [
            ...prev,
            { role: "user", text: result.user_text },
            { role: "agent", text: result.agent_text },
          ]);
          playBase64Audio(result.audio);
        } catch (err) {
          setMicError("Coco had trouble responding. Please try again.");
        } finally {
          setThinking(false);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      setMicError("Microphone access was denied. Please allow mic access to talk to Coco.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleEndSession = () => {
    if (recording) stopRecording();
    onEndSession(transcript);
  };

  return (
    <div className="screen conversation">
      <div className="transcript">
        {transcript.map((turn, i) => (
          <div key={i} className={`bubble ${turn.role}`}>
            <span className="bubble-label">{turn.role === "agent" ? "Coco" : "You"}</span>
            <p>{turn.text}</p>
          </div>
        ))}
        {thinking && (
          <div className="bubble agent thinking">
            <span className="bubble-label">Coco</span>
            <p>Coco is thinking…</p>
          </div>
        )}
        <div ref={transcriptEndRef} />
      </div>

      {micError && <p className="error-text">{micError}</p>}

      <div className="controls">
        <button
          className={`mic-button ${recording ? "recording" : ""}`}
          onClick={toggleRecording}
          disabled={thinking}
        >
          {recording ? "🔴 Recording… click to send" : "🎙️ Click to talk"}
        </button>
        <button className="end-button" onClick={handleEndSession}>
          End session
        </button>
      </div>
    </div>
  );
}
