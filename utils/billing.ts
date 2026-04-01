import type { SupabaseClient } from "@supabase/supabase-js";

type BillingTier = "FREE" | "PRO" | "BUSINESS";

type BillingPlan = {
  tier: BillingTier;
  usageLimit: number;
};

type BillingIdentity = {
  userId?: string;
  externalCustomerId?: string;
  email?: string;
};

const BILLING_PLANS: Record<BillingTier, BillingPlan> = {
  FREE: { tier: "FREE", usageLimit: 50 },
  PRO: { tier: "PRO", usageLimit: 1_000_000 },
  BUSINESS: { tier: "BUSINESS", usageLimit: 10_000_000 },
};

function normalizeString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function getMetadataValue(value: unknown, key: string) {
  const record = getRecord(value);
  const direct = record[key];

  if (
    direct &&
    typeof direct === "object" &&
    "value" in direct &&
    typeof (direct as { value?: unknown }).value === "string"
  ) {
    return normalizeString((direct as { value?: unknown }).value);
  }

  return normalizeString(direct);
}

function getProductHints(payload: unknown) {
  const source = getRecord(payload);
  const product = getRecord(source.product);
  const metadata = getRecord(source.metadata);

  const hints = [
    normalizeString(product.id),
    normalizeString(product.name),
    getMetadataValue(metadata, "plan"),
    getMetadataValue(metadata, "tier"),
    getMetadataValue(product.metadata, "plan"),
    getMetadataValue(product.metadata, "tier"),
  ].filter(Boolean) as string[];

  return hints.map((hint) => hint.toUpperCase());
}

export function getPolarServer() {
  if (process.env.POLAR_SERVER === "sandbox") {
    return "sandbox" as const;
  }

  return process.env.NODE_ENV === "production" ? ("production" as const) : ("sandbox" as const);
}

export function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSiteUrl() {
  return requireEnv("NEXT_PUBLIC_SITE_URL").replace(/\/+$/, "");
}

export function getPlanByTier(tier: BillingTier) {
  return BILLING_PLANS[tier];
}

export function resolvePlanFromPayload(payload: unknown) {
  const productHints = getProductHints(payload);
  const configuredBusinessId = normalizeString(process.env.NEXT_PUBLIC_POLAR_BUSINESS_PRODUCT_ID);
  const configuredProId = normalizeString(process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID);

  for (const hint of productHints) {
    if (configuredBusinessId && hint === configuredBusinessId.toUpperCase()) {
      return BILLING_PLANS.BUSINESS;
    }

    if (configuredProId && hint === configuredProId.toUpperCase()) {
      return BILLING_PLANS.PRO;
    }

    if (hint.includes("BUSINESS") || hint.includes("TEAM")) {
      return BILLING_PLANS.BUSINESS;
    }

    if (hint.includes("PRO") || hint.includes("BUGLENS_PRO")) {
      return BILLING_PLANS.PRO;
    }
  }

  return BILLING_PLANS.PRO;
}

export function resolveBillingIdentity(payload: unknown): BillingIdentity {
  const source = getRecord(payload);
  const customer = getRecord(source.customer);
  const customerMetadata = getRecord(customer.metadata);
  const metadata = getRecord(source.metadata);

  const userId =
    getMetadataValue(customerMetadata, "user_id") ??
    getMetadataValue(metadata, "user_id");
  const externalCustomerId =
    normalizeString(customer.externalId) ??
    normalizeString(customer.external_id) ??
    normalizeString(source.externalCustomerId) ??
    normalizeString(source.external_customer_id);
  const email =
    normalizeString(customer.email) ??
    normalizeString(source.email) ??
    getMetadataValue(metadata, "email");

  return {
    userId,
    externalCustomerId,
    email: email?.toLowerCase(),
  };
}

export async function findProfileForBilling(
  supabase: SupabaseClient,
  identity: BillingIdentity
) {
  if (identity.userId) {
    const result = await supabase
      .from("profiles")
      .select("id, email, github_username, subscription_tier, current_usage, usage_limit")
      .eq("id", identity.userId)
      .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    if (result.data) {
      return result.data;
    }
  }

  if (identity.externalCustomerId) {
    const result = await supabase
      .from("profiles")
      .select("id, email, github_username, subscription_tier, current_usage, usage_limit")
      .eq("id", identity.externalCustomerId)
      .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    if (result.data) {
      return result.data;
    }
  }

  if (identity.email) {
    const result = await supabase
      .from("profiles")
      .select("id, email, github_username, subscription_tier, current_usage, usage_limit")
      .ilike("email", identity.email)
      .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    if (result.data) {
      return result.data;
    }
  }

  return null;
}

export async function applyBillingState(
  supabase: SupabaseClient,
  userId: string,
  plan: BillingPlan
) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      subscription_tier: plan.tier,
      usage_limit: plan.usageLimit,
      current_usage: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id, subscription_tier, current_usage, usage_limit, github_username")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function recordBillingHistory(
  supabase: SupabaseClient,
  input: {
    userId: string;
    transactionId: string;
    amount: string;
    status: string;
  }
) {
  const existing = await supabase
    .from("billing_history")
    .select("id")
    .eq("transaction_id", input.transactionId)
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  if (existing.data) {
    return existing.data;
  }

  const { data, error } = await supabase
    .from("billing_history")
    .insert({
      user_id: input.userId,
      transaction_id: input.transactionId,
      amount: input.amount,
      status: input.status,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export function formatPolarAmount(amountInCents: number | null | undefined) {
  if (typeof amountInCents !== "number" || Number.isNaN(amountInCents)) {
    return "0.00";
  }

  return (amountInCents / 100).toFixed(2);
}
