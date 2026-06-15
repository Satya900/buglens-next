import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ReviewsClient from './ReviewsClient'

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

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, pr_title, pr_number, repo_full_name, merge_decision, findings_count, created_at, pr_url, pr_author')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-title">History</p>
          <h1 className="page-heading">AI Reviews</h1>
        </div>
      </div>
      <ReviewsClient reviews={(reviews as Review[]) || []} />
    </div>
  )
}
