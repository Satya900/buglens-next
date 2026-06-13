import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from './AdminDashboard'

// Check by GitHub username — more reliable than email with OAuth
const ADMIN_GITHUB = 'Satya900'

export function isAdmin(user: { user_metadata?: { user_name?: string }; email?: string | null }) {
  return (
    user.user_metadata?.user_name === ADMIN_GITHUB ||
    user.email === 'satyatechgeek@gmail.com'
  )
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user)) redirect('/dashboard')

  // Don't pass ADMIN_SECRET to client — server actions handle auth
  return <AdminDashboard />
}
