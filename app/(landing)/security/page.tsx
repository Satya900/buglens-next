export const metadata = {
  title: 'Security | BugLens',
  description: 'How BugLens protects your code and data.',
}

const PERMISSIONS = [
  { permission: 'Pull requests', access: 'Read & Write', reason: 'To read diffs and post review comments' },
  { permission: 'Contents', access: 'Read', reason: 'To read .buglens.yml config from repo root' },
  { permission: 'Commit statuses', access: 'Write', reason: 'To post ✅/❌ status checks on commits' },
  { permission: 'Issues', access: 'Write', reason: 'To post billing limit notices as comments' },
  { permission: 'Metadata', access: 'Read', reason: 'Required by GitHub for all GitHub Apps' },
]

export default function SecurityPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '5rem 2rem', color: 'var(--text)', lineHeight: 1.8 }}>
      <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-dim)', marginBottom: '1rem' }}>Last updated: June 2026</p>
      <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '0.5rem' }}>Security</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
        We know you're trusting BugLens with your codebase. Here's exactly how we handle that trust.
      </p>

      <Section title="GitHub App permissions">
        <p>BugLens requests the minimum permissions required to do its job:</p>
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(34,197,94,0.15)' }}>
                <th style={th}>Permission</th>
                <th style={th}>Access</th>
                <th style={th}>Why</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.permission} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={td}><code style={{ fontSize: 13 }}>{p.permission}</code></td>
                  <td style={{ ...td, color: 'var(--green)', fontFamily: 'monospace', fontSize: 12 }}>{p.access}</td>
                  <td style={{ ...td, color: 'var(--text-muted)' }}>{p.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: '1rem', fontSize: 13, color: 'var(--text-dim)' }}>
          BugLens never requests access to your organisation's members, secrets, or settings.
        </p>
      </Section>

      <Section title="Token storage">
        <ul>
          <li>GitHub installation tokens are encrypted at rest using <strong>AES-256-GCM</strong> with a 256-bit key</li>
          <li>The encryption key is stored as a secret environment variable — never in code or version control</li>
          <li>Tokens are decrypted only at review time and never logged</li>
        </ul>
      </Section>

      <Section title="PR data handling">
        <ul>
          <li>Only the <strong>diff</strong> (changed lines) of a PR is sent for analysis — not full file contents</li>
          <li>Diffs are sent to our AI analysis provider over HTTPS. We do not retain diffs after analysis completes.</li>
          <li>Review findings (bug descriptions, line numbers, suggestions) are stored in our database tied to your account</li>
          <li>We do not use your code or diffs to train any AI model</li>
        </ul>
      </Section>

      <Section title="Infrastructure">
        <ul>
          <li>All traffic is served over HTTPS/TLS 1.3</li>
          <li>Backend runs on Render (isolated containers, not shared hosting)</li>
          <li>Database hosted on Supabase with Row Level Security — users can only access their own data</li>
          <li>No SSH keys, production secrets, or credentials are stored in our GitHub repositories</li>
        </ul>
      </Section>

      <Section title="What BugLens cannot do">
        <ul>
          <li>Cannot write code to your repository (no push access)</li>
          <li>Cannot access branches, tags, or commits outside of open PR diffs</li>
          <li>Cannot read your repository's secrets or environment variables</li>
          <li>Cannot access any repository you haven't explicitly installed the GitHub App on</li>
        </ul>
      </Section>

      <Section title="Responsible disclosure">
        <p>
          Found a security vulnerability? Please email{' '}
          <a href="mailto:satyatechgeek@gmail.com" style={{ color: 'var(--green)' }}>satyatechgeek@gmail.com</a>{' '}
          with details. We'll respond within 48 hours and credit you if you'd like.
        </p>
        <p>Please do not disclose publicly until we've had a chance to investigate and patch.</p>
      </Section>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem', borderBottom: '1px solid rgba(34,197,94,0.1)', paddingBottom: '0.5rem' }}>
        {title}
      </h2>
      <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8 }}>
        {children}
      </div>
    </section>
  )
}

const th: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: 'var(--text-dim)',
  fontFamily: 'monospace',
}

const td: React.CSSProperties = {
  padding: '10px 12px',
  verticalAlign: 'top',
}
