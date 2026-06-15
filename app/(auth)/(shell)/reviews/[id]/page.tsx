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

function sevStyle(s: string) {
  if (s === 'HIGH') return { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)', dot: '#f87171' }
  if (s === 'MEDIUM') return { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)', dot: '#fbbf24' }
  return { color: '#7a9980', bg: 'rgba(122,153,128,0.08)', border: 'rgba(122,153,128,0.2)', dot: '#7a9980' }
}

function groupByFile(findings: Finding[]): Record<string, Finding[]> {
  return findings.reduce((acc, f) => {
    const key = f.file_path || 'unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(f)
    return acc
  }, {} as Record<string, Finding[]>)
}

function fileWorstSev(findings: Finding[]): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (findings.some(f => f.severity === 'HIGH')) return 'HIGH'
  if (findings.some(f => f.severity === 'MEDIUM')) return 'MEDIUM'
  return 'LOW'
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
  const fileEntries = Object.entries(byFile)
  const isApprove = review.merge_decision === 'APPROVE'

  const decisionColor = isApprove ? 'var(--green)' : '#f87171'
  const decisionBg = isApprove ? 'rgba(34,197,94,0.08)' : 'rgba(248,113,113,0.08)'
  const decisionBorder = isApprove ? 'rgba(34,197,94,0.25)' : 'rgba(248,113,113,0.25)'

  // Cross-file impact
  const highFiles = fileEntries
    .filter(([, fs]) => fs.some(f => f.severity === 'HIGH'))
    .map(([fp]) => fp)

  // Pre-merge checklist
  const checklist = allFindings
    .filter(f => f.severity === 'HIGH' || f.severity === 'MEDIUM')
    .slice(0, 6)

  return (
    <div className="page-shell">

      {/* Back nav */}
      <Link href="/reviews" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-dim)', textDecoration: 'none', fontFamily: 'var(--mono)', marginBottom: 16 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        All Reviews
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', margin: '0 0 8px', lineHeight: 1.3 }}>
            {review.pr_title || 'Untitled PR'}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
            <span>⎇ {review.repo_full_name}</span>
            <span>PR #{review.pr_number}</span>
            {review.pr_author && <span>@{review.pr_author}</span>}
            <span>{timeAgo(review.created_at)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)',
            color: decisionColor, background: decisionBg,
            border: `1px solid ${decisionBorder}`,
            padding: '5px 14px', borderRadius: 6,
          }}>
            {isApprove ? '✓ APPROVE' : '✗ REQUEST CHANGES'}
          </span>
          {review.pr_url && (
            <Link href={review.pr_url} target="_blank" rel="noopener noreferrer"
              className="btn-secondary" style={{ fontSize: 11, textDecoration: 'none', gap: 5 }}>
              GitHub ↗
            </Link>
          )}
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Files reviewed', value: review.files_reviewed || 0, color: 'var(--text)' },
          { label: 'High', value: counts.HIGH, color: counts.HIGH > 0 ? '#f87171' : 'var(--text)' },
          { label: 'Medium', value: counts.MEDIUM, color: counts.MEDIUM > 0 ? '#fbbf24' : 'var(--text)' },
          { label: 'Low', value: counts.LOW, color: 'var(--text-dim)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: '1rem 1.25rem' }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-number" style={{ fontSize: 28, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* AI Risk Assessment */}
      {review.risk_summary && (
        <div style={{
          padding: '1rem 1.25rem', marginBottom: '1.5rem', borderRadius: 10,
          background: isApprove ? 'rgba(34,197,94,0.04)' : 'rgba(248,113,113,0.05)',
          border: `1px solid ${isApprove ? 'rgba(34,197,94,0.15)' : 'rgba(248,113,113,0.2)'}`,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: isApprove ? 'var(--green)' : '#f87171', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            AI Risk Assessment
          </div>
          <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7, margin: 0 }}>{review.risk_summary}</p>
        </div>
      )}

      {/* Main layout: file tree + findings */}
      {allFindings.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 10, color: 'var(--green)' }}>✓</div>
          <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500, margin: '0 0 6px' }}>Clean review</p>
          <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>No issues found in this pull request.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.25rem', alignItems: 'start' }}>

          {/* File Tree */}
          <div className="card" style={{ overflow: 'hidden', position: 'sticky', top: 20 }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Files ({fileEntries.length})
            </div>
            {fileEntries.map(([fp, fls]) => {
              const worst = fileWorstSev(fls)
              const { dot } = sevStyle(worst)
              const filename = fp.split('/').pop() || fp
              return (
                <div
                  key={fp}
                  title={fp}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 12px', borderBottom: '1px solid rgba(34,197,94,0.05)',
                    fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)',
                    cursor: 'pointer', transition: 'background 0.1s',
                    overflow: 'hidden',
                  }}
                  className="file-tree-item"
                  onClick={() => {
                    document.getElementById(`file-${fp.replace(/[^a-z0-9]/gi, '-')}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{filename}</span>
                  <span style={{ fontSize: 9, color: 'var(--text-dim)', flexShrink: 0 }}>{fls.length}</span>
                </div>
              )
            })}
            {/* Clean files */}
            {(review.files_reviewed || 0) > fileEntries.length && (
              <div style={{ padding: '7px 12px', fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                +{(review.files_reviewed || 0) - fileEntries.length} clean
              </div>
            )}
          </div>

          {/* Findings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Cross-file impact warning */}
            {highFiles.length > 1 && (
              <div style={{
                padding: '12px 16px', borderRadius: 10,
                background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--mono)', marginBottom: 5 }}>⚠ Cross-file impact</div>
                <p style={{ fontSize: 12, color: 'var(--text)', margin: 0, lineHeight: 1.6 }}>
                  High-severity issues across {highFiles.length} files —{' '}
                  {highFiles.map((f, i) => (
                    <span key={f}>
                      <code style={{ fontFamily: 'var(--mono)', fontSize: 11, background: 'var(--surface2)', padding: '1px 5px', borderRadius: 3 }}>{f.split('/').pop()}</code>
                      {i < highFiles.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  . Fix all HIGH findings before merging.
                </p>
              </div>
            )}

            {/* Grouped findings */}
            {fileEntries.map(([filePath, fileFindings]) => {
              const worst = fileWorstSev(fileFindings)
              const { color: wColor, bg: wBg, border: wBorder } = sevStyle(worst)
              const fileId = `file-${filePath.replace(/[^a-z0-9]/gi, '-')}`

              return (
                <div key={filePath} id={fileId} className="card" style={{ overflow: 'hidden' }}>
                  {/* File header */}
                  <div style={{
                    padding: '10px 16px', background: 'var(--surface2)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-dim)', flexShrink: 0 }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {filePath}
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, fontFamily: 'var(--mono)', flexShrink: 0,
                      color: wColor, background: wBg, border: `1px solid ${wBorder}`,
                      padding: '2px 7px', borderRadius: 4,
                    }}>
                      {fileFindings.filter(f => f.severity === 'HIGH').length > 0 && `${fileFindings.filter(f => f.severity === 'HIGH').length}H `}
                      {fileFindings.filter(f => f.severity === 'MEDIUM').length > 0 && `${fileFindings.filter(f => f.severity === 'MEDIUM').length}M `}
                      {fileFindings.filter(f => f.severity === 'LOW').length > 0 && `${fileFindings.filter(f => f.severity === 'LOW').length}L`}
                    </span>
                  </div>

                  {/* Findings in file */}
                  {fileFindings.map((f, i) => {
                    const { color, bg, border } = sevStyle(f.severity)
                    return (
                      <div
                        key={f.id}
                        style={{
                          padding: '14px 16px',
                          borderBottom: i < fileFindings.length - 1 ? '1px solid var(--border)' : 'none',
                          borderLeft: `3px solid ${color}`,
                        }}
                      >
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{
                            fontSize: 9, fontWeight: 700, fontFamily: 'var(--mono)',
                            color, background: bg, border: `1px solid ${border}`,
                            padding: '3px 7px', borderRadius: 4, flexShrink: 0, marginTop: 2,
                          }}>
                            {f.severity}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, color: 'var(--text)', margin: '0 0 6px', lineHeight: 1.6 }}>
                              {f.message}
                            </p>
                            <p style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text-dim)', margin: 0, lineHeight: 1.8 }}>
                              {f.file_path}{f.line_number ? `:${f.line_number}` : ''}
                              {f.source ? ` · ${f.source}` : ''}
                              {f.confidence != null ? ` · ${Math.round(f.confidence * 100)}%` : ''}
                            </p>
                            {f.suggestion && (
                              <pre style={{
                                fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-muted)',
                                background: 'var(--surface2)', border: '1px solid var(--border)',
                                borderRadius: 6, padding: '10px 14px', margin: '8px 0 0',
                                whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6,
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
              })}

              {/* Pre-merge checklist */}
              {checklist.length > 0 && (
                <div style={{
                  marginTop: '1.5rem', padding: '1.25rem 1.5rem',
                  background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.15)',
                  borderRadius: 10,
                }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                    Pre-merge checklist
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {checklist.map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                        <span style={{ color: f.severity === 'HIGH' ? '#f87171' : '#fbbf24', flexShrink: 0, marginTop: 1 }}>
                          {f.severity === 'HIGH' ? '✕' : '○'}
                        </span>
                        <span style={{ lineHeight: 1.5 }}>{f.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cross-file impact warning */}
              {highFiles.length > 1 && (
                <div style={{
                  marginTop: '1rem', padding: '1rem 1.25rem',
                  background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)',
                  borderRadius: 8, display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <p style={{ fontSize: 12, color: '#f87171', fontFamily: 'var(--mono)', margin: 0, lineHeight: 1.6 }}>
                    High-severity issues span {highFiles.length} files — review cross-file impact before merging.
                  </p>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  )
}
