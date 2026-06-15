import { SCENARIOS } from "../scenarios";

export default function ScenarioPicker({ onSelectScenario, loading }) {
  return (
    <div className="screen picker">
      <h2 className="picker-heading">Pick a scenario to start</h2>
      <p className="subtitle">Choose a situation you'd like to practice with Coco.</p>
      <div className="scenario-grid">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            className="scenario-card"
            onClick={() => onSelectScenario(s.id)}
            disabled={loading}
          >
            <span className="scenario-emoji">{s.emoji}</span>
            <span className="scenario-title">{s.title}</span>
            <span className="scenario-desc">{s.desc}</span>
          </button>
        ))}
      </div>

      {loading && <p className="loading-text">Coco is getting ready…</p>}
    </div>
  );
}
