import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TeachAIButton from '@/components/TeachAIButton'

type ReviewRow = {
  id: string
  pr_title: string | null
  repo_full_name: string
  pr_number: number | null
  pr_url: string | null
  merge_decision: string | null
  findings_count: number | null
  risk_summary: string | null
  created_at: string
}

type ShadowReviewRow = {
  id: string
  pr_title: string | null
  repo_full_name: string
  pr_number: number | null
  pr_url: string | null
  merge_decision: string | null
  findings_count: number | null
  risk_summary: string | null
  created_at: string
  findings_json: Array<{ confidence?: number; source?: string; category?: string }> | null
}

type TimelineReview = {
  id: string
  kind: 'posted' | 'shadow'
  pr_title: string | null
  repo_full_name: string
  pr_number: number | null
  pr_url: string | null
  merge_decision: string | null
  findings_count: number
  risk_summary: string | null
  created_at: string
  avgConfidence: number | null
  sources: string[]
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}

function averageConfidence(findings: ShadowReviewRow['findings_json']) {
  if (!findings?.length) return null
  const scored = findings.filter((item) => typeof item.confidence === 'number')
  if (!scored.length) return null
  return scored.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / scored.length
}

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('id, pr_title, repo_full_name, pr_number, pr_url, merge_decision, findings_count, risk_summary, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const timeline = (reviews || []) as ReviewRow[]

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-title">BugLens</p>
          <h1 className="page-heading">Review History</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge-dim">{timeline.length} total reviews</span>
        </div>
      </div>

      {!timeline.length && !reviewsError && (
        <div className="alert-banner warn" style={{ marginBottom: '1.5rem' }}>
          <span>i</span>
          <span>No reviews found yet. Open a PR on an active repository to start seeing BugLens in action.</span>
        </div>
      )}

      {reviewsError && (
        <div className="alert-banner red" style={{ marginBottom: '1.5rem' }}>
          <span>x</span>
          <span>Error loading review history: {reviewsError?.message}</span>
        </div>
      )}

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Pull Request</th>
              <th>Status</th>
              <th>Findings</th>
              <th>Risk Summary</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {timeline.map((review) => {
              const statusCls = review.merge_decision === 'APPROVE'
                ? 'badge-green'
                : review.merge_decision === 'REQUEST_CHANGES'
                  ? 'badge-red'
                  : 'badge-dim'

              return (
                <tr key={review.id} style={{ position: 'relative' }}>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{review.pr_title || 'Untitled PR'}</div>
                    <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>
                      {review.repo_full_name} #{review.pr_number || '—'}
                    </div>
                  </td>
                  <td><span className={statusCls}>{review.merge_decision || 'PENDING'}</span></td>
                  <td>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12 }} className={(review.findings_count || 0) > 0 ? 'text-red' : 'text-dim'}>
                      {review.findings_count || 0} findings
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, color: 'var(--text-dim)', maxWidth: '280px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {review.risk_summary || 'No risk summary available'}
                    </span>
                  </td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>{timeAgo(review.created_at)}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <Link href={review.pr_url || '#'} target="_blank" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)', textDecoration: 'none' }}>
                        GitHub ↗
                      </Link>
                      <TeachAIButton repoFullName={review.repo_full_name} prTitle={review.pr_title} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
