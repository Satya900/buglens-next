import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import OSSForm from './OSSForm'

export const metadata = {
  title: 'Apply — OSS Program | BugLens',
}

export default async function ApplyOSSProgramPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?returnUrl=/apply-oss-program')

  // Check existing application
  const { data: existing } = await supabase
    .from('oss_applications')
    .select('status, repo_name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const githubUsername = user.user_metadata?.user_name || ''

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-title">
            <Link href="/oss-program" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>
              OSS Program
            </Link>
            {' '}/{'  '}Apply
          </p>
          <h1 className="page-heading">Apply for Free Pro Access</h1>
        </div>
      </div>

      <div style={{ maxWidth: 680 }}>

        {/* Existing application banner */}
        {existing && (
          <div style={{
            padding: '14px 18px',
            borderRadius: 10,
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: existing.status === 'approved'
              ? 'rgba(34,197,94,0.1)' : existing.status === 'rejected'
              ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)',
            border: `1px solid ${existing.status === 'approved'
              ? 'rgba(34,197,94,0.3)' : existing.status === 'rejected'
              ? 'rgba(248,113,113,0.3)' : 'rgba(251,191,36,0.3)'}`,
            color: existing.status === 'approved' ? '#4ade80' : existing.status === 'rejected' ? '#f87171' : '#fbbf24',
            fontSize: 13,
          }}>
            <span style={{ fontWeight: 700 }}>
              {existing.status === 'approved' ? '✅ Approved' : existing.status === 'rejected' ? '❌ Rejected' : '⏳ Pending Review'}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              {existing.repo_name} · {new Date(existing.created_at).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Benefits reminder */}
        <div style={{
          padding: '1rem 1.25rem',
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.15)',
          borderRadius: 10,
          marginBottom: '2rem',
          fontSize: 13,
          color: '#c4b5fd',
          lineHeight: 1.7,
        }}>
          <strong>What you get:</strong> 6 months Pro free — unlimited reviews, GitHub status checks, inline comments, email digests, .buglens.yml config.
          {' '}<Link href="/oss-program" style={{ color: 'var(--green, #22c55e)', textDecoration: 'underline' }}>Learn more →</Link>
        </div>

        <OSSForm githubUsername={githubUsername} />
      </div>
    </div>
  )
}
