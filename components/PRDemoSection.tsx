"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ── Sequence steps that animate in ── */
const STEPS = [
  { delay: 300,  panel: "left",   id: "pr" },
  { delay: 900,  panel: "left",   id: "scanning" },
  { delay: 1600, panel: "left",   id: "stats" },
  { delay: 2400, panel: "mid",    id: "comment" },
  { delay: 3200, panel: "mid",    id: "diff" },
  { delay: 4000, panel: "right",  id: "reply" },
  { delay: 4800, panel: "right",  id: "learning" },
];

export default function PRDemoSection() {
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          STEPS.forEach(({ delay, id }) => {
            setTimeout(() => setVisible((s) => new Set([...s, id])), delay);
          });
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const show = (id: string) => visible.has(id);

  return (
    <section className="section prd-section" ref={ref}>
      <div className="section-eyebrow">{"// see it in action"}</div>
      <h2 className="section-title">
        What your team<br /><em>actually sees.</em>
      </h2>
      <p className="section-sub">
        BugLens posts structured review comments directly on your PRs — with the bug,
        context from your codebase, and the fix.
      </p>

      <div className="prd-panels">

        {/* ── LEFT PANEL: Review summary ── */}
        <div className="prd-panel prd-panel-left">
          <div className={`prd-pr-header prd-fade${show("pr") ? " prd-in" : ""}`}>
            <div className="prd-pr-row">
              <span className="prd-pr-num">PR #247</span>
              <span className="prd-pr-name">feat: add user auth middleware</span>
            </div>
            <div className="prd-pr-branch">main ← feat/auth-middleware</div>
          </div>

          <div className={`prd-scanning prd-fade${show("scanning") ? " prd-in" : ""}`}>
            <div className="prd-scan-row">
              <Image src="/BUGLENS_Llogo.png" alt="BugLens" width={18} height={18} />
              <span className="prd-scan-label">BugLens reviewing…</span>
              <span className="prd-scan-dot" />
            </div>
            <div className="prd-scan-bar">
              <div className={`prd-scan-fill${show("scanning") ? " prd-scan-animate" : ""}`} />
            </div>
          </div>

          <div className={`prd-stats prd-fade${show("stats") ? " prd-in" : ""}`}>
            <div className="prd-stats-title">
              <Image src="/BUGLENS_Llogo.png" alt="BugLens" width={16} height={16} />
              Estimated review effort
            </div>
            <div className="prd-stat-row">
              <span className="prd-stat-icon">🔴</span>
              <span className="prd-stat-label">1 Critical</span>
            </div>
            <div className="prd-stat-row">
              <span className="prd-stat-icon">🟡</span>
              <span className="prd-stat-label">2 Warnings</span>
            </div>
            <div className="prd-stat-row">
              <span className="prd-stat-icon">📄</span>
              <span className="prd-stat-label">11 files reviewed · ~18 min effort</span>
            </div>
            <div className="prd-divider" />
            <details className="prd-details">
              <summary>▶ Files reviewed (11)</summary>
            </details>
            <details className="prd-details prd-details-open">
              <summary>▶ Critical findings (1)</summary>
              <div className="prd-detail-item">auth/middleware.ts:33</div>
            </details>
          </div>
        </div>

        {/* ── MID PANEL: PR comment with diff ── */}
        <div className="prd-panel prd-panel-mid">
          <div className={`prd-comment-card prd-fade${show("comment") ? " prd-in" : ""}`}>
            <div className="prd-comment-top">
              <div className="prd-commenter">
                <Image src="/BUGLENS_Llogo.png" alt="BugLens" width={26} height={26} className="prd-commenter-logo" />
                <span className="prd-commenter-name">buglens[bot]</span>
                <span className="prd-commenter-badge">bot</span>
                <span className="prd-commenter-time">1 min ago</span>
              </div>
              <span className="prd-severity-badge">⚠ Critical&nbsp;|&nbsp;🔒 Security</span>
            </div>
            <p className="prd-issue-title">
              SQL injection — user input directly interpolated into query string
            </p>
            <p className="prd-issue-desc">
              Token from <code className="prd-code">req.body.token</code> is concatenated into SQL.
              An attacker can manipulate the query. Matches your KB rule: <em>use parameterized queries everywhere.</em>
            </p>
          </div>

          <div className={`prd-diff-card prd-fade${show("diff") ? " prd-in" : ""}`}>
            <div className="prd-diff-file">auth/middleware.ts</div>
            <div className="prd-diff-body">
              <div className="prd-dline prd-ctx">
                <span className="prd-ln">31</span>
                <span>{"  const user = await getUser(req.headers.auth);"}</span>
              </div>
              <div className="prd-dline prd-del">
                <span className="prd-ln">33</span>
                <span>{"-  `SELECT * FROM sessions WHERE token = ${req.body.token}`"}</span>
              </div>
              <div className="prd-dline prd-add">
                <span className="prd-ln">34</span>
                <span>{"+ db.prepare('SELECT * FROM sessions WHERE token = ?')"}</span>
              </div>
            </div>
            <button className="prd-suggestion-btn">▶ Committable suggestion</button>
          </div>
        </div>

        {/* ── RIGHT PANEL: Feedback + learning ── */}
        <div className="prd-panel prd-panel-right">
          <div className={`prd-reply-thread prd-fade${show("reply") ? " prd-in" : ""}`}>
            <div className="prd-thread-msg prd-thread-user">
              <div className="prd-thread-avatar prd-thread-avatar-user">SB</div>
              <div className="prd-thread-bubble">
                @buglens we use parameterized queries in <code className="prd-code">lib/db.ts</code> — flag inconsistency in future reviews
              </div>
            </div>
            <div className="prd-thread-msg">
              <Image src="/BUGLENS_Llogo.png" alt="BugLens" width={26} height={26} className="prd-thread-logo" />
              <div className="prd-thread-bubble prd-thread-bubble-bot">
                Understood. I&apos;ll compare against <code className="prd-code">lib/db.ts</code> patterns in all future reviews for this repo.
              </div>
            </div>
          </div>

          <div className={`prd-learning-card prd-fade${show("learning") ? " prd-in" : ""}`}>
            <div className="prd-learning-hdr">
              <span className="prd-learning-dot" />
              New Learnings Added
            </div>
            <div className="prd-learning-body">
              <div className="prd-learning-row">
                <span className="prd-ldim">Repo</span> your-org/api
              </div>
              <div className="prd-learning-row">
                <span className="prd-ldim">File</span> auth/middleware.ts:33
              </div>
              <div className="prd-learning-row">
                <span className="prd-ldim">Rule</span> Cross-check DB queries against <code className="prd-code">lib/db.ts</code> patterns
              </div>
            </div>
          </div>

          <div className={`prd-avail prd-fade${show("learning") ? " prd-in" : ""}`}>
            Also available via <a href="/for-agents" className="prd-avail-link">REST API</a> &amp; <a href="/for-agents" className="prd-avail-link">MCP</a>
          </div>
        </div>

      </div>
    </section>
  );
}
