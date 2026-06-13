'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  getAdminStats,
  setUserTier,
  approveOSSApplication,
  rejectOSSApplication,
} from './actions'

type Section = 'overview' | 'users' | 'reviews' | 'oss' | 'analytics' | 'health'

type AdminData = Awaited<ReturnType<typeof getAdminStats>>

// ─── Mini bar chart ────────────────────────────────────────────────────────────
function BarChart({ data, label }: { data: { label: string; count: number }[]; label?: string }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div>
      {label && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</p>}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 64 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div
              style={{
                width: '100%',
                height: Math.max(4, (d.count / max) * 56),
                background: 'var(--green)',
                borderRadius: 3,
                opacity: d.count === 0 ? 0.2 : 1,
              }}
            />
            <span style={{ fontSize: 9, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '16px 20px',
    }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

// ─── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ text, color }: { text: string; color: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    green: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
    yellow: { bg: 'rgba(234,179,8,0.15)', text: '#eab308' },
    red: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
    gray: { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8' },
  }
  const c = colors[color] || colors.gray
  return (
    <span style={{
      background: c.bg,
      color: c.text,
      fontSize: 11,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 20,
      display: 'inline-block',
    }}>{text}</span>
  )
}

// ─── Section: Overview ─────────────────────────────────────────────────────────
function OverviewSection({ data }: { data: AdminData }) {
  const { stats, recentReviews, users } = data
  const recentUsers = users.slice(0, 8)

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Overview</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard label="Total Users" value={stats.totalUsers} sub={`${stats.proUsers} PRO`} />
        <StatCard label="Total Reviews" value={stats.totalReviews} sub={`${stats.reviewsToday} today`} />
        <StatCard label="Findings" value={stats.totalFindings} sub={`avg ${stats.avgFindingsPerReview}/review`} />
        <StatCard label="Active Repos" value={stats.activeRepos} sub={`of ${stats.totalRepos}`} />
        <StatCard label="Pending OSS" value={stats.pendingOSS} sub={`${stats.approvedOSS} approved`} />
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <BarChart data={stats.reviewsByDay} label="Reviews — last 7 days" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Recent Signups</p>
          {recentUsers.map(u => (
            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>@{u.github_username || '—'}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge text={u.subscription_tier} color={u.subscription_tier === 'PRO' ? 'green' : 'gray'} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Recent Reviews</p>
          {recentReviews.slice(0, 8).map(r => (
            <div key={r.id} style={{ padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href={r.pr_url} target="_blank" rel="noreferrer"
                  style={{ fontSize: 12, color: 'var(--green)', textDecoration: 'none', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.pr_title || r.repo_full_name}
                </a>
                <Badge
                  text={r.merge_decision}
                  color={r.merge_decision === 'APPROVE' ? 'green' : r.merge_decision === 'REQUEST_CHANGES' ? 'red' : 'yellow'}
                />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.repo_full_name} · {r.findings_count || 0} findings</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section: Users ────────────────────────────────────────────────────────────
function UsersSection({ users, onTierChange }: {
  users: AdminData['users']
  onTierChange: (id: string, tier: 'PRO' | 'FREE') => void
}) {
  const [q, setQ] = useState('')
  const [filterTier, setFilterTier] = useState<'ALL' | 'PRO' | 'FREE'>('ALL')
  const filtered = users.filter(u => {
    const matchQ = !q || (u.github_username || '').toLowerCase().includes(q.toLowerCase())
    const matchTier = filterTier === 'ALL' || u.subscription_tier === filterTier
    return matchQ && matchTier
  })

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Users</h2>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search by username…"
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6,
            padding: '8px 12px', fontSize: 13, color: 'var(--text)', outline: 'none', flex: 1,
          }}
        />
        {(['ALL', 'PRO', 'FREE'] as const).map(t => (
          <button key={t} onClick={() => setFilterTier(t)} style={{
            background: filterTier === t ? 'var(--green)' : 'var(--surface)',
            color: filterTier === t ? '#000' : 'var(--text)',
            border: '1px solid var(--border)', borderRadius: 6,
            padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['GitHub', 'Plan', 'Usage', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 14px', color: 'var(--text)' }}>@{u.github_username || '—'}</td>
                <td style={{ padding: '10px 14px' }}><Badge text={u.subscription_tier} color={u.subscription_tier === 'PRO' ? 'green' : 'gray'} /></td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                  {u.current_usage}/{u.usage_limit === null ? '∞' : u.usage_limit}
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '10px 14px' }}>
                  {u.subscription_tier === 'FREE' ? (
                    <button onClick={() => onTierChange(u.id, 'PRO')} style={{
                      background: 'var(--green)', color: '#000', border: 'none', borderRadius: 5,
                      padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}>→ PRO</button>
                  ) : (
                    <button onClick={() => onTierChange(u.id, 'FREE')} style={{
                      background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 5,
                      padding: '4px 10px', fontSize: 11, cursor: 'pointer',
                    }}>→ FREE</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No users found</p>}
      </div>
    </div>
  )
}

// ─── Section: Reviews ──────────────────────────────────────────────────────────
function ReviewsSection({ reviews }: { reviews: AdminData['recentReviews'] }) {
  const [filter, setFilter] = useState<'ALL' | 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'>('ALL')
  const filtered = filter === 'ALL' ? reviews : reviews.filter(r => r.merge_decision === filter)

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Reviews</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['ALL', 'APPROVE', 'REQUEST_CHANGES', 'COMMENT'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? 'var(--green)' : 'var(--surface)',
            color: filter === f ? '#000' : 'var(--text)',
            border: '1px solid var(--border)', borderRadius: 6,
            padding: '6px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}>{f.replace('_', ' ')}</button>
        ))}
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['PR Title', 'Repo', 'Decision', 'Findings', 'Date'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 14px', maxWidth: 220 }}>
                  <a href={r.pr_url} target="_blank" rel="noreferrer"
                    style={{ color: 'var(--green)', textDecoration: 'none', fontSize: 12,
                      display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.pr_title || '—'}
                  </a>
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: 12 }}>{r.repo_full_name}</td>
                <td style={{ padding: '10px 14px' }}>
                  <Badge
                    text={r.merge_decision}
                    color={r.merge_decision === 'APPROVE' ? 'green' : r.merge_decision === 'REQUEST_CHANGES' ? 'red' : 'yellow'}
                  />
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--text)' }}>{r.findings_count || 0}</td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: 12 }}>{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No reviews</p>}
      </div>
    </div>
  )
}

// ─── Section: OSS Applications ─────────────────────────────────────────────────
function OSSSection({ apps, onApprove, onReject }: {
  apps: AdminData['ossApplications']
  onApprove: (id: string) => void
  onReject: (id: string, reason?: string) => void
}) {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const filtered = apps.filter(a => a.status === filter)

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>OSS Applications</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? 'var(--green)' : 'var(--surface)',
            color: filter === f ? '#000' : 'var(--text)',
            border: '1px solid var(--border)', borderRadius: 6,
            padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
          }}>
            {f} ({apps.filter(a => a.status === f).length})
          </button>
        ))}
      </div>

      {rejectId && (
        <div style={{
          background: 'var(--surface)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10,
          padding: 16, marginBottom: 16,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>Rejection reason (optional)</p>
          <textarea
            value={reason} onChange={e => setReason(e.target.value)}
            rows={2} placeholder="Explain why the application is rejected…"
            style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6,
              color: 'var(--text)', fontSize: 13, padding: '8px 10px', boxSizing: 'border-box', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={() => { onReject(rejectId, reason); setRejectId(null); setReason('') }} style={{
              background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>Confirm Reject</button>
            <button onClick={() => { setRejectId(null); setReason('') }} style={{
              background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer',
            }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(app => (
          <div key={app.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>@{app.github_username}</span>
                  <a href={app.repo_url} target="_blank" rel="noreferrer"
                    style={{ color: 'var(--green)', fontSize: 12, textDecoration: 'none' }}>
                    {app.repo_name}
                  </a>
                  {app.stars != null && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>⭐ {app.stars}</span>}
                  {app.license && <Badge text={app.license} color="gray" />}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{app.email}</p>
                {app.use_case && <p style={{ fontSize: 12, color: 'var(--text)', marginBottom: 2 }}><b>Use case:</b> {app.use_case}</p>}
                {app.role_in_project && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Role: {app.role_in_project}</p>}
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Applied {new Date(app.created_at).toLocaleDateString()}
                  {app.approved_at && ` · Approved ${new Date(app.approved_at).toLocaleDateString()}`}
                  {app.rejected_at && ` · Rejected ${new Date(app.rejected_at).toLocaleDateString()}`}
                </p>
                {app.rejection_reason && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>Reason: {app.rejection_reason}</p>}
              </div>
              {app.status === 'pending' && (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => onApprove(app.id)} style={{
                    background: 'var(--green)', color: '#000', border: 'none', borderRadius: 6,
                    padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>✓ Approve</button>
                  <button onClick={() => setRejectId(app.id)} style={{
                    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6,
                    padding: '6px 14px', fontSize: 12, cursor: 'pointer',
                  }}>✗ Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
            No {filter} applications
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Section: Analytics ────────────────────────────────────────────────────────
function AnalyticsSection({ analytics, stats }: { analytics: AdminData['analytics']; stats: AdminData['stats'] }) {
  const { reviewsByDay30, topCategories, severitySplit, topRepos, signupsByWeek, conversionRate } = analytics
  const sevTotal = severitySplit.HIGH + severitySplit.MEDIUM + severitySplit.LOW || 1

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Analytics</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Free → Pro" value={`${conversionRate}%`} sub="conversion rate" />
        <StatCard label="PRO Users" value={stats.proUsers} />
        <StatCard label="Avg Findings" value={stats.avgFindingsPerReview} sub="per review" />
        <StatCard label="Total Findings" value={stats.totalFindings} />
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <BarChart data={reviewsByDay30} label="Reviews — last 30 days" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Severity Split</p>
          {[
            { label: 'HIGH', count: severitySplit.HIGH, color: '#ef4444' },
            { label: 'MEDIUM', count: severitySplit.MEDIUM, color: '#eab308' },
            { label: 'LOW', count: severitySplit.LOW, color: '#22c55e' },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.label}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.count} ({Math.round((s.count / sevTotal) * 100)}%)</span>
              </div>
              <div style={{ background: 'var(--surface2)', borderRadius: 4, height: 6 }}>
                <div style={{ background: s.color, height: 6, borderRadius: 4, width: `${(s.count / sevTotal) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Top Bug Categories</p>
          {topCategories.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No data yet</p>}
          {topCategories.map((c, i) => {
            const maxCount = topCategories[0]?.count || 1
            return (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 16, textAlign: 'right' }}>{i + 1}</span>
                <span style={{ fontSize: 12, color: 'var(--text)', flex: 1, textTransform: 'capitalize' }}>{c.name}</span>
                <div style={{ background: 'var(--surface2)', borderRadius: 3, height: 6, width: 80 }}>
                  <div style={{ background: 'var(--green)', height: 6, borderRadius: 3, width: `${(c.count / maxCount) * 100}%` }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 28, textAlign: 'right' }}>{c.count}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Most Active Repos</p>
          {topRepos.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No data</p>}
          {topRepos.map(r => (
            <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>{r.name}</span>
              <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>{r.count}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <BarChart data={signupsByWeek} label="Signups — last 8 weeks" />
        </div>
      </div>
    </div>
  )
}

// ─── Section: System Health ────────────────────────────────────────────────────
function HealthSection({ stats }: { stats: AdminData['stats'] }) {
  const metrics = [
    { label: 'Reviews Today', value: stats.reviewsToday, ok: true },
    { label: 'Avg Findings / Review', value: stats.avgFindingsPerReview, ok: stats.avgFindingsPerReview > 0 },
    { label: 'Total Repos', value: stats.totalRepos, ok: true },
    { label: 'Active Repos', value: stats.activeRepos, ok: stats.activeRepos > 0 },
    { label: 'Total Users', value: stats.totalUsers, ok: true },
    { label: 'PRO Users', value: stats.proUsers, ok: true },
    { label: 'Total Reviews', value: stats.totalReviews, ok: true },
    { label: 'Total Findings', value: stats.totalFindings, ok: true },
    { label: 'Pending OSS', value: stats.pendingOSS, ok: stats.pendingOSS === 0 },
  ]

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>System Health</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            background: 'var(--surface)',
            border: `1px solid ${m.ok ? 'var(--border)' : 'rgba(234,179,8,0.3)'}`,
            borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.label}</p>
              <span style={{ fontSize: 14 }}>{m.ok ? '✅' : '⚠️'}</span>
            </div>
            <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>DB Row Counts</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { table: 'profiles', count: stats.totalUsers },
            { table: 'reviews', count: stats.totalReviews },
            { table: 'repos', count: stats.totalRepos },
            { table: 'findings', count: stats.totalFindings },
            { table: 'oss_applications', count: stats.pendingOSS + stats.approvedOSS },
          ].map(row => (
            <div key={row.table} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--surface2)', borderRadius: 6 }}>
              <code style={{ fontSize: 13, color: 'var(--text)' }}>{row.table}</code>
              <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>{row.count} rows</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [section, setSection] = useState<Section>('overview')
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getAdminStats()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function handleTierChange(id: string, tier: 'PRO' | 'FREE') {
    startTransition(async () => {
      const res = await setUserTier(id, tier)
      if ('error' in res) { showToast('Error: ' + res.error); return }
      showToast(`User updated to ${tier}`)
      const fresh = await getAdminStats()
      setData(fresh)
    })
  }

  function handleApprove(id: string) {
    startTransition(async () => {
      const res = await approveOSSApplication(id)
      if ('error' in res) { showToast('Error: ' + res.error); return }
      showToast('Application approved — welcome email sent ✓')
      const fresh = await getAdminStats()
      setData(fresh)
    })
  }

  function handleReject(id: string, reason?: string) {
    startTransition(async () => {
      const res = await rejectOSSApplication(id, reason)
      if ('error' in res) { showToast('Error: ' + res.error); return }
      showToast('Application rejected')
      const fresh = await getAdminStats()
      setData(fresh)
    })
  }

  const navItems: { id: Section; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '⬡' },
    { id: 'users', label: 'Users', icon: '👤' },
    { id: 'reviews', label: 'Reviews', icon: '🔍' },
    { id: 'oss', label: 'OSS Apps', icon: '📋' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'health', label: 'Health', icon: '💚' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'inherit' }}>
      {/* Sidebar */}
      <nav style={{
        width: 200,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 10,
      }}>
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', letterSpacing: '0.05em' }}>BugLens</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Admin Console</p>
        </div>
        <div style={{ flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setSection(item.id)} style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              background: section === item.id ? 'rgba(34,197,94,0.08)' : 'transparent',
              color: section === item.id ? 'var(--green)' : 'var(--text-muted)',
              border: 'none',
              borderLeft: `3px solid ${section === item.id ? 'var(--green)' : 'transparent'}`,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: section === item.id ? 600 : 400,
              textAlign: 'left',
              transition: 'all 0.12s',
            }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
              {item.id === 'oss' && data && data.stats.pendingOSS > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--green)',
                  color: '#000',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 99,
                  padding: '1px 6px',
                  lineHeight: '16px',
                }}>{data.stats.pendingOSS}</span>
              )}
            </button>
          ))}
        </div>
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
          <a href="/dashboard" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Dashboard
          </a>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ marginLeft: 200, flex: 1, padding: '32px 32px', minWidth: 0 }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading admin data…</p>
          </div>
        )}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 16, color: '#ef4444', fontSize: 13 }}>
            {error}
          </div>
        )}
        {data && !loading && (
          <>
            {section === 'overview' && <OverviewSection data={data} />}
            {section === 'users' && <UsersSection users={data.users} onTierChange={handleTierChange} />}
            {section === 'reviews' && <ReviewsSection reviews={data.recentReviews} />}
            {section === 'oss' && <OSSSection apps={data.ossApplications} onApprove={handleApprove} onReject={handleReject} />}
            {section === 'analytics' && <AnalyticsSection analytics={data.analytics} stats={data.stats} />}
            {section === 'health' && <HealthSection stats={data.stats} />}
          </>
        )}
      </main>

      {/* Saving indicator */}
      {isPending && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: 'var(--text-muted)', zIndex: 100 }}>
          Saving…
        </div>
      )}
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, background: 'var(--green)', color: '#000', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 100 }}>
          {toast}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
