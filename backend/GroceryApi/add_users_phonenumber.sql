-- Add PhoneNumber column to Users table (for admin/staff contact, e.g. SMS alerts).
-- Run this in pgAdmin (or psql) if your database was created before this column existed.

ALTER TABLE "Users"
ADD COLUMN IF NOT EXISTS "PhoneNumber" TEXT;

COMMENT ON COLUMN "Users"."PhoneNumber" IS 'Admin/staff contact number (e.g. for SMS alerts).';
