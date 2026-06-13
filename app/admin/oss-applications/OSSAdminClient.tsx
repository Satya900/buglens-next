'use client'

import { useState } from 'react'

type Application = {
  id: string
  created_at: string
  status: string
  github_username: string
  email: string
  repo_name: string
  repo_url: string
  repo_description: string
  license: string
  stars: number
  role_in_project: string
  use_case: string
  approved_at?: string
  rejected_at?: string
  rejection_reason?: string
}

export default function OSSAdminClient({ applications }: { applications: Application[] }) {
  const [apps, setApps] = useState(applications)
  const [loading, setLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET_HINT || ''

  async function handleAction(appId: string, action: 'approve' | 'reject', reason?: string) {
    setLoading(appId)
    try {
      const secret = prompt('Enter admin secret:')
      if (!secret) { setLoading(null); return }

      const res = await fetch('/api/admin/approve-oss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ applicationId: appId, action, rejectionReason: reason }),
      })
      const data = await res.json()
      if (data.success) {
        setApps(prev => prev.map(a => a.id === appId
          ? { ...a, status: action === 'approve' ? 'approved' : 'rejected' }
          : a
        ))
      } else {
        alert(data.error || 'Action failed')
      }
    } finally {
      setLoading(null)
    }
  }

  const filtered = apps.filter(a => filter === 'all' || a.status === filter)
  const counts = { pending: apps.filter(a => a.status === 'pending').length, approved: apps.filter(a => a.status === 'approved').length, rejected: apps.filter(a => a.status === 'rejected').length }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: 6, border: '1px solid var(--border)',
            background: filter === f ? 'var(--green)' : 'var(--surface)',
            color: filter === f ? '#000' : 'var(--text)', fontFamily: 'var(--mono)',
            fontSize: 12, cursor: 'pointer', fontWeight: 600, textTransform: 'uppercase'
          }}>
            {f} {f !== 'all' ? `(${counts[f]})` : `(${apps.length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: 13 }}>
          No {filter} applications
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(app => (
            <div key={app.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '1.25rem',
              borderLeft: `3px solid ${app.status === 'approved' ? 'var(--green)' : app.status === 'rejected' ? '#ef4444' : '#f59e0b'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                    <a href={app.repo_url} target="_blank" rel="noopener" style={{ color: 'var(--green)', textDecoration: 'none' }}>
                      {app.repo_name}
                    </a>
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                    @{app.github_username} · {app.email} · ⭐ {app.stars} · {app.license}
                  </div>
                </div>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                  padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase',
                  background: app.status === 'approved' ? '#14532d' : app.status === 'rejected' ? '#450a0a' : '#451a03',
                  color: app.status === 'approved' ? '#22c55e' : app.status === 'rejected' ? '#ef4444' : '#f59e0b',
                }}>
                  {app.status}
                </span>
              </div>

              <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                "{app.use_case}"
              </div>

              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                Role: {app.role_in_project} · Applied: {new Date(app.created_at).toLocaleDateString()}
              </div>

              {app.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    disabled={loading === app.id}
                    onClick={() => handleAction(app.id, 'approve')}
                    style={{
                      padding: '7px 18px', background: 'var(--green)', color: '#000',
                      border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'var(--mono)', opacity: loading === app.id ? 0.5 : 1
                    }}
                  >
                    {loading === app.id ? 'Processing...' : '✓ Approve → Send Pro'}
                  </button>
                  <button
                    disabled={loading === app.id}
                    onClick={() => {
                      const reason = prompt('Rejection reason (optional):')
                      handleAction(app.id, 'reject', reason || undefined)
                    }}
                    style={{
                      padding: '7px 18px', background: 'transparent', color: '#ef4444',
                      border: '1px solid #ef4444', borderRadius: 6, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'var(--mono)', opacity: loading === app.id ? 0.5 : 1
                    }}
                  >
                    ✕ Reject
                  </button>
                </div>
              )}

              {app.status === 'rejected' && app.rejection_reason && (
                <div style={{ fontSize: 12, color: '#ef4444', fontFamily: 'var(--mono)' }}>
                  Reason: {app.rejection_reason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
