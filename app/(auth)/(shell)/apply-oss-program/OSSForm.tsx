'use client'

import { useState, useTransition } from 'react'
import { submitOSSApplication } from './actions'

const LICENSES = [
  'MIT', 'Apache 2.0', 'GPL-3.0', 'AGPL-3.0', 'LGPL-3.0',
  'BSD-2-Clause', 'BSD-3-Clause', 'MPL-2.0', 'ISC', 'Other OSI-approved',
]

const ROLES = [
  { value: 'owner', label: 'Owner / Creator' },
  { value: 'maintainer', label: 'Core Maintainer' },
  { value: 'contributor', label: 'Active Contributor' },
]

const CONFIRMATIONS = [
  { name: 'confirm_public', label: 'The repository is public and will remain public' },
  { name: 'confirm_license', label: 'The project has an OSI-approved open source license' },
  { name: 'confirm_not_course', label: 'This is not primarily a course, tutorial, or portfolio project' },
  { name: 'confirm_active', label: 'I am an active maintainer with at least one commit in the last 90 days' },
]

export default function OSSForm({ githubUsername }: { githubUsername: string }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await submitOSSApplication(fd)
      if (result?.error) {
        setStatus({ type: 'error', msg: result.error })
      } else {
        setSubmitted(true)
      }
    })
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: 56, marginBottom: 24 }}>🎉</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>Application Submitted!</h2>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 2rem' }}>
          We'll review your project and get back to you within <strong>48 hours</strong> at your email. If approved, you'll get instant Pro access for 6 months.
        </p>
        <div style={{
          display: 'inline-block',
          padding: '12px 20px',
          background: 'rgba(139,92,246,0.1)',
          border: '1px solid rgba(139,92,246,0.25)',
          borderRadius: 8,
          fontSize: 13,
          color: '#a78bfa',
          fontFamily: 'monospace',
        }}>
          Status: PENDING REVIEW
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>

      {/* Applicant */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Your GitHub Account</h2>
        <div style={fieldStyle}>
          <label style={labelStyle}>GITHUB USERNAME</label>
          <input
            value={`@${githubUsername}`}
            disabled
            style={disabledInput}
          />
          <p style={hintStyle}>Pulled from your connected GitHub account.</p>
        </div>
      </section>

      {/* Project info */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Project Information</h2>

        <div style={fieldStyle}>
          <label htmlFor="repo_url" style={labelStyle}>GITHUB REPOSITORY URL <Required /></label>
          <input
            id="repo_url"
            name="repo_url"
            type="url"
            placeholder="https://github.com/your-org/your-project"
            required
            style={inputStyle}
          />
          <p style={hintStyle}>Must be a public repository.</p>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="license" style={labelStyle}>OPEN SOURCE LICENSE <Required /></label>
          <select id="license" name="license" required style={inputStyle}>
            <option value="">Select a license…</option>
            {LICENSES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="role_in_project" style={labelStyle}>YOUR ROLE IN THE PROJECT <Required /></label>
          <select id="role_in_project" name="role_in_project" required style={inputStyle}>
            <option value="">Select your role…</option>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        <div style={{ ...fieldStyle, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <input
            id="is_primary_project"
            name="is_primary_project"
            type="checkbox"
            defaultChecked
            style={checkboxStyle}
          />
          <div>
            <label htmlFor="is_primary_project" style={{ fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>
              This is one of my primary maintained projects
            </label>
          </div>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="use_case" style={labelStyle}>HOW WILL YOU USE BUGLENS? <Required /></label>
          <textarea
            id="use_case"
            name="use_case"
            rows={4}
            minLength={20}
            maxLength={500}
            placeholder="e.g. We maintain a widely-used authentication library and want automated review on every PR to catch security regressions before they ship..."
            required
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
          />
          <p style={hintStyle}>Min 20 characters. Be specific — it helps us review faster.</p>
        </div>
      </section>

      {/* Eligibility confirmations */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Eligibility Confirmation</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.25rem', marginTop: 0 }}>
          All four must be checked to qualify.
        </p>
        <div style={{ display: 'grid', gap: 14 }}>
          {CONFIRMATIONS.map((c) => (
            <label key={c.name} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                name={c.name}
                type="checkbox"
                required
                style={checkboxStyle}
              />
              <span style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{c.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Status */}
      {status?.type === 'error' && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: 13,
          background: 'rgba(248,113,113,0.1)',
          border: '1px solid rgba(248,113,113,0.3)',
          color: '#f87171',
        }}>
          {status.msg}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '12px 32px',
            background: isPending ? 'rgba(124,58,237,0.5)' : 'var(--green, #22c55e)',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? 'Submitting…' : 'Submit Application'}
        </button>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 10 }}>
          We review applications within 48 hours. No spam, ever.
        </p>
      </div>
    </form>
  )
}

function Required() {
  return <span style={{ color: '#f87171' }}>*</span>
}

const sectionStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: '1.75rem',
  display: 'grid',
  gap: '1.25rem',
}

const sectionTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  margin: 0,
  color: 'var(--text)',
}

const fieldStyle: React.CSSProperties = {
  display: 'grid',
  gap: 6,
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: 'var(--text-dim)',
  fontFamily: 'monospace',
}

const inputStyle: React.CSSProperties = {
  background: 'var(--surface2, rgba(255,255,255,0.05))',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '10px 14px',
  borderRadius: 6,
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const disabledInput: React.CSSProperties = {
  ...inputStyle,
  color: 'var(--text-muted)',
  cursor: 'not-allowed',
}

const checkboxStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  accentColor: 'var(--green, #22c55e)',
  cursor: 'pointer',
  marginTop: 2,
  flexShrink: 0,
}

const hintStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-dim)',
  margin: 0,
}
