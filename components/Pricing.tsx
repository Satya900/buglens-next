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
            link: "/dashboard",
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
        <section id="pricing" className="py-20 bg-background overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-20"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {plans.map((plan) => (
                        <div 
                            key={plan.name} 
                            className={`group relative flex flex-col p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
                                plan.featured 
                                    ? 'border-primary shadow-xl shadow-primary/10 bg-primary/[0.02]' 
                                    : 'border-border bg-card'
                            } ${plan.comingSoon ? 'opacity-90' : ''}`}
                        >
                            {plan.featured && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase rounded-full">
                                    Highly Recommended
                                </div>
                            )}

                            {plan.comingSoon && (
                                <div className="absolute top-4 right-4 px-2 py-0.5 bg-secondary text-secondary-foreground text-[9px] font-bold uppercase rounded-md tracking-wider">
                                    Coming Soon
                                </div>
                            )}
                            
                            <div className="mb-6">
                                <h3 className="text-xl font-bold tracking-tight mb-1">{plan.name}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                                    {plan.period && <span className="text-sm font-medium text-muted-foreground">{plan.period}</span>}
                                </div>
                            </div>

                            <div className="flex-grow">
                                <ul className="space-y-3.5 mb-10">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm">
                                            <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${plan.featured ? 'bg-primary/20' : 'bg-secondary'}`}>
                                                <svg className={`w-2.5 h-2.5 ${plan.featured ? 'text-primary' : 'text-muted-foreground'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-muted-foreground/90">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {plan.comingSoon ? (
                                <button disabled className="w-full py-3.5 px-4 rounded-xl bg-secondary/50 text-muted-foreground font-semibold text-sm cursor-not-allowed border border-border">
                                    Waitlist Open
                                </button>
                            ) : (
                                <a 
                                    href={plan.link}
                                    className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-center shadow-sm transition-all duration-200 active:scale-95 ${
                                    plan.featured 
                                        ? 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20' 
                                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                }`}
                                >
                                    {plan.buttonText}
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
