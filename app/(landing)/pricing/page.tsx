import type { Metadata } from "next";
import Pricing from "@/components/Pricing";
import { getAbsoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
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
    images: [{ url: getAbsoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: "BugLens Pricing" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing | BugLens',
    description: 'Free plan, $19/mo Starter, and Team plans. AI code review for every GitHub PR.',
    images: [getAbsoluteUrl("/opengraph-image")],
  },
};

const pricingJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "BugLens",
  description: "AI code review for GitHub pull requests.",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD", description: "1 repository, 10 AI reviews/month, public repos only." },
    { "@type": "Offer", name: "Starter", price: "19", priceCurrency: "USD", description: "Unlimited AI reviews, private repos, knowledge base." },
    { "@type": "Offer", name: "Team", price: "49", priceCurrency: "USD", description: "Per seat/month. Organization-wide install, custom AI standards." },
  ],
};

const faqs = [
  {
    q: "What happens when I hit the 10 review/month limit on the Free plan?",
    a: "BugLens posts a comment letting you know you've hit your monthly limit, then pauses AI reviews until usage resets on the 1st of the next month. Nothing you've already received is removed, and upgrading to Starter lifts the cap immediately.",
  },
  {
    q: "Does Starter include API or agent access?",
    a: "The REST API, MCP server, and CLI for AI coding agents are currently in early access via a waitlist, independent of which pricing plan you're on. Email founder@buglens.app or see the for-agents page to join.",
  },
  {
    q: "Can I cancel or downgrade anytime?",
    a: "Yes — Starter is billed monthly with no lock-in. Manage or cancel your subscription anytime from the billing page in your dashboard.",
  },
  {
    q: "Do you store my code or use it to train AI models?",
    a: "No. Only the PR diff is sent for analysis, not full file contents, and diffs are not retained after the review completes. Your code is never used to train any AI model. See our Security page for the full breakdown.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function PricingPage() {
  return (
    <main className="pricing-page-content">
      <h1 className="sr-only">BugLens Pricing — Free, Starter, and Team Plans</h1>
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}
