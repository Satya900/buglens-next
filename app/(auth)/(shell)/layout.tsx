import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import './shell.css'

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user ? await supabase
    .from('profiles')
    .select('full_name, github_token, subscription_tier')
    .eq('id', user.id)
    .single() : { data: null }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
  const planTier = profile?.subscription_tier || 'FREE'

  return (
    <div className="auth-layout-wrapper">
      <Sidebar userEmail={displayName} userPlan={planTier} />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
