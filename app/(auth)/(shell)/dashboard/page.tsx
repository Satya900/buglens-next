import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: recentReviews },
    { count: totalReviews },
    { count: highFindings },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, subscription_tier, usage_limit, current_usage')
      .eq('id', user.id)
      .single(),
    supabase
      .from('reviews')
      .select('id, pr_title, repo_full_name, pr_number, merge_decision, findings_count, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('findings')
      .select('id, reviews!inner(user_id)', { count: 'exact', head: true })
      .eq('severity', 'HIGH')
      .eq('reviews.user_id', user.id),
  ])

  const tier = (profile?.subscription_tier || 'FREE').toUpperCase()
  const rawLimit = profile?.usage_limit ?? 10
  const usageLimit = rawLimit >= 1000000 ? Infinity : rawLimit
  const isUnlimited = usageLimit === Infinity
  const usageCount = totalReviews || 0
  const usagePercent = isUnlimited ? 100 : Math.min(100, (usageCount / (usageLimit as number)) * 100)
  const remaining = isUnlimited ? null : Math.max(0, (usageLimit as number) - usageCount)
  const critical = highFindings || 0

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="page-header">
        <div>
          <p className="page-title">Overview</p>
          <h1 className="page-heading">Dashboard</h1>
        </div>
        <Link href="/repos" className="btn-primary">+ Connect repo</Link>
      </div>

      {/* Stat Cards */}
      <div className="grid-4-stat">

        <div className="stat-card">
          <div className="stat-label">System status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0 6px' }}>
            <span className="status-dot-live" />
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--green)', fontFamily: 'var(--mono)' }}>Online</span>
          </div>
          <div className="stat-sub">Webhook listening</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total reviews</div>
          <div className="stat-number">{usageCount}</div>
          <div className="stat-sub">All time</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Critical caught</div>
          <div className="stat-number" style={{ color: critical > 0 ? '#f87171' : 'var(--text)' }}>{critical}</div>
          <div className="stat-sub">High severity findings</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Your plan</div>
          <div style={{ margin: '10px 0 6px' }}>
            <span style={{
              fontSize: 15, fontWeight: 700, fontFamily: 'var(--mono)',
              color: tier === 'PRO' ? 'var(--green)' : 'var(--text-muted)',
            }}>{tier}</span>
          </div>
          {tier !== 'PRO' && (
            <Link href="/billing" style={{ fontSize: 11, color: 'var(--green)', textDecoration: 'none', fontFamily: 'var(--mono)' }}>
              Upgrade to PRO →
            </Link>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-dashboard-main">

        {/* Activity Feed */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-header">
            <span className="card-title">Recent PR reviews</span>
            <Link href="/reviews" className="card-action" style={{ fontSize: 11 }}>View all →</Link>
          </div>

          {!recentReviews || recentReviews.length === 0 ? (
            <div className="state-empty">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              <p>No reviews yet.</p>
              <p style={{ fontSize: 11 }}>
                <Link href="/repos" style={{ color: 'var(--green)', textDecoration: 'none' }}>Connect a repo</Link>
                {' '}and open a pull request.
              </p>
            </div>
          ) : (
            <div>
              {recentReviews.map(review => {
                const isApprove = review.merge_decision === 'APPROVE'
                const barColor = isApprove ? 'var(--green)' : review.findings_count > 2 ? '#f87171' : '#fbbf24'

                return (
                  <Link
                    key={review.id}
                    href={`/reviews/${review.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 1.5rem', borderBottom: '1px solid var(--border)',
                      textDecoration: 'none', transition: 'background 0.12s',
                    }}
                    className="review-row-link"
                  >
                    <span style={{ width: 3, minHeight: 38, borderRadius: 2, background: barColor, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {review.pr_title || 'Untitled PR'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                        {review.repo_full_name} · PR #{review.pr_number} · {timeAgo(review.created_at)}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, fontFamily: 'var(--mono)',
                      padding: '3px 9px', borderRadius: 5, flexShrink: 0,
                      background: isApprove ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)',
                      color: isApprove ? 'var(--green)' : '#f87171',
                      border: `1px solid ${isApprove ? 'rgba(34,197,94,0.25)' : 'rgba(248,113,113,0.25)'}`,
                    }}>
                      {isApprove ? '✓ APPROVE' : '✗ CHANGES'}
                    </span>
                  </Link>
                )
              })}
              <div style={{ padding: '10px 1.5rem' }}>
                <Link href="/reviews" style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)', textDecoration: 'none' }}>
                  See full review history →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Usage */}
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Monthly usage
              </span>
              <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text)' }}>
                {usageCount} / {isUnlimited ? '∞' : usageLimit}
              </span>
            </div>

            <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{
                width: `${isUnlimited ? 100 : usagePercent}%`, height: '100%', borderRadius: 3,
                background: isUnlimited ? 'var(--green)' : usagePercent > 80 ? '#f87171' : usagePercent > 60 ? '#fbbf24' : 'var(--green)',
                transition: 'width 0.4s ease',
              }} />
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)', marginBottom: 14, lineHeight: 1.5 }}>
              {isUnlimited
                ? 'Unlimited reviews included'
                : remaining === 0
                  ? <span style={{ color: '#f87171' }}>Limit reached — upgrade to continue</span>
                  : <>{remaining} reviews remaining{(remaining ?? 0) <= 3 && <span style={{ color: '#fbbf24', marginLeft: 8 }}>· Running low</span>}</>
              }
            </div>

            {tier !== 'PRO' && (
              <Link href="/billing" className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
                Upgrade to PRO — Unlimited
              </Link>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Quick actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { href: '/repos', label: 'Connect repository', icon: '⎇' },
                { href: '/knowledge', label: 'Update knowledge base', icon: '◉' },
                { href: '/reviews', label: 'View all reviews', icon: '▤' },
                { href: '/billing', label: 'Manage billing', icon: '◈' },
              ].map(a => (
                <Link
                  key={a.href}
                  href={a.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 8,
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    color: 'var(--text-muted)', fontSize: 12, textDecoration: 'none',
                    fontFamily: 'var(--mono)', transition: 'all 0.15s',
                  }}
                  className="quick-action-link"
                >
                  <span style={{ color: 'var(--green)', fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0 }}>{a.icon}</span>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
