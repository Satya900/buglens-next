import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

const SEVERITY: Array<{ label: string; cls: string }> = [
  { label: 'Critical', cls: 'badge-red' },
  { label: 'High', cls: 'badge-red' },
  { label: 'Medium', cls: 'badge-yellow' },
  { label: 'Low', cls: 'badge-dim' },
]

const PLACEHOLDER_REVIEWS = [
  { id: '1', pr: 'Fix: Auth race condition', repo: 'buglens-next #124', severity: 'Critical', findings: 3, score: 34, date: '2h ago' },
  { id: '2', pr: 'Feat: Add GitHub OAuth', repo: 'buglens-next #123', severity: 'Low', findings: 0, score: 98, date: '5h ago' },
  { id: '3', pr: 'Refactor: DB middleware', repo: 'api-gateway #45', severity: 'Medium', findings: 2, score: 72, date: '1d ago' },
]

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-title">BugLens</p>
          <h1 className="page-heading">Review History</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['All Repos', 'All Severities', 'All Statuses'].map(f => (
            <select key={f} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '6px 10px', color: 'var(--text-muted)',
              fontFamily: 'var(--mono)', fontSize: 11, cursor: 'pointer'
            }}>
              <option>{f}</option>
            </select>
          ))}
        </div>
      </div>

      <div className="alert-banner warn" style={{ marginBottom: '1.5rem' }}>
        <span>⚠</span>
        <span>These are placeholder reviews. Real data will appear once the BugLens GitHub App is installed.</span>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Pull Request</th>
              <th>Severity</th>
              <th>Findings</th>
              <th>Score</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {PLACEHOLDER_REVIEWS.map(r => {
              const sev = SEVERITY.find(s => s.label === r.severity)
              return (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{r.pr}</div>
                    <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>{r.repo}</div>
                  </td>
                  <td><span className={sev?.cls || 'badge-dim'}>{r.severity}</span></td>
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }} className={r.findings > 0 ? 'text-red' : 'text-dim'}>
                      {r.findings} findings
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }} className={r.score < 50 ? 'text-red' : r.score > 80 ? 'text-green' : 'text-yellow'}>
                      {r.score}%
                    </span>
                  </td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>{r.date}</span></td>
                  <td>
                    <a href={`/reviews/${r.id}`} style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)', textDecoration: 'none' }}>
                      View →
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>
        <span>{PLACEHOLDER_REVIEWS.length} results</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" disabled style={{ opacity: 0.4 }}>← Prev</button>
          <button className="btn-secondary" disabled style={{ opacity: 0.4 }}>Next →</button>
        </div>
      </div>
    </div>
  )
}
