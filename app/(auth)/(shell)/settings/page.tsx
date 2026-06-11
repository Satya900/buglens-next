import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, about_me, email_notifications')
    .eq('id', user.id)
    .single()

  const githubLogin = user.user_metadata?.user_name || ''

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-title">Personal</p>
          <h1 className="page-heading">Settings</h1>
        </div>
      </div>

      <SettingsForm
        email={user.email ?? ''}
        githubLogin={githubLogin}
        profile={profile ?? {}}
      />

      {/* Danger Zone */}
      <div className="card" style={{ maxWidth: 720, marginTop: '2rem', borderColor: 'rgba(248,113,113,0.2)' }}>
        <div className="card-header">
          <span className="card-title" style={{ color: '#f87171' }}>Danger Zone</span>
        </div>
        <div style={{ padding: '2rem' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Deleting your account is permanent and cannot be undone. All data — repos, reviews, and billing — will be removed.
          </p>
          <button
            className="btn-ghost"
            style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
            onClick={undefined}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
