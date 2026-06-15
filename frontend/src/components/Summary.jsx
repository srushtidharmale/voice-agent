export default function Summary({ summary, onRestart }) {
  const minutes = Math.floor(summary.duration_seconds / 60);
  const seconds = summary.duration_seconds % 60;

  return (
    <div className="screen summary">
      <div className="mascot small">
        <div className="orb">
          <span className="orb-face">🎉</span>
        </div>
      </div>
      <h1>Great chat!</h1>
      <p className="subtitle">
        You practiced for {minutes}m {seconds}s and exchanged{" "}
        {Math.floor(summary.transcript.length / 2)} turns with Coco.
      </p>
      <button className="primary-button" onClick={onRestart}>
        Start a new conversation
      </button>
    </div>
  );
}
