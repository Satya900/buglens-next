import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile data from the profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fallback to metadata if profile record doesn't exist yet (unlikely with trigger)
  const displayData = profile || {
    full_name: user.user_metadata.full_name,
    role: user.user_metadata.role,
    about_me: user.user_metadata.about_me,
    email: user.email
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {displayData.full_name?.charAt(0) || user.email?.charAt(0)}
            </div>
            <div className="profile-intro">
              <h1 className="profile-name">{displayData.full_name || 'Anonymous User'}</h1>
              <p className="profile-badge">{displayData.role || 'Member'}</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <label>Email Address</label>
              <p>{user.email}</p>
            </div>

            <div className="detail-section">
              <label>About Me</label>
              <p className="about-text">
                {displayData.about_me || "No bio provided yet. Tell us about your coding journey!"}
              </p>
            </div>

            <div className="detail-section">
              <label>Account ID</label>
              <code className="text-xs text-[var(--text-dim)]">{user.id}</code>
            </div>
          </div>

          <div className="profile-footer">
            <button className="btn-primary edit-btn">Edit Profile</button>
          </div>
        </div>
      </div>
    </div>
  )
}
