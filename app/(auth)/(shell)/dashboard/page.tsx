import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import UpgradeModal from '@/components/UpgradeModal'

type RecentRepo = {
  id: number
  name: string
  full_name: string
  url: string
  updated_at: string
  open_issues: number
  language: string | null
  private: boolean
}

type DashboardReview = {
  id: string
  pr_title: string | null
  repo_full_name: string
  pr_url: string | null
  findings_count: number | null
  created_at: string
  merge_decision: string | null
  kind: 'posted' | 'shadow'
}

async function getGitHubStats(token: string) {
  try {
    const [reposRes, userRes] = await Promise.all([
      fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
        next: { revalidate: 300 },
      }),
      fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
        next: { revalidate: 300 },
      }),
    ])
    if (!reposRes.ok || !userRes.ok) return null
    const [repos, ghUser] = await Promise.all([reposRes.json(), userRes.json()])
    return {
      totalRepos: repos.length,
      publicRepos: ghUser.public_repos,
      login: ghUser.login,
      recent: repos.slice(0, 6).map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        url: repo.html_url,
        updated_at: repo.updated_at,
        open_issues: repo.open_issues_count,
        language: repo.language,
        private: repo.private,
      }))
    }
  } catch {
    return null
  }
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 0) return 'Just now'
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch data
  const [{ data: profile }, { data: reviewList }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  ])

  // 🗓️ Monthly Reset Logic (Lazy)
  const lastReset = new Date(profile?.last_usage_reset_at || profile?.created_at || Date.now())
  const isNewMonth = lastReset.getMonth() !== new Date().getMonth() || lastReset.getFullYear() !== new Date().getFullYear()

  if (isNewMonth) {
    await supabase.from('profiles').update({
      current_usage: 0,
      last_usage_reset_at: new Date().toISOString()
    }).eq('id', user.id)
  }

  const stats = profile?.github_token ? await getGitHubStats(profile.github_token) : null
  const displayName = profile?.full_name || stats?.login || user.email?.split('@')[0]
  const tier = (profile?.subscription_tier || 'FREE').toUpperCase()
  
  // 🛡️ LOCK THE LIMIT: Force 50 for Free, Unlimited for Pro
  const usageLimit = tier === 'PRO' ? Infinity : 50
  const usageCount = reviewList?.length || 0
  const isUnlimited = usageLimit === Infinity
  const prsLeft = isUnlimited ? Infinity : Math.max(0, usageLimit - usageCount)
  const isOutOfPRs = tier === 'FREE' && prsLeft === 0
  const usagePercent = isUnlimited ? 0 : Math.min(100, (usageCount / usageLimit) * 100)

  const activityFeed = (reviewList?.slice(0, 5) || []) as DashboardReview[]

  return (
    <div className="page-shell">
      <UpgradeModal show={isOutOfPRs} />

      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <p className="section-eyebrow" style={{ margin: 0 }}>OVERVIEW</p>
          <h1 className="page-heading" style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8 }}>
            Welcome back, <span style={{ fontWeight: 600, color: 'var(--text)' }}>{displayName}</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/billing" className={isOutOfPRs ? 'badge-red' : 'badge-green'} style={{ textDecoration: 'none', fontSize: 10 }}>{tier} PLAN</Link>
          <Link href="/repos" className="btn-ghost" style={{ fontSize: 11, padding: '8px 16px' }}>Review Controls →</Link>
        </div>
      </div>

      <div className="stat-cards-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-label">System Status</div>
          <div className="stat-number green">Online</div>
          <div className="stat-sub">AI reviews fully operational</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{isUnlimited ? 'Total Reviews' : 'PRs Remaining'}</div>
          <div className={`stat-number ${isOutOfPRs ? 'limit-pulse' : 'green'}`}>
            {isUnlimited ? usageCount : prsLeft}
          </div>
          <div className="stat-sub">{usageCount} of {isUnlimited ? '∞' : usageLimit} used this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Plan Tier</div>
          <div className="stat-number">{tier}</div>
          <div className="stat-sub">status: active</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border)' }}>
              <span className="card-title">Latest Review Activity</span>
              <Link href="/reviews" style={{ fontSize: 11, color: 'var(--green)', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
            </div>
            
            {activityFeed.length ? activityFeed.map((review) => (
              <div key={review.id} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid var(--border)',
                gap: '1.25rem'
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: review.merge_decision === 'APPROVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                  color: review.merge_decision === 'APPROVE' ? 'var(--green)' : '#f87171',
                  border: '1px solid currentColor'
                }}>
                  <span style={{ fontSize: 12 }}>{review.merge_decision === 'APPROVE' ? '✓' : '!'}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {review.pr_title || 'Untitled Pull Request'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', opacity: 0.8 }}>
                    {review.repo_full_name} · {review.findings_count || 0} findings · {timeAgo(review.created_at)}
                  </div>
                </div>
                <Link href={review.pr_url || '#'} target="_blank" className="btn-icon" style={{ opacity: 0.4 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </Link>
              </div>
            )) : (
              <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: 12 }}>
                No active reviews found.
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="card-title" style={{ marginBottom: '1.5rem' }}>Usage Insight</div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, fontFamily: 'var(--mono)' }}>MONTHLY CAPACITY</span>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)' }}>{usageCount} / {isUnlimited ? '∞' : usageLimit}</span>
            </div>

            <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 10, overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ width: `${usagePercent}%`, height: '100%', background: 'var(--green)', boxShadow: '0 0 10px var(--green)' }} />
            </div>

            <p style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {isUnlimited 
                ? "Unlimited agent capacity enabled. Private repo support active."
                : `You have ${prsLeft} reviews remaining this month. Next credit refresh: 1st of next month.`}
            </p>

            <Link href="/billing" className="btn-ghost" style={{ width: '100%', fontSize: 11, textAlign: 'center', textDecoration: 'none', padding: '8px' }}>
              {isOutOfPRs ? "Unlock Unlimited Reviews" : "Manage Subscription"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
