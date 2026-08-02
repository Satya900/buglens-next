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
    const { repo_full_name, shadow_mode, review_strictness, auto_post_reviews, is_active } = await req.json()

    if (!repo_full_name) {
      return NextResponse.json({ error: 'Missing repo_full_name' }, { status: 400 })
    }

    const payload: Record<string, unknown> = {}
    if (typeof shadow_mode === 'boolean') payload.shadow_mode = shadow_mode
    if (typeof auto_post_reviews === 'boolean') payload.auto_post_reviews = auto_post_reviews
    if (typeof review_strictness === 'string') payload.review_strictness = review_strictness
    if (typeof is_active === 'boolean') payload.is_active = is_active

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

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { repo_full_name } = await req.json()

    if (!repo_full_name) {
      return NextResponse.json({ error: 'Missing repo_full_name' }, { status: 400 })
    }

    // Delete review history first (cascades to findings via the reviews FK).
    // The repos table has no FK relationship to reviews, so this has to be explicit
    // to actually honor what the "Remove repo" confirmation dialog promises.
    const { error: reviewsError } = await supabase
      .from('reviews')
      .delete()
      .eq('user_id', user.id)
      .eq('repo_full_name', repo_full_name)

    if (reviewsError) {
      return NextResponse.json({ error: reviewsError.message }, { status: 500 })
    }

    // Same reasoning for the persisted repo-index tables: no FK cascade
    // exists there either, so without this a removed repo's cached source
    // code (repo_index_files.head_snippet) stays around indefinitely —
    // a real privacy issue since it's a fresh copy of the customer's code.
    // Best-effort: log but don't block repo removal on these, since the
    // repos-table delete below is the primary contract this endpoint owes.
    const { error: indexFilesError } = await supabase
      .from('repo_index_files')
      .delete()
      .eq('user_id', user.id)
      .eq('repo_full_name', repo_full_name)
    if (indexFilesError) console.error('Failed to purge repo_index_files:', indexFilesError.message)

    const { error: indexMetaError } = await supabase
      .from('repo_index_meta')
      .delete()
      .eq('user_id', user.id)
      .eq('repo_full_name', repo_full_name)
    if (indexMetaError) console.error('Failed to purge repo_index_meta:', indexMetaError.message)

    const { error } = await supabase
      .from('repos')
      .delete()
      .eq('user_id', user.id)
      .eq('repo_full_name', repo_full_name)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
