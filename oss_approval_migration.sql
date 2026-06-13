-- OSS Approval Flow migration
-- Run this in Supabase SQL editor

ALTER TABLE oss_applications
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS approved_by text; -- admin email who approved
