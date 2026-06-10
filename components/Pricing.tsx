import React from 'react';

const STARTER_CHECKOUT = `/api/checkout/dodo?productId=${process.env.NEXT_PUBLIC_DODO_STARTER_PRODUCT_ID}`;

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for students and early explorers.",
    features: [
      "1 repository",
      "50 AI reviews / month",
      "Generic review only",
      "Community support",
      "Public repos only",
    ],
    buttonText: "Start for Free",
    link: "/login",
    featured: false,
    comingSoon: false,
  },
  {
    name: "Starter",
    price: "$19",
    period: "per month",
    description: "Advanced context-aware AI reviews for growing teams.",
    features: [
      "Unlimited AI reviews",
      "Support for private repositories",
      "Shadow mode (silent analysis)",
      "Priority analysis queue",
      "Email support",
    ],
    buttonText: "Upgrade to Starter",
    link: STARTER_CHECKOUT,
    featured: true,
    comingSoon: false,
  },
  {
    name: "Team",
    price: "$49",
    period: "per seat / month",
    description: "Organization-wide AI reviews for scaling engineering teams.",
    features: [
      "Everything in Starter",
      "Custom AI coding standards",
      "Slack & Discord integrations",
      "Organization-wide installation",
      "Priority Slack support",
    ],
    buttonText: "Join Waitlist",
    link: "mailto:founder@buglens.app?subject=Team Plan Waitlist",
    featured: false,
    comingSoon: true,
  },
];

const Pricing = () => {
  return (
    <section className="section" id="pricing">
      <div className="section-eyebrow">{"// pricing"}</div>
      <h2 className="section-title">Scale your<br /><em>engineering quality</em></h2>
      <p className="section-sub">Simple, transparent pricing for teams of all sizes. No hidden fees.</p>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`price-card ${plan.featured ? 'featured' : ''} ${plan.comingSoon ? 'coming-soon' : ''}`}
          >
            {plan.featured && (
              <div className="price-badge">Most Popular</div>
            )}

            <div className="price-name">
              {plan.name}{plan.comingSoon && <span style={{ fontSize: '0.65em', opacity: 0.6 }}> (Soon)</span>}
            </div>

            <div className="price-val-wrap">
              <span className="price-val">{plan.price}</span>
              <span className="price-period">{plan.period}</span>
            </div>

            <p className="price-desc">{plan.description}</p>

            <ul className="price-features">
              {plan.features.map((feature, i) => (
                <li key={i} className="price-feature">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href={plan.link}
              className={`price-btn ${plan.featured ? 'price-btn-primary' : 'price-btn-ghost'} ${plan.comingSoon ? 'disabled' : ''}`}
              style={plan.comingSoon ? { pointerEvents: 'none', opacity: 0.5 } : {}}
            >
              {plan.buttonText}
            </a>
          </div>
        ))}
      </div>

      <div className="pricing-footer">
        <p>
          Need a custom plan or self-hosted instance?{' '}
          <a href="mailto:founder@buglens.app">Contact us →</a>
        </p>
      </div>
    </section>
  );
};

export default Pricing;
