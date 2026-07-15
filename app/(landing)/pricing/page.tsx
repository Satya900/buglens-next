import Pricing from "@/components/Pricing";

export const metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for teams of all sizes. Free plan, $19/mo Starter, and Team plans. AI code review for every GitHub PR.',
  alternates: {
    canonical: 'https://buglens.app/pricing/',
  },
  openGraph: {
    title: 'Pricing | BugLens',
    description: 'Free plan, $19/mo Starter, and Team plans. AI code review for every GitHub PR.',
    url: 'https://buglens.app/pricing/',
    type: 'website',
  },
};

export default function PricingPage() {
  return (
    <main className="pricing-page-content">
      <Pricing />
      
      {/* Additional information context */}
      <section className="section section-flush">
          <div className="pricing-info-card">
              <div className="info-badge">Pro Tip</div>
              <h3 className="info-title">Why choose context-aware reviews?</h3>
              <p className="info-text">
                  Generic AI reviews often miss architectural nuances. Our <strong>Context RAG</strong> pipeline 
                  ingests your team's documentation and past PR history to ensure BugLens catches bugs 
                  specific to your unique codebase.
              </p>
              <div className="info-quote">
                  "Catching the bug today that would have cost you 10 hours next week."
              </div>
          </div>
      </section>
    </main>
  );
}
