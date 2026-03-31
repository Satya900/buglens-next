'use client'

import { useEffect, useState } from 'react'

type Repo = {
  id: number
  name: string
  full_name: string
  description: string | null
  url: string
  stars: number
  language: string | null
  updated_at: string
  private: boolean
  open_issues: number
  owner: string
}

type RepoSettings = {
  repo_full_name: string
  is_active: boolean
  shadow_mode?: boolean
  review_strictness?: 'relaxed' | 'balanced' | 'strict'
  auto_post_reviews?: boolean
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572a5',
  Go: '#00add8', Rust: '#dea584', CSS: '#563d7c', HTML: '#e34c26',
}

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [repoSettings, setRepoSettings] = useState<Record<string, RepoSettings>>({})
  const [filtered, setFiltered] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [actioning, setActioning] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const [ghRes, appRes] = await Promise.all([
          fetch('/api/github/repos'),
          fetch('/api/app/repos'),
        ])
        const [ghData, appData] = await Promise.all([ghRes.json(), appRes.json()])

        if (ghData.error) {
          setError(ghData.error)
        } else {
          setRepos(ghData)
          setFiltered(ghData)
        }

        if (appData && !appData.error) {
          setRepoSettings(
            Object.fromEntries(appData.map((repo: RepoSettings) => [repo.repo_full_name, repo]))
          )
        }
      } catch {
        setError('Failed to sync repositories')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const toggleRepo = async (repo: Repo) => {
    setActioning(repo.full_name)
    try {
      const res = await fetch('/api/github/repos', {
        method: 'POST',
        body: JSON.stringify({
          id: repo.id,
          full_name: repo.full_name,
          private: repo.private,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setRepoSettings((prev) => ({
          ...prev,
          [repo.full_name]: data.data,
        }))
      }
    } finally {
      setActioning(null)
    }
  }

  const updateRepoSetting = async (
    repoFullName: string,
    patch: Partial<Pick<RepoSettings, 'shadow_mode' | 'review_strictness' | 'auto_post_reviews'>>
  ) => {
    setActioning(repoFullName)
    const current = repoSettings[repoFullName]
    setRepoSettings((prev) => ({
      ...prev,
      [repoFullName]: { ...current, ...patch, repo_full_name: repoFullName, is_active: true },
    }))

    try {
      const res = await fetch('/api/app/repos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_full_name: repoFullName, ...patch }),
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to save repo settings')
      }
      setRepoSettings((prev) => ({
        ...prev,
        [repoFullName]: data.data,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save repo settings')
      setRepoSettings((prev) => ({
        ...prev,
        [repoFullName]: current,
      }))
    } finally {
      setActioning(null)
    }
  }

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(repos.filter((repo) =>
      repo.name.toLowerCase().includes(q) || (repo.description || '').toLowerCase().includes(q)
    ))
  }, [search, repos])

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-title">GitHub</p>
          <h1 className="page-heading">Repositories</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a
            href="https://github.com/apps/buglensai/installations/new"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ fontSize: 11, padding: '8px 14px' }}
          >
            + Install App
          </a>
          <div className="search-wrapper">
            <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search repos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-dim)', marginBottom: '1rem' }}>
        {filtered.length} of {repos.length} repositories
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Repository</th>
              <th>Language</th>
              <th>Status</th>
              <th>Strictness</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="state-empty" style={{ padding: '3rem' }}>
                    No repositories match &quot;{search}&quot;
                  </div>
                </td>
              </tr>
            ) : filtered.map((repo) => {
              const settings = repoSettings[repo.full_name]
              const isActive = Boolean(settings?.is_active)
              const strictness = settings?.review_strictness || 'balanced'

              return (
                <tr key={repo.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{repo.name}</span>
                        {repo.private && <span className="badge-dim">Private</span>}
                      </div>
                      {repo.description && (
                        <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                          {repo.description.length > 60 ? `${repo.description.slice(0, 60)}…` : repo.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {repo.language ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 12 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: LANG_COLORS[repo.language] || 'var(--border-bright)', flexShrink: 0 }} />
                        {repo.language}
                      </span>
                    ) : <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: 12 }}>—</span>}
                  </td>
                  <td>
                    {isActive ? (
                      <span className="badge-green">ACTIVE</span>
                    ) : (
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: 10 }}
                        onClick={() => toggleRepo(repo)}
                        disabled={actioning === repo.full_name}
                      >
                        {actioning === repo.full_name ? '...' : 'Activate'}
                      </button>
                    )}
                  </td>
                  <td>
                    {isActive ? (
                      <select
                        value={strictness}
                        onChange={(e) => updateRepoSetting(repo.full_name, { review_strictness: e.target.value as RepoSettings['review_strictness'] })}
                        disabled={actioning === repo.full_name}
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: 11 }}
                      >
                        <option value="relaxed">Relaxed</option>
                        <option value="balanced">Balanced</option>
                        <option value="strict">Strict</option>
                      </select>
                    ) : <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>—</span>}
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                      {timeAgo(repo.updated_at)}
                    </span>
                  </td>
                  <td>
                    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Open on GitHub">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
