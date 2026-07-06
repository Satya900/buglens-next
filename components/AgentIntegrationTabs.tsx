"use client";
import { useState } from "react";

const TABS = [
  {
    id: "rest",
    label: "REST API",
    badge: "Sprint 2",
    desc: "POST a diff, get structured JSON back. No GitHub dependency. No webhooks. Works in any language, any pipeline.",
    bullets: [
      "Severity · line · category · fix suggestion per finding",
      "Exit code 0 (clean) or 1 (issues) — use as a merge gate",
      "API key from dashboard. No sales call.",
    ],
    filename: "// any agent · any language",
    code: `POST https://buglens.app/api/v1/review
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
      "suggestion": "const key = process.env.API_KEY"
    },
    {
      "severity": "HIGH",
      "line": 89,
      "category": "security",
      "title": "SQL injection risk"
    }
  ]
}`,
  },
  {
    id: "mcp",
    label: "MCP Server",
    badge: "Sprint 3",
    desc: "Add BugLens as a tool in Claude Code, Cursor, or Windsurf. The agent calls review_diff() before it even opens the PR.",
    bullets: [
      "review_diff(diff, filename) → structured findings",
      "check_conventions(code, repo) → violations against your lessons",
      "get_knowledge_base(repo) → team rules as reviewable context",
    ],
    filename: "// claude_desktop_config.json",
    code: `{
  "mcpServers": {
    "buglens": {
      "url": "https://mcp.buglens.app",
      "headers": {
        "Authorization": "Bearer bl_sk_..."
      }
    }
  }
}

// Claude Code now has:
// review_diff()        — call before opening PR
// check_conventions() — check against your lessons
// get_knowledge_base() — fetch your team's context

// Agent self-reviews. Humans only see clean PRs.`,
  },
  {
    id: "cli",
    label: "CLI",
    badge: "Sprint 4",
    desc: "For agents that shell out. Pipe a diff in, get findings to stdout. Exit code 1 on HIGH severity — plug into any CI gate or pre-commit hook.",
    bullets: [
      "Works with any agent using subprocess or shell",
      "--format json for machine-readable output",
      "BUGLENS_API_KEY env var — zero config files",
    ],
    filename: "// shell script or agent loop",
    code: `# Review staged changes before push
git diff HEAD | npx buglens review --stdin

# Review a specific file
npx buglens review src/auth/login.ts

# Machine-readable output for agent parsing
npx buglens review auth.ts --format json

# Use as a hard gate in any agent loop:
if ! git diff | npx buglens review --stdin; then
  echo "BugLens: fix issues before merge."
  exit 1
fi`,
  },
];

export default function AgentIntegrationTabs() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <div className="fa-tabs-wrap">
      {/* Tab picker */}
      <div className="fa-tabs-bar">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            className={`fa-tab-btn${active === i ? " fa-tab-active" : ""}`}
            onClick={() => setActive(i)}
          >
            {t.label}
            <span className="fa-tab-badge">{t.badge}</span>
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div className="fa-tabs-panel">
        <div className="fa-tabs-left">
          <p className="fa-tabs-desc">{tab.desc}</p>
          <ul className="fa-tabs-bullets">
            {tab.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
        <div className="fa-code-block">
          <div className="fa-code-label">{tab.filename}</div>
          <pre className="fa-pre">{tab.code}</pre>
        </div>
      </div>
    </div>
  );
}
