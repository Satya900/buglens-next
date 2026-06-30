import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { encrypt } from '@/utils/crypto'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirect URL
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!sessionError && data?.session) {
      const user = data.session.user
      const providerToken = data.session.provider_token
      const metadata = user.user_metadata
      
      console.log('Auth successful for user:', user.email, 'Github:', metadata.user_name)
      
      // Update or create profile with the github_token and username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          github_token: providerToken ? encrypt(providerToken) : null,
          github_username: metadata.user_name, // 🚀 Critical for multi-tenant linking
          full_name: metadata.full_name || metadata.user_name,
          email: user.email,
          avatar_url: metadata.avatar_url,
          updated_at: new Date().toISOString()
        })
        .select('onboarding_completed')
        .single()

      if (profileError) {
        console.log('Profile integration error:', profileError.message)
      }

      let redirectUrl = next || '/dashboard'

      // Onboarding takes priority over any returnUrl
      if (!profile || profile.onboarding_completed === false) {
        console.log('User needs onboarding. Redirecting to /onboarding')
        redirectUrl = '/onboarding'
      } else {
        console.log('Returning user. Redirecting to', redirectUrl)
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development' || origin.includes('localhost')
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectUrl}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not verify session`)
}
