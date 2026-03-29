import { createClient } from '@/utils/supabase/server'
import { resendVerificationEmail } from '@/app/(auth)/actions'

export default async function VerifyAnnouncement() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email_confirmed_at) return null

  return (
    <div className="verify-bar">
      <div className="verify-content">
        <span className="verify-icon">✉️</span>
        <p>Your email is not verified yet. Some features might be restricted.</p>
        <form action={resendVerificationEmail}>
          <input type="hidden" name="email" value={user.email} />
          <button type="submit" className="verify-resend-btn">
            Click here to resend verification email
          </button>
        </form>
      </div>
    </div>
  )
}
