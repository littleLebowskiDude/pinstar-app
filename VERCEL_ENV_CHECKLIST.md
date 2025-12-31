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

## Quick Reference

### Variables Exposed to Browser (NEXT_PUBLIC_)
These are safe to see in the browser:
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

### Server-Only Variables (NO NEXT_PUBLIC_)
These should NEVER be exposed to the browser:
1. `SUPABASE_SERVICE_ROLE_KEY` - Full database access
2. `CLOUDINARY_API_KEY` - Cloudinary authentication
3. `CLOUDINARY_API_SECRET` - Cloudinary secret key
4. `RESEND_API_KEY` - Email API access

## Post-Deployment Steps

After adding all variables and deploying:

1. **Update Supabase Redirect URLs**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add: `https://your-app.vercel.app/auth/callback`
   - Add: `https://your-app.vercel.app/*`
   - Set Site URL: `https://your-app.vercel.app`

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
- Check redirect URLs in Supabase match your domain
- Ensure email service is configured in Supabase

### Images won't upload
- Verify all Cloudinary credentials are correct
- Check browser console for CORS errors
- Ensure Cloudinary domain is in next.config.ts

---

**Need help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide.
