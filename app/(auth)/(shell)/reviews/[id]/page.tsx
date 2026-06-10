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

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}

function severityStyles(s: string): { color: string; bg: string; border: string } {
  if (s === 'HIGH') return { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.25)' }
  if (s === 'MEDIUM') return { color: '#ea580c', bg: 'rgba(234,88,12,0.08)', border: 'rgba(234,88,12,0.25)' }
  return { color: 'var(--text-dim)', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.25)' }
}

function groupByFile(findings: Finding[]): Record<string, Finding[]> {
  return findings.reduce((acc, f) => {
    const key = f.file_path || 'unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(f)
    return acc
  }, {} as Record<string, Finding[]>)
}

function fileHighestSeverity(findings: Finding[]): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (findings.some(f => f.severity === 'HIGH')) return 'HIGH'
  if (findings.some(f => f.severity === 'MEDIUM')) return 'MEDIUM'
  return 'LOW'
}

function fileSeveritySummary(findings: Finding[]) {
  const h = findings.filter(f => f.severity === 'HIGH').length
  const m = findings.filter(f => f.severity === 'MEDIUM').length
  const l = findings.filter(f => f.severity === 'LOW').length
  const parts = []
  if (h) parts.push(`${h} HIGH`)
  if (m) parts.push(`${m} MEDIUM`)
  if (l) parts.push(`${l} LOW`)
  return parts.join(' · ')
}

