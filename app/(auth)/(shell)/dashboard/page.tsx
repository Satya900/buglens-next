import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
    const totalOpenIssues = repos.reduce((s: number, r: { open_issues_count: number }) => s + r.open_issues_count, 0)
    const recent = repos.slice(0, 6).map((r: {
      id: number; name: string; full_name: string; html_url: string;
      updated_at: string; open_issues_count: number; language: string | null; private: boolean;
    }) => ({
      id: r.id, name: r.name, full_name: r.full_name, url: r.html_url,
      updated_at: r.updated_at, open_issues: r.open_issues_count,
      language: r.language, private: r.private,
    }))
    return { totalRepos: repos.length, totalOpenIssues, publicRepos: ghUser.public_repos, followers: ghUser.followers, login: ghUser.login, recent }
  } catch { return null }
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

  const { data: profile } = await supabase.from('profiles').select('github_token, full_name').eq('id', user.id).single()
  const stats = profile?.github_token ? await getGitHubStats(profile.github_token) : null
  const displayName = profile?.full_name || stats?.login || user.email?.split('@')[0]

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-title">Overview</p>
          <h1 className="page-heading">Welcome back, {displayName}</h1>
        </div>
        <Link href="/repos" className="btn-secondary">View Repositories →</Link>
      </div>

      {!stats && (
        <div className="alert-banner warn">
          <span>⚠</span>
          <span>Could not load GitHub data. <a href="/login">Log out and back in</a> to re-grant access.</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stat-cards-row">
        <div className="stat-card">
          <div className="stat-label">Repositories</div>
          <div className="stat-number">{stats?.totalRepos ?? '—'}</div>
          <div className="stat-sub">{stats?.publicRepos ?? '—'} public</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Open Issues</div>
          <div className={`stat-number ${(stats?.totalOpenIssues ?? 0) > 0 ? 'red' : ''}`}>
            {stats?.totalOpenIssues ?? '—'}
          </div>
          <div className="stat-sub">across all repos</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">GitHub Followers</div>
          <div className="stat-number green">{stats?.followers ?? '—'}</div>
          <div className="stat-sub mono">@{stats?.login ?? '...'}</div>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Recent Repos */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <span className="card-title">Recently Updated Repos</span>
            <Link href="/repos" className="card-action">View all →</Link>
          </div>
          <div>
            {stats?.recent?.length ? stats.recent.map((repo, i) => (
              <div key={repo.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.9rem 1.5rem',
                borderBottom: i < stats.recent.length - 1 ? '1px solid var(--border)' : 'none'
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--green-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
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
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              </div>
            )) : (
              <div className="state-empty">
                <p>No repositories found. Connect your GitHub account.</p>
              </div>
            )}
          </div>
        </div>

        {/* BugLens Reviews Placeholder */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">AI Reviews</span>
            <span className="badge-dim">Coming Soon</span>
          </div>
          <div className="state-empty" style={{ padding: '2rem' }}>
            <svg width="28" height="28" className="state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            <p style={{ fontSize: 12, lineHeight: 1.7 }}>
              AI review findings will appear after you install the BugLens GitHub App and open a PR.
            </p>
            <Link href="/onboarding" className="btn-primary" style={{ marginTop: 4 }}>Set Up →</Link>
          </div>
        </div>

        {/* Knowledge Base Placeholder */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Knowledge Base</span>
            <Link href="/knowledge" className="card-action">Manage →</Link>
          </div>
          <div className="state-empty" style={{ padding: '2rem' }}>
            <svg width="28" height="28" className="state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <p style={{ fontSize: 12, lineHeight: 1.7 }}>
              Upload docs, RFCs, and coding standards to improve AI review accuracy.
            </p>
            <Link href="/knowledge" className="btn-primary" style={{ marginTop: 4 }}>Upload Docs →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
