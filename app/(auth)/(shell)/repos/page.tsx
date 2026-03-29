'use client'

import { useEffect, useState } from 'react'

type Repo = {
  id: number; name: string; full_name: string; description: string | null
  url: string; stars: number; language: string | null; updated_at: string
  private: boolean; open_issues: number; owner: string
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
  const [filtered, setFiltered] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/github/repos').then(r => r.json()).then(data => {
      if (data.error) setError(data.error)
      else { setRepos(data); setFiltered(data) }
    }).catch(() => setError('Failed to fetch repositories')).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(repos.filter(r =>
      r.name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q)
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
          <div className="search-wrapper">
            <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search repos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="state-loading">
          <div className="spinner" />
          <span>Fetching from GitHub…</span>
        </div>
      )}

      {error && (
        <div className="state-error">
          <span>⚠ {error}</span>
          {error.includes('token') && (
            <span style={{ color: 'var(--text-dim)', marginTop: 4 }}>
              <a href="/login" style={{ color: 'var(--green)' }}>Re-login</a> to reconnect GitHub.
            </span>
          )}
        </div>
      )}

      {!loading && !error && (
        <>
          <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-dim)', marginBottom: '1rem' }}>
            {filtered.length} of {repos.length} repositories
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Repository</th>
                  <th>Language</th>
                  <th>Stars</th>
                  <th>Issues</th>
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
                ) : filtered.map(repo => (
                  <tr key={repo.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{repo.name}</span>
                          {repo.private && <span className="badge-dim">Private</span>}
                        </div>
                        {repo.description && (
                          <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                            {repo.description.length > 60 ? repo.description.slice(0, 60) + '…' : repo.description}
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
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                        ⭐ {repo.stars}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }} className={repo.open_issues > 0 ? 'text-red' : 'text-dim'}>
                        {repo.open_issues}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                        {timeAgo(repo.updated_at)}
                      </span>
                    </td>
                    <td>
                      <a href={repo.url} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Open on GitHub">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
