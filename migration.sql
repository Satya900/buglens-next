-- ============================================================
--  BugLens — Full Database Migration
--  Run this in Supabase SQL Editor after clearing old tables.
--  Safe to run on a fresh project.
-- ============================================================


-- ============================================================
-- 0. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";


-- ============================================================
-- 0b. DROP EXISTING TRIGGERS & FUNCTIONS (safe re-run)
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS set_updated_at()  CASCADE;
DO $$ BEGIN
  PERFORM cron.unschedule('reset-monthly-usage');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ============================================================
-- 1. PROFILES
--    One row per user. Created automatically on sign-up.
-- ============================================================
CREATE TABLE profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                TEXT,
  full_name            TEXT,
  github_username      TEXT UNIQUE,
  github_token         TEXT,            -- AES-256-GCM encrypted
  avatar_url           TEXT,
  onboarding_completed BOOLEAN     DEFAULT FALSE,
  subscription_tier    TEXT        DEFAULT 'FREE' CHECK (subscription_tier IN ('FREE', 'PRO', 'BUSINESS')),
  current_usage        INTEGER     DEFAULT 0,
  usage_limit          INTEGER     DEFAULT 50,
  last_usage_reset_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile row when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 2. REPOS
--    GitHub repositories connected to BugLens by users.
-- ============================================================
CREATE TABLE repos (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repo_full_name    TEXT        NOT NULL,
  repo_id           BIGINT,
  is_active         BOOLEAN     DEFAULT TRUE,
  shadow_mode       BOOLEAN     DEFAULT TRUE,
  review_strictness TEXT        DEFAULT 'balanced' CHECK (review_strictness IN ('lenient', 'balanced', 'strict')),
  auto_post_reviews BOOLEAN     DEFAULT FALSE,
  total_reviews     INTEGER     DEFAULT 0,
  last_review_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, repo_full_name)
);

CREATE TRIGGER repos_updated_at
  BEFORE UPDATE ON repos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX repos_full_name_idx  ON repos (repo_full_name);
CREATE INDEX repos_user_id_idx    ON repos (user_id);


-- ============================================================
-- 3. REVIEWS
--    AI reviews posted to GitHub PRs.
-- ============================================================
CREATE TABLE reviews (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  repo_full_name TEXT        NOT NULL,
  pr_number      INTEGER,
  pr_title       TEXT,
  pr_author      TEXT,
  pr_url         TEXT,
  merge_decision TEXT        CHECK (merge_decision IN ('APPROVE', 'REQUEST_CHANGES', 'COMMENT')),
  risk_summary   TEXT,
  files_reviewed INTEGER     DEFAULT 0,
  findings_count INTEGER     DEFAULT 0,
  delivery_id    TEXT        UNIQUE,     -- GitHub webhook delivery ID (idempotency)
  gemini_model   TEXT        DEFAULT 'gemini-2.5-flash',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX reviews_user_id_idx      ON reviews (user_id);
CREATE INDEX reviews_repo_pr_idx      ON reviews (repo_full_name, pr_number, created_at DESC);
CREATE INDEX reviews_delivery_id_idx  ON reviews (delivery_id) WHERE delivery_id IS NOT NULL;


-- ============================================================
-- 4. FINDINGS
--    Individual issues found within a review.
-- ============================================================
CREATE TABLE findings (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   UUID           NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  file_path   TEXT,
  line_number INTEGER,
  severity    TEXT           CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
  message     TEXT,
  suggestion  TEXT,
  feedback    TEXT,
  source      TEXT           DEFAULT 'ai',
  category    TEXT,
  rule_id     TEXT,
  confidence  NUMERIC(4, 3),
  created_at  TIMESTAMPTZ    DEFAULT NOW()
);

CREATE INDEX findings_review_id_idx    ON findings (review_id);
CREATE INDEX findings_severity_idx     ON findings (severity);


-- ============================================================
-- 5. SHADOW REVIEWS
--    AI reviews run silently without posting to GitHub.
--    Used when a repo has shadow_mode = TRUE.
-- ============================================================
CREATE TABLE shadow_reviews (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_full_name TEXT        NOT NULL,
  pr_number      INTEGER     NOT NULL,
  pr_title       TEXT,
  pr_author      TEXT,
  pr_url         TEXT,
  merge_decision TEXT,
  risk_summary   TEXT,
  files_reviewed INTEGER     DEFAULT 0,
  findings_count INTEGER     DEFAULT 0,
  findings_json  JSONB,      -- Full findings array for dashboard display
  repo_profile   JSONB,      -- Repo tech profile snapshot
  delivery_id    TEXT,       -- GitHub webhook delivery ID
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX shadow_reviews_repo_pr_idx ON shadow_reviews (repo_full_name, pr_number, created_at DESC);


-- ============================================================
-- 6. BILLING HISTORY
--    One row per payment transaction from Creem.
-- ============================================================
CREATE TABLE billing_history (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id TEXT        UNIQUE NOT NULL,
  amount         TEXT,
  status         TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX billing_history_user_id_idx ON billing_history (user_id);


-- ============================================================
-- 7. LESSONS LEARNED
--    Developer feedback stored for RAG-style AI context.
-- ============================================================
CREATE TABLE lessons_learned (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_full_name TEXT        NOT NULL,
  content        TEXT        NOT NULL,
  rating         INTEGER     DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX lessons_learned_repo_idx ON lessons_learned (repo_full_name);


-- ============================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE repos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons_learned ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "users manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- repos
CREATE POLICY "users manage own repos"
  ON repos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- reviews
CREATE POLICY "users see own reviews"
  ON reviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- findings
CREATE POLICY "users see own findings"
  ON findings FOR ALL
  USING (
    review_id IN (SELECT id FROM reviews WHERE user_id = auth.uid())
  );

-- shadow_reviews
CREATE POLICY "users see own shadow reviews"
  ON shadow_reviews FOR ALL
  USING (
    repo_full_name IN (SELECT repo_full_name FROM repos WHERE user_id = auth.uid())
  );

-- billing_history
CREATE POLICY "users see own billing history"
  ON billing_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- lessons_learned
CREATE POLICY "users manage lessons for their repos"
  ON lessons_learned FOR ALL
  USING (
    repo_full_name IN (SELECT repo_full_name FROM repos WHERE user_id = auth.uid())
  );


-- ============================================================
-- 9. SERVICE ROLE BYPASS
--    buglens-core uses SUPABASE_SERVICE_ROLE_KEY which bypasses
--    RLS by default. No extra config needed — this is a reminder.
--
--    If you ever restrict the service role, add policies like:
--    CREATE POLICY "service role full access" ON reviews
--      FOR ALL USING (auth.role() = 'service_role');
-- ============================================================


-- ============================================================
-- 10. PG_CRON — MONTHLY USAGE RESET
--     Resets FREE tier usage counters at midnight on the 1st.
-- ============================================================
SELECT cron.schedule(
  'reset-monthly-usage',
  '0 0 1 * *',
  $$
    UPDATE profiles
    SET
      current_usage = 0,
      last_usage_reset_at = NOW()
    WHERE subscription_tier = 'FREE';
  $$
);

-- ============================================================
-- DONE.
-- Tables created: profiles, repos, reviews, findings,
--                 shadow_reviews, billing_history, lessons_learned
-- ============================================================
