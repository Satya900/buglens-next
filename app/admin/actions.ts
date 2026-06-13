'use server'

import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { sendOSSWelcomeEmail } from '@/lib/email'
import { isAdmin } from './page'

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function requireAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user)) throw new Error('Unauthorized')
}

export async function getAdminStats() {
  await requireAdmin()
  const sb = adminSupabase()

  const [
    usersRes, reviewsRes, reposRes, ossRes,
    findingsCatRes, findingsSevRes, allReviewsRes,
  ] = await Promise.all([
    sb.from('profiles')
      .select('id, github_username, subscription_tier, usage_limit, current_usage, created_at')
      .order('created_at', { ascending: false }),

    sb.from('reviews')
      .select('id, repo_full_name, pr_title, pr_url, merge_decision, findings_count, created_at')
      .order('created_at', { ascending: false })
      .limit(200),

    sb.from('repos')
      .select('id, user_id, repo_full_name, is_active, total_reviews, created_at'),

    sb.from('oss_applications')
      .select('id, github_username, email, repo_name, repo_url, stars, license, status, use_case, role_in_project, created_at, approved_at, rejected_at, rejection_reason')
      .order('created_at', { ascending: false }),

    sb.from('findings').select('category'),
    sb.from('findings').select('severity'),

    sb.from('reviews')
      .select('id, repo_full_name, pr_title, pr_url, merge_decision, findings_count, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const users = usersRes.data || []
  const reviews = reviewsRes.data || []
  const repos = reposRes.data || []
  const ossApps = ossRes.data || []
  const findings = findingsCatRes.data || []
  const findingsSev = findingsSevRes.data || []

  // 7-day chart
  const now = new Date()
  const reviewsByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    return {
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      count: reviews.filter(r => new Date(r.created_at).toDateString() === d.toDateString()).length,
    }
  })

  // 30-day trend
  const reviewsByDay30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (29 - i))
    return {
      label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      count: reviews.filter(r => new Date(r.created_at).toDateString() === d.toDateString()).length,
    }
  })

  // Bug categories
  const catCount: Record<string, number> = {}
  for (const f of findings) {
    const c = f.category || 'general'
    catCount[c] = (catCount[c] || 0) + 1
  }
  const topCategories = Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }))

  // Severity split
  const sevCount = { HIGH: 0, MEDIUM: 0, LOW: 0 }
  for (const f of findingsSev) {
    const s = f.severity as keyof typeof sevCount
    if (s in sevCount) sevCount[s]++
  }

  // Top repos
  const repoCount: Record<string, number> = {}
  for (const r of reviews) {
    repoCount[r.repo_full_name] = (repoCount[r.repo_full_name] || 0) + 1
  }
  const topRepos = Object.entries(repoCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }))

  // Signups per week (last 8 weeks)
  const signupsByWeek = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - (7 * (7 - i)) - weekStart.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    return {
      label: weekStart.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      count: users.filter(u => {
        const d = new Date(u.created_at)
        return d >= weekStart && d < weekEnd
      }).length,
    }
  })

  // System health
  const today = new Date().toDateString()
  const reviewsToday = reviews.filter(r => new Date(r.created_at).toDateString() === today).length
  const totalFindings = findings.length
  const avgFindingsPerReview = reviews.length > 0
    ? Math.round((reviews.reduce((s, r) => s + (r.findings_count || 0), 0) / reviews.length) * 10) / 10
    : 0

  return {
    stats: {
      totalUsers: users.length,
      proUsers: users.filter(u => u.subscription_tier === 'PRO').length,
      freeUsers: users.filter(u => u.subscription_tier !== 'PRO').length,
      totalReviews: reviews.length,
      totalRepos: repos.length,
      activeRepos: repos.filter(r => r.is_active).length,
      totalFindings,
      pendingOSS: ossApps.filter(a => a.status === 'pending').length,
      approvedOSS: ossApps.filter(a => a.status === 'approved').length,
      reviewsByDay,
      reviewsToday,
      avgFindingsPerReview,
    },
    analytics: {
      reviewsByDay30,
      topCategories,
      severitySplit: sevCount,
      topRepos,
      signupsByWeek,
      conversionRate: users.length > 0
        ? Math.round((users.filter(u => u.subscription_tier === 'PRO').length / users.length) * 100)
        : 0,
    },
    users,
    ossApplications: ossApps,
    recentReviews: allReviewsRes.data || [],
  }
}

export async function setUserTier(userId: string, tier: 'PRO' | 'FREE') {
  await requireAdmin()
  const sb = adminSupabase()
  const { error } = await sb.from('profiles').update({
    subscription_tier: tier,
    usage_limit: tier === 'PRO' ? null : 10,
  }).eq('id', userId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function approveOSSApplication(applicationId: string) {
  await requireAdmin()
  const sb = adminSupabase()

  const { data: app } = await sb.from('oss_applications')
    .select('id, user_id, email, github_username, repo_name, status')
    .eq('id', applicationId).single()

  if (!app) return { error: 'Not found' }
  if (app.status !== 'pending') return { error: `Already ${app.status}` }

  const [appUpdate, profileUpdate] = await Promise.all([
    sb.from('oss_applications').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', applicationId),
    sb.from('profiles').update({ subscription_tier: 'PRO', usage_limit: null }).eq('id', app.user_id),
  ])

  if (appUpdate.error) return { error: appUpdate.error.message }
  if (profileUpdate.error) return { error: profileUpdate.error.message }

  await sendOSSWelcomeEmail({ toEmail: app.email, name: app.github_username, repoName: app.repo_name })
  return { success: true }
}

export async function rejectOSSApplication(applicationId: string, reason?: string) {
  await requireAdmin()
  const sb = adminSupabase()
  const { error } = await sb.from('oss_applications').update({
    status: 'rejected',
    rejected_at: new Date().toISOString(),
    rejection_reason: reason || null,
  }).eq('id', applicationId)
  if (error) return { error: error.message }
  return { success: true }
}
