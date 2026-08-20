import { createClient } from '@/utils/supabase/server'
import { NextResponse, after } from 'next/server'
import { safeDecrypt } from '@/utils/crypto'

const FREE_REPO_LIMIT = 1

function triggerInitialIndex(repoFullName: string) {
  const webhookUrl = process.env.NEXT_PUBLIC_BUGLENS_CORE_WEBHOOK_URL
  const secret = process.env.WEBHOOK_SECRET
  if (!webhookUrl || !secret) return

  after(() =>
    fetch(webhookUrl.replace('/webhook', '/internal/index-repo'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-webhook-secret': secret },
      body: JSON.stringify({ repoFullName }),
    }).catch(() => {
      // Best-effort — a failed initial-index trigger must never block repo
      // connection. The repo still gets indexed on its next default-branch
      // push, and reviews fall back to the live one-hop context lookup
      // until then either way.
    })
  )
}

async function getActiveRepoCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { count, error } = await supabase
    .from('repos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) throw new Error(error.message)
  return count ?? 0
}

async function assertFreeTierCanActivateRepo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  repoFullName: string
) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) throw new Error(profileError.message)

  const tier = (profile?.subscription_tier || 'FREE').toUpperCase()
  if (tier !== 'FREE') return

  const { data: existing } = await supabase
    .from('repos')
    .select('id, is_active')
    .eq('user_id', userId)
    .eq('repo_full_name', repoFullName)
    .maybeSingle()

  // Re-activating or updating an already-active repo does not consume a new slot.
  if (existing?.is_active) return

  const activeCount = await getActiveRepoCount(supabase, userId)
  if (activeCount >= FREE_REPO_LIMIT) {
    const err = new Error(
      'Free plan allows 1 active repository. Upgrade to connect more.'
    )
    ;(err as Error & { status: number }).status = 403
    throw err
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('github_token')
    .eq('id', user.id)
    .single()

  if (!profile?.github_token) {
    return NextResponse.json({ error: 'GitHub token not found. Please re-login.' }, { status: 400 })
  }

  try {
    const response = await fetch(
      'https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator',
      {
        headers: {
          Authorization: `token ${safeDecrypt(profile.github_token)}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )

    if (!response.ok) {
      const err = await response.json()
      return NextResponse.json({ error: err.message || 'GitHub API error' }, { status: response.status })
    }

    const repos = await response.json()

    const formatted = repos.map((repo: {
      id: number;
      name: string;
      full_name: string;
      description: string | null;
      html_url: string;
      stargazers_count: number;
      language: string | null;
      updated_at: string;
      private: boolean;
      open_issues_count: number;
      owner: { login: string };
    }) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language,
      updated_at: repo.updated_at,
      private: repo.private,
      open_issues: repo.open_issues_count,
      owner: repo.owner.login,
    }))

    return NextResponse.json(formatted)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, full_name } = await req.json()

    if (!id || !full_name) {
      return NextResponse.json({ error: 'Missing repo details' }, { status: 400 })
    }

    try {
      await assertFreeTierCanActivateRepo(supabase, user.id, full_name)
    } catch (limitError: unknown) {
      const status =
        typeof limitError === 'object' &&
        limitError &&
        'status' in limitError &&
        typeof (limitError as { status: unknown }).status === 'number'
          ? (limitError as { status: number }).status
          : 500
      const message = limitError instanceof Error ? limitError.message : 'Repo limit check failed'
      return NextResponse.json({ error: message }, { status })
    }

    const { data, error } = await supabase
      .from('repos')
      .upsert({
        user_id: user.id,
        repo_full_name: full_name,
        repo_id: id,
        is_active: true,
        shadow_mode: false,
        review_strictness: 'balanced',
        auto_post_reviews: false,
        last_review_at: null,
      }, { onConflict: 'user_id, repo_full_name' })
      .select()
      .single()

    if (error) {
      console.error('Database Error (Registering Repo):', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    triggerInitialIndex(full_name)

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
