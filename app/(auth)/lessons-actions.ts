'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addLesson(repoFullName: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('lessons_learned')
    .insert({
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
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching lessons:', error.message)
    return { error: error.message, data: [] }
  }

  return { success: true, data }
}
