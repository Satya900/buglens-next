import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "CodeRabbit Alternative | Why BugLens is better for deep PR reviews",
  description: "Compare BugLens vs CodeRabbit and other AI code review tools. See why our context-aware senior reviewer catches more bugs.",
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
    buglens: "Transparent $0 - $19/mo tiers. No hidden seat costs.",
    competitors: "Complex enterprise pricing starting at $50+/user.",
    win: true,
  }
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

      <section className="section py-0">
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

      <section className="section text-center">
         <h2 className="section-title">Ready to level up your code reviews?</h2>
         <p className="section-sub mx-auto">
           Join the 500+ developers shipping more reliable code with BugLens.
         </p>
         <div className="hero-actions">
           <Link href="/#updates" className="btn-primary">Get Started for Free</Link>
           <Link href="/pricing" className="btn-ghost">View Pricing</Link>
         </div>
      </section>
      
      <style jsx>{`
        .mx-auto { margin-left: auto; margin-right: auto; }
        .text-center { text-align: center; }
        .hero-mini { padding-top: 8rem; padding-bottom: 4rem; text-align: center; }
        
        .comparison-table-wrap {
          background: var(--surface);
          border: 1px solid var(--border-bright);
          border-radius: 12px;
          overflow-x: auto;
          margin-bottom: 4rem;
        }
        
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        
        .comparison-table th {
          text-align: left;
          padding: 1.5rem;
          background: var(--surface2);
          font-family: var(--mono);
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
          color: var(--text-dim);
          border-bottom: 1px solid var(--border);
        }
        
        .comparison-table th.th-active {
          color: var(--green);
          background: var(--green-muted);
        }
        
        .comparison-table td {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          vertical-align: top;
          line-height: 1.6;
        }
        
        .td-feature {
          font-weight: 600;
          color: var(--text-active);
          width: 200px;
        }
        
        .td-buglens {
          color: var(--text);
          background: rgba(34, 197, 94, 0.02);
        }
        
        .td-other {
          color: var(--text-muted);
        }
        
        .td-label {
          display: none;
          font-family: var(--mono);
          font-size: 10px;
          color: var(--text-dim);
          margin-bottom: 4px;
        }
        
        @media (max-width: 768px) {
          .comparison-table thead { display: none; }
          .comparison-table tr { display: flex; flex-direction: column; }
          .td-feature { width: 100%; border-bottom: none; padding-bottom: 0.5rem; }
          .td-label { display: block; }
          .comparison-table td { padding: 1rem; }
        }
      `}</style>
    </main>
  );
}
