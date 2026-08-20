import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  applyBillingState,
  findProfileForBilling,
  recordBillingHistory,
  getPlanByTier,
} from '@/utils/billing';

const STARTER_PLAN = { tier: 'PRO' as const, usageLimit: 1_000_000 };
const MAX_WEBHOOK_AGE_SECONDS = 300;

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function isTimestampFresh(msgTimestamp: string): boolean {
  const ts = Number(msgTimestamp);
  if (!Number.isFinite(ts)) return false;
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - ts);
  return ageSeconds <= MAX_WEBHOOK_AGE_SECONDS;
}

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
      console.warn('[Dodo Webhook] Missing signature headers', {
        msgId: !!msgId,
        msgTimestamp: !!msgTimestamp,
        msgSignature: !!msgSignature,
      });
      return false;
    }

    if (!isTimestampFresh(msgTimestamp)) {
      console.warn('[Dodo Webhook] Timestamp outside allowed window', { msgTimestamp });
      return false;
    }

    const keyB64 = secret.startsWith('whsec_') ? secret.slice(6) : secret;
    const keyBytes = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));

    const toSign = `${msgId}.${msgTimestamp}.${rawBody}`;
    const encoder = new TextEncoder();

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(toSign));
    const computedSig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)));

    const valid = msgSignature.split(' ').some((entry) => {
      const [, sig] = entry.split(',');
      return typeof sig === 'string' && timingSafeEqualString(sig, computedSig);
    });

    if (!valid) {
      console.warn('[Dodo Webhook] Signature mismatch');
    }
    return valid;
  } catch (err) {
    console.error('[Dodo Webhook] Signature verification error:', err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;

  if (!webhookKey) {
    console.error('[Dodo Webhook] DODO_PAYMENTS_WEBHOOK_KEY is not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  console.log('[Dodo Webhook] Received event');

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
        return NextResponse.json({ error: 'Profile not found' }, { status: 200 });
      }
      await applyBillingState(supabase, profile.id, STARTER_PLAN);
      console.log(`[Dodo Webhook] Upgraded ${profile.id} to PRO`);
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
        console.log(`[Dodo Webhook] Recorded payment $${(amount / 100).toFixed(2)} for ${profile.id}`);
      }
    }

    else if (eventType === 'subscription.cancelled' || eventType === 'subscription.expired') {
      const profile = await findProfileForBilling(supabase, { userId, email });
      if (!profile) return NextResponse.json({ ok: true }, { status: 200 });

      await applyBillingState(supabase, profile.id, getPlanByTier('FREE'));
      console.log(`[Dodo Webhook] Downgraded ${profile.id} to FREE (${eventType})`);
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
