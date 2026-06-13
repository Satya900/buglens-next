import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import DodoPayments from 'dodopayments';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const PRODUCT_ID = process.env.NEXT_PUBLIC_DODO_STARTER_PRODUCT_ID!;
const DODO_ENV = (process.env.DODO_PAYMENTS_ENVIRONMENT ?? 'test_mode') as 'test_mode' | 'live_mode';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId') ?? PRODUCT_ID;
  const coupon = searchParams.get('coupon') ?? undefined;

  if (!productId) {
    return new Response('Missing productId', { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: DODO_ENV,
  });

  const subscription = await client.subscriptions.create({
    billing: { country: 'US' },
    customer: {
      email: user.email!,
      name: (user.user_metadata?.full_name as string) ?? '',
    },
    product_id: productId,
    quantity: 1,
    payment_link: true,
    ...(coupon ? { discount_code: coupon } : {}),
    metadata: {
      userId: user.id,
      email: user.email ?? '',
    },
    return_url: `${BASE_URL}/billing?success=true`,
  });

  if (!subscription.payment_link) {
    return new Response('Failed to create checkout link', { status: 500 });
  }

  redirect(subscription.payment_link);
}
