# Database Migrations

This directory contains database migration scripts for Supabase Postgres.

## Running Migrations

### In Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `001_initial_schema.sql`
4. Paste and execute in the SQL Editor

### Using Supabase CLI

```bash
supabase db reset
supabase migration up
```

## Migration Files

### `001_initial_schema.sql`

Creates the complete database schema including:

- All tables (clients, users, voices, agents, calls, campaigns, etc.)
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for `updated_at` timestamps
- Audit logging triggers
- Helper functions for JWT claims

## Verification

After running migrations, verify:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Test RLS policies
SELECT * FROM clients;  -- Should return rows based on JWT context
```

## Notes

- All tables have RLS enabled by default
- RLS policies filter data by `client_id` from JWT claims
- Agency admins can access all clients
- Regular users can only access their own client's data

