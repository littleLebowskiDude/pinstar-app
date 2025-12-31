# Supabase Setup Guide

## Required Configuration for Magic Link Authentication

The 500 error you're seeing is because Supabase email authentication needs to be properly configured. Follow these steps:

### 1. Configure Email Authentication

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `nvvzvymwynhikubxcdtd`
3. Navigate to **Authentication** → **Providers**
4. Find **Email** provider and click to configure

### 2. Enable Email Provider

Make sure the following settings are configured:

- ✓ **Enable Email provider** - Turn this ON
- ✓ **Confirm email** - You can turn this OFF for development (turn ON for production)
- ✓ **Secure email change** - Recommended for production

### 3. Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add these URLs to **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (for local development)
   - Your production URL when you deploy (e.g., `https://yourdomain.com/auth/callback`)

### 4. Configure Email Templates (Optional but Recommended)

1. Go to **Authentication** → **Email Templates**
2. Find **Magic Link** template
3. Customize if needed, or use the default

The default template includes a link like:
```
{{ .ConfirmationURL }}
```

This will automatically include your redirect URL.

### 5. SMTP Configuration (Important!)

**For Development:**
Supabase provides a built-in email service for development, but it has rate limits and may not work reliably. You might see errors if you hit these limits.

**For Production (Recommended):**
Configure your own SMTP server:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Enable **Enable Custom SMTP**
3. Configure your SMTP provider (Resend, SendGrid, etc.)

#### Using Resend (You already have an API key):

Since you have a Resend API key in your `.env.local`, you can use Resend's SMTP:

- **Host**: `smtp.resend.com`
- **Port**: `465` or `587`
- **Username**: `resend`
- **Password**: Your Resend API key (`re_ZS5G4JmA_MnesMcXd5roUfGKSJsJ898Ua`)
- **Sender email**: A verified email address in Resend
- **Sender name**: Your app name (e.g., "Pinboard App")

### 6. Run the Database Migration

Apply the database schema:

1. Copy the contents of `supabase/migrations/001_initial_schema.sql`
2. Go to **SQL Editor** in your Supabase dashboard
3. Paste and run the migration

Or use Supabase CLI:
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref nvvzvymwynhikubxcdtd

# Push migrations
supabase db push
```

### 7. Test the Setup

1. Try logging in again at http://localhost:3000/login
2. Enter your email address
3. Check your email inbox (and spam folder)
4. Click the magic link
5. You should be redirected to the home page, logged in

### Common Issues

**Issue: Still getting 500 error**
- Check that Email provider is enabled in Supabase
- Verify SMTP is configured (or use Supabase's default for testing)
- Check Supabase logs: Dashboard → Logs → Auth Logs

**Issue: Not receiving emails**
- Check spam folder
- Verify sender email is configured
- Use custom SMTP instead of Supabase default
- Check Supabase Auth logs for delivery status

**Issue: Redirect not working**
- Verify `http://localhost:3000/auth/callback` is in Redirect URLs
- Check browser console for errors
- Verify the callback route exists at `src/app/(auth)/auth/callback/route.ts`

### Environment Variables Checklist

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://nvvzvymwynhikubxcdtd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_6lDMZGJNCSLdGF1WIC1ZsQ_DpenYCkG
```

### Next Steps After Setup

Once authentication is working:

1. Test the protected routes (`/boards`, `/pins`)
2. Test logout functionality
3. Apply the database migration
4. Start building your boards and pins features

---

## Quick Fix for Development

If you just want to test quickly without email:

1. In Supabase Dashboard → Authentication → Settings
2. Disable "Confirm email"
3. This allows users to sign in without clicking the magic link (development only!)

Note: This is NOT recommended for production.
