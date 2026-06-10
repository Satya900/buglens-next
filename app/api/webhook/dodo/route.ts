import { Webhooks } from '@dodopayments/nextjs';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  applyBillingState,
  findProfileForBilling,
  recordBillingHistory,
  getPlanByTier,
} from '@/utils/billing';

const STARTER_PLAN = { tier: 'PRO' as const, usageLimit: 1_000_000 };

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,

  // Subscription activated or renewed → grant PRO access
  onSubscriptionActive: async (payload) => {
    const supabase = createAdminClient();
    const data = payload.data as Record<string, unknown>;
    const metadata = (data?.metadata ?? {}) as Record<string, string>;
    const customer = data?.customer as Record<string, string> | undefined;

    const userId = metadata?.userId;
    const email = customer?.email ?? metadata?.email;

    const profile = await findProfileForBilling(supabase, { userId, email });
    if (!profile) {
      console.warn(`[Dodo Webhook] No profile found for userId=${userId} email=${email}`);
      return;
    }

    await applyBillingState(supabase, profile.id, STARTER_PLAN);
    console.log(`[Dodo Webhook] Granted Starter access to ${profile.id}`);
  },

  onSubscriptionRenewed: async (payload) => {
    const supabase = createAdminClient();
    const data = payload.data as Record<string, unknown>;
    const metadata = (data?.metadata ?? {}) as Record<string, string>;
    const customer = data?.customer as Record<string, string> | undefined;

    const userId = metadata?.userId;
    const email = customer?.email ?? metadata?.email;

    const profile = await findProfileForBilling(supabase, { userId, email });
    if (!profile) return;

    await applyBillingState(supabase, profile.id, STARTER_PLAN);
    console.log(`[Dodo Webhook] Renewed Starter access for ${profile.id}`);
  },

  // Payment succeeded → record billing history
  onPaymentSucceeded: async (payload) => {
    const supabase = createAdminClient();
    const data = payload.data as Record<string, unknown>;
    const metadata = (data?.metadata ?? {}) as Record<string, string>;
    const customer = data?.customer as Record<string, string> | undefined;

    const userId = metadata?.userId;
    const email = customer?.email ?? metadata?.email;
    const profile = await findProfileForBilling(supabase, { userId, email });
    if (!profile) return;

    const paymentId = (data?.payment_id as string) ?? `dodo_${Date.now()}`;
    const amount = data?.amount as number | undefined;

    if (amount && amount > 0) {
      await recordBillingHistory(supabase, {
        userId: profile.id,
        transactionId: paymentId,
        amount: (amount / 100).toFixed(2),
        status: 'paid',
      });
    }
  },

  // Subscription cancelled or expired → downgrade to FREE
  onSubscriptionCancelled: async (payload) => {
    const supabase = createAdminClient();
    const data = payload.data as Record<string, unknown>;
    const metadata = (data?.metadata ?? {}) as Record<string, string>;
    const customer = data?.customer as Record<string, string> | undefined;

    const userId = metadata?.userId;
    const email = customer?.email ?? metadata?.email;

    const profile = await findProfileForBilling(supabase, { userId, email });
    if (!profile) {
      console.warn(`[Dodo Webhook] No profile for cancellation: email=${email}`);
      return;
    }

    await applyBillingState(supabase, profile.id, getPlanByTier('FREE'));
    console.log(`[Dodo Webhook] Subscription cancelled — downgraded ${profile.id} to FREE`);
  },

  onSubscriptionExpired: async (payload) => {
    const supabase = createAdminClient();
    const data = payload.data as Record<string, unknown>;
    const metadata = (data?.metadata ?? {}) as Record<string, string>;
    const customer = data?.customer as Record<string, string> | undefined;

    const userId = metadata?.userId;
    const email = customer?.email ?? metadata?.email;

    const profile = await findProfileForBilling(supabase, { userId, email });
    if (!profile) return;

    await applyBillingState(supabase, profile.id, getPlanByTier('FREE'));
    console.log(`[Dodo Webhook] Subscription expired — downgraded ${profile.id} to FREE`);
  },
});
