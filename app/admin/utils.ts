const ADMIN_GITHUB = 'Satya900'

export function isAdmin(user: { user_metadata?: { user_name?: string }; email?: string | null }) {
  return (
    user.user_metadata?.user_name === ADMIN_GITHUB ||
    user.email === 'satyatechgeek@gmail.com'
  )
}
