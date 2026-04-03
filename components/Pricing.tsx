import React from 'react';
import { POLAR_PLANS } from '@/utils/polar';

const Pricing = () => {
    const plans = [
        {
            name: "Free",
            price: "$0",
            period: "forever",
            description: "Perfect for students and early explorers.",
            features: [
                "1 repo",
                "50 PRs / month",
                "Generic review only",
                "Community support",
                "Public repos only"
            ],
            buttonText: "Start for Free",
            link: "/login",
            featured: false,
            comingSoon: false
        },
        {
            name: "Starter",
            price: "$19",
            period: "per month",
            description: "Empower your team with site-specific RAG context.",
            features: [
                "Up to 3 repos",
                "500 PRs / month",
                "Generic + team docs RAG",
                "Email support",
                "Public + private repos"
            ],
            buttonText: "Get Starter",
            link: POLAR_PLANS.STARTER.checkoutUrl,
            featured: true,
            comingSoon: false
        },
        {
            name: "Team",
            price: "$49",
            period: "per seat / month",
            description: "The ultimate solution for scaling engineering teams.",
            features: [
                "Unlimited repos",
                "Unlimited PRs",
                "Full RAG + custom rules",
                "Slack channel support",
                "Public + private repos"
            ],
            buttonText: "Join Team",
            link: POLAR_PLANS.TEAM.checkoutUrl,
            featured: false,
            comingSoon: true
        }
    ];

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
                            <div className="price-badge">Highly Recommended</div>
                        )}

                        <div className="price-name">{plan.name} {plan.comingSoon && "(Soon)"}</div>
                        
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
                        >
                            {plan.comingSoon ? "Join Waitlist" : plan.buttonText}
                        </a>
                    </div>
                ))}
            </div>
            
            <div className="pricing-footer">
                <p>
                    Need a custom plan or self-hosted instance? 
                    <a href="mailto:sales@buglens.app">
                        Contact Sales -&gt;
                    </a>
                </p>
            </div>
        </section>
    );
};

export default Pricing;
