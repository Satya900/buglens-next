'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const full_name = (formData.get('full_name') as string)?.trim()
  const about_me = (formData.get('about_me') as string)?.trim()
  const email_notifications = formData.get('email_notifications') === 'on'

  if (!full_name) return { error: 'Display name is required' }
  if (full_name.length > 80) return { error: 'Display name must be under 80 characters' }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name,
      about_me: about_me || null,
      email_notifications,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/profile')
  return { success: true }
}
