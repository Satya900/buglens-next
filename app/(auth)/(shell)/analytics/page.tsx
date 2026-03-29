import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const BARS = [40, 60, 45, 80, 50, 90, 70, 45, 95, 60, 80, 100]

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-title">BugLens</p>
          <h1 className="page-heading">Analytics</h1>
        </div>
        <span className="badge-dim">Placeholder Data</span>
      </div>

      <div className="alert-banner warn">
        <span>⚠</span>
        <span>Analytics will populate once BugLens starts reviewing your pull requests.</span>
      </div>

      <div className="stat-cards-row" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'PRs Reviewed', value: '24', sub: '+4 this week' },
          { label: 'Avg. Time Saved', value: '6.4h', sub: 'per PR', cls: 'green' },
          { label: 'Bugs Caught', value: '12', sub: '8 critical', cls: 'red' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-number ${s.cls || ''}`}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        {/* Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">PRs Reviewed Over Time</span>
            <span className="badge-dim">Last 30 Days</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160 }}>
              {BARS.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                  <div className="bar-hover" style={{
                    height: `${h}%`,
                    background: 'var(--green-muted)',
                    border: '1px solid var(--border-bright)',
                    borderRadius: '3px 3px 0 0',
                    transition: 'background 0.15s',
                  }} />
                </div>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', textAlign: 'center', marginTop: '0.75rem' }}>
              March 2026
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Severity Breakdown</span></div>
            <div className="card-body">
              {[
                { label: 'Critical', pct: 15, cls: 'text-red' },
                { label: 'High', pct: 25, cls: 'text-red' },
                { label: 'Medium', pct: 40, cls: 'text-yellow' },
                { label: 'Low', pct: 20, cls: 'text-dim' },
              ].map(s => (
                <div key={s.label} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                    <span className={s.cls}>{s.pct}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${s.pct}%`, background: 'var(--green)', borderRadius: 2, opacity: s.pct < 20 ? 0.4 : s.pct < 30 ? 0.6 : 0.8 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Top Bug Types</span></div>
            <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Race Condition (12)', 'Null Handling (18)', 'Memory Leak (8)', 'SQL Injection (4)', 'Improper Auth (6)'].map(t => (
                <span key={t} className="badge-dim" style={{ fontSize: 10 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
