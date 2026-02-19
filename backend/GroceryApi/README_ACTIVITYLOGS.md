# ActivityLogs Table Setup

## Option 1: Run SQL Script Directly (Recommended)

1. Connect to your PostgreSQL database:
   ```bash
   psql -h localhost -p 5432 -U postgres -d grocery_db
   ```
   (Password: 123)

2. Run the SQL script:
   ```sql
   \i create_activitylogs_table.sql
   ```
   
   Or copy and paste the contents of `create_activitylogs_table.sql` into your PostgreSQL client.

## Option 2: Use Entity Framework Migration

If you have network access and can restore NuGet packages:

```bash
cd backend/GroceryApi
dotnet ef database update
```

This will apply all pending migrations including the ActivityLogs table.

## Option 3: Manual SQL Execution

If you're using pgAdmin or another PostgreSQL client:

1. Open your PostgreSQL client
2. Connect to the `grocery_db` database
3. Copy and paste the SQL from `create_activitylogs_table.sql`
4. Execute the script

## Revert support (undo actions)

To allow reverting activity log entries (undo the action, not just remove the log), add these columns:

```bash
psql -h localhost -p 5432 -U postgres -d grocery_db -f add_activitylogs_revert_columns.sql
```

Or run the SQL in `add_activitylogs_revert_columns.sql` (adds `EntityType`, `EntityId`, `RevertPayload`).

## Verify Table Creation

After running the script, verify the table exists:

```sql
SELECT * FROM "ActivityLogs" LIMIT 1;
```

If this runs without error, the table was created successfully!

## Table Structure

The ActivityLogs table has the following columns:
- `Id` (integer, primary key, auto-increment)
- `UserId` (text, nullable)
- `UserName` (text, nullable)
- `Action` (text, nullable) - e.g., "PRODUCT_CREATE", "USER_UPDATE"
- `Details` (text, nullable) - Description of the action
- `Timestamp` (timestamp, not null, defaults to current time)

Indexes are created on:
- `Timestamp` (descending) - for fast ordering
- `UserId` - for filtering by user
