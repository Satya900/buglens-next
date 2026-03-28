export default function Features() {
  return (
    <>
      <div className="divider-line"></div>
      <section className="section" id="features">
        <div className="section-eyebrow">{"// how it works"}</div>
        <h2 className="section-title">Three agents.<br /><em>One verdict.</em></h2>
        <p className="section-sub">BugLens uses a LangGraph pipeline of three specialised AI agents that work in sequence on every PR diff.</p>
        <div className="feat-grid">
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><line x1="16" y1="16" x2="22" y2="22" /></svg></div>
            <div className="feat-name">Lens agent</div>
            <div className="feat-desc">Parses diffs with AST analysis. Detects OWASP vulnerabilities, logic errors, and anti-patterns at the line level.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h8" /><circle cx="17" cy="17" r="4" /><line x1="20" y1="20" x2="22" y2="22" /></svg></div>
            <div className="feat-name">Context agent</div>
            <div className="feat-desc">Searches your team&apos;s docs, past PR comments, and standards via RAG. Every review knows your codebase.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg></div>
            <div className="feat-name">Review agent</div>
            <div className="feat-desc">Writes structured inline comments with severity scores and one-click suggested fixes - posted directly on the PR.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" /></svg></div>
            <div className="feat-name">GitHub native</div>
            <div className="feat-desc">Install via GitHub App in 60 seconds. Works on any repo, any language. No config files needed to get started.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 12h6M9 15h4" /></svg></div>
            <div className="feat-name">MCP server</div>
            <div className="feat-desc">Expose BugLens agents to any MCP-compatible AI tool. Let your IDE assistant query review history and standards.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg></div>
            <div className="feat-name">Review analytics</div>
            <div className="feat-desc">Track bug patterns, recurring violations, and team-wide code health over time on your BugLens dashboard.</div>
          </div>
        </div>
      </section>
    </>
  );
}
