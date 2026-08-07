import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata = {
  title: 'Security | BugLens',
  description: 'How BugLens protects your code and data.',
}

const PERMISSIONS = [
  { permission: 'Pull requests', access: 'Read & Write', reason: 'To read diffs and post review comments' },
  { permission: 'Contents', access: 'Read', reason: 'To read .buglens.yml config from repo root' },
  { permission: 'Commit statuses', access: 'Write', reason: 'To post pass/fail status checks on commits' },
  { permission: 'Issues', access: 'Write', reason: 'To post billing limit notices as comments' },
  { permission: 'Metadata', access: 'Read', reason: 'Required by GitHub for all GitHub Apps' },
]

export default function SecurityPage() {
  return (
    <LegalPage
      title="Security"
      updated="June 2026"
      intro="We know you're trusting BugLens with your codebase. Here's exactly how we handle that trust."
    >
      <LegalSection title="GitHub App permissions">
        <p>BugLens requests the minimum permissions required to do its job:</p>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <thead>
              <tr>
                <th>Permission</th>
                <th>Access</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.permission}>
                  <td><code>{p.permission}</code></td>
                  <td className="legal-table-access">{p.access}</td>
                  <td className="legal-table-reason">{p.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="legal-note">
          BugLens never requests access to your organisation's members, secrets, or settings.
        </p>
      </LegalSection>

      <LegalSection title="Token storage">
        <ul>
          <li>GitHub installation tokens are encrypted at rest using <strong>AES-256-GCM</strong> with a 256-bit key</li>
          <li>The encryption key is stored as a secret environment variable — never in code or version control</li>
          <li>Tokens are decrypted only at review time and never logged</li>
        </ul>
      </LegalSection>

      <LegalSection title="PR data handling">
        <ul>
          <li>Only the <strong>diff</strong> (changed lines) of a PR is sent for analysis — not full file contents</li>
          <li>Diffs are sent over HTTPS to our AI subprocessors — Google (Gemini API) for paid-tier reviews, with OpenRouter used to route free-tier fallback requests. We do not retain diffs after analysis completes.</li>
          <li>Review findings (bug descriptions, line numbers, suggestions) are stored in our database tied to your account</li>
          <li>We do not use your code or diffs to train any AI model</li>
        </ul>
      </LegalSection>

      <LegalSection title="Infrastructure">
        <ul>
          <li>All traffic is served over HTTPS/TLS 1.3</li>
          <li>Backend runs on Render (isolated containers, not shared hosting)</li>
          <li>Database hosted on Supabase with Row Level Security — users can only access their own data</li>
          <li>No SSH keys, production secrets, or credentials are stored in our GitHub repositories</li>
        </ul>
      </LegalSection>

      <LegalSection title="What BugLens cannot do">
        <ul>
          <li>Cannot write code to your repository (no push access)</li>
          <li>Cannot access branches, tags, or commits outside of open PR diffs</li>
          <li>Cannot read your repository's secrets or environment variables</li>
          <li>Cannot access any repository you haven't explicitly installed the GitHub App on</li>
        </ul>
      </LegalSection>

      <LegalSection title="Responsible disclosure">
        <p>
          Found a security vulnerability? Please email{' '}
          <a href="mailto:satyatechgeek@gmail.com" className="legal-link">satyatechgeek@gmail.com</a>{' '}
          with details. We'll respond within 48 hours and credit you if you'd like.
        </p>
        <p>Please do not disclose publicly until we've had a chance to investigate and patch.</p>
      </LegalSection>
    </LegalPage>
  )
}
