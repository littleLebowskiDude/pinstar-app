# Fixing Callback URL Issues on Vercel

## The Problem
You updated the callback URL in Supabase, but authentication still isn't working on Vercel.

## The Solution

### Step 1: Add NEXT_PUBLIC_SITE_URL to Vercel
1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add a new environment variable:
   - **Name**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://your-app.vercel.app` (replace with your actual Vercel URL)
   - **Environments**: Check all three (Production, Preview, Development)
4. Click **Save**

### Step 2: Update Supabase Redirect URLs
1. Go to your Supabase project dashboard
2. Navigate to **Authentication → URL Configuration**
3. Update these fields:
   - **Site URL**: `https://your-app.vercel.app` (must match Step 1)
   - **Redirect URLs**: Add these entries:
     ```
     https://your-app.vercel.app/auth/callback
     https://your-app.vercel.app/*
     ```
4. Click **Save**

### Step 3: Redeploy Your Vercel App
1. Go to your Vercel project dashboard
2. Go to **Deployments** tab
3. Click the **...** menu on the latest deployment
4. Click **Redeploy**
5. Make sure "Use existing Build Cache" is **unchecked**
6. Click **Redeploy**

## Testing
1. Once redeployed, visit your Vercel app URL
2. Click **Login**
3. Enter your email
4. Check your email for the magic link
5. Click the link - you should be logged in!

## Common Issues

### "Invalid redirect URL" error
- Make sure NEXT_PUBLIC_SITE_URL in Vercel **exactly matches** the URL in Supabase
- Include `https://` in the URL
- Don't include trailing slashes
- If using a custom domain, use that instead of `.vercel.app`

### Still not working after redeployment
1. Check Vercel logs (Deployments → Click deployment → Runtime Logs)
2. Look for any errors related to Supabase or authentication
3. Make sure all environment variables are set (check VERCEL_ENV_CHECKLIST.md)

### Preview deployments not working
- Preview deployments get different URLs (e.g., `your-app-git-branch-user.vercel.app`)
- You may need to add a wildcard in Supabase:
  ```
  https://*.vercel.app/auth/callback
  ```
- Or set NEXT_PUBLIC_SITE_URL differently for preview environments

## What Changed?
The login page now uses the `NEXT_PUBLIC_SITE_URL` environment variable for the callback URL instead of dynamically detecting it. This ensures:
1. Consistent callback URLs across all environments
2. Better control over redirect URLs
3. Easier debugging and configuration
4. Compliance with Supabase's redirect URL allowlist

## Need More Help?
- See [VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md) for all environment variables
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guide
- Check Supabase and Vercel documentation
