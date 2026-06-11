-- Run this in Supabase SQL Editor

-- 1. Change default usage_limit from 50 to 10 for new FREE users
ALTER TABLE profiles ALTER COLUMN usage_limit SET DEFAULT 10;

-- 2. Update all existing FREE users who still have the old 50 limit
UPDATE profiles
SET usage_limit = 10
WHERE subscription_tier = 'FREE' AND usage_limit = 50;

-- 3. OSS applications table
CREATE TABLE IF NOT EXISTS oss_applications (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  github_username   TEXT        NOT NULL,
  email             TEXT        NOT NULL,

  -- Project info
  repo_url          TEXT        NOT NULL,
  repo_name         TEXT        NOT NULL,
  repo_description  TEXT,
  license           TEXT        NOT NULL,
  stars             INTEGER     DEFAULT 0,
  is_primary_project BOOLEAN   DEFAULT true,

  -- Applicant info
  role_in_project   TEXT        NOT NULL CHECK (role_in_project IN ('owner', 'maintainer', 'contributor')),
  use_case          TEXT        NOT NULL,

  -- Eligibility confirmations (stored as boolean flags)
  confirm_public    BOOLEAN     NOT NULL DEFAULT false,
  confirm_license   BOOLEAN     NOT NULL DEFAULT false,
  confirm_not_course BOOLEAN   NOT NULL DEFAULT false,
  confirm_active    BOOLEAN     NOT NULL DEFAULT false,

  -- Status
  status            TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason  TEXT,
  reviewed_by       TEXT,
  reviewed_at       TIMESTAMPTZ,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent duplicate applications per user
CREATE UNIQUE INDEX IF NOT EXISTS oss_applications_user_unique
  ON oss_applications(user_id)
  WHERE status IN ('pending', 'approved');

-- RLS
ALTER TABLE oss_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own application"
  ON oss_applications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own application"
  ON oss_applications FOR SELECT
  USING (user_id = auth.uid());
