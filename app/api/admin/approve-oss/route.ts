import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendOSSWelcomeEmail } from '@/lib/email'

// Protect with a secret header — set ADMIN_SECRET in .env
const ADMIN_SECRET = process.env.ADMIN_SECRET

export async function POST(req: NextRequest) {
  // Auth check
  const secret = req.headers.get('x-admin-secret')
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { applicationId, action, rejectionReason } = body

  if (!applicationId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'applicationId and action (approve|reject) required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Fetch application
  const { data: app, error: fetchErr } = await supabase
    .from('oss_applications')
    .select('id, user_id, email, github_username, repo_name, status')
    .eq('id', applicationId)
    .single()

  if (fetchErr || !app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  if (app.status !== 'pending') {
    return NextResponse.json({ error: `Application already ${app.status}` }, { status: 409 })
  }

  if (action === 'approve') {
    // 1. Mark application approved
    const { error: appErr } = await supabase
      .from('oss_applications')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', applicationId)

    if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 })

    // 2. Upgrade profile to Pro with unlimited reviews
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'PRO',
        usage_limit: null,  // null = unlimited
      })
      .eq('id', app.user_id)

    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 })

    // 3. Send welcome email
    await sendOSSWelcomeEmail({
      toEmail: app.email,
      name: app.github_username,
      repoName: app.repo_name,
    })

    return NextResponse.json({ success: true, action: 'approved', userId: app.user_id })
  }

  if (action === 'reject') {
    const { error: rejectErr } = await supabase
      .from('oss_applications')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: rejectionReason || null,
      })
      .eq('id', applicationId)

    if (rejectErr) return NextResponse.json({ error: rejectErr.message }, { status: 500 })

    return NextResponse.json({ success: true, action: 'rejected' })
  }
}
