import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BugLens for AI Agents — Code Review API, MCP Server & CLI",
  description:
    "When AI agents like Devin, Claude Code, or GitHub Copilot open PRs, BugLens reviews them via REST API, MCP server, or CLI — before humans ever see the output.",
  keywords: [
    "AI agent code review", "MCP code review tool", "code review API for AI agents",
    "software for agents", "agentic code review", "Claude Code MCP",
  ],
  openGraph: {
    title: "BugLens for AI Agents",
    description: "When AI agents write PRs, BugLens reviews them. REST API, MCP server, CLI.",
    url: "https://buglens.app/for-agents",
  },
};

export default function ForAgentsPage() {
  return (
    <main>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="section fa-hero">
        <div className="section-eyebrow">{"// buglens for agents"}</div>
        <h1 className="fa-title">
          AI agents write the code.<br />
          <em>BugLens reviews it.</em>
        </h1>
        <p className="fa-sub">
          Devin opens a PR. Claude Code pushes a commit. Copilot Workspace suggests a merge.
          None of them know if the code is actually correct. BugLens is the review layer
          that sits between agent output and production.
        </p>
        <div className="fa-cta-row">
          <a href="mailto:founder@buglens.app?subject=BugLens API Early Access" className="btn-primary">
            Get API early access →
          </a>
          <a href="/login" className="btn-secondary">Use BugLens on GitHub</a>
        </div>
      </section>

      {/* ── The problem, concretely ──────────────────────────────────────────── */}
      <div className="divider-line" />
      <section className="section">
        <div className="fa-problem-grid">
          <div className="fa-problem-left">
            <div className="section-eyebrow">{"// the problem"}</div>
            <h2 className="section-title" style={{ fontSize: "clamp(22px,3vw,34px)" }}>
              Agent PRs are already<br />
              <em>outpacing human review.</em>
            </h2>
            <p className="section-sub" style={{ maxWidth: "400px" }}>
              Teams using Devin and Claude Code report 5–10× more PRs per week.
              Human reviewers are the bottleneck. And the agent has no idea
              it introduced a bug — it just sees a green merge.
            </p>
            <p className="section-sub" style={{ maxWidth: "400px" }}>
              BugLens adds a review layer the agent can actually use:
              machine-readable output, structured JSON, no dashboard required.
            </p>
          </div>
          <div className="fa-problem-right">
            <div className="fa-terminal">
              <div className="fa-terminal-bar">
                <span className="fa-t-dot" style={{background:"#fc5f57"}}/>
                <span className="fa-t-dot" style={{background:"#fdbc2c"}}/>
                <span className="fa-t-dot" style={{background:"#33c748"}}/>
                <span className="fa-t-label">agent output without BugLens</span>
              </div>
              <div className="fa-terminal-body">
                <div className="fa-t-line"><span className="fa-t-dim">$</span> devin merge PR #247</div>
                <div className="fa-t-line fa-t-ok">✓ Tests passed</div>
                <div className="fa-t-line fa-t-ok">✓ CI green</div>
                <div className="fa-t-line fa-t-ok">✓ Merged to main</div>
                <div className="fa-t-line" style={{marginTop:"8px", color:"#f87171"}}>
                  ✗ Hardcoded API key in line 42
                </div>
                <div className="fa-t-line" style={{color:"#f87171"}}>
                  ✗ SQL injection on line 89
                </div>
                <div className="fa-t-line" style={{color:"#f87171"}}>
                  ✗ Unhandled promise on line 104
                </div>
                <div className="fa-t-line" style={{marginTop:"8px", color:"#4a6650"}}>
                  # found in prod 6 hours later
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How agents use BugLens ───────────────────────────────────────────── */}
      <div className="divider-line" />
      <section className="section">
        <div className="section-eyebrow">{"// integration"}</div>
        <h2 className="section-title">
          Three ways to wire it in.<br />
          <em>Pick your interface.</em>
        </h2>

        {/* REST API */}
        <div className="fa-feature-block">
          <div className="fa-feature-meta">
            <div className="fa-feature-tag">Coming — Sprint 2</div>
            <h3 className="fa-feature-title">REST API</h3>
            <p className="fa-feature-desc">
              The simplest integration. Your agent POSTs a diff,
              gets back structured JSON findings. No GitHub. No webhooks.
              Works in any language, any pipeline.
            </p>
            <ul className="fa-feature-bullets">
              <li>Returns findings with severity, line number, category, fix suggestion</li>
              <li>Exit-code-friendly — use as a pre-merge gate</li>
              <li>API key in dashboard, no sales call</li>
            </ul>
          </div>
          <div className="fa-code-block">
            <div className="fa-code-label">// any agent, any language</div>
            <pre className="fa-pre">{`POST https://buglens.app/api/v1/review
Authorization: Bearer bl_sk_...
Content-Type: application/json

{
  "diff": "--- a/auth.ts\\n+++ b/auth.ts\\n...",
  "filename": "src/auth/login.ts"
}

// Response
{
  "status": "issues_found",
  "findings": [
    {
      "severity": "HIGH",
      "line": 42,
      "category": "security",
      "title": "Hardcoded API key",
      "description": "sk_live_... exposed in source",
      "suggestion": "const key = process.env.API_KEY"
    }
  ]
}`}</pre>
          </div>
        </div>

        {/* MCP */}
        <div className="fa-feature-block">
          <div className="fa-feature-meta">
            <div className="fa-feature-tag">Coming — Sprint 3</div>
            <h3 className="fa-feature-title">MCP Server</h3>
            <p className="fa-feature-desc">
              Add BugLens as a tool in Claude Code, Cursor, or Windsurf.
              The agent calls <code className="fa-inline-code">review_diff()</code> directly
              from its tool loop — before it even opens the PR.
            </p>
            <ul className="fa-feature-bullets">
              <li><code className="fa-inline-code">review_diff(diff, filename)</code> → findings</li>
              <li><code className="fa-inline-code">check_conventions(code, repo)</code> → violations</li>
              <li><code className="fa-inline-code">get_knowledge_base(repo)</code> → your team&apos;s lessons</li>
            </ul>
          </div>
          <div className="fa-code-block">
            <div className="fa-code-label">// claude_desktop_config.json</div>
            <pre className="fa-pre">{`{
  "mcpServers": {
    "buglens": {
      "url": "https://mcp.buglens.app",
      "headers": {
        "Authorization": "Bearer bl_sk_..."
      }
    }
  }
}

// Claude Code now has access to:
// - review_diff()
// - check_conventions()
// - get_knowledge_base()
//
// Agent self-reviews before opening PR.`}</pre>
          </div>
        </div>

        {/* CLI */}
        <div className="fa-feature-block">
          <div className="fa-feature-meta">
            <div className="fa-feature-tag">Coming — Sprint 4</div>
            <h3 className="fa-feature-title">CLI</h3>
            <p className="fa-feature-desc">
              For agents that shell out. Pipe a diff into BugLens,
              get findings to stdout. Exit code 1 on HIGH severity —
              plug into any CI gate or pre-commit hook.
            </p>
            <ul className="fa-feature-bullets">
              <li>Works with any agent that uses subprocess / shell</li>
              <li>JSON output or human-readable</li>
              <li>Zero config — API key via env var</li>
            </ul>
          </div>
          <div className="fa-code-block">
            <div className="fa-code-label">// in any shell script or CI</div>
            <pre className="fa-pre">{`# Review staged changes before commit
git diff HEAD | npx buglens review --stdin

# Review a specific file
npx buglens review src/auth/login.ts

# JSON output for programmatic use
npx buglens review auth.ts --format json

# Exit code 1 on HIGH findings
# Use as a gate in your agent loop:
if ! git diff | npx buglens review --stdin; then
  echo "BugLens found issues. Fix before merge."
  exit 1
fi`}</pre>
          </div>
        </div>
      </section>

      {/* ── llms.txt ─────────────────────────────────────────────────────────── */}
      <div className="divider-line" />
      <section className="section fa-llms-section">
        <div className="fa-llms-left">
          <div className="section-eyebrow">{"// discoverability"}</div>
          <h2 className="section-title" style={{ fontSize: "clamp(22px,3vw,34px)" }}>
            Agents find us<br />
            <em>on their own.</em>
          </h2>
          <p className="section-sub" style={{ maxWidth: "380px" }}>
            <code className="fa-inline-code">buglens.app/llms.txt</code> gives AI agents
            structured documentation to discover, sign up for, and integrate BugLens
            without a human in the loop. Follows the emerging llms.txt standard.
          </p>
          <a
            href="mailto:founder@buglens.app?subject=BugLens API Early Access"
            className="btn-primary"
            style={{ marginTop: "20px", display: "inline-flex" }}
          >
            Join the waitlist →
          </a>
        </div>
        <div className="fa-code-block" style={{ flex: 1 }}>
          <div className="fa-code-label">// buglens.app/llms.txt (coming soon)</div>
          <pre className="fa-pre">{`# BugLens
Code review infrastructure for AI agents.
When you write code and open a PR, call BugLens
to check it before humans see it.

## Authentication
Get your API key: https://buglens.app/settings
No credit card for free tier (50 reviews/month)

## REST API
POST https://buglens.app/api/v1/review
Authorization: Bearer <api_key>
Body: { diff: string, filename: string }

## MCP
Server: https://mcp.buglens.app
Tools: review_diff, check_conventions, get_knowledge_base

## CLI
npx buglens review <file>
BUGLENS_API_KEY=<key> git diff | npx buglens review --stdin`}</pre>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <div className="divider-line" />
      <section className="section" style={{ textAlign: "center", paddingBottom: "5rem" }}>
        <div className="section-eyebrow">{"// early access"}</div>
        <h2 className="section-title">
          Building an agent that writes code?<br />
          <em>We want to talk.</em>
        </h2>
        <p className="section-sub" style={{ maxWidth: "400px", margin: "0 auto 28px" }}>
          We&apos;re working with early adopters to shape the API.
          If you&apos;re building on Devin, Claude Code, or your own coding agent — email us.
          API design happens in the open.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="mailto:founder@buglens.app?subject=BugLens API Early Access" className="btn-primary">
            founder@buglens.app →
          </a>
          <a href="/login" className="btn-secondary">Try BugLens on GitHub now</a>
        </div>
      </section>

    </main>
  );
}
