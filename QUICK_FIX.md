# Quick Fix for Authentication Error

## The Problem

You're seeing: **"Database error saving new user"**

The `profiles` table exists, but the **trigger** that auto-creates profiles is missing.

## The Solution (2 minutes)

### 1. Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/nvvzvymwynhikubxcdtd/sql

### 2. Run the Fix Migration

Copy and paste this entire file into the SQL editor:
**`supabase/migrations/002_fix_missing_parts.sql`**

Then click **RUN**.

### 3. Test Authentication

1. Go to http://localhost:3000/login
2. Enter your email
3. Click "Send magic link"
4. It should now work! ✅

## What This Does

The migration safely:
- ✅ Creates missing tables (boards, pins, board_pins)
- ✅ Creates the critical auth trigger ⭐
- ✅ Adds all RLS policies
- ✅ Skips anything that already exists (safe to run multiple times)

## Still Not Working?

### Check Email Configuration

After the migration, you still need to configure email:

1. **Enable Email Provider**:
   - Auth → Providers → Email → Toggle ON

2. **Add Redirect URL**:
   - Auth → URL Configuration
   - Add: `http://localhost:3000/auth/callback`

3. **Disable "Confirm Email"** (for development):
   - Auth → Providers → Email
   - Turn OFF "Confirm email"
   - (You can enable this later with SMTP)

## Verify It Worked

Run this query in SQL Editor to check:

```sql
-- Check if trigger exists
SELECT EXISTS (
  SELECT FROM pg_trigger
  WHERE tgname = 'on_auth_user_created'
) as trigger_exists;
```

Should return: `true` ✅

---

**That's it!** Authentication should now work perfectly.

For detailed info, see: [APPLY_MIGRATION.md](APPLY_MIGRATION.md)
