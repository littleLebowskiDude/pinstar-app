# Apply Database Migration

## The Error You're Seeing

```
AuthApiError: Database error saving new user
```

This happens because the database migration hasn't been fully applied. The trigger that auto-creates profiles is missing.

## Quick Fix - Apply Migration via Supabase Dashboard

### Important: If you see "relation already exists" error

If the `profiles` table already exists but you're still getting the authentication error, it means the migration was partially applied. Use the **002_fix_missing_parts.sql** migration instead, which safely adds only the missing pieces.

### Step 1: Choose the Right Migration File

- **If starting fresh**: Use `supabase/migrations/001_initial_schema.sql`
- **If profiles table exists**: Use `supabase/migrations/002_fix_missing_parts.sql` ⭐ (This is you!)

### Step 2: Apply via Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/nvvzvymwynhikubxcdtd

2. Click on **SQL Editor** in the left sidebar

3. Click **New Query**

4. Copy the entire contents of `supabase/migrations/002_fix_missing_parts.sql`

5. Paste it into the SQL editor

6. Click **Run** (or press Ctrl+Enter)

7. You should see success messages for:
   - Extensions enabled (uuid-ossp, pg_trgm)
   - Missing tables created (boards, pins, board_pins)
   - Indexes created
   - Triggers created ⭐ (This fixes the auth error!)
   - RLS policies enabled

### Step 3: Verify the Migration

After running the migration, verify it worked:

1. In Supabase Dashboard, go to **Database** → **Tables**
2. You should see 4 new tables:
   - `profiles`
   - `boards`
   - `pins`
   - `board_pins`

### Step 4: Enable Email Authentication

Now that the database is set up, configure email auth:

1. Go to **Authentication** → **Providers**
2. Find **Email** and click to configure
3. Make sure it's **enabled**
4. Disable "Confirm email" for now (you can enable it later when SMTP is configured)
5. Save changes

### Step 5: Add Redirect URL

1. Go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   ```
   http://localhost:3000/auth/callback
   ```
3. Save changes

### Step 6: Test Authentication

1. Go to http://localhost:3000/login
2. Enter your email address
3. Click "Send magic link"
4. Check your email (Supabase will send from `noreply@mail.app.supabase.io`)
5. Click the magic link
6. You should be redirected to the home page, logged in!

## Alternative: Using Supabase CLI (Advanced)

If you prefer using the CLI:

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref nvvzvymwynhikubxcdtd

# Push the migration
supabase db push
```

## Troubleshooting

### Error: "relation already exists"

If you see errors about tables already existing:
- The migration has already been partially applied
- You can either:
  - Drop the existing tables and re-run (use with caution!)
  - Or manually add only the missing parts

### Error: "permission denied"

- Make sure you're logged into the correct Supabase account
- Verify you have admin access to the project

### Still getting "Database error saving new user"

1. Check that the `profiles` table exists in Database → Tables
2. Check that the trigger `on_auth_user_created` exists
3. Go to Database → Functions and verify `create_profile_for_user` exists
4. Check Database Logs for more specific errors

### SMTP / Email Issues

If authentication works but emails aren't being sent:
- Supabase's development email service has rate limits
- For reliable email delivery, configure SMTP (see SUPABASE_SETUP.md)
- Or use Resend SMTP with your existing API key

## Expected Result

After completing these steps:

1. ✅ Database tables created
2. ✅ RLS policies active
3. ✅ Email authentication enabled
4. ✅ Users can sign up with magic links
5. ✅ Profiles automatically created on signup
6. ✅ Protected routes work correctly

## Next Steps

Once authentication is working:
- Build the boards feature
- Build the pins feature
- Add image upload with Cloudinary
- Create the masonry layout
- Add search functionality

---

Need help? Check the Supabase logs at: https://supabase.com/dashboard/project/nvvzvymwynhikubxcdtd/logs/edge-logs
