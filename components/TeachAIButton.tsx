'use client'

import { useState } from 'react'
import { addLesson } from '@/app/(auth)/lessons-actions'

type Props = {
  repoFullName: string
  prTitle: string | null
}

export default function TeachAIButton({ repoFullName, prTitle }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return
    setIsSubmitting(true)
    const res = await addLesson(repoFullName, content)
    if (res.success) {
      setIsOpen(false)
      setContent('')
      alert('Lesson learned! BugLens will apply this rule to future reviews for this repository.')
    } else {
      alert('Failed to save lesson: ' + res.error)
    }
    setIsSubmitting(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-dim)',
          fontSize: 10,
          fontFamily: 'var(--mono)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: 0,
          opacity: 0.6,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
          <path d="M12 16V12" /><path d="M12 8H12.01" />
        </svg>
        TEACH AI
      </button>
    )
  }

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: '100%',
      zIndex: 50,
      width: 280,
      background: 'var(--surface)',
      border: '1px solid var(--border-bright)',
      borderRadius: 8,
      padding: 12,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
      marginTop: 8,
    }}>
      <h4 style={{ fontSize: 11, color: 'var(--text)', marginBottom: 8, fontFamily: 'var(--mono)' }}>
        NEW RULE FOR {repoFullName.split('/')[1].toUpperCase()}
      </h4>
      <textarea
        autoFocus
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`e.g., In PR "${prTitle}", the AI missed that...`}
        style={{
          width: '100%',
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: 8,
          fontSize: 12,
          color: 'var(--text)',
          fontFamily: 'var(--mono)',
          minHeight: 60,
          marginBottom: 8,
          outline: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 11, cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          className="btn-primary"
          style={{ padding: '4px 10px', fontSize: 11 }}
        >
          {isSubmitting ? '...' : 'Save Rule'}
        </button>
      </div>
    </div>
  )
}
