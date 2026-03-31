-- Run this in your Supabase SQL Editor to set up the database schema

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username TEXT; -- 🚀 Used for multi-tenant linking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Billing-related Columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT 'Free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_limit INTEGER DEFAULT 5000;

-- 3. Billing History Table
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id TEXT,
  amount TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Repo review controls
ALTER TABLE repos ADD COLUMN IF NOT EXISTS shadow_mode BOOLEAN DEFAULT TRUE;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS review_strictness TEXT DEFAULT 'balanced';
ALTER TABLE repos ADD COLUMN IF NOT EXISTS auto_post_reviews BOOLEAN DEFAULT FALSE;

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

CREATE INDEX IF NOT EXISTS shadow_reviews_repo_pr_idx
  ON shadow_reviews (repo_full_name, pr_number, created_at DESC);

ALTER TABLE shadow_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own shadow reviews" ON shadow_reviews
FOR ALL USING (
  repo_full_name IN (SELECT repo_full_name FROM repos WHERE user_id = auth.uid())
);
