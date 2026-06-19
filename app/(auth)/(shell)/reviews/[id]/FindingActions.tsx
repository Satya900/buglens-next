'use client'

import { useState } from 'react'

const SEV_EMOJI: Record<string, string> = { HIGH: '🔴', MEDIUM: '🟡', LOW: '🔵' }

function buildGitHubComment(props: {
  message: string
  suggestion: string | null
  severity: string
  category: string | null
  confidence: number | null
}) {
  const emoji = SEV_EMOJI[props.severity] || '⚠️'
  const confidence = props.confidence != null ? Math.round(props.confidence * 100) : null
  const lines = [
    `### ${emoji} BugLens · ${props.severity} Severity`,
    ``,
    props.message,
    ``,
    `> **Confidence:** ${confidence != null ? `${confidence}%` : 'n/a'} &nbsp;|&nbsp; **Category:** ${props.category || 'general'}`,
  ]
  if (props.suggestion) {
    lines.push(``, `**Suggested fix:**`, ``, '```suggestion', props.suggestion, '```')
  }
  return lines.join('\n')
}

export default function FindingActions({
  message,
  suggestion,
  severity,
  category,
  confidence,
  filePath,
  lineNumber,
  prUrl,
}: {
  message: string
  suggestion: string | null
  severity: string
  category: string | null
  confidence: number | null
  filePath: string
  lineNumber: number | null
  prUrl: string | null
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const text = buildGitHubComment({ message, suggestion, severity, category, confidence })
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Build GitHub file URL if prUrl available
  // PR URL: https://github.com/owner/repo/pull/123
  // File URL: https://github.com/owner/repo/blob/HEAD/filepath#L42
  const ghFileUrl = prUrl
    ? (() => {
        const match = prUrl.match(/^(https:\/\/github\.com\/[^/]+\/[^/]+)\/pull\/\d+/)
        if (!match) return null
        const base = match[1]
        return `${base}/blob/HEAD/${filePath}${lineNumber ? `#L${lineNumber}` : ''}`
      })()
    : null

  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
      <button
        onClick={handleCopy}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 10, fontFamily: 'var(--mono)', cursor: 'pointer',
          padding: '3px 10px', borderRadius: 5,
          background: copied ? 'rgba(34,197,94,0.1)' : 'var(--surface2)',
          border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
          color: copied ? 'var(--green)' : 'var(--text-dim)',
          transition: 'all 0.15s',
        }}
      >
        {copied ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        )}
        {copied ? 'Copied!' : 'Copy comment'}
      </button>

      {ghFileUrl && (
        <a
          href={ghFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 10, fontFamily: 'var(--mono)',
            padding: '3px 10px', borderRadius: 5,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--text-dim)', textDecoration: 'none',
            transition: 'all 0.15s',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Open in GitHub
        </a>
      )}
    </div>
  )
}
