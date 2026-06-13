import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  applyBillingState,
  findProfileForBilling,
  recordBillingHistory,
  getPlanByTier,
} from '@/utils/billing';

const STARTER_PLAN = { tier: 'PRO' as const, usageLimit: 1_000_000 };

// Manual HMAC-SHA256 verification — no SDK timestamp tolerance issues
async function verifyDodoSignature(
  rawBody: string,
  headers: Headers,
  secret: string
): Promise<boolean> {
  try {
    const msgId = headers.get('webhook-id') ?? '';
    const msgTimestamp = headers.get('webhook-timestamp') ?? '';
    const msgSignature = headers.get('webhook-signature') ?? '';

    if (!msgId || !msgTimestamp || !msgSignature) {
      console.warn('[Dodo Webhook] Missing signature headers', { msgId: !!msgId, msgTimestamp: !!msgTimestamp, msgSignature: !!msgSignature });
      return false;
    }

    // Strip whsec_ prefix and decode base64 key
    const keyB64 = secret.startsWith('whsec_') ? secret.slice(6) : secret;
    const keyBytes = Uint8Array.from(atob(keyB64), c => c.charCodeAt(0));

    // Build signed content: msgId.timestamp.rawBody
    const toSign = `${msgId}.${msgTimestamp}.${rawBody}`;
    const encoder = new TextEncoder();

    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(toSign));
    const computedSig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)));

    // Dodo sends: "v1,<sig1> v1,<sig2>" (space separated, multiple possible)
    const valid = msgSignature.split(' ').some(s => {
      const [, sig] = s.split(',');
      return sig === computedSig;
    });

    if (!valid) {
      console.warn('[Dodo Webhook] Signature mismatch', { computed: computedSig, received: msgSignature });
    }
    return valid;
  } catch (err) {
    console.error('[Dodo Webhook] Signature verification error:', err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY!;

  console.log('[Dodo Webhook] Received event');

  // Verify signature
  const isValid = await verifyDodoSignature(rawBody, req.headers, webhookKey);
  if (!isValid) {
    console.error('[Dodo Webhook] Signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType = payload.type as string;
  const data = (payload.data ?? {}) as Record<string, unknown>;
  const metadata = (data.metadata ?? {}) as Record<string, string>;
  const customer = (data.customer ?? {}) as Record<string, string>;

  const userId = metadata.userId;
  const email = customer.email ?? metadata.email;

  console.log(`[Dodo Webhook] Event: ${eventType} | userId: ${userId} | email: ${email}`);

  const supabase = createAdminClient();

  try {
    if (eventType === 'subscription.active' || eventType === 'subscription.renewed') {
      const profile = await findProfileForBilling(supabase, { userId, email });
      if (!profile) {
        console.warn(`[Dodo Webhook] No profile found for userId=${userId} email=${email}`);
        return NextResponse.json({ error: 'Profile not found' }, { status: 200 }); // 200 so Dodo doesn't retry
      }
      await applyBillingState(supabase, profile.id, STARTER_PLAN);
      console.log(`[Dodo Webhook] ✅ Upgraded ${profile.id} to PRO`);
    }

    else if (eventType === 'payment.succeeded') {
      const profile = await findProfileForBilling(supabase, { userId, email });
      if (!profile) return NextResponse.json({ ok: true }, { status: 200 });

      const paymentId = (data.payment_id as string) ?? `dodo_${Date.now()}`;
      const amount = data.amount as number | undefined;

      if (amount && amount > 0) {
        await recordBillingHistory(supabase, {
          userId: profile.id,
          transactionId: paymentId,
          amount: (amount / 100).toFixed(2),
          status: 'paid',
        });
        console.log(`[Dodo Webhook] ✅ Recorded payment $${(amount / 100).toFixed(2)} for ${profile.id}`);
      }
    }

    else if (eventType === 'subscription.cancelled' || eventType === 'subscription.expired') {
      const profile = await findProfileForBilling(supabase, { userId, email });
      if (!profile) return NextResponse.json({ ok: true }, { status: 200 });

      await applyBillingState(supabase, profile.id, getPlanByTier('FREE'));
      console.log(`[Dodo Webhook] ✅ Downgraded ${profile.id} to FREE (${eventType})`);
    }

    else {
      console.log(`[Dodo Webhook] Unhandled event type: ${eventType}`);
    }

  } catch (err) {
    console.error(`[Dodo Webhook] Handler error for ${eventType}:`, err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
