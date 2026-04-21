export default function ReviewPreview() {
  return (
    <section className="section">
      <div className="section-eyebrow">{"// see it in action"}</div>
      <h2 className="section-title">What your team<br /><em>actually sees</em></h2>
      <p className="section-sub">
        BugLens posts structured review comments directly on your pull requests —
        with the bug, why it matters in your codebase, and the fix.
      </p>

      <div className="rp-shell">
        <div className="rp-header">
          <div className="rp-pr-info">
            <span className="rp-pr-badge">PR #142</span>
            <span className="rp-pr-title">feat: add user authentication middleware</span>
          </div>
          <div className="rp-reviewed">
            <span className="rp-reviewed-dot"></span>
            buglens reviewed
          </div>
        </div>

        <div className="rp-diff">
          <div className="rp-diff-file">auth/middleware.ts</div>
          <div className="rp-diff-body">
            <div className="rp-line rp-ctx">
              <span className="rp-ln">31</span>
              <span>{"  const user = await getUser(req.headers.authorization);"}</span>
            </div>
            <div className="rp-line rp-ctx">
              <span className="rp-ln">32</span>
              <span>{"  if (!user) return res.status(401).json({ error: 'Unauthorized' });"}</span>
            </div>
            <div className="rp-line rp-del">
              <span className="rp-ln">33</span>
              <span>{"  const q = `SELECT * FROM sessions WHERE token = ${req.body.token}`;"}</span>
            </div>
            <div className="rp-line rp-add">
              <span className="rp-ln">34</span>
              <span>{"  const q = db.prepare('SELECT * FROM sessions WHERE token = ?');"}</span>
            </div>
            <div className="rp-line rp-ctx">
              <span className="rp-ln">35</span>
              <span>{"  return q.get(req.body.token);"}</span>
            </div>
          </div>
        </div>

        <div className="rp-comment">
          <div className="rp-comment-header">
            <div className="rp-comment-author">
              <div className="rp-avatar">BL</div>
              <span className="rp-author-name">buglens[bot]</span>
              <span className="rp-author-meta">commented on auth/middleware.ts:33</span>
            </div>
            <span className="rp-badge-critical">CRITICAL</span>
          </div>
          <p className="rp-issue-title">SQL injection — user input interpolated directly into query string</p>
          <p className="rp-issue-desc">
            The token from <code>req.body.token</code> is concatenated into the SQL string,
            letting an attacker manipulate the query. Matches OWASP A03:2021 — Injection.
          </p>
          <div className="rp-context-note">
            <span className="rp-context-icon">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </span>
            <span>
              From your Knowledge Base: <em>RFC-22 mandates parameterized queries for all DB access.
              See the team pattern in <code>lib/db.ts:12</code>.</em>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
