'use client'

import { useState } from 'react'

type Finding = {
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  file_path: string
  line_number: number | null
  message: string
  suggestion: string | null
  category: string | null
}

type Review = {
  pr_title: string | null
  pr_number: number | null
  repo_full_name: string | null
  merge_decision: string | null
  risk_summary: string | null
}

const SEV_EMOJI: Record<string, string> = { HIGH: '🔴', MEDIUM: '🟡', LOW: '🔵' }

function buildMarkdown(review: Review, findings: Finding[]): string {
  const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 }
  for (const f of findings) counts[f.severity]++
  const decision = review.merge_decision === 'APPROVE' ? '✅ APPROVE' : '⚠️ REQUEST CHANGES'

  const lines = [
    `## 🧠 BugLens Review — ${review.pr_title || 'PR'} #${review.pr_number || ''}`,
    ``,
    `**Repo:** \`${review.repo_full_name || ''}\` &nbsp;|&nbsp; **Decision:** ${decision}`,
    ``,
  ]

  if (review.risk_summary) {
    lines.push(`> ${review.risk_summary}`, ``)
  }

  if (findings.length === 0) {
    lines.push(`✅ No issues found.`)
  } else {
    lines.push(
      `| # | Severity | File | Line | Issue |`,
      `|---|---|---|---|---|`,
      ...findings.map((f, i) =>
        `| ${i + 1} | ${SEV_EMOJI[f.severity]} ${f.severity} | \`${f.file_path}\` | ${f.line_number || '—'} | ${f.message.replace(/\|/g, '\\|')} |`
      ),
      ``,
    )

    const withSuggestions = findings.filter(f => f.suggestion)
    if (withSuggestions.length > 0) {
      lines.push(`---`, ``, `### Suggested fixes`, ``)
      for (const f of withSuggestions) {
        lines.push(
          `**${f.file_path}${f.line_number ? `:${f.line_number}` : ''}** (${f.severity})`,
          ``,
          '```suggestion',
          f.suggestion!,
          '```',
          ``,
        )
      }
    }

    lines.push(`---`, ``)
    if (counts.HIGH > 0) lines.push(`- [ ] Resolve **${counts.HIGH} HIGH** severity issue(s)`)
    if (counts.MEDIUM > 0) lines.push(`- [ ] Resolve **${counts.MEDIUM} MEDIUM** severity issue(s)`)
  }

  lines.push(``, `---`, `<sub>Reviewed by [BugLens AI](https://buglens.app)</sub>`)
  return lines.join('\n')
}

export default function CopyReviewButton({
  findings,
  review,
}: {
  findings: Finding[]
  review: Review
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const md = buildMarkdown(review, findings)
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="btn-secondary"
      style={{ fontSize: 11, gap: 5 }}
    >
      {copied ? (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      )}
      {copied ? 'Copied!' : 'Copy as MD'}
    </button>
  )
}
