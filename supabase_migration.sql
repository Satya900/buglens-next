-- Run this in your Supabase SQL Editor to set up the database schema

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Billing-related columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'FREE';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_usage INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_limit INTEGER DEFAULT 50;

-- Billing history
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id TEXT,
  amount TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE billing_history ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE billing_history ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE billing_history ADD COLUMN IF NOT EXISTS amount TEXT;
ALTER TABLE billing_history ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE billing_history ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Repo review controls and stats
ALTER TABLE repos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS repo_full_name TEXT;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS repo_id BIGINT;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS shadow_mode BOOLEAN DEFAULT TRUE;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS review_strictness TEXT DEFAULT 'balanced';
ALTER TABLE repos ADD COLUMN IF NOT EXISTS auto_post_reviews BOOLEAN DEFAULT FALSE;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS last_review_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS repos_user_id_repo_full_name_idx
  ON repos (user_id, repo_full_name)
  WHERE user_id IS NOT NULL AND repo_full_name IS NOT NULL;

-- Shadow review storage
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

-- Production reviews table
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
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS repo_full_name TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS pr_number INTEGER;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS pr_title TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS pr_author TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS pr_url TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS merge_decision TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS risk_summary TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS files_reviewed INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS findings_count INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS kind TEXT DEFAULT 'posted';

-- Findings
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

CREATE UNIQUE INDEX IF NOT EXISTS billing_history_transaction_id_idx
  ON billing_history (transaction_id)
  WHERE transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS shadow_reviews_repo_pr_idx
  ON shadow_reviews (repo_full_name, pr_number, created_at DESC);
CREATE INDEX IF NOT EXISTS findings_review_id_idx ON findings (review_id);

-- Enable RLS
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "users see own billing history" ON billing_history;
CREATE POLICY "users see own billing history" ON billing_history
FOR SELECT USING (user_id = auth.uid());

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
 
 -- Lessons Learned for AI Shadow Learning
 CREATE TABLE IF NOT EXISTS lessons_learned (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   repo_full_name TEXT NOT NULL,
   content TEXT NOT NULL,
   rating INTEGER DEFAULT 0, -- Positive for good feedback, negative for correction
   created_at TIMESTAMPTZ DEFAULT NOW()
 );
 
 ALTER TABLE lessons_learned ENABLE ROW LEVEL SECURITY;
 CREATE POLICY "users see lessons for their repos" ON lessons_learned
 FOR SELECT USING (
   repo_full_name IN (SELECT repo_full_name FROM repos WHERE user_id = auth.uid())
 );
