export default function Landing({ onGetStarted }) {
  return (
    <div className="screen hero">
      <div className="mascot">
        <div className="orb">
          <span className="orb-face">🦜</span>
        </div>
      </div>
      <h1>Meet Coco</h1>
      <p className="subtitle">
        Your friendly AI English tutor. Practice real conversations, get gentle
        feedback, and build confidence one chat at a time.
      </p>
      <ul className="hero-points">
        <li>🎙️ Practice speaking with realistic roleplay scenarios</li>
        <li>💡 Get gentle, encouraging corrections as you go</li>
        <li>📈 Build confidence one conversation at a time</li>
      </ul>
      <button className="primary-button get-started" onClick={onGetStarted}>
        Get Started
      </button>
    </div>
  );
}
