import { Polar } from "@polar-sh/sdk";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getPolarServer, getSiteUrl, requireEnv } from "@/utils/billing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const products = searchParams.getAll("products").flatMap((entry) =>
    entry
      .split(",")
      .map((product) => product.trim())
      .filter(Boolean)
  );
  const fallbackProduct = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID;

  if (products.length === 0 && fallbackProduct) {
    products.push(fallbackProduct);
  }

  if (products.length === 0) {
    console.error(
      "[Checkout] Error: No product ID provided. Ensure NEXT_PUBLIC_POLAR_PRODUCT_ID is set."
    );
    return new Response("Missing product ID", { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const polar = new Polar({
    accessToken: requireEnv("POLAR_ACCESS_TOKEN"),
    server: getPolarServer(),
  });

  const result = await polar.checkouts.create({
    products,
    successUrl: `${getSiteUrl()}/billing?success=true`,
    customerEmail: user.email ?? undefined,
    customerName:
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name
          : undefined,
    externalCustomerId: user.id,
    customerMetadata: {
      user_id: user.id,
      github_username:
        typeof user.user_metadata?.user_name === "string"
          ? user.user_metadata.user_name
          : "",
    },
    metadata: {
      user_id: user.id,
      email: user.email ?? "",
      source: "buglens-next",
    },
    allowDiscountCodes: true,
  });

  console.log(
    `[Checkout] Redirecting user ${user.email} to Polar checkout ${result.id}`
  );

  redirect(result.url);
}
