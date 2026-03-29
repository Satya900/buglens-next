'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signInWithGitHub() {
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      scopes: 'repo read:user user:email'
    },
  })

  if (error) {
    console.error('Error signing in with GitHub:', error.message)
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data?.url) {
    redirect(data.url)
  }

  return redirect('/login?error=Failed to start GitHub login')
}

export async function completeOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('No user found when completing onboarding')
    return { error: 'Not authenticated' }
  }

  // Upsert the profile with onboarding_completed: true
  const { error } = await supabase
    .from('profiles')
    .upsert({ 
      id: user.id, 
      onboarding_completed: true,
      email: user.email,
      full_name: user.user_metadata.full_name || user.user_metadata.name,
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error updating onboarding status:', error.message)
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
