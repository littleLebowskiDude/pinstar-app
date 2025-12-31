# Vercel Environment Variables Checklist

## Copy-Paste Format for Vercel Dashboard

When adding environment variables in Vercel (Project Settings → Environment Variables), use this format:

### Variable 1: NEXT_PUBLIC_SUPABASE_URL
```
your_actual_supabase_url_here
```
**Set for:** Production, Preview, Development

---

### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
your_actual_anon_key_here
```
**Set for:** Production, Preview, Development

---

### Variable 3: SUPABASE_SERVICE_ROLE_KEY
```
your_actual_service_role_key_here
```
**Set for:** Production, Preview, Development
**⚠️ IMPORTANT:** This is a SECRET key - never expose to browser

---

### Variable 4: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
```
your_cloud_name_here
```
**Set for:** Production, Preview, Development

---

### Variable 5: CLOUDINARY_API_KEY
```
your_api_key_here
```
**Set for:** Production, Preview, Development

---

### Variable 6: CLOUDINARY_API_SECRET
```
your_api_secret_here
```
**Set for:** Production, Preview, Development
**⚠️ IMPORTANT:** This is a SECRET - never expose to browser

---

### Variable 7: RESEND_API_KEY
```
re_your_api_key_here
```
**Set for:** Production, Preview, Development
**⚠️ IMPORTANT:** This is a SECRET - never expose to browser

---

### Variable 8: NEXT_PUBLIC_SITE_URL
```
https://your-app.vercel.app
```
**Set for:** Production, Preview, Development
**⚠️ CRITICAL:** This MUST match your actual Vercel deployment URL
- For production: `https://your-app.vercel.app` (or your custom domain)
- For preview: Can use the same or leave blank to use Vercel's preview URLs
- For development: Can use `http://localhost:3000` or leave blank

**Why this matters:** This URL is used for authentication callbacks. If it doesn't match what's configured in Supabase, login will fail.

---

## Quick Reference

### Variables Exposed to Browser (NEXT_PUBLIC_)
These are safe to see in the browser:
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
4. `NEXT_PUBLIC_SITE_URL`

### Server-Only Variables (NO NEXT_PUBLIC_)
These should NEVER be exposed to the browser:
1. `SUPABASE_SERVICE_ROLE_KEY` - Full database access
2. `CLOUDINARY_API_KEY` - Cloudinary authentication
3. `CLOUDINARY_API_SECRET` - Cloudinary secret key
4. `RESEND_API_KEY` - Email API access

## Post-Deployment Steps

After adding all variables and deploying:

1. **Update Supabase Redirect URLs** ⚠️ CRITICAL
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - **Site URL**: Set to `https://your-app.vercel.app` (MUST match NEXT_PUBLIC_SITE_URL)
   - **Redirect URLs**: Add these:
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/*`
   - **IMPORTANT**: The callback URL in Supabase MUST match the URL you set in NEXT_PUBLIC_SITE_URL
   - If you have a custom domain, use that instead of the .vercel.app URL

2. **Apply Database Migrations**
   ```bash
   npx supabase link --project-ref your_project_ref
   npx supabase db push
   ```

3. **Test the Application**
   - Try logging in with magic link
   - Upload a test image
   - Create a test board
   - Verify all features work

## Troubleshooting

### "Environment variable not found" error
- Make sure variable names match exactly (including case)
- Redeploy after adding variables
- Check that variables are set for the correct environments

### Authentication not working
- Verify Supabase URL and keys are correct
- **Check NEXT_PUBLIC_SITE_URL matches your Vercel deployment URL**
- Check redirect URLs in Supabase match NEXT_PUBLIC_SITE_URL
- Ensure email service is configured in Supabase
- If you get "Invalid redirect URL" error:
  1. Go to Vercel → Your Project → Settings → Environment Variables
  2. Check the value of NEXT_PUBLIC_SITE_URL (e.g., `https://your-app.vercel.app`)
  3. Go to Supabase → Authentication → URL Configuration
  4. Add that exact URL + `/auth/callback` to Redirect URLs
  5. Redeploy your Vercel app after making changes

### Images won't upload
- Verify all Cloudinary credentials are correct
- Check browser console for CORS errors
- Ensure Cloudinary domain is in next.config.ts

---

**Need help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide.
