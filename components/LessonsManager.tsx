'use client'

import { useState } from 'react'
import { addLesson, deleteLesson } from '@/app/(auth)/lessons-actions'

type Lesson = {
  id: string
  repo_full_name: string
  content: string
  created_at: string
}

type Props = {
  initialLessons: Lesson[]
  repos: { full_name: string }[]
}

export default function LessonsManager({ initialLessons, repos }: Props) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons)
  const [newContent, setNewContent] = useState('')
  const [selectedRepo, setSelectedRepo] = useState(repos[0]?.full_name || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContent.trim() || !selectedRepo) return

    setIsSubmitting(true)
    const res = await addLesson(selectedRepo, newContent)
    if (res.success) {
      // Refresh local state (simplistic)
      window.location.reload()
    } else {
      alert('Failed to add lesson: ' + res.error)
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this lesson?')) return

    const res = await deleteLesson(id)
    if (res.success) {
      setLessons(lessons.filter((l) => l.id !== id))
    } else {
      alert('Failed to delete lesson: ' + res.error)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Add Lesson Form */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Teach New Lesson</span>
        </div>
        <div className="card-body">
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  color: 'var(--text)',
                  fontSize: 12,
                  outline: 'none',
                }}
              >
                {repos.map((r) => (
                  <option key={r.full_name} value={r.full_name}>
                    {r.full_name}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="e.g., Always complain if React hooks are used inside a loop..."
              style={{
                width: '100%',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '10px 12px',
                color: 'var(--text)',
                fontFamily: 'var(--mono)',
                fontSize: 12,
                minHeight: 80,
                outline: 'none',
                resize: 'vertical',
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ alignSelf: 'flex-end', padding: '10px 20px', fontSize: 12 }}
            >
              {isSubmitting ? 'Teaching...' : 'Save Lesson →'}
            </button>
          </form>
        </div>
      </div>

      {/* Active Lessons List */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span className="card-title">AI Lessons Learned</span>
            <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
              {lessons.length} ACTIVE RULES
            </span>
          </div>
        </div>
        <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Repository</th>
                <th>Rule / Lesson</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {lessons.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: 12 }}>
                    No lessons recorded yet. Start by teaching the AI below!
                  </td>
                </tr>
              ) : (
                lessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td style={{ verticalAlign: 'top' }}>
                      <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>
                        {lesson.repo_full_name}
                      </span>
                    </td>
                    <td>
                      <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text)' }}>
                        {lesson.content}
                      </p>
                    </td>
                    <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        className="btn-icon"
                        style={{ color: '#f87171', opacity: 0.7 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
