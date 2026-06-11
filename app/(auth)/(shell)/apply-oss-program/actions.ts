'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitOSSApplication(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check if user already has a pending/approved application
  const { data: existing } = await supabase
    .from('oss_applications')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['pending', 'approved'])
    .maybeSingle()

  if (existing) {
    if (existing.status === 'approved') return { error: 'Your project is already approved for the OSS program.' }
    return { error: 'You already have a pending application. We\'ll review it within 48 hours.' }
  }

  const repoUrl = (formData.get('repo_url') as string)?.trim()
  const license = formData.get('license') as string
  const roleInProject = formData.get('role_in_project') as string
  const useCase = (formData.get('use_case') as string)?.trim()
  const isPrimary = formData.get('is_primary_project') === 'on'

  const confirmPublic = formData.get('confirm_public') === 'on'
  const confirmLicense = formData.get('confirm_license') === 'on'
  const confirmNotCourse = formData.get('confirm_not_course') === 'on'
  const confirmActive = formData.get('confirm_active') === 'on'

  // Validation
  if (!repoUrl) return { error: 'Repository URL is required' }
  if (!repoUrl.startsWith('https://github.com/')) return { error: 'Must be a valid GitHub repository URL' }
  if (!license) return { error: 'Please select a license' }
  if (!roleInProject) return { error: 'Please select your role' }
  if (!useCase || useCase.length < 20) return { error: 'Please describe how you\'ll use BugLens (at least 20 characters)' }
  if (!confirmPublic || !confirmLicense || !confirmNotCourse || !confirmActive) {
    return { error: 'Please confirm all eligibility criteria' }
  }

  // Fetch repo info from GitHub API to verify it's real + get metadata
  const repoParts = repoUrl.replace('https://github.com/', '').split('/')
  if (repoParts.length < 2) return { error: 'Invalid GitHub repository URL' }
  const [repoOwner, repoName] = repoParts

  let stars = 0
  let repoDescription = ''
  try {
    const res = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'BugLens' },
    })
    if (!res.ok) return { error: 'Could not find this repository on GitHub. Make sure it\'s public.' }
    const data = await res.json()
    if (data.private) return { error: 'Repository must be public to qualify.' }
    stars = data.stargazers_count || 0
    repoDescription = data.description || ''
  } catch {
    return { error: 'Could not verify repository. Please check the URL and try again.' }
  }

  const { error } = await supabase.from('oss_applications').insert({
    user_id: user.id,
    github_username: user.user_metadata?.user_name || '',
    email: user.email || '',
    repo_url: repoUrl,
    repo_name: `${repoOwner}/${repoName}`,
    repo_description: repoDescription,
    license,
    stars,
    is_primary_project: isPrimary,
    role_in_project: roleInProject,
    use_case: useCase,
    confirm_public: confirmPublic,
    confirm_license: confirmLicense,
    confirm_not_course: confirmNotCourse,
    confirm_active: confirmActive,
    status: 'pending',
  })

  if (error) return { error: error.message }

  revalidatePath('/apply-oss-program')
  return { success: true }
}
