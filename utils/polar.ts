/**
 * Polar Billing Integration Utility
 * This handles the checkout links and subscription status for BugLens plans.
 */

export const POLAR_PLANS = {
  STARTER: {
    priceId: process.env.NEXT_PUBLIC_POLAR_STARTER_PRICE_ID || '', // Replace with actual Polar Price ID
    checkoutUrl: `https://polar.sh/buglens/products/starter`, // Default landing page if ID missing
  },
  TEAM: {
    priceId: process.env.NEXT_PUBLIC_POLAR_TEAM_PRICE_ID || '',
    checkoutUrl: `https://polar.sh/buglens/products/team`,
  }
};

/**
 * Generates a checkout URL for a specific plan.
 * In a real production app, you might use the Polar API to create a checkout session.
 */
export function getCheckoutUrl(plan: 'STARTER' | 'TEAM', userId?: string) {
  const base = POLAR_PLANS[plan].checkoutUrl;
  if (!userId) return base;
  
  // Attach user ID for tracking / webhook mapping
  return `${base}?metadata[user_id]=${userId}`;
}
