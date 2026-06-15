export default function Header({ onBack, showBack }) {
  return (
    <header className="site-header">
      <div className="header-left">
        {showBack && (
          <button className="back-button" onClick={onBack} aria-label="Go back">
            ← Back
          </button>
        )}
      </div>
      <div className="header-brand">SpeakEasy</div>
      <div className="header-right">
        <a
          className="social-link"
          href="https://www.linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
            <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
          </svg>
        </a>
        <a
          className="social-link"
          href="https://www.x.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (Twitter)"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
            <path d="M18.9 2H22l-7.2 8.2L23 22h-6.9l-5.4-7-6.2 7H1.3l7.7-8.8L1 2h6.9l4.9 6.4L18.9 2zm-2.4 18h1.9L7.6 4H5.6l10.9 16z" />
          </svg>
        </a>
        <a
          className="social-link"
          href="https://www.youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
            <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.5V8.5L15.8 12l-6.2 3.5z" />
          </svg>
        </a>
      </div>
    </header>
  );
}
