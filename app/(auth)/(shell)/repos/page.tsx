'use client'

import { useEffect, useState, useMemo } from 'react'

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
  Java: '#b07219', Ruby: '#701516', Swift: '#F05138', Kotlin: '#A97BFF',
}

function StrictnessChip({ value }: { value: string }) {
  const map: Record<string, { color: string; bg: string; border: string }> = {
    strict: { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
    balanced: { color: 'var(--green)', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
    relaxed: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
  }
  const s = map[value] || map.balanced
  return (
    <span style={{
      fontSize: 9, fontWeight: 600, fontFamily: 'var(--mono)', textTransform: 'uppercase',
      letterSpacing: '0.06em', padding: '2px 7px', borderRadius: 4,
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
    }}>
      {value}
    </span>
  )
}

function Toggle({ on, loading, onClick }: { on: boolean; loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick() }}
      disabled={loading}
      title={on ? 'Click to deactivate' : 'Click to activate'}
      style={{
        width: 36, height: 20, borderRadius: 10, border: 'none',
        background: on ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.07)',
        outline: `1.5px solid ${on ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.15)'}`,
        position: 'relative', cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s', flexShrink: 0, opacity: loading ? 0.5 : 1,
      }}
    >
      <span style={{
        position: 'absolute', width: 14, height: 14, borderRadius: '50%', top: 2,
        left: on ? 18 : 2,
        background: on ? 'var(--green)' : '#4a6650',
        transition: 'left 0.2s, background 0.2s',
      }} />
    </button>
  )
}

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [repoSettings, setRepoSettings] = useState<Record<string, RepoSettings>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [actioning, setActioning] = useState<string | null>(null)
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    async function init() {
      try {
        const [ghRes, appRes] = await Promise.all([
          fetch('/api/github/repos'),
          fetch('/api/app/repos'),
        ])
        const [ghData, appData] = await Promise.all([ghRes.json(), appRes.json()])

        if (ghData.error) { setError(ghData.error) }
        else { setRepos(ghData) }

        if (appData && !appData.error) {
          setRepoSettings(Object.fromEntries(appData.map((r: RepoSettings) => [r.repo_full_name, r])))
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
        body: JSON.stringify({ id: repo.id, full_name: repo.full_name, private: repo.private }),
      })
      const data = await res.json()
      if (data.success) setRepoSettings(prev => ({ ...prev, [repo.full_name]: data.data }))
    } finally {
      setActioning(null)
    }
  }

  const updateStrictness = async (repoFullName: string, value: RepoSettings['review_strictness']) => {
    setActioning(repoFullName)
    const prev = repoSettings[repoFullName]
    setRepoSettings(p => ({ ...p, [repoFullName]: { ...prev, review_strictness: value, repo_full_name: repoFullName, is_active: true } }))
    try {
      await fetch('/api/app/repos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_full_name: repoFullName, review_strictness: value }),
      })
    } catch {
      setRepoSettings(p => ({ ...p, [repoFullName]: prev }))
    } finally {
      setActioning(null)
    }
  }

  const removeRepo = async (repoFullName: string) => {
    if (!confirm(`Remove ${repoFullName}? This deletes all review history for this repo from your dashboard.`)) return
    setActioning(repoFullName)
    try {
      const res = await fetch('/api/app/repos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_full_name: repoFullName }),
      })
      const data = await res.json()
      if (data.success) {
        setRepoSettings(prev => { const next = { ...prev }; delete next[repoFullName]; return next })
      }
    } finally {
      setActioning(null)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return repos.filter(r => {
      const settings = repoSettings[r.full_name]
      const isActive = Boolean(settings?.is_active)
      if (filterActive === 'active' && !isActive) return false
      if (filterActive === 'inactive' && isActive) return false
      if (q && !r.name.toLowerCase().includes(q) && !r.full_name.toLowerCase().includes(q)) return false
      return true
    })
  }, [repos, search, filterActive, repoSettings])

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-title">GitHub</p>
          <h1 className="page-heading">Repositories</h1>
        </div>
        <a
          href="https://github.com/apps/buglensai/installations/new"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          + Install GitHub App
        </a>
      </div>

      {!loading && !error && repos.length === 0 && (
        <div className="alert-banner warn">
          <span>!</span>
          <div>
            GitHub App not installed.{' '}
            <a href="https://github.com/apps/buglensai/installations/new" target="_blank" rel="noopener noreferrer">
              Install it here →
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="alert-banner error">
          <span>✕</span>
          <span>{error}</span>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden' }}>
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              style={{
                padding: '6px 14px', fontSize: 11, fontFamily: 'var(--mono)',
                background: filterActive === f ? 'rgba(34,197,94,0.12)' : 'transparent',
                color: filterActive === f ? 'var(--green)' : 'var(--text-dim)',
                border: 'none', borderRight: '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
              }}
            >
              {f === 'all' ? 'All repos' : f}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }}
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search repos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 7,
              padding: '6px 10px 6px 30px', color: 'var(--text)', fontSize: 12,
              fontFamily: 'var(--mono)', outline: 'none', width: 200,
            }}
          />
        </div>

        <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)', marginLeft: 'auto' }}>
          {filtered.length} repo{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="state-loading"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map(repo => {
            const settings = repoSettings[repo.full_name]
            const isActive = Boolean(settings?.is_active)
            const strictness = settings?.review_strictness || 'balanced'
            const isActioning = actioning === repo.full_name
            const langColor = LANG_COLORS[repo.language || ''] || 'var(--border-bright)'

            return (
              <div
                key={repo.id}
                style={{
                  background: 'var(--glass-bg)', borderRadius: 12, padding: '16px 18px',
                  border: `1px solid ${isActive ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
                  transition: 'border-color 0.2s, background 0.2s',
                  position: 'relative', opacity: isActioning ? 0.7 : 1,
                }}
                className="repo-card-item"
              >
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--mono)', marginBottom: 2 }}>
                      {repo.owner}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2, wordBreak: 'break-word' }}>
                      {repo.name}
                    </div>
                  </div>
                  <Toggle on={isActive} loading={isActioning} onClick={() => toggleRepo(repo)} />
                </div>

                {repo.description && (
                  <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {repo.description}
                  </p>
                )}

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
                  {repo.language && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: langColor, flexShrink: 0 }} />
                      {repo.language}
                    </span>
                  )}
                  {repo.stars > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                      ★ {repo.stars}
                    </span>
                  )}
                  {repo.private && (
                    <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text-dim)', background: 'var(--surface2)', padding: '1px 5px', borderRadius: 3, border: '1px solid var(--border)' }}>
                      PRIVATE
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isActive ? (
                      <select
                        value={strictness}
                        onChange={e => updateStrictness(repo.full_name, e.target.value as RepoSettings['review_strictness'])}
                        disabled={isActioning}
                        onClick={e => e.stopPropagation()}
                        style={{
                          background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6,
                          padding: '4px 8px', color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: 10,
                          outline: 'none', cursor: 'pointer',
                        }}
                      >
                        <option value="relaxed">Relaxed</option>
                        <option value="balanced">Balanced</option>
                        <option value="str
ict">Strict</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>Not active</span>
                    )}
                    {isActive && <StrictnessChip value={strictness} />}
                  </div>

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                      {timeAgo(repo.updated_at)}
                    </span>
                    {isActive && (
                      <button
                        onClick={() => removeRepo(repo.full_name)}
                        disabled={isActioning}
                        title="Remove from BugLens"
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: '#f87171', opacity: 0.5, padding: 2,
                          display: 'flex', alignItems: 'center', transition: 'opacity 0.15s',
                        }}
                        className="remove-repo-btn"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-icon"
                      title="Open on GitHub"
                      onClick={e => e.stopPropagation()}
                      style={{ width: 26, height: 26 }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                </div>

                {isActive && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--green)', borderRadius: '12px 12px 0 0', opacity: 0.6 }} />
                )}
              </div>
            )
          })}

          {/* Connect repo card */}
          <a
            href="https://github.com/apps/buglensai/installations/new"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 10, borderRadius: 12, padding: '24px 18px',
              border: '1px dashed var(--border)', textDecoration: 'none',
              minHeight: 120, transition: 'border-color 0.15s, background 0.15s',
              background: 'transparent',
            }}
            className="add-repo-card"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-dim)' }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>Connect repository</span>
          </a>
        </div>
      )}
    </div>
  )
}
