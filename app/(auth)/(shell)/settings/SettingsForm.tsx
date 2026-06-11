'use client'

import { useRef, useState, useTransition } from 'react'
import { updateProfile } from './actions'

type Profile = {
  full_name?: string | null
  about_me?: string | null
  email_notifications?: boolean | null
}

export default function SettingsForm({
  email,
  githubLogin,
  profile,
}: {
  email: string
  githubLogin: string
  profile: Profile
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfile(fd)
      if (result?.error) {
        setStatus({ type: 'error', msg: result.error })
      } else {
        setStatus({ type: 'success', msg: 'Profile updated successfully.' })
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="card" style={{ maxWidth: 720 }}>
        <div className="card-header">
          <span className="card-title">Profile Information</span>
        </div>
        <div style={{ padding: '2rem', display: 'grid', gap: '1.5rem' }}>

          {/* Email — read only */}
          <div style={{ display: 'grid', gap: 6 }}>
            <label style={labelStyle}>EMAIL ADDRESS</label>
            <input
              type="text"
              value={email}
              disabled
              style={disabledInputStyle}
            />
            <p style={hintStyle}>Managed by GitHub OAuth — cannot be changed here.</p>
          </div>

          {/* GitHub login — read only */}
          <div style={{ display: 'grid', gap: 6 }}>
            <label style={labelStyle}>GITHUB USERNAME</label>
            <input
              type="text"
              value={githubLogin || 'Not connected'}
              disabled
              style={disabledInputStyle}
            />
          </div>

          {/* Display name — editable */}
          <div style={{ display: 'grid', gap: 6 }}>
            <label htmlFor="full_name" style={labelStyle}>DISPLAY NAME</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={profile.full_name ?? ''}
              maxLength={80}
              placeholder="Your name"
              style={inputStyle}
            />
          </div>

          {/* Bio — editable */}
          <div style={{ display: 'grid', gap: 6 }}>
            <label htmlFor="about_me" style={labelStyle}>BIO</label>
            <textarea
              id="about_me"
              name="about_me"
              defaultValue={profile.about_me ?? ''}
              maxLength={300}
              rows={3}
              placeholder="Tell us about yourself..."
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
            <p style={hintStyle}>Shown on your profile page. Max 300 characters.</p>
          </div>

          {/* Email notifications toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              id="email_notifications"
              name="email_notifications"
              type="checkbox"
              defaultChecked={profile.email_notifications ?? true}
              style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            <div>
              <label htmlFor="email_notifications" style={{ fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>
                Email notifications
              </label>
              <p style={hintStyle}>Receive an email summary after each PR review.</p>
            </div>
          </div>

          {/* Status message */}
          {status && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 6,
              fontSize: 13,
              background: status.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)',
              border: `1px solid ${status.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(248,113,113,0.3)'}`,
              color: status.type === 'success' ? '#4ade80' : '#f87171',
            }}>
              {status.msg}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary"
              style={{ padding: '8px 24px', opacity: isPending ? 0.6 : 1 }}
            >
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: 'var(--text-dim)',
  fontFamily: 'var(--mono)',
}

const inputStyle: React.CSSProperties = {
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  padding: '10px 14px',
  borderRadius: 6,
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const disabledInputStyle: React.CSSProperties = {
  ...inputStyle,
  color: 'var(--text-muted)',
  cursor: 'not-allowed',
}

const hintStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-dim)',
  margin: 0,
}
