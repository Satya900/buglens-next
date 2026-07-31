'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addLesson(repoFullName: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Reject lessons for repos the caller doesn't own — the client-side repo
  // dropdown is already scoped, but this action can be invoked directly.
  const { data: repo } = await supabase
    .from('repos')
    .select('id')
    .eq('user_id', user.id)
    .eq('repo_full_name', repoFullName)
    .maybeSingle()

  if (!repo) {
    return { error: 'Repository not found or not connected to your account' }
  }

  const { error } = await supabase
    .from('lessons_learned')
    .insert({
      user_id: user.id,
      repo_full_name: repoFullName,
      content,
    })

  if (error) {
    console.error('Error adding lesson:', error.message)
    return { error: error.message }
  }

  revalidatePath('/knowledge')
  revalidatePath('/reviews')
  return { success: true }
}

export async function deleteLesson(lessonId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('lessons_learned')
    .delete()
    .eq('id', lessonId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting lesson:', error.message)
    return { error: error.message }
  }

  revalidatePath('/knowledge')
  return { success: true }
}

export async function getLessons() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('lessons_learned')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching lessons:', error.message)
    return { error: error.message, data: [] }
  }

  return { success: true, data }
}
