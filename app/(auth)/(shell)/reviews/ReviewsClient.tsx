'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Review = {
  id: string
  pr_title: string | null
  pr_number: number | null
  repo_full_name: string | null
  merge_decision: string | null
  findings_count: number | null
  created_at: string
  pr_url: string | null
  pr_author: string | null
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  if (m < 10080) return `${Math.floor(m / 1440)}d ago`
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function FindingPills({ count, decision }: { count: number | null; decision: string | null }) {
  if (!count || count === 0) {
    return <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>—</span>
  }
  const isChanges = decision === 'REQUEST_CHANGES'
  if (!isChanges) {
    return (
      <span style={{
        fontSize: 10, fontWeight: 600, fontFamily: 'var(--mono)',
        padding: '2px 6px', borderRadius: 4,
        background: 'rgba(34,197,94,0.08)', color: 'var(--green)',
        border: '1px solid rgba(34,197,94,0.2)',
      }}>
        {count}L
      </span>
    )
  }
  // Heuristic: if changes requested, split across severities
  const high = count > 3 ? Math.ceil(count * 0.4) : count > 1 ? 1 : 1
  const med = count > high ? Math.ceil((count - high) * 0.5) : 0
  const low = count - high - med

  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {high > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 600, fontFamily: 'var(--mono)',
          padding: '2px 6px', borderRadius: 4,
          background: 'rgba(248,113,113,0.08)', color: '#f87171',
          border: '1px solid rgba(248,113,113,0.2)',
        }}>{high}H</span>
      )}
      {med > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 600, fontFamily: 'var(--mono)',
          padding: '2px 6px', borderRadius: 4,
          background: 'rgba(251,191,36,0.08)', color: '#fbbf24',
          border: '1px solid rgba(251,191,36,0.2)',
        }}>{med}M</span>
      )}
      {low > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 600, fontFamily: 'var(--mono)',
          padding: '2px 6px', borderRadius: 4,
          background: 'rgba(34,197,94,0.08)', color: 'var(--green)',
          border: '1px solid rgba(34,197,94,0.2)',
        }}>{low}L</span>
      )}
    </div>
  )
}

type FilterType = 'all' | 'approve' | 'changes'

export default function ReviewsClient({ reviews }: { reviews: Review[] }) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')

  const repos = useMemo(() => {
    const set = new Set<string>()
    reviews.forEach(r => r.repo_full_name && set.add(r.repo_full_name))
    return Array.from(set)
  }, [reviews])

  const [repoFilter, setRepoFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    return reviews.filter(r => {
      if (filter === 'approve' && r.merge_decision !== 'APPROVE') return false
      if (filter === 'changes' && r.merge_decision !== 'REQUEST_CHANGES') return false
      if (repoFilter !== 'all' && r.repo_full_name !== repoFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !r.pr_title?.toLowerCase().includes(q) &&
          !r.repo_full_name?.toLowerCase().includes(q) &&
          !String(r.pr_number).includes(q)
        ) return false
      }
      return true
    })
  }, [reviews, filter, search, repoFilter])

  if (reviews.length === 0) {
    return (
      <div className="state-empty" style={{ padding: '5rem 2rem' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        <p>No reviews yet.</p>
        <p style={{ fontSize: 11 }}>
          <Link href="/repos" style={{ color: 'var(--green)', textDecoration: 'none' }}>Connect a repo</Link>
          {' '}and open a pull request to get started.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {/* Decision tabs */}
        <div style={{
          display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 7, overflow: 'hidden',
        }}>
          {(['all', 'approve', 'changes'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', fontSize: 11, fontFamily: 'var(--mono)',
                background: filter === f ? 'rgba(34,197,94,0.12)' : 'transparent',
                color: filter === f ? 'var(--green)' : 'var(--text-dim)',
                border: 'none', borderRight: '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {f === 'all' ? 'All' : f === 'approve' ? '✓ Approved' : '✗ Changes'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }}
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search pull requests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 7, padding: '6px 10px 6px 32px', color: 'var(--text)',
              fontSize: 12, fontFamily: 'var(--mono)', outline: 'none', transition: 'border-color 0.15s',
            }}
          />
        </div>

        {/* Repo filter */}
        {repos.length > 1 && (
          <select
            value={repoFilter}
            onChange={e => setRepoFilter(e.target.value)}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 7,
              padding: '6px 10px', color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: 11,
              outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="all">All repos</option>
            {repos.map(r => <option key={r} value={r}>{r.split('/')[1] || r}</option>)}
          </select>
        )}

        <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)', marginLeft: 'auto' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        {/* Header */}
        <div className="reviews-table-header">
          <span>Pull request</span>
          <span>Status</span>
          <span className="col-hide-mobile">Findings</span>
          <span className="col-hide-mobile">Date</span>
        </div>

        {filtered.length === 0 ? (
          <div className="state-empty" style={{ padding: '3rem' }}>
            No results match your filters.
          </div>
        ) : (
          filtered.map(review => {
            const isApprove = review.merge_decision === 'APPROVE'
            const count = review.findings_count || 0
            const borderColor = isApprove ? 'var(--green)' : count > 2 ? '#f87171' : '#fbbf24'

            return (
              <Link
                key={review.id}
                href={`/reviews/${review.id}`}
                style={{
                  borderBottom: '1px solid var(--border)',
                  borderLeft: `3px solid ${borderColor}`,
                  textDecoration: 'none',
                  transition: 'background 0.12s',
                }}
                className="review-table-row reviews-table-row-grid"
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, color: 'var(--text)', marginBottom: 3,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {review.pr_title || 'Untitled PR'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                    {review.repo_full_name} · PR #{review.pr_number}
                    {review.pr_author && ` · @${review.pr_author}`}
                  </div>
                </div>

                <span style={{
                  fontSize: 10, fontWeight: 700, fontFamily: 'var(--mono)',
                  padding: '3px 8px', borderRadius: 4, display: 'inline-block',
                  background: isApprove ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)',
                  color: isApprove ? 'var(--green)' : '#f87171',
                  border: `1px solid ${isApprove ? 'rgba(34,197,94,0.25)' : 'rgba(248,113,113,0.25)'}`,
                  whiteSpace: 'nowrap',
                }}>
                  {isApprove ? '✓ APPROVE' : '✗ CHANGES'}
                </span>

                <span className="col-hide-mobile"><FindingPills count={review.findings_count} decision={review.merge_decision} /></span>

                <span className="col-hide-mobile" style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>
                  {timeAgo(review.created_at)}
                </span>
              </Link>
            )
          })
        )}
      </div>

      <style>{`
        .review-table-row:hover { background: rgba(34,197,94,0.03) !important; }
        .review-table-row:last-child { border-bottom: none !important; }
      `}</style>
    </>
  )
}
