import type { Metadata } from "next";
import AgentIntegrationTabs from "@/components/AgentIntegrationTabs";

export const metadata: Metadata = {
  title: "BugLens for AI Agents — Code Review API, MCP Server & CLI",
  description:
    "When AI agents like Devin, Claude Code, or GitHub Copilot open PRs, BugLens reviews them via REST API, MCP server, or CLI — before humans ever see the output.",
  keywords: [
    "AI agent code review", "MCP code review tool", "code review API for AI agents",
    "software for agents", "agentic code review", "Claude Code MCP",
  ],
  alternates: {
    canonical: "https://buglens.app/for-agents/",
  },
  openGraph: {
    title: "BugLens for AI Agents — Code Review API, MCP Server & CLI",
    description: "When AI agents like Devin, Claude Code, or GitHub Copilot open PRs, BugLens reviews them via REST API, MCP server, or CLI.",
    url: "https://buglens.app/for-agents/",
    type: "website",
    images: [
      {
        url: "https://buglens.app/opengraph-image/",
        width: 1200,
        height: 630,
        alt: "BugLens for AI Agents — Code Review API, MCP Server & CLI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BugLens for AI Agents — Code Review API, MCP Server & CLI",
    description: "When AI agents like Devin, Claude Code, or GitHub Copilot open PRs, BugLens reviews them via REST API, MCP server, or CLI.",
    images: ["https://buglens.app/opengraph-image/"],
    site: "@satyabrat_me",
    creator: "@satyabrat_me",
  },
};

export default function ForAgentsPage() {
  return (
    <main className="fa-page">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="section fa-hero">
        <div className="section-eyebrow">{"// for ai agents"}</div>
        <h1 className="fa-title">
          AI agents write the code.<br />
          <em>BugLens reviews it.</em>
        </h1>
        <p className="fa-sub">
          The review layer between agent output and production.
          Machine-readable findings. JSON output agents can act on.
          No dashboard. No humans required.
        </p>
        <div className="fa-cta-row">
          <a href="mailto:founder@buglens.app?subject=BugLens API Early Access" className="btn-primary">
            Get API early access →
          </a>
          <a href="/login" className="btn-ghost">Start reviewing free</a>
        </div>

        {/* Works with */}
        <div className="fa-works-with">
          <span className="fa-works-label">Works with</span>
          {["Devin", "Claude Code", "GitHub Copilot", "Cursor", "Windsurf", "Cline", "Any Agent"].map((a) => (
            <span key={a} className={`fa-agent-chip${a === "Any Agent" ? " fa-agent-chip-any" : ""}`}>{a}</span>
          ))}
        </div>
      </section>

      {/* ── Story scenario ───────────────────────────────────────────────────── */}
      <section className="section">
        <div className="section-eyebrow">{"// how it works"}</div>
        <h2 className="fa-section-title">
          Agent opens PR at 2 AM.<br />
          <em>Bug never reaches prod.</em>
        </h2>
        <p className="fa-section-sub">
          Devin doesn't sleep. Neither does BugLens. Every PR gets reviewed,
          findings returned as JSON, and a hard exit code before merge.
        </p>

        <div className="fa-story">
          <div className="fa-story-bar">
            <span className="fa-t-dot t-dot--red" />
            <span className="fa-t-dot t-dot--yellow" />
            <span className="fa-t-dot t-dot--green" />
            <span className="fa-t-label">buglens — live agent loop · PR #142</span>
          </div>
          <div className="fa-story-body">

            <div className="fa-story-row">
              <span className="fa-story-time">2:34 AM</span>
              <span className="fa-story-event">
                <span className="fa-story-agent">Devin</span> opens PR #142 — &quot;Add payment retry logic&quot;
                <span className="fa-story-meta"> · 847 lines · 12 files</span>
              </span>
            </div>

            <div className="fa-story-row fa-story-row-bl">
              <span className="fa-story-time">2:34 AM</span>
              <span className="fa-story-event">
                <span className="fa-story-bl">BugLens</span> webhook received
                <span className="fa-story-meta"> · review started · 8 rules + AI analysis</span>
              </span>
            </div>

            <div className="fa-story-divider" />

            <div className="fa-story-findings-block">
              <div className="fa-story-findings-label">findings · 1m 52s</div>
              <div className="fa-story-finding">
                <span className="fa-sev fa-sev-high">HIGH</span>
                <span className="fa-story-finding-text">Hardcoded Stripe key —</span>
                <code className="fa-story-code">src/payments/config.ts:34</code>
              </div>
              <div className="fa-story-finding">
                <span className="fa-sev fa-sev-high">HIGH</span>
                <span className="fa-story-finding-text">No retry limit cap — retries could run forever</span>
              </div>
              <div className="fa-story-finding">
                <span className="fa-sev fa-sev-med">MED</span>
                <span className="fa-story-finding-text">Race condition on concurrent retries —</span>
                <code className="fa-story-code">line 104</code>
              </div>
              <div className="fa-story-exit">
                <span className="fa-exit-bad">exit_code: 1</span>
                <span className="fa-story-meta"> · merge blocked · Devin notified via API</span>
              </div>
            </div>

            <div className="fa-story-divider" />

            <div className="fa-story-row">
              <span className="fa-story-time">2:36 AM</span>
              <span className="fa-story-event">
                <span className="fa-story-agent">Devin</span> reads JSON findings · fixing issues
              </span>
            </div>

            <div className="fa-story-row">
              <span className="fa-story-time">2:38 AM</span>
              <span className="fa-story-event">
                <span className="fa-story-agent">Devin</span> pushes fix commit
                <span className="fa-story-meta"> · BugLens auto re-reviews</span>
              </span>
            </div>

            <div className="fa-story-row fa-story-row-clean">
              <span className="fa-story-time">2:40 AM</span>
              <span className="fa-story-event">
                <span className="fa-story-bl">BugLens</span> re-review complete
                <span className="fa-exit-good"> · exit_code: 0 · 0 issues · merge unblocked</span>
              </span>
            </div>

            <div className="fa-story-row fa-story-row-clean">
              <span className="fa-story-time">2:41 AM</span>
              <span className="fa-story-event">
                ✓ PR #142 merged clean
                <span className="fa-story-meta"> · no human intervention · 7 minutes total</span>
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ── Four pillars ─────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="section-eyebrow">{"// what buglens does for agents"}</div>
        <h2 className="fa-section-title">
          Four things.<br />
          <em>All automatic.</em>
        </h2>
        <div className="fa-pillars">
          <div className="fa-pillar">
            <div className="fa-pillar-num">01</div>
            <h3 className="fa-pillar-title">Review</h3>
            <p className="fa-pillar-desc">
              8 deterministic security rules + AI analysis on every diff.
              Runs in under 3 minutes. No config, no setup, no approval required.
            </p>
          </div>
          <div className="fa-pillar">
            <div className="fa-pillar-num">02</div>
            <h3 className="fa-pillar-title">Block</h3>
            <p className="fa-pillar-desc">
              <code className="fa-inline-code">exit_code 1</code> on HIGH findings.
              Plug it into any merge gate. The agent cannot proceed until it fixes the issues.
            </p>
          </div>
          <div className="fa-pillar">
            <div className="fa-pillar-num">03</div>
            <h3 className="fa-pillar-title">Return</h3>
            <p className="fa-pillar-desc">
              Structured JSON — severity, line, category, fix suggestion per finding.
              No prose. No dashboard. Agents parse it and act on it directly.
            </p>
          </div>
          <div className="fa-pillar">
            <div className="fa-pillar-num">04</div>
            <h3 className="fa-pillar-title">Learn</h3>
            <p className="fa-pillar-desc">
              Write a team Lesson once. BugLens applies it to every PR,
              every agent, every repo — forever. Context that compounds with use.
            </p>
          </div>
        </div>
      </section>

      {/* ── Integration interfaces ────────────────────────────────────────────── */}
      <section className="section">
        <div className="section-eyebrow">{"// integration"}</div>
        <h2 className="fa-section-title">
          Three interfaces.<br />
          <em>Pick your stack.</em>
        </h2>
        <p className="fa-section-sub">
          REST API for any language. MCP for Claude Code and Cursor.
          CLI for shell-based agents. All return the same structured findings.
        </p>
        <AgentIntegrationTabs />
      </section>

      {/* ── Coming soon roadmap ───────────────────────────────────────────────── */}
      <section className="section">
        <div className="section-eyebrow">{"// roadmap"}</div>
        <h2 className="fa-section-title">
          What&apos;s coming.<br />
          <em>Sprint by sprint.</em>
        </h2>
        <p className="fa-section-sub">
          Building in public. API design happens in the open — early adopters shape the contract.
        </p>
        <div className="fa-roadmap">

          <div className="fa-rm-card fa-rm-soon">
            <div className="fa-rm-header">
              <span className="fa-rm-sprint">Sprint 2</span>
              <span className="fa-rm-status-badge fa-rm-badge-soon">Coming soon</span>
            </div>
            <h3 className="fa-rm-title">REST API</h3>
            <p className="fa-rm-desc">
              POST a diff, get JSON findings back. Any language, any agent, any pipeline.
              Exit code 0 or 1 for hard merge gates.
            </p>
            <ul className="fa-rm-list">
              <li>Severity · line · category · fix suggestion</li>
              <li>Webhook callbacks for async pipelines</li>
              <li>API key from dashboard — no sales call</li>
            </ul>
          </div>

          <div className="fa-rm-card fa-rm-soon">
            <div className="fa-rm-header">
              <span className="fa-rm-sprint">Sprint 3</span>
              <span className="fa-rm-status-badge fa-rm-badge-soon">Coming soon</span>
            </div>
            <h3 className="fa-rm-title">MCP Server</h3>
            <p className="fa-rm-desc">
              Add BugLens as a tool in Claude Code, Cursor, or Windsurf.
              Agent calls <code className="fa-inline-code">review_diff()</code> before opening the PR.
            </p>
            <ul className="fa-rm-list">
              <li>review_diff() · check_conventions() · get_knowledge_base()</li>
              <li>Agent self-reviews — humans see only clean PRs</li>
              <li>Works in any MCP-compatible agent</li>
            </ul>
          </div>

          <div className="fa-rm-card fa-rm-soon">
            <div className="fa-rm-header">
              <span className="fa-rm-sprint">Sprint 4</span>
              <span className="fa-rm-status-badge fa-rm-badge-soon">Coming soon</span>
            </div>
            <h3 className="fa-rm-title">CLI</h3>
            <p className="fa-rm-desc">
              Pipe a diff in, get findings to stdout. Exit code 1 on HIGH —
              plug into any CI gate, pre-commit hook, or shell-based agent loop.
            </p>
            <ul className="fa-rm-list">
              <li>git diff | npx buglens review --stdin</li>
              <li>--format json for machine-readable output</li>
              <li>BUGLENS_API_KEY env var — zero config files</li>
            </ul>
          </div>

          <div className="fa-rm-card fa-rm-planned">
            <div className="fa-rm-header">
              <span className="fa-rm-sprint">Sprint 5</span>
              <span className="fa-rm-status-badge fa-rm-badge-planned">Planned</span>
            </div>
            <h3 className="fa-rm-title">Agent Dashboard</h3>
            <p className="fa-rm-desc">
              Built for agent builders, not developers. Track which agent introduced which bug,
              per-repo analytics, and knowledge base management.
            </p>
            <ul className="fa-rm-list">
              <li>Per-agent attribution — Devin vs Claude Code vs Copilot</li>
              <li>Findings heatmap per repo + rule</li>
              <li>Usage analytics · webhook logs · key rotation</li>
            </ul>
          </div>

        </div>
      </section>

      {/* ── llms.txt ──────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="fa-llms-card">
          <div className="fa-llms-inner">
            <div className="fa-llms-left">
              <div className="fa-llms-eyebrow">{"// discoverability"}</div>
              <h2 className="fa-section-title fa-section-title--sm">
                Agents find BugLens<br />
                <em>on their own.</em>
              </h2>
              <p className="fa-section-sub fa-section-sub--narrow">
                <code className="fa-inline-code">buglens.app/llms.txt</code> gives AI agents
                structured docs to discover, authenticate, and integrate BugLens
                without a human in the loop. Follows the emerging llms.txt standard.
              </p>
              <a href="mailto:founder@buglens.app?subject=BugLens API Early Access" className="btn-primary">
                Join the waitlist →
              </a>
            </div>
            <div className="fa-code-block fa-llms-code">
              <div className="fa-code-label">{"// buglens.app/llms.txt"}</div>
              <pre className="fa-pre">{`# BugLens — Code review for AI agents
When you write code and open a PR, call BugLens
to check it before humans see it.

## Authentication
GET https://buglens.app/settings → API key
Free tier: 10 reviews/month. No credit card.

## REST API
POST https://buglens.app/api/v1/review
Authorization: Bearer <api_key>
Body: { diff: string, filename: string }
Returns: { status, findings[], exit_code }

## MCP Server
Server: https://mcp.buglens.app
Tools: review_diff, check_conventions,
       get_knowledge_base

## CLI
BUGLENS_API_KEY=<key> \\
  git diff | npx buglens review --stdin
Exit 0 = clean. Exit 1 = issues found.`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="section fa-cta-section">
        <div className="section-eyebrow">{"// early access"}</div>
        <h2 className="fa-section-title">
          Building an agent that writes code?<br />
          <em>We want you as an early tester.</em>
        </h2>
        <p className="fa-section-sub fa-section-sub--cta">
          API design happens in the open. If you&apos;re building on Devin,
          Claude Code, or your own coding agent — email us. Early adopters
          shape the API contract.
        </p>
        <div className="fa-cta-row">
          <a href="mailto:founder@buglens.app?subject=BugLens API Early Access" className="btn-primary">
            founder@buglens.app →
          </a>
          <a href="/login" className="btn-ghost">Start reviewing free</a>
        </div>
      </section>

    </main>
  );
}