export default async function ReviewDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?returnUrl=/reviews/${id}`)

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

  const allFindings: Finding[] = findings || []
  const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 }
  for (const f of allFindings) counts[f.severity as keyof typeof counts]++

  const byFile = groupByFile(allFindings)
  const isApprove = review.merge_decision === 'APPROVE'
  const decisionColor = isApprove ? 'var(--green)' : '#dc2626'
  const decisionBg = isApprove ? 'rgba(34,197,94,0.08)' : 'rgba(220,38,38,0.08)'
  const decisionBorder = isApprove ? 'rgba(34,197,94,0.3)' : 'rgba(220,38,38,0.3)'

  // Build pre-merge checklist from HIGH + MEDIUM findings
  const checklistItems = allFindings
    .filter(f => f.severity === 'HIGH' || f.severity === 'MEDIUM')
    .slice(0, 6)
    .map(f => ({ severity: f.severity, text: f.message, file: f.file_path, line: f.line_number }))

  // Cross-file impact: files with HIGH findings that share state (heuristic: same dir)
  const highFiles = Object.entries(byFile)
    .filter(([, fs]) => fs.some(f => f.severity === 'HIGH'))
    .map(([fp]) => fp)

  return (
    <div className="page-shell">

      {/* ── Header ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <Link href="/reviews" style={{ fontSize: 11, color: 'var(--text-dim)', textDecoration: 'none', fontFamily: 'var(--mono)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          ← All Reviews
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', margin: '0 0 8px' }}>
              {review.pr_title || 'Untitled PR'}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
              <span>⎇ {review.repo_full_name}</span>
              <span>PR #{review.pr_number}</span>
              {review.pr_author && <span>@{review.pr_author}</span>}
              <span>{timeAgo(review.created_at)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)',
              color: decisionColor, background: decisionBg,
              border: `1px solid ${decisionBorder}`,
              padding: '5px 12px', borderRadius: 6,
            }}>
              {isApprove ? '✓ APPROVE' : '✗ REQUEST CHANGES'}
            </span>
            {review.pr_url && (
              <Link href={review.pr_url} target="_blank" rel="noopener noreferrer"
                className="btn-secondary"
                style={{ fontSize: 11, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                View on GitHub ↗
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Files Reviewed', value: review.files_reviewed || 0, color: 'var(--text)' },
          { label: 'High Severity', value: counts.HIGH, color: counts.HIGH > 0 ? '#dc2626' : 'var(--text-dim)' },
          { label: 'Medium Severity', value: counts.MEDIUM, color: counts.MEDIUM > 0 ? '#ea580c' : 'var(--text-dim)' },
          { label: 'Low Severity', value: counts.LOW, color: 'var(--text-dim)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1rem 1.25rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: 'var(--mono)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── AI Risk Assessment ── */}
      {review.risk_summary && (
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>AI Risk Assessment</div>
          <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7, margin: 0 }}>{review.risk_summary}</p>
        </div>
      )}

      {/* ── Findings grouped by file ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Findings</span>
          <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{allFindings.length} total · {Object.keys(byFile).length} files</span>
        </div>

        {allFindings.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
            No issues found — clean review
          </div>
        ) : (
          Object.entries(byFile).map(([filePath, fileFindings]) => {
            const worst = fileHighestSeverity(fileFindings)
            const { color: wColor, bg: wBg, border: wBorder } = severityStyles(worst)
            return (
              <div key={filePath} style={{ borderBottom: '1px solid var(--border)' }}>
                {/* File header */}
                <div style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--surface2)',
                  display: 'flex', alignItems: 'center', gap: 10,
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>⬡</span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{filePath}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, fontFamily: 'var(--mono)', color: wColor, background: wBg, border: `1px solid ${wBorder}`, padding: '2px 8px', borderRadius: 4, flexShrink: 0 }}>
                    {fileSeveritySummary(fileFindings)}
                  </span>
                </div>

                {/* Findings in this file */}
                {fileFindings.map((f, i) => {
                  const { color, bg, border } = severityStyles(f.severity)
                  return (
                    <div key={f.id} style={{
                      padding: '1rem 1.5rem',
                      borderBottom: i < fileFindings.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, fontFamily: 'var(--mono)',
                          color, background: bg, border: `1px solid ${border}`,
                          padding: '3px 8px', borderRadius: 4, flexShrink: 0, marginTop: 1,
                        }}>
                          {f.severity}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, color: 'var(--text)', margin: '0 0 6px', lineHeight: 1.6 }}>{f.message}</p>
                          <p style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-dim)', margin: '0 0 0' }}>
                            {f.file_path}{f.line_number ? `:${f.line_number}` : ''}
                            {f.source ? ` · ${f.source}` : ''}
                            {f.confidence ? ` · ${Math.round(f.confidence * 100)}% confidence` : ''}
                            {f.category ? ` · ${f.category}` : ''}
                          </p>
                          {f.suggestion && (
                            <pre style={{
                              background: 'var(--surface2)', border: '1px solid var(--border)',
                              borderRadius: 6, padding: '0.75rem 1rem', fontSize: 12,
                              fontFamily: 'var(--mono)', overflowX: 'auto', margin: '10px 0 0',
                              color: 'var(--green)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                            }}>
                              {f.suggestion}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })
        )}
      </div>

      {/* ── Cross-file Impact ── */}
      {highFiles.length > 1 && (
        <div style={{
          padding: '1rem 1.25rem', marginBottom: '1.5rem',
          background: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.25)',
          borderRadius: 10,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#ea580c', fontFamily: 'var(--mono)', marginBottom: 6 }}>⚠ Cross-file Impact</div>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.6 }}>
            High-severity issues detected across {highFiles.length} files:{' '}
            {highFiles.map((f, i) => (
              <span key={f}>
                <code style={{ fontFamily: 'var(--mono)', fontSize: 11, background: 'var(--surface2)', padding: '1px 5px', borderRadius: 3 }}>{f.split('/').pop()}</code>
                {i < highFiles.length - 1 ? ', ' : ''}
              </span>
            ))}.{' '}
            Bugs in these files may compound — fix all HIGH findings before merging.
          </p>
        </div>
      )}

      {/* ── Pre-merge Checklist ── */}
      {checklistItems.length > 0 && (
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Pre-merge Checklist</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {checklistItems.map((item, i) => {
              const { color } = severityStyles(item.severity)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12, color: 'var(--text)' }}>
                  <span style={{ color, flexShrink: 0, marginTop: 1 }}>☐</span>
                  <span style={{ lineHeight: 1.5 }}>
                    {item.text}
                    {item.file && (
                      <span style={{ marginLeft: 6, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' }}>
                        {item.file.split('/').pop()}{item.line ? `:${item.line}` : ''}
                      </span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--mono)', paddingBottom: '2rem' }}>
        Reviewed by BugLens AI · <Link href="/dashboard" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>buglens.app</Link>
      </div>
    </div>
  )
}
