import Link from 'next/link'

export const metadata = {
  title: 'Open Source Program | BugLens',
  description: 'Get 6 months of BugLens Pro free for your open source project. AI-powered code reviews for the tools developers rely on.',
}

const BENEFITS = [
  {
    title: '6 Months Pro — Free',
    desc: 'Full Pro plan access, no credit card. Renew every 6 months as long as your project stays active.',
  },
  {
    title: 'Unlimited PR Reviews',
    desc: 'No monthly cap. Every pull request gets a full AI review with inline comments and severity scoring.',
  },
  {
    title: 'GitHub Status Checks',
    desc: 'BugLens posts a pass or fail commit status on every PR — integrates directly into your merge workflow.',
  },
  {
    title: 'Email Digests',
    desc: 'Review summaries delivered to your inbox after every merge. Stay on top of code quality without living in GitHub.',
  },
  {
    title: '.buglens.yml Config',
    desc: 'Configure strictness, ignore patterns, and file caps per-repo with a simple YAML file at your repo root.',
  },
  {
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
    <main>

      {/* Hero */}
      <section className="oss-hero">
        <div className="badge">
          <span className="badge-dot"></span>
          Open Source Program
        </div>
        <h1 className="hero-title">
          AI code reviews for the<br /><em>tools developers trust.</em>
        </h1>
        <p className="hero-sub">
          Open source maintainers keep the ecosystem running. BugLens Pro is free for qualifying projects — 6 months, no credit card, renew as long as you ship.
        </p>
        <div className="hero-actions">
          <Link href="/apply-oss-program" className="btn-primary">Apply Now — It&apos;s Free</Link>
          <Link href="/pricing" className="btn-secondary">View Pricing</Link>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="oss-section">
        <h2 className="oss-section-title">Everything in Pro, free for 6 months</h2>
        <div className="feat-grid">
          {BENEFITS.map((b) => (
            <div key={b.title} className="feat-card">
              <h3 className="feat-name">{b.title}</h3>
              <div className="feat-desc">{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="oss-how">
        <h2 className="oss-section-title">How it works</h2>
        <div className="oss-how-grid">
          {HOW_IT_WORKS.map((h) => (
            <div key={h.step}>
              <div className="hiw-number">{h.step}</div>
              <h3 className="hiw-title">{h.title}</h3>
              <p className="hiw-desc">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Eligibility */}
      <section className="oss-eligibility">
        <h2 className="oss-eligibility-title">Eligibility</h2>
        <ul className="oss-eligibility-list">
          {ELIGIBILITY.map((e) => (
            <li key={e} className="oss-eligibility-item">
              <span className="oss-eligibility-check">✓</span>
              {e}
            </li>
          ))}
        </ul>
        <p className="oss-eligibility-note">
          We don&apos;t gatekeep on stars or age. A new project with a real license and active commits qualifies.
        </p>
      </section>

      {/* CTA */}
      <section className="oss-cta">
        <h2 className="oss-cta-title">Ready to apply?</h2>
        <p className="oss-cta-sub">
          Takes under 3 minutes. We review applications within 48 hours.
        </p>
        <Link href="/apply-oss-program" className="btn-primary">Apply for Free Access →</Link>
      </section>

    </main>
  )
}
