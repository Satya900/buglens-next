import { NextResponse } from 'next/server'
// The client you created from the utils/supabase/server.ts file
import { createClient } from '@/utils/supabase/server'

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
      
      console.log('Auth successful for user:', user.email)
      
      // Update or create profile with the github_token
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          github_token: providerToken,
          email: user.email,
          updated_at: new Date().toISOString()
        })
        .select('onboarding_completed')
        .single()

      if (profileError) {
        console.log('Profile integration error:', profileError.message)
      }

      let redirectUrl = next || '/dashboard'
      
      // Check onboarding status
      if (!profile || profile.onboarding_completed === false) {
        console.log('User needs onboarding. Redirecting to /onboarding')
        redirectUrl = '/onboarding'
      } else {
        console.log('Returning user. Redirecting to /dashboard')
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
