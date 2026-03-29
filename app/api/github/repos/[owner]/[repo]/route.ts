import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { owner: string; repo: string } }
) {
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

  const { owner, repo } = await params

  try {
    // Fetch open PRs for the repo
    const [prsRes, repoRes] = await Promise.all([
      fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=50`,
        {
          headers: {
            Authorization: `token ${profile.github_token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      ),
      fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization: `token ${profile.github_token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      )
    ])

    if (!prsRes.ok || !repoRes.ok) {
      return NextResponse.json({ error: 'GitHub API error fetching repo details' }, { status: 400 })
    }

    const [prs, repoData] = await Promise.all([prsRes.json(), repoRes.json()])

    return NextResponse.json({
      open_prs: prs.length,
      default_branch: repoData.default_branch,
      language: repoData.language,
      stars: repoData.stargazers_count,
      open_issues: repoData.open_issues_count,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
