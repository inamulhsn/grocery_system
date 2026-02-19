-- Add columns to ActivityLogs for revert support
-- Run this if the table already exists without these columns

ALTER TABLE "ActivityLogs"
  ADD COLUMN IF NOT EXISTS "EntityType" TEXT,
  ADD COLUMN IF NOT EXISTS "EntityId" TEXT,
  ADD COLUMN IF NOT EXISTS "RevertPayload" TEXT;

COMMENT ON COLUMN "ActivityLogs"."EntityType" IS 'Product, Sale, User, SystemSettings';
COMMENT ON COLUMN "ActivityLogs"."EntityId" IS 'Id of the entity for revert lookup';
COMMENT ON COLUMN "ActivityLogs"."RevertPayload" IS 'JSON snapshot to restore (e.g. deleted product)';
