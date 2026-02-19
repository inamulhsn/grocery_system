-- SQL script to create the ActivityLogs table
-- Run this script in your PostgreSQL database to create the table

-- Create the ActivityLogs table
CREATE TABLE IF NOT EXISTS "ActivityLogs" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" TEXT,
    "UserName" TEXT,
    "Action" TEXT,
    "Details" TEXT,
    "Timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add a comment to the table
COMMENT ON TABLE "ActivityLogs" IS 'Stores system activity logs for audit trail';

-- Create an index on Timestamp for faster queries (since we order by Timestamp)
CREATE INDEX IF NOT EXISTS "IX_ActivityLogs_Timestamp" ON "ActivityLogs" ("Timestamp" DESC);

-- Create an index on UserId for filtering by user
CREATE INDEX IF NOT EXISTS "IX_ActivityLogs_UserId" ON "ActivityLogs" ("UserId");

-- Verify the table was created
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ActivityLogs'
ORDER BY ordinal_position;
