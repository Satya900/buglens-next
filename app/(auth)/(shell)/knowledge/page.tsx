import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LessonsManager from '@/components/LessonsManager'
import DocumentsManager from '@/components/DocumentsManager'
import { getLessons } from '@/app/(auth)/lessons-actions'
import { getDocuments } from '@/app/(auth)/document-actions'

export default async function KnowledgeBasePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [lessonsRes, docsRes, reposRes] = await Promise.all([
    getLessons(),
    getDocuments(),
    supabase.from('repos').select('repo_full_name').eq('user_id', user.id).eq('is_active', true),
  ])

  const lessons = (lessonsRes.data || []).map((l: any) => ({
    id: l.id,
    repo_full_name: l.repo_full_name,
    content: l.content,
    created_at: l.created_at,
  }))

  const documents = (docsRes.data || []).map((d: any) => ({
    id: d.id,
    file_name: d.file_name,
    file_size: d.file_size,
    storage_path: d.storage_path,
    status: d.status,
    created_at: d.created_at,
  }))

  const repos = (reposRes.data || []).map((r: any) => ({ full_name: r.repo_full_name }))

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-title">RAG Brain</p>
          <h1 className="page-heading">Knowledge Base</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* AI Tuning & Lessons Learned */}
          <LessonsManager initialLessons={lessons} repos={repos} />

          {/* Document Upload & List */}
          <DocumentsManager initialDocuments={documents} />
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Index Stats</span></div>
            <div className="card-body">
              {[
                { label: 'Total Documents', value: String(documents.length) },
                { label: 'Active Lessons', value: String(lessons.length), cls: 'text-green' },
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

          <div className="card">
            <div className="card-header"><span className="card-title">Supported Formats</span></div>
            <div className="card-body">
              {[
                { ext: '.pdf', desc: 'Design docs, RFCs, specs' },
                { ext: '.md', desc: 'Coding standards, READMEs' },
                { ext: '.txt', desc: 'Guidelines, notes' },
              ].map(f => (
                <div key={f.ext} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <code style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--mono)' }}>{f.ext}</code>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{f.desc}</span>
                </div>
              ))}
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: '0.75rem' }}>Max 10MB per file</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
