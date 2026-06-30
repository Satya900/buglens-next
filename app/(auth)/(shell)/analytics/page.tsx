import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

type FindingRow = {
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | null
  category: string | null
  confidence: number | null
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch real review data and findings
  const [{ data: reviews }, { data: findings }] = await Promise.all([
    supabase
      .from('reviews')
      .select('id, findings_count, merge_decision, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('findings')
      .select('severity, category, confidence, review_id, reviews!inner(user_id)')
      .eq('reviews.user_id', user.id),
  ])

  const safeReviews = reviews || []
  const safeFindings = (findings || []) as unknown as FindingRow[]
  
  // 📈 Realistic Metrics Calculation
  const highSeverityCount = safeFindings.filter(f => f.severity === 'HIGH').length
  const totalFindings = safeFindings.length
  
  // Calculate average confidence score
  const avgConfidence = totalFindings 
    ? (safeFindings.reduce((sum, f) => sum + (f.confidence || 0), 0) / totalFindings) * 100 
    : 0

  // Estimated "Engineering Hours Saved" (Logic: 2h per High, 0.5h per Medium/Low)
  const hoursSaved = (highSeverityCount * 2) + ((totalFindings - highSeverityCount) * 0.5)

  // Severity Distribution
  const severityMap = safeFindings.reduce((acc, f) => {
    const s = f.severity || 'LOW'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, { HIGH: 0, MEDIUM: 0, LOW: 0 } as Record<string, number>)

  return (
    <div className="page-shell">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <p className="section-eyebrow" style={{ margin: 0 }}>ENGINEERING INTELLIGENCE</p>
          <h1 className="page-heading" style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 8 }}>
            System Impact <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>Dashboard</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="badge-green">LIVE UPDATES</span>
        </div>
      </div>

      <div className="stat-cards-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-label">Critical Caught</div>
          <div className="stat-number" style={{ color: '#f87171' }}>{highSeverityCount}</div>
          <div className="stat-sub">High-risk vulnerabilities</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Reviews Finalized</div>
          <div className="stat-number">{safeReviews.length}</div>
          <div className="stat-sub">AI agent processing active</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg. Confidence</div>
          <div className="stat-number green">{Math.round(avgConfidence)}%</div>
          <div className="stat-sub">Precision across {totalFindings} findings</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Hours Reclaimed</div>
          <div className="stat-number" style={{ color: 'var(--green)' }}>{hoursSaved}h</div>
          <div className="stat-sub">Estimated manual review time</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Risk Distribution Chart */}
        <div className="card" style={{ padding: '2rem' }}>
          <div className="card-header" style={{ padding: 0, marginBottom: '2rem' }}>
            <span className="card-title">Severity Distribution</span>
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Across all codebases</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {['HIGH', 'MEDIUM', 'LOW'].map((sev) => {
              const count = severityMap[sev]
              const percent = totalFindings ? (count / totalFindings) * 100 : 0
              const color = sev === 'HIGH' ? '#f87171' : sev === 'MEDIUM' ? '#fbbf24' : 'var(--green)'
              
              return (
                <div key={sev}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{sev} RISK</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)' }}>{count} <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: 11 }}>({Math.round(percent)}%)</span></span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: color, opacity: 0.8 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Intelligence Summary */}
        <div className="card" style={{ padding: '2rem' }}>
          <div className="card-header" style={{ padding: 0, marginBottom: '1.5rem' }}>
            <span className="card-title">Agent Focus</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { id: 1, label: 'Security Vulnerabilities', status: highSeverityCount > 0 ? 'Active' : 'Scanning', desc: 'Detecting SQLi, XSS, and broken auth.' },
              { id: 2, label: 'Resource Leaks', status: 'Optimal', desc: 'Monitoring for unclosed connections and memory spikes.' },
              { id: 3, label: 'Logic Flaws', status: 'Optimal', desc: 'Detecting race conditions and business logic errors.' },
              { id: 4, label: 'Code Quality', status: 'Optimal', desc: 'Enforcing style guides and anti-pattern detection.' },
            ].map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{item.label}</span>
                    <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 700 }}>{item.status.toUpperCase()}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.4 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {totalFindings === 0 && (
        <div style={{ marginTop: '2rem', padding: '3rem', textAlign: 'center', background: 'rgba(34, 197, 94, 0.02)', border: '1px dashed var(--border)', borderRadius: 12 }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>🚀 <strong>Awaiting Data Context</strong></p>
          <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>BugLens hasn&apos;t detected any significant findings yet. As your team opens more Pull Requests, this dashboard will automatically populate with risk trends and productivity metrics.</p>
        </div>
      )}
    </div>
  )
}
