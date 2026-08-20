import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { encrypt } from '@/utils/crypto'

function safeInternalPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) {
    return '/dashboard'
  }
  return next
}

function allowedRedirectOrigin(request: Request, requestOrigin: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '')
  if (siteUrl) return siteUrl

  const isLocal =
    process.env.NODE_ENV === 'development' || requestOrigin.includes('localhost')
  if (isLocal) return requestOrigin

  return requestOrigin
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (!sessionError && data?.session) {
      const user = data.session.user
      const providerToken = data.session.provider_token
      const metadata = user.user_metadata

      console.log('Auth successful for user:', user.email, 'Github:', metadata.user_name)

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          github_token: providerToken ? encrypt(providerToken) : null,
          github_username: metadata.user_name,
          full_name: metadata.full_name || metadata.user_name,
          email: user.email,
          avatar_url: metadata.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .select('onboarding_completed')
        .single()

      if (profileError) {
        console.log('Profile integration error:', profileError.message)
      }

      let redirectPath = safeInternalPath(next)

      if (!profile || profile.onboarding_completed === false) {
        console.log('User needs onboarding. Redirecting to /onboarding')
        redirectPath = '/onboarding'
      } else {
        console.log('Returning user. Redirecting to', redirectPath)
      }

      const base = allowedRedirectOrigin(request, origin)
      return NextResponse.redirect(`${base}${redirectPath}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not verify session`)
}
