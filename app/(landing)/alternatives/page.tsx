import type { Metadata } from "next";
import Link from "next/link";
import { getAbsoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "CodeRabbit Alternative | Why BugLens is better for deep PR reviews",
  description: "Compare BugLens vs CodeRabbit and other AI code review tools. See why our context-aware senior reviewer catches more bugs.",
  alternates: {
    canonical: "/alternatives/",
  },
  openGraph: {
    title: "CodeRabbit Alternative | Why BugLens is better for deep PR reviews",
    description: "Compare BugLens vs CodeRabbit and other AI code review tools. See why our context-aware senior reviewer catches more bugs.",
    url: "https://buglens.app/alternatives/",
    type: "website",
    images: [{ url: getAbsoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: "BugLens vs CodeRabbit and other AI code review tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeRabbit Alternative | Why BugLens is better for deep PR reviews",
    description: "Compare BugLens vs CodeRabbit and other AI code review tools. See why our context-aware senior reviewer catches more bugs.",
    images: [getAbsoluteUrl("/opengraph-image")],
  },
};

const comparisons = [
  {
    feature: "Codebase Context",
    buglens: "Deep Context RAG: Ingests docs, past PRs, and team conventions.",
    competitors: "Limited to current file or shallow local context.",
    win: true,
  },
  {
    feature: "Seniority Level",
    buglens: "Acts as a Senior Engineer: Catches architectural flaws, not just linting.",
    competitors: "Primarily catches style violations and basic logic bugs.",
    win: true,
  },
  {
    feature: "Integration",
    buglens: "Native GitHub App with zero-config setup.",
    competitors: "Often require complex CI/CD pipe configuration.",
    win: false, // assuming they are similar
  },
  {
    feature: "Shadow Learning",
    buglens: "Learns from your custom 'Lessons' to avoid repeating old mistakes.",
    competitors: "Static models that don't adapt to your specific team rules.",
    win: true,
  },
  {
    feature: "Pricing",
    buglens: "Transparent $0 - $19/mo tiers to start. No usage-based overage fees.",
    competitors: "Per-seat pricing from $12-30+/seat/month, with some tools adding usage-based overage on top.",
    win: true,
  }
];

const faqs = [
  {
    q: "Is BugLens really free to start?",
    a: "Yes. The Free tier requires no credit card and works on public repositories out of the box. You only pay if you need private repos or higher usage on the Starter plan.",
  },
  {
    q: "How is BugLens different from CodeRabbit and other AI reviewers?",
    a: "BugLens ingests your team's docs, past PRs, and conventions through a Context RAG pipeline before reviewing, instead of judging a diff in isolation. It also runs 8 deterministic security/correctness rules on every PR alongside the AI analysis.",
  },
  {
    q: "Can I switch from another AI code review tool to BugLens?",
    a: "Yes. Installing the BugLens GitHub App takes about 60 seconds and doesn't require removing your existing CI configuration. You can run both tools in parallel while you evaluate.",
  },
];

export default function AlternativesPage() {
  return (
    <main className="alternatives-page">
      <section className="section hero-mini">
        <div className="badge">
          <div className="badge-dot"></div>
          Why BugLens?
        </div>
        <h1 className="section-title">The best <em>AI Code Review</em> alternative to CodeRabbit</h1>
        <p className="section-sub">
          Stop settling for simple linter-like AI reviews. BugLens uses advanced RAG to understand 
          your entire codebase, acting as the senior reviewer your team needs.
        </p>
      </section>

      <section className="section section-flush">
        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="th-active">BugLens</th>
                <th>Standard AI Reviewers</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((item, i) => (
                <tr key={i}>
                  <td className="td-feature">{item.feature}</td>
                  <td className="td-buglens">
                    <div className="td-label">BugLens</div>
                    {item.buglens}
                  </td>
                  <td className="td-other">
                    <div className="td-label">Others</div>
                    {item.competitors}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Common questions</h2>
        <div className="faq-list">
          {faqs.map((item, i) => (
            <div className="faq-item" key={i}>
              <h3 className="faq-question">{item.q}</h3>
              <p className="faq-answer">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section alt-cta">
         <h2 className="section-title">Ready to level up your code reviews?</h2>
         <p className="section-sub">
           No waitlist, no credit card &mdash; install BugLens on GitHub and get your first review in under 60 seconds.
         </p>
         <div className="hero-actions">
           <Link href="/login" className="btn-primary">Start reviewing free</Link>
           <Link href="/pricing/" className="btn-ghost">View Pricing</Link>
         </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
    </main>
  );
}

