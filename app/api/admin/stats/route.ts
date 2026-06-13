import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_SECRET = process.env.ADMIN_SECRET

// Service role client — bypasses RLS, admin only
function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret')
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = adminSupabase()

  const [
    usersRes,
    reviewsRes,
    reposRes,
    ossRes,
    findingsRes,
    recentReviewsRes,
    recentUsersRes,
  ] = await Promise.all([
    sb.from('profiles').select('id, github_username, subscription_tier, usage_limit, current_usage, created_at', { count: 'exact' }).order('created_at', { ascending: false }),
    sb.from('reviews').select('id, repo_full_name, pr_title, merge_decision, findings_count, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(20),
    sb.from('repos').select('id, user_id, repo_full_name, is_active, total_reviews, created_at', { count: 'exact' }),
    sb.from('oss_applications').select('id, github_username, email, repo_name, repo_url, stars, license, status, use_case, role_in_project, created_at, approved_at, rejected_at, rejection_reason').order('created_at', { ascending: false }),
    sb.from('findings').select('severity', { count: 'exact' }),
    sb.from('reviews').select('id, repo_full_name, pr_title, merge_decision, findings_count, created_at').order('created_at', { ascending: false }).limit(10),
    sb.from('profiles').select('id, github_username, subscription_tier, created_at').order('created_at', { ascending: false }).limit(10),
  ])

  // Compute derived stats
  const users = usersRes.data || []
  const reviews = reviewsRes.data || []
  const repos = reposRes.data || []
  const ossApps = ossRes.data || []
  const findings = findingsRes.data || []

  const proUsers = users.filter(u => u.subscription_tier === 'PRO').length
  const activeRepos = repos.filter(r => r.is_active).length
  const totalFindings = findingsRes.count || 0
  const highFindings = findings.filter(f => f.severity === 'HIGH').length

  const approvedOSS = ossApps.filter(a => a.status === 'approved').length
  const pendingOSS = ossApps.filter(a => a.status === 'pending').length

  // Reviews per day (last 7 days)
  const now = new Date()
  const reviewsByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    const label = d.toLocaleDateString('en', { weekday: 'short' })
    const dayReviews = reviews.filter(r => {
      const rd = new Date(r.created_at)
      return rd.toDateString() === d.toDateString()
    }).length
    return { label, count: dayReviews }
  })

  return NextResponse.json({
    stats: {
      totalUsers: usersRes.count || users.length,
      proUsers,
      freeUsers: (usersRes.count || users.length) - proUsers,
      totalReviews: reviewsRes.count || reviews.length,
      totalRepos: reposRes.count || repos.length,
      activeRepos,
      totalFindings,
      pendingOSS,
      approvedOSS,
      reviewsByDay,
    },
    users: usersRes.data || [],
    ossApplications: ossApps,
    recentReviews: recentReviewsRes.data || [],
    recentUsers: recentUsersRes.data || [],
  })
}
