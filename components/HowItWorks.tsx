export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Install in 60 seconds",
      desc: "Connect BugLens to your GitHub organization. Authorize the GitHub App. Select the repos you want reviewed. No config files. No CI changes.",
    },
    {
      number: "02",
      title: "PR opened. Review starts.",
      desc: "A developer opens a pull request. BugLens receives the webhook, fetches the diff, runs 8 deterministic rules, then sends the diff to AI analysis. Under 3 minutes.",
    },
    {
      number: "03",
      title: "Findings posted inline",
      desc: "BugLens posts inline comments on the PR — one per finding, at the exact line. Sets a commit status: green if clean, red if issues found. Your team reviews, not reruns.",
    },
  ]

  return (
    <>
      <div className="divider-line" />
      <section className="section" id="how-it-works">
        <div className="section-eyebrow">{"// how it works"}</div>
        <h2 className="section-title">
          Three steps.<br />
          <em>Zero ceremony.</em>
        </h2>
        <p className="section-sub">
          Install once. Every pull request gets reviewed automatically. No manual triggers.
        </p>
        <div className="hiw-grid">
          {steps.map((step) => (
            <div key={step.number} className="hiw-card">
              <div className="hiw-number">{step.number}</div>
              <h3 className="hiw-title">{step.title}</h3>
              <p className="hiw-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
