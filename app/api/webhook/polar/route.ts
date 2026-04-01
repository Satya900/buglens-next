import { Webhooks } from "@polar-sh/nextjs";
import {
  applyBillingState,
  findProfileForBilling,
  formatPolarAmount,
  getPlanByTier,
  recordBillingHistory,
  resolveBillingIdentity,
  resolvePlanFromPayload,
} from "@/utils/billing";
import { createAdminClient } from "@/utils/supabase/admin";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload: any) => {
    console.log(`[POLAR HEARTBEAT] Incoming Webhook Event: ${payload?.type || 'UNKNOWN'}`);
    const supabase = createAdminClient();
    const { type, data } = payload;
    console.log(`[Polar Webhook] Received event: ${type}`);

    try {
      if (
        type === "subscription.created" ||
        type === "subscription.updated" ||
        type === "subscription.active" ||
        type === "order.created" ||
        type === "order.paid"
      ) {
        const identity = resolveBillingIdentity(data);
        const profile = await findProfileForBilling(supabase, identity);

        if (!profile) {
          console.warn(
            `[Polar Webhook] No profile found for subscription event. userId=${identity.userId ?? "n/a"} email=${identity.email ?? "n/a"}`
          );
          return;
        }

        const plan = resolvePlanFromPayload(data);
        const updatedProfile = await applyBillingState(supabase, profile.id, plan);
        console.log(
          `[Polar Webhook] Updated ${profile.id} to ${updatedProfile.subscription_tier} (${updatedProfile.usage_limit} reviews)`
        );
      }

      if (type === "order.paid" || (type === "order.created" && data.status === "paid")) {
        const identity = resolveBillingIdentity(data);
        const profile = await findProfileForBilling(supabase, identity);

        if (!profile) {
          console.warn(
            `[Polar Webhook] No profile found for order event. userId=${identity.userId ?? "n/a"} email=${identity.email ?? "n/a"}`
          );
          return;
        }

        await recordBillingHistory(supabase, {
          userId: profile.id,
          transactionId: data.id,
          amount: formatPolarAmount(data.totalAmount),
          status: data.status ?? "paid",
        });
        console.log(`[Polar Webhook] Stored billing history for order ${data.id}`);
      }

      if (type === "subscription.revoked" || type === "subscription.canceled") {
        const identity = resolveBillingIdentity(data);
        const profile = await findProfileForBilling(supabase, identity);

        if (!profile) {
          console.warn(
            `[Polar Webhook] No profile found for revoke event. userId=${identity.userId ?? "n/a"} email=${identity.email ?? "n/a"}`
          );
          return;
        }

        await applyBillingState(supabase, profile.id, getPlanByTier("FREE"));
        console.log(`[Polar Webhook] Downgraded ${profile.id} to FREE`);
      }
    } catch (err) {
      console.error("[Polar Webhook Error]", err);
      throw err;
    }
  },
});
