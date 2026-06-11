import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LessonsManager from '@/components/LessonsManager'
import { getLessons } from '@/app/(auth)/lessons-actions'

const DOCS = [
  { name: 'Coding Standards v2.pdf', chunks: 142, status: 'Active', statusCls: 'badge-green' },
  { name: 'Architecture RFC.md', chunks: 56, status: 'Active', statusCls: 'badge-green' },
  { name: 'Security Policy.pdf', chunks: 89, status: 'Indexing', statusCls: 'badge-yellow' },
]

export default async function KnowledgeBasePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch initial lessons and repos
  const [lessonsRes, reposRes] = await Promise.all([
    getLessons(),
    supabase.from('repos').select('repo_full_name').eq('user_id', user.id).eq('is_active', true)
  ])

  const lessons = (lessonsRes.data || []).map((l: any) => ({
    id: l.id,
    repo_full_name: l.repo_full_name,
    content: l.content,
    created_at: l.created_at,
  }))

  const repos = (reposRes.data || []).map((r: any) => ({ full_name: r.repo_full_name }))

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-title">RAG Brain</p>
          <h1 className="page-heading">Knowledge Base</h1>
        </div>
        <button className="btn-primary">+ Upload Document</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* AI Tuning & Lessons Learned */}
          <LessonsManager initialLessons={lessons} repos={repos} />

          {/* Document List (Existing RAG) */}
          <div className="card">
            <div className="card-header"><span className="card-title">Indexed Documents</span></div>
            <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Chunks</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {DOCS.map(d => (
                    <tr key={d.name}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <span style={{ fontSize: 13 }}>{d.name}</span>
                        </div>
                      </td>
                      <td><span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-dim)' }}>{d.chunks}</span></td>
                      <td><span className={d.statusCls}>{d.status}</span></td>
                      <td>
                        <button className="btn-icon" title="Delete">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Index Stats</span></div>
            <div className="card-body">
              {[
                { label: 'Total Documents', value: '3' },
                { label: 'Total Chunks', value: '1,248', cls: 'text-green' },
                { label: 'AI Model', value: 'Latest', cls: 'text-green' },
                { label: 'Shadow Learning', value: 'Active', cls: 'text-green' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>{s.label}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }} className={s.cls || ''}>{s.value}</span>
                </div>
              ))}
              <button className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}>Re-Sync Lessons</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">RAG Query</span></div>
            <div className="card-body">
              <textarea style={{
                width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '8px 10px', color: 'var(--text)', fontFamily: 'var(--mono)',
                fontSize: 12, resize: 'vertical', minHeight: 70, outline: 'none'
              }} placeholder="How should we handle CORS?..." />
              <button className="btn-primary" style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}>Query Brain →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
