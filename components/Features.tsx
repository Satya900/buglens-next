export default function Features() {
  return (
    <>
      <div className="divider-line"></div>
      <section className="section" id="features">
        <div className="section-eyebrow">{"// what buglens does"}</div>
        <h2 className="section-title">Catches bugs<br /><em>before your team does.</em></h2>
        <p className="section-sub">BugLens runs on every pull request — AI analysis plus deterministic rules that never miss the obvious stuff.</p>
        <div className="feat-grid">
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><line x1="16" y1="16" x2="22" y2="22" /></svg></div>
            <h3 className="feat-name">AI-powered review</h3>
            <div className="feat-desc">State-of-the-art AI analyses every diff for bugs, security issues, and logic errors — with inline comments posted directly on the PR.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div>
            <h3 className="feat-name">Deterministic rules</h3>
            <div className="feat-desc">8 hardcoded rules that run every time: hardcoded secrets, missing await, import typos, eval usage, shell injection, variable mismatches and more.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" /></svg></div>
            <h3 className="feat-name">GitHub native</h3>
            <div className="feat-desc">Install via GitHub App in 60 seconds. BugLens posts reviews as PR comments and sets a commit status — green or red — on every push.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" /></svg></div>
            <h3 className="feat-name">Re-review on push</h3>
            <div className="feat-desc">Developer pushes a fix? BugLens dismisses the old review and runs a fresh one automatically — no manual trigger needed.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 12h6M9 15h4" /></svg></div>
            <h3 className="feat-name">Knowledge base</h3>
            <div className="feat-desc">Write your team&apos;s conventions as Lessons. BugLens applies them to every PR — catching violations your senior devs would flag.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg></div>
            <h3 className="feat-name">Review analytics</h3>
            <div className="feat-desc">Track bug patterns, recurring violations, and code health over time. See which files get flagged most and where your team&apos;s weak spots are.</div>
          </div>
        </div>
      </section>
    </>
  );
}
