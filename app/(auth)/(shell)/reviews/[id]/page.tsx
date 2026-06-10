import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

type Finding = {
  id: string
  file_path: string
  line_number: number | null
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  message: string
  suggestion: string | null
  source: string
  category: string | null
  confidence: number | null
}

type Params = Promise<{ id: string }>

function severityColor(s: string) {
  if (s === 'HIGH') return '#f87171'
  if (s === 'MEDIUM') return '#fb923c'
  return '#94a3b8'
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}

export default async function ReviewDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: review, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !review) notFound()

  const { data: findings } = await supabase
    .from('findings')
    .select('*')
    .eq('review_id', id)
    .order('severity', { ascending: false })

  const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 }
  for (const f of findings || []) counts[f.severity as keyof typeof counts]++

  const decisionColor = review.merge_decision === 'APPROVE' ? 'var(--green)' : '#f87171'

  return (
    <div className="page-shell">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <Link href="/reviews" style={{ fontSize: 11, color: 'var(--text-dim)', textDecoration: 'none', fontFamily: 'var(--mono)' }}>
            ← All Reviews
          </Link>
          <h1 className="page-heading" style={{ marginTop: 8 }}>
            {review.pr_title || 'Untitled PR'}
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--mono)', marginTop: 4 }}>
            {review.repo_full_name} · PR #{review.pr_number} · {timeAgo(review.created_at)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: decisionColor, fontWeight: 700, fontSize: 13, fontFamily: 'var(--mono)' }}>
            {review.merge_decision || 'PENDING'}
          </span>
          {review.pr_url && (
            <Link href={review.pr_url} target="_blank" className="btn-primary" style={{ fontSize: 11 }}>
              View on GitHub ↗
            </Link>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Files Reviewed', value: review.files_reviewed || 0 },
          { label: 'HIGH', value: counts.HIGH, color: '#f87171' },
          { label: 'MEDIUM', value: counts.MEDIUM, color: '#fb923c' },
          { label: 'LOW', value: counts.LOW, color: '#94a3b8' },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-number" style={s.color ? { color: s.color } : {}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Risk summary */}
      {review.risk_summary && (
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
          <div className="card-title" style={{ marginBottom: 8 }}>Risk Summary</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{review.risk_summary}</p>
        </div>
      )}

      {/* Findings */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <span className="card-title">Findings ({findings?.length || 0})</span>
        </div>

        {!findings?.length ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            No findings — clean review ✓
          </div>
        ) : (
          findings.map((f: Finding) => (
            <div key={f.id} style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, fontFamily: 'var(--mono)',
                  color: severityColor(f.severity), flexShrink: 0,
                  background: `${severityColor(f.severity)}18`,
                  padding: '3px 8px', borderRadius: 4, marginTop: 2,
                }}>
                  {f.severity}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-active)', marginBottom: 6, lineHeight: 1.5 }}>
                    {f.message}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-dim)', marginBottom: f.suggestion ? 10 : 0 }}>
                    {f.file_path}{f.line_number ? `:${f.line_number}` : ''} · {f.source}
                    {f.confidence ? ` · ${Math.round(f.confidence * 100)}% confidence` : ''}
                    {f.category ? ` · ${f.category}` : ''}
                  </div>
                  {f.suggestion && (
                    <pre style={{
                      background: 'var(--surface2)', border: '1px solid var(--border)',
                      borderRadius: 6, padding: '0.75rem 1rem', fontSize: 12,
                      fontFamily: 'var(--mono)', overflow: 'auto', margin: 0,
                      color: 'var(--green)',
                    }}>
                      {f.suggestion}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
