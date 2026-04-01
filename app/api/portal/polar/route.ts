import { Polar } from "@polar-sh/sdk";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getPolarServer, getSiteUrl, requireEnv } from "@/utils/billing";

export async function GET() {
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

  const { customerPortalUrl } = await polar.customerSessions.create({
    externalCustomerId: user.id,
    returnUrl: `${getSiteUrl()}/billing`,
  });

  redirect(customerPortalUrl);
}
