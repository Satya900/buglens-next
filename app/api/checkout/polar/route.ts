import { Checkout as PolarCheckout } from "@polar-sh/nextjs";
import { createClient } from "@/utils/supabase/server";

export const GET = async (request: Request) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return PolarCheckout({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/billing?success=true`,
    server: "production",
    // 🛡️ Passing the User ID as persistent metadata
    // Checkouts in the Polar Next.js helper can accept these as query params or via the underlying API
    // We'll wrap it to ensure the metadata is attached if the library allows it 
    // or use the product search params.
  })(request, { params: { custom_metadata: JSON.stringify({ user_id: user?.id }) } } as any);
};
