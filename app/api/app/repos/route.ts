import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: repos, error } = await supabase
    .from('repos')
    .select('repo_full_name, is_active, shadow_mode, review_strictness, auto_post_reviews')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(repos)
}

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { repo_full_name, shadow_mode, review_strictness, auto_post_reviews } = await req.json()

    if (!repo_full_name) {
      return NextResponse.json({ error: 'Missing repo_full_name' }, { status: 400 })
    }

    const payload: Record<string, unknown> = {}
    if (typeof shadow_mode === 'boolean') payload.shadow_mode = shadow_mode
    if (typeof auto_post_reviews === 'boolean') payload.auto_post_reviews = auto_post_reviews
    if (typeof review_strictness === 'string') payload.review_strictness = review_strictness

    const { data, error } = await supabase
      .from('repos')
      .update(payload)
      .eq('user_id', user.id)
      .eq('repo_full_name', repo_full_name)
      .select('repo_full_name, is_active, shadow_mode, review_strictness, auto_post_reviews')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
