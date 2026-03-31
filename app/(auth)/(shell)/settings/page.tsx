import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-title">Personal</p>
          <h1 className="page-heading">Settings</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800 }}>
        <div className="card-header">
          <span className="card-title">Profile Information</span>
        </div>
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={{ display: 'grid', gap: '8px' }}>
              <label style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>EMAIL ADDRESS</label>
              <input 
                type="text" 
                value={user.email} 
                disabled 
                style={{ 
                  background: 'var(--surface2)', 
                  border: '1px solid var(--border)', 
                  padding: '10px 14px', 
                  borderRadius: 6, 
                  color: 'var(--text-muted)',
                  fontSize: 14,
                  fontFamily: 'var(--mono)'
                }} 
              />
            </div>
            
            <div style={{ display: 'grid', gap: '8px' }}>
              <label style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>GITHUB IDENTIFIER</label>
              <input 
                type="text" 
                value={user.user_metadata?.user_name || 'Not connected'} 
                disabled 
                style={{ 
                  background: 'var(--surface2)', 
                  border: '1px solid var(--border)', 
                  padding: '10px 14px', 
                  borderRadius: 6, 
                  color: 'var(--text-muted)',
                  fontSize: 14,
                  fontFamily: 'var(--mono)'
                }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn-primary" style={{ padding: '8px 20px' }}>Update Profile</button>
              <button className="btn-ghost" style={{ padding: '8px 20px' }}>Change Password</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800, marginTop: '2rem', borderColor: 'rgba(248, 113, 113, 0.2)' }}>
        <div className="card-header">
          <span className="card-title" style={{ color: '#f87171' }}>Danger Zone</span>
        </div>
        <div style={{ padding: '2rem' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Deleting your account is permanent and cannot be undone. All your data, including saved repositories and scan history, will be removed.
          </p>
          <button className="btn-ghost" style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.2)' }}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
