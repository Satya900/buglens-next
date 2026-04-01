import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";

const TIER_MAPPING = {
  "FREE": { tier: "FREE", limit: 50 },
  "BUGLENS_PRO": { tier: "PRO", limit: 1000000 },
  "PRO": { tier: "PRO", limit: 1000000 },
  "BUSINESS": { tier: "BUSINESS", limit: 10000000 }
};

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload: any) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { type, data } = payload;
    console.log(`[Polar Webhook] Received event: ${type}`);

    try {
      if (type === "subscription.created" || type === "subscription.updated") {
        const subscription = data as any;
        const userEmail = subscription.user.email;
        const productName = (subscription.product.name as string).toUpperCase();
        const userId = subscription.customer_metadata?.user_id || subscription.metadata?.user_id;

        // Find the matching tier
        const tierConfig = TIER_MAPPING[productName as keyof typeof TIER_MAPPING] || TIER_MAPPING["PRO"];
        
        console.log(`[Polar Webhook] Upgrading user: ${userId || userEmail} to ${tierConfig.tier}`);

        let query = supabase.from("profiles").update({
          subscription_tier: tierConfig.tier,
          usage_limit: tierConfig.limit
        });

        if (userId) {
          query = query.eq("id", userId);
        } else {
          query = query.ilike("email", userEmail.trim());
        }

        const { error, data: updateData } = await query.select();

        if (error) {
           console.error(`[Polar Webhook] Supabase Update Error: ${error.message}`);
           throw error;
        }
        
        if (!updateData || updateData.length === 0) {
           console.warn(`[Polar Webhook] No user found matching ${userId ? 'ID: ' + userId : 'Email: ' + userEmail}.`);
        } else {
           console.log(`[Polar Webhook] Successfully upgraded ${userId || userEmail}`);
        }
      }

      if (type === "subscription.revoked" || type === "subscription.canceled") {
        const subscription = data as any;
        const userEmail = subscription.user.email;
        
        console.log(`[Polar Webhook] Revoking PRO from user: ${userEmail}`);
        
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_tier: "FREE",
            usage_limit: 50
          })
          .eq("email", userEmail);

        if (error) throw error;
      }
    } catch (err) {
      console.error("[Polar Webhook Error]", err);
    }
  },
});
