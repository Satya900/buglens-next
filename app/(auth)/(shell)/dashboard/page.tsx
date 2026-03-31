import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
    const totalOpenIssues = repos.reduce((sum: number, repo: { open_issues_count: number }) => sum + repo.open_issues_count, 0)
    const recent: RecentRepo[] = repos.slice(0, 6).map((repo: {
      id: number
      name: string
      full_name: string
      html_url: string
      updated_at: string
      open_issues_count: number
      language: string | null
      private: boolean
    }) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      url: repo.html_url,
      updated_at: repo.updated_at,
      open_issues: repo.open_issues_count,
      language: repo.language,
      private: repo.private,
    }))
    return {
      totalRepos: repos.length,
      totalOpenIssues,
      publicRepos: ghUser.public_repos,
      login: ghUser.login,
      recent,
    }
  } catch {
    return null
  }
}

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('github_token, full_name, subscription_tier, current_usage, usage_limit')
    .eq('id', user.id)
    .single()

  const stats = profile?.github_token ? await getGitHubStats(profile.github_token) : null
  const displayName = profile?.full_name || stats?.login || user.email?.split('@')[0]
  const tier = profile?.subscription_tier || 'FREE'
  const usageCount = profile?.current_usage || 0
  const usageLimit = tier === 'PRO' ? Infinity : (profile?.usage_limit || 50)
  const isUnlimited = usageLimit === Infinity
  const usagePercent = isUnlimited ? 0 : Math.min(100, (usageCount / usageLimit) * 100)

  const [{ data: recentReviews }, { data: repoControls }] = await Promise.all([
    supabase
      .from('reviews')
      .select('id, pr_title, repo_full_name, pr_url, findings_count, created_at, merge_decision')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('repos')
      .select('repo_full_name, is_active')
      .eq('user_id', user.id),
  ])

  const activityFeed = (recentReviews || []) as DashboardReview[]
  const activeRepoCount = repoControls?.filter((repo) => repo.is_active).length || 0

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-title">Overview</p>
          <h1 className="page-heading">Welcome back, {displayName}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/billing" className="badge-green" style={{ textDecoration: 'none', fontSize: 10 }}>{tier} PLAN</Link>
          <Link href="/repos" className="btn-secondary">Review Controls →</Link>
        </div>
      </div>

      {!stats && (
        <div className="alert-banner warn">
          <span>!</span>
          <span>Could not load GitHub data. Log out and back in to restore repository sync.</span>
        </div>
      )}

      <div className="stat-cards-row">
        <div className="stat-card">
          <div className="stat-label">Active Repositories</div>
          <div className="stat-number">{activeRepoCount || stats?.totalRepos || '—'}</div>
          <div className="stat-sub">monitored for PR traffic</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Reviews Consumed</div>
          <div className="stat-number green">{usageCount}</div>
          <div className="stat-sub">{isUnlimited ? '∞ access enabled' : `${usageLimit - usageCount} remaining in tier`}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Subscription</div>
          <div className="stat-number">{tier}</div>
          <div className="stat-sub">plan status active</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Latest Review Activity</span>
              <Link href="/reviews" className="card-action">View all →</Link>
            </div>
            <div>
              {activityFeed.length ? activityFeed.map((review, i) => (
                <div
                  key={review.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.9rem 1.5rem',
                    borderBottom: i < activityFeed.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: review.merge_decision === 'APPROVE' ? 'var(--green-muted)' : 'var(--red-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 10 }}>{review.merge_decision === 'APPROVE' ? '✓' : '!'}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {review.pr_title || 'Untitled PR'}
                    </div>
                    <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>
                      {review.repo_full_name} · {review.findings_count || 0} findings · {timeAgo(review.created_at)}
                    </div>
                  </div>
                  <Link href={review.pr_url || '#'} target="_blank" className="btn-icon">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </Link>
                </div>
              )) : (
                <div className="state-empty" style={{ padding: '2.5rem' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    No reviews yet. Open a PR on an active repo to see results.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Recently Updated Repos</span>
              <Link href="/repos" className="card-action">View all →</Link>
            </div>
            <div>
              {stats?.recent?.length ? stats.recent.map((repo, i) => (
                <div
                  key={repo.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.9rem 1.5rem',
                    borderBottom: i < stats.recent.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--green-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{repo.name}</div>
                    <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>
                      {repo.language || 'Unknown'} · {repo.open_issues} issues · {timeAgo(repo.updated_at)}
                    </div>
                  </div>
                  {repo.private && <span className="badge-dim">Private</span>}
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" className="btn-icon">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              )) : (
                <div className="state-empty" style={{ padding: '2rem' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>No repositories found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Usage & Status</span>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Monthly Traffic</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{usageCount} / {isUnlimited ? '∞' : usageLimit}</span>
              </div>
              {!isUnlimited ? (
                <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 10, overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <div style={{ width: `${usagePercent}%`, height: '100%', background: 'var(--green)', boxShadow: '0 0 10px var(--green-glow)' }} />
                </div>
              ) : (
                <div style={{ height: 6, background: 'linear-gradient(90deg, var(--green), var(--surface2))', borderRadius: 10, opacity: 0.3, marginBottom: '1.5rem' }} />
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                  {isUnlimited 
                    ? "Your professional plan gives you unlimited AI reviews and private repo support. No throttles, no limits."
                    : "You're on the standard free tier. Upgrade to Pro for unlimited reviews, private repo support and priority processing."}
                </p>
                {!isUnlimited && (
                  <Link href="/billing" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', fontSize: 11, padding: '8px' }}>
                    View Upgrade Options
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">System Health</span>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Engine Status</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)' }}>OPTIMAL</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>GitHub Sync</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)' }}>SYNCED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
