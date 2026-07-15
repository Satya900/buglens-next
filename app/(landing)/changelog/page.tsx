export const metadata = {
  title: 'Changelog | BugLens',
  description: 'Everything shipped in BugLens, newest first.',
}

const ENTRIES = [
  {
    date: 'Jun 2026',
    version: 'v0.6',
    tag: 'Feature',
    title: 'Re-review on push + GitHub status checks',
    items: [
      'New pushes to open PRs automatically dismiss the old review and trigger a fresh one',
      'BugLens now posts a pass or fail commit status on every reviewed commit',
      'Re-review header shows which push triggered the new analysis',
    ],
  },
  {
    date: 'Jun 2026',
    version: 'v0.6',
    tag: 'Feature',
    title: '.buglens.yml per-repo config',
    items: [
      'Add a .buglens.yml file to your repo root to configure strictness, ignore patterns, and max files',
      'Repo-level config overrides dashboard settings',
      'Supports: strictness, ignore, shadow, max_files',
    ],
  },
  {
    date: 'Jun 2026',
    version: 'v0.5',
    tag: 'Feature',
    title: 'OSS Program launched',
    items: [
      '6 months of Pro access free for qualifying open source projects',
      'Application form with GitHub repo validation',
      'Eligibility: public repo, OSI license, active maintainer',
    ],
  },
  {
    date: 'Jun 2026',
    version: 'v0.5',
    tag: 'Improvement',
    title: 'Expanded import typo detection',
    items: [
      'KNOWN_PACKAGES expanded from 13 to 100+ popular packages',
      'Now covers React, Next.js, testing libraries, UI frameworks, databases, auth, AI SDKs, and more',
    ],
  },
  {
    date: 'Jun 2026',
    version: 'v0.5',
    tag: 'Improvement',
    title: 'Editable settings page',
    items: [
      'Display name and bio are now editable from Settings',
      'Email notification toggle — opt out of review summary emails',
      'Changes saved via Server Actions with instant feedback',
    ],
  },
  {
    date: 'May 2026',
    version: 'v0.4',
    tag: 'Feature',
    title: 'Email notifications',
    items: [
      'Review summary emails sent after every PR review',
      'Includes decision (approve/request changes), finding count, risk summary',
      'Links directly to the review in the BugLens dashboard',
    ],
  },
  {
    date: 'May 2026',
    version: 'v0.4',
    tag: 'Feature',
    title: 'DodoPayments billing',
    items: [
      'Pro plan billing via DodoPayments (live mode)',
      'Webhook-based subscription management',
      'Usage limits enforced per tier: Free (10/mo), Pro (unlimited)',
    ],
  },
  {
    date: 'May 2026',
    version: 'v0.3',
    tag: 'Feature',
    title: 'Deterministic rule engine',
    items: [
      '8 hardcoded rules that run on every PR regardless of AI output',
      'Detects: hardcoded secrets, eval/new Function, shell injection, suspicious packages, critical TODOs, variable name mismatches, missing await, import path typos',
      'Levenshtein distance used for fuzzy variable and import matching',
    ],
  },
  {
    date: 'May 2026',
    version: 'v0.3',
    tag: 'Security',
    title: 'Encrypted token storage',
    items: [
      'GitHub installation tokens encrypted at rest with AES-256-GCM',
      'Webhook delivery idempotency — duplicate GitHub events safely ignored',
    ],
  },
  {
    date: 'Apr 2026',
    version: 'v0.2',
    tag: 'Launch',
    title: 'Initial release',
    items: [
      'GitHub App installation flow',
      'AI-powered review on PR open using top-tier language models',
      'Inline comments with severity scores (HIGH / MEDIUM / LOW)',
      'APPROVE / REQUEST_CHANGES decision on each PR',
      'BugLens dashboard with review history',
      'Shadow mode — run reviews without posting to GitHub',
    ],
  },
]

const tagClass: Record<string, string> = {
  Feature: 'changelog-tag--feature',
  Improvement: 'changelog-tag--improvement',
  Security: 'changelog-tag--security',
  Launch: 'changelog-tag--launch',
}

export default function ChangelogPage() {
  return (
    <main className="legal-page">
      <p className="legal-updated">Newest first</p>
      <h1 className="legal-title">Changelog</h1>
      <p className="legal-intro">
        Everything shipped in BugLens. We ship fast and document what changes.
      </p>

      <div className="changelog-timeline">
        <div className="changelog-timeline-rail" />

        <div className="changelog-entries">
          {ENTRIES.map((entry, i) => (
            <div key={i} className="changelog-entry">
              <div className="changelog-entry-dot" />

              <div className="changelog-entry-meta">
                <span className="changelog-entry-date">
                  {entry.date} · {entry.version}
                </span>
                <span className={`changelog-tag ${tagClass[entry.tag] || tagClass.Feature}`}>
                  {entry.tag.toUpperCase()}
                </span>
              </div>

              <h2 className="changelog-entry-title">
                {entry.title}
              </h2>

              <ul className="changelog-entry-list">
                {entry.items.map((item, j) => (
                  <li key={j} className="changelog-entry-item">
                    <span className="changelog-entry-item-arrow">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
