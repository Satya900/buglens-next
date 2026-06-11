'use client'

import { useState, useRef, useTransition } from 'react'
import { uploadDocument, deleteDocument } from '@/app/(auth)/document-actions'

type Document = {
  id: string
  file_name: string
  file_size: number
  storage_path: string
  status: string
  created_at: string
}

type Props = {
  initialDocuments: Document[]
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function FileIcon({ ext }: { ext: string }) {
  const color = ext === 'pdf' ? '#f87171' : 'var(--text-dim)'
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

export default function DocumentsManager({ initialDocuments }: Props) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', file)

    const res = await uploadDocument(formData)

    if (res.error) {
      setUploadError(res.error)
    } else {
      window.location.reload()
    }

    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = (docId: string, storagePath: string, fileName: string) => {
    if (!confirm(`Delete "${fileName}"?`)) return
    startTransition(async () => {
      const res = await deleteDocument(docId, storagePath)
      if (res.success) {
        setDocuments(prev => prev.filter(d => d.id !== docId))
      } else {
        alert('Failed to delete: ' + res.error)
      }
    })
  }

  const totalSize = documents.reduce((acc, d) => acc + d.file_size, 0)

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.md,.txt"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Indexed Documents card */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card-title">Indexed Documents</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <button
              className="btn-primary"
              style={{ fontSize: 11, padding: '6px 12px' }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : '+ Upload'}
            </button>
            {uploadError && (
              <span style={{ fontSize: 11, color: '#f87171' }}>{uploadError}</span>
            )}
          </div>
        </div>
        <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>File</th>
                <th>Size</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: 12 }}>
                    No documents yet. Upload a PDF or Markdown file to expand the AI's knowledge.
                  </td>
                </tr>
              ) : (
                documents.map(d => {
                  const ext = d.file_name.split('.').pop()?.toLowerCase() ?? ''
                  return (
                    <tr key={d.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FileIcon ext={ext} />
                          <span style={{ fontSize: 13 }}>{d.file_name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-dim)' }}>
                          {formatSize(d.file_size)}
                        </span>
                      </td>
                      <td>
                        <span className="badge-green">{d.status}</span>
                      </td>
                      <td>
                        <button
                          className="btn-icon"
                          title="Delete"
                          disabled={isPending}
                          onClick={() => handleDelete(d.id, d.storage_path, d.file_name)}
                          style={{ color: '#f87171', opacity: 0.7 }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {documents.length > 0 && (
          <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
            {documents.length} file{documents.length !== 1 ? 's' : ''} · {formatSize(totalSize)} total
          </div>
        )}
      </div>
    </>
  )
}
