import Link from 'next/link'

export const metadata = {
  title: 'Open Source Program | BugLens',
  description: 'Get 6 months of BugLens Pro free for your open source project. AI-powered code reviews for the tools developers rely on.',
}

const BENEFITS = [
  {
    icon: '🤖',
    title: '6 Months Pro — Free',
    desc: 'Full Pro plan access, no credit card. Renew every 6 months as long as your project stays active.',
  },
  {
    icon: '🔍',
    title: 'Unlimited PR Reviews',
    desc: 'No monthly cap. Every pull request gets a full AI review with inline comments and severity scoring.',
  },
  {
    icon: '✅',
    title: 'GitHub Status Checks',
    desc: 'BugLens posts a green or red commit status on every PR — integrates directly into your merge workflow.',
  },
  {
    icon: '📧',
    title: 'Email Digests',
    desc: 'Review summaries delivered to your inbox after every merge. Stay on top of code quality without living in GitHub.',
  },
  {
    icon: '⚙️',
    title: '.buglens.yml Config',
    desc: 'Configure strictness, ignore patterns, and file caps per-repo with a simple YAML file at your repo root.',
  },
  {
    icon: '🛡️',
    title: 'README Badge',
    desc: 'Show contributors you take code quality seriously with a "Reviewed by BugLens" badge in your README.',
  },
]

const ELIGIBILITY = [
  'Repository is public and will remain public',
  'Project has an OSI-approved open source license (MIT, Apache 2.0, GPL, AGPL, BSD, MPL, etc.)',
  'Not primarily a tutorial, course, or personal portfolio project',
  'You are an active maintainer with at least one commit in the last 90 days',
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Apply', desc: 'Fill out the application form — takes under 3 minutes.' },
  { step: '02', title: 'We Review', desc: 'We check your repo: public, licensed, active. No BS criteria.' },
  { step: '03', title: 'Get Access', desc: 'Approved? You get an email + instant Pro access for 6 months.' },
  { step: '04', title: 'Renew', desc: 'Reapply every 6 months as long as your project is active.' },
]

export default function OSSProgramPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg, #0a0a0a)', color: 'var(--text, #e5e7eb)' }}>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '6rem 2rem 4rem', maxWidth: 800, margin: '0 auto' }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 14px',
          background: 'rgba(139,92,246,0.15)',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: '#a78bfa',
          marginBottom: '1.5rem',
          fontFamily: 'monospace',
        }}>
          OPEN SOURCE PROGRAM
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
          AI Code Reviews for the
          <br />
          <span style={{ color: '#a78bfa' }}>Tools Developers Trust</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-muted, #9ca3af)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 600, margin: '0 auto 2.5rem' }}>
          Open source maintainers keep the ecosystem running. BugLens Pro is free for qualifying projects — 6 months, no credit card, renew as long as you ship.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/apply-oss-program" style={{
            padding: '12px 32px',
            background: '#7c3aed',
            color: '#fff',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
            display: 'inline-block',
          }}>
            Apply Now — It's Free
          </Link>
          <Link href="/pricing" style={{
            padding: '12px 32px',
            background: 'transparent',
            color: 'var(--text-muted, #9ca3af)',
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 15,
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'inline-block',
          }}>
            View Pricing
          </Link>
        </div>
      </section>

      {/* Benefits grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 2rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: '3rem' }}>
          Everything in Pro, free for 6 months
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {BENEFITS.map((b) => (
            <div key={b.title} style={{
              padding: '1.75rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{b.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{b.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted, #9ca3af)', lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 2rem 5rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: '3rem' }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {HOW_IT_WORKS.map((h) => (
            <div key={h.step} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'monospace',
                color: '#7c3aed',
                marginBottom: 12,
                letterSpacing: '0.1em',
              }}>{h.step}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{h.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted, #9ca3af)', lineHeight: 1.6, margin: 0 }}>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Eligibility */}
      <section style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '3rem 2rem',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>Eligibility</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {ELIGIBILITY.map((e) => (
            <li key={e} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, color: 'var(--text-muted, #9ca3af)', lineHeight: 1.6 }}>
              <span style={{ color: '#4ade80', fontWeight: 700, flexShrink: 0 }}>✓</span>
              {e}
            </li>
          ))}
        </ul>
        <p style={{ fontSize: 13, color: 'rgba(156,163,175,0.6)', marginTop: '1.5rem', textAlign: 'center' }}>
          We don't gatekeep on stars or age. A new project with a real license and active commits qualifies.
        </p>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: '1rem' }}>Ready to apply?</h2>
        <p style={{ fontSize: 16, color: 'var(--text-muted, #9ca3af)', marginBottom: '2rem' }}>
          Takes under 3 minutes. We review applications within 48 hours.
        </p>
        <Link href="/apply-oss-program" style={{
          padding: '14px 40px',
          background: '#7c3aed',
          color: '#fff',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 16,
          textDecoration: 'none',
          display: 'inline-block',
        }}>
          Apply for Free Access →
        </Link>
      </section>

    </main>
  )
}
