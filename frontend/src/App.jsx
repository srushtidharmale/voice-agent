import { useState } from "react";
import Header from "./components/Header";
import Landing from "./components/Landing";
import ScenarioPicker from "./components/ScenarioPicker";
import Conversation from "./components/Conversation";
import Summary from "./components/Summary";
import { startSession, endSession, playBase64Audio } from "./api";
import "./App.css";

export default function App() {
  const [view, setView] = useState("landing"); // landing | scenarios | conversation | summary
  const [session, setSession] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectScenario = async (scenarioId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await startSession(scenarioId);
      setSession({
        session_id: result.session_id,
        transcript: [{ role: "agent", text: result.agent_text }],
      });
      playBase64Audio(result.audio);
      setView("conversation");
    } catch (err) {
      setError("Couldn't start a session. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (transcript) => {
    try {
      const result = await endSession(session.session_id);
      setSummary(result);
    } catch (err) {
      setSummary({ duration_seconds: 0, transcript });
    }
    setSession(null);
    setView("summary");
  };

  const handleRestart = () => {
    setSession(null);
    setSummary(null);
    setView("landing");
  };

  const handleBack = () => {
    if (view === "scenarios") setView("landing");
    if (view === "conversation") {
      setSession(null);
      setView("scenarios");
    }
  };

  return (
    <div className="app">
      <Header onBack={handleBack} showBack={view === "scenarios" || view === "conversation"} />
      {error && <div className="error-banner">{error}</div>}
      {view === "landing" && <Landing onGetStarted={() => setView("scenarios")} />}
      {view === "scenarios" && (
        <ScenarioPicker onSelectScenario={handleSelectScenario} loading={loading} />
      )}
      {view === "conversation" && session && (
        <Conversation session={session} onEndSession={handleEndSession} />
      )}
      {view === "summary" && summary && (
        <Summary summary={summary} onRestart={handleRestart} />
      )}
    </div>
  );
}
