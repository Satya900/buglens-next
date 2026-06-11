'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

const BUCKET = 'knowledge-docs'
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_EXTS = ['.pdf', '.md', '.txt']

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('file') as File
  if (!file || file.size === 0) return { error: 'No file provided' }

  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
  if (!ALLOWED_EXTS.includes(ext)) {
    return { error: 'Only PDF, MD, and TXT files are supported' }
  }

  if (file.size > MAX_SIZE) {
    return { error: 'File must be under 10MB' }
  }

  const storagePath = `${user.id}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) return { error: uploadError.message }

  const { error: dbError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      file_name: file.name,
      file_size: file.size,
      storage_path: storagePath,
      status: 'active',
    })

  if (dbError) {
    await supabase.storage.from(BUCKET).remove([storagePath])
    return { error: dbError.message }
  }

  revalidatePath('/knowledge')
  return { success: true }
}

export async function deleteDocument(docId: string, storagePath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  await supabase.storage.from(BUCKET).remove([storagePath])

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', docId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/knowledge')
  return { success: true }
}

export async function getDocuments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', data: [] }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message, data: [] }
  return { success: true, data: data ?? [] }
}
