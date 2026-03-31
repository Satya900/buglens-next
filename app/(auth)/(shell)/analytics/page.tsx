import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

type FindingRow = {
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | null
  category: string | null
  confidence: number | null
}

type ShadowReviewRow = {
  findings_count: number | null
  merge_decision: string | null
  created_at: string
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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

  const severityCounts = safeFindings.reduce(
    (acc, finding) => {
      if (finding.severity === 'HIGH') acc.HIGH += 1
      if (finding.severity === 'MEDIUM') acc.MEDIUM += 1
      if (finding.severity === 'LOW') acc.LOW += 1
      return acc
    },
    { HIGH: 0, MEDIUM: 0, LOW: 0 }
  )

  const totalFindings = safeFindings.length
  const averageConfidence = totalFindings
    ? safeFindings.reduce((sum, finding) => sum + Number(finding.confidence || 0), 0) / totalFindings
    : 0
  const requestChanges = safeReviews.filter((review) => review.merge_decision === 'REQUEST_CHANGES').length
  const topCategories = Object.entries(
    safeFindings.reduce<Record<string, number>>((acc, finding) => {
      const key = finding.category || 'general'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  ).sort((left, right) => right[1] - left[1]).slice(0, 5)

  const reviewVolume = Array.from({ length: 6 }, (_, index) => {
    const now = new Date()
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`
    const count = safeReviews.filter((review) => {
      const date = new Date(review.created_at)
      return `${date.getFullYear()}-${date.getMonth()}` === monthKey
    }).length
    return { label: monthDate.toLocaleString('en-US', { month: 'short' }), count }
  })

  const maxBar = Math.max(...reviewVolume.map((item) => item.count), 1)

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-title">BugLens</p>
          <h1 className="page-heading">Analytics</h1>
        </div>
        <span className="badge-dim">Platform Impact</span>
      </div>

      <div className="stat-cards-row" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Reviews', value: String(safeReviews.length), sub: `${requestChanges} request changes` },
          { label: 'Avg. Confidence', value: `${Math.round(averageConfidence * 100)}%`, sub: `${totalFindings} persisted findings`, cls: averageConfidence >= 0.85 ? 'green' : '' },
          { label: 'Total Findings', value: String(totalFindings), sub: 'across all repositories', cls: 'green' },
        ].map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-label">{stat.label}</div>
            <div className={`stat-number ${stat.cls || ''}`}>{stat.value}</div>
            <div className="stat-sub">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Posted Reviews Over Time</span>
            <span className="badge-dim">Last 6 Months</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 180 }}>
              {reviewVolume.map((item) => (
                <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' }}>{item.count}</div>
                  <div
                    className="bar-hover"
                    style={{
                      width: '100%',
                      height: `${Math.max((item.count / maxBar) * 100, item.count > 0 ? 14 : 4)}%`,
                      background: item.count > 0 ? 'var(--green-muted)' : 'var(--surface2)',
                      border: '1px solid var(--border-bright)',
                      borderRadius: '4px 4px 0 0',
                    }}
                  />
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Severity Breakdown</span></div>
            <div className="card-body">
              {[
                { label: 'High', count: severityCounts.HIGH, cls: 'text-red' },
                { label: 'Medium', count: severityCounts.MEDIUM, cls: 'text-yellow' },
                { label: 'Low', count: severityCounts.LOW, cls: 'text-dim' },
              ].map((item) => {
                const pct = totalFindings ? Math.round((item.count / totalFindings) * 100) : 0
                return (
                  <div key={item.label} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                      <span className={item.cls}>{item.count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)', borderRadius: 2, opacity: pct < 20 ? 0.4 : pct < 40 ? 0.65 : 0.85 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Top Bug Types</span></div>
            <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {topCategories.length > 0 ? topCategories.map(([category, count]) => (
                <span key={category} className="badge-dim" style={{ fontSize: 10 }}>
                  {category} ({count})
                </span>
              )) : (
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>No findings persisted yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
