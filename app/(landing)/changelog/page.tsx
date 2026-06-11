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
      'BugLens now posts a ✅ or ❌ commit status on every reviewed commit',
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

const tagColors: Record<string, { bg: string; color: string }> = {
  Feature:     { bg: 'rgba(34,197,94,0.1)',   color: '#4ade80' },
  Improvement: { bg: 'rgba(96,165,250,0.1)',  color: '#60a5fa' },
  Security:    { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24' },
  Launch:      { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
}

export default function ChangelogPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '5rem 2rem', color: 'var(--text)' }}>
      <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-dim)', marginBottom: '1rem' }}>
        Newest first
      </p>
      <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '0.5rem' }}>Changelog</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: 16 }}>
        Everything shipped in BugLens. We ship fast and document what changes.
      </p>

      <div style={{ position: 'relative' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 8,
          bottom: 0,
          width: 1,
          background: 'rgba(34,197,94,0.15)',
        }} />

        <div style={{ display: 'grid', gap: '3rem', paddingLeft: '2rem' }}>
          {ENTRIES.map((entry, i) => {
            const tag = tagColors[entry.tag] || tagColors.Feature
            return (
              <div key={i} style={{ position: 'relative' }}>
                {/* Dot */}
                <div style={{
                  position: 'absolute',
                  left: -32,
                  top: 6,
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: 'var(--green)',
                  border: '2px solid var(--bg)',
                }} />

                {/* Date + tag */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                    {entry.date} · {entry.version}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: tag.bg,
                    color: tag.color,
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                  }}>
                    {entry.tag.toUpperCase()}
                  </span>
                </div>

                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, marginTop: 0 }}>
                  {entry.title}
                </h2>

                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
                  {entry.items.map((item, j) => (
                    <li key={j} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      <span style={{ color: 'var(--green)', flexShrink: 0, marginTop: 2 }}>→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
