-- Add RevertedAt column to ActivityLogs (keeps reverted log record, no Revert button)
-- Run in pgAdmin on database grocery_db

ALTER TABLE "ActivityLogs"
  ADD COLUMN IF NOT EXISTS "RevertedAt" TIMESTAMP NULL;

COMMENT ON COLUMN "ActivityLogs"."RevertedAt" IS 'When set, the action was reverted; record kept for audit, Revert button hidden';
