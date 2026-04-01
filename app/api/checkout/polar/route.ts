import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const products = searchParams.get("products") || process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID;
  
  if (!products) {
    console.error("[Checkout] Error: No product ID provided. Ensure NEXT_PUBLIC_POLAR_PRODUCT_ID is set.");
    return new Response("Missing product ID", { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 🛡️ Manual Polar Checkout URL creation
  // We bypass the helper to ensure 100% control over the redirect.
  // The official Polar checkout link format:
  const isProduction = process.env.NODE_ENV === "production";
  const baseUrl = isProduction ? "https://polar.sh" : "https://sandbox.polar.sh";
  
  const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/billing?success=true`;
  const checkoutUrl = `${baseUrl}/checkout/custom/${products}?success_url=${encodeURIComponent(successUrl)}&customer_email=${encodeURIComponent(user?.email || "")}`;

  console.log(`[Checkout] Redirecting user ${user?.email} to Polar: ${checkoutUrl}`);
  
  redirect(checkoutUrl);
}
