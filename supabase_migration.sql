-- Run this in your Supabase SQL Editor to set up the database schema

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username TEXT; -- 🚀 Used for multi-tenant linking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Billing-related Columns: Unifying with Dashboard Logic
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'FREE';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_usage INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_limit INTEGER DEFAULT 50;

-- 3. Billing History Table
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id TEXT,
  amount TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Repo review controls & Stats
ALTER TABLE repos ADD COLUMN IF NOT EXISTS shadow_mode BOOLEAN DEFAULT TRUE;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS review_strictness TEXT DEFAULT 'balanced';
ALTER TABLE repos ADD COLUMN IF NOT EXISTS auto_post_reviews BOOLEAN DEFAULT FALSE;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS last_review_at TIMESTAMPTZ;

-- 5. Shadow review storage for safe rollout
CREATE TABLE IF NOT EXISTS shadow_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_full_name TEXT NOT NULL,
  pr_number INTEGER NOT NULL,
  pr_title TEXT,
  pr_author TEXT,
  pr_url TEXT,
  merge_decision TEXT,
  risk_summary TEXT,
  files_reviewed INTEGER DEFAULT 0,
  findings_count INTEGER DEFAULT 0,
  repo_profile JSONB,
  findings_json JSONB,
  delivery_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Production reviews table (queried by Dashboard)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  repo_full_name TEXT NOT NULL,
  pr_number INTEGER,
  pr_title TEXT,
  pr_author TEXT,
  pr_url TEXT,
  merge_decision TEXT,
  risk_summary TEXT,
  files_reviewed INTEGER DEFAULT 0,
  findings_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  kind TEXT DEFAULT 'posted'
);

-- 7. Findings (Individual issues within a review)
CREATE TABLE IF NOT EXISTS findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  file_path TEXT,
  line_number INTEGER,
  severity TEXT CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
  message TEXT,
  suggestion TEXT,
  feedback TEXT,
  source TEXT DEFAULT 'ai',
  category TEXT,
  rule_id TEXT,
  confidence NUMERIC(4, 3),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS shadow_reviews_repo_pr_idx
  ON shadow_reviews (repo_full_name, pr_number, created_at DESC);
CREATE INDEX IF NOT EXISTS findings_review_id_idx ON findings (review_id);

-- Ensure RLS is enabled
ALTER TABLE shadow_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;

-- 🛡️ Idempotent Policies
DROP POLICY IF EXISTS "users see own shadow reviews" ON shadow_reviews;
CREATE POLICY "users see own shadow reviews" ON shadow_reviews
FOR ALL USING (
  repo_full_name IN (SELECT repo_full_name FROM repos WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "users see own reviews" ON reviews;
CREATE POLICY "users see own reviews" ON reviews
FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users see own findings" ON findings;
CREATE POLICY "users see own findings" ON findings
FOR ALL USING (
  review_id IN (SELECT id FROM reviews WHERE user_id = auth.uid())
);
