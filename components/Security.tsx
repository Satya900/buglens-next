export default function Security() {
  return (
    <>
      <div className="divider-line" />
      <section className="section" id="security">
        <div className="section-eyebrow">{"// security"}</div>
        <h2 className="section-title">
          Your code stays<br />
          <em>yours.</em>
        </h2>
        <p className="section-sub">
          BugLens reviews your diff and discards it. No training on your code.
          No storage after review. GitHub OAuth only — we never see your password.
        </p>
        <div className="security-grid">
          <div className="security-card">
            <div className="security-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="security-title">Zero retention</h3>
            <p className="security-desc">
              Your diff is fetched, reviewed, and discarded. Nothing is stored
              on our servers after the review completes.
            </p>
          </div>
          <div className="security-card">
            <div className="security-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="security-title">GitHub OAuth only</h3>
            <p className="security-desc">
              We never see your password. Authentication is handled entirely
              by GitHub — BugLens only receives an installation token scoped
              to the repos you select.
            </p>
          </div>
          <div className="security-card">
            <div className="security-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="security-title">Not trained on your code</h3>
            <p className="security-desc">
              Your codebase is never used to train any AI model. Reviews run
              against a hosted model with zero data retention on the AI side.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
