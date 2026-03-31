import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

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
          Authorization: `token ${profile.github_token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )

    if (!response.ok) {
      const err = await response.json()
      return NextResponse.json({ error: err.message || 'GitHub API error' }, { status: response.status })
    }

    const repos = await response.json()

    // Shape the data for the UI
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

    // Insert or update repo in our tracking table
    const { data, error } = await supabase
      .from('repos')
      .upsert({
        user_id: user.id,
        repo_full_name: full_name,
        repo_id: id,
        is_active: true,
        shadow_mode: true,
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

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
