function parseAllowlist(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdmin(user: { user_metadata?: { user_name?: string }; email?: string | null }) {
  const githubAllowlist = parseAllowlist(process.env.ADMIN_GITHUB_USERNAMES)
  const emailAllowlist = parseAllowlist(process.env.ADMIN_EMAILS)

  // Fail closed when nothing is configured.
  if (githubAllowlist.length === 0 && emailAllowlist.length === 0) {
    return false
  }

  const githubUsername = user.user_metadata?.user_name?.toLowerCase()
  const email = user.email?.toLowerCase()

  if (githubUsername && githubAllowlist.includes(githubUsername)) return true
  if (email && emailAllowlist.includes(email)) return true
  return false
}
