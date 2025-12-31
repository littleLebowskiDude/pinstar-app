-- =====================================================
-- CHECK AUTH AND PROFILE STATUS
-- =====================================================
-- Run this to diagnose login/profile issues

-- Check 1: Count users in auth.users
SELECT
  'Total users in auth.users' as metric,
  COUNT(*) as count
FROM auth.users;

-- Check 2: Count profiles
SELECT
  'Total profiles' as metric,
  COUNT(*) as count
FROM profiles;

-- Check 3: Find users WITHOUT profiles (the problem!)
SELECT
  'Users WITHOUT profiles' as metric,
  COUNT(*) as count
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- Check 4: List users without profiles
SELECT
  au.id,
  au.email,
  au.created_at as user_created_at,
  au.raw_user_meta_data
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM profiles)
ORDER BY au.created_at DESC;

-- Check 5: Check if trigger exists and is enabled
SELECT
  t.tgname as trigger_name,
  c.relname as table_name,
  n.nspname as schema_name,
  p.proname as function_name,
  CASE t.tgenabled
    WHEN 'O' THEN 'Enabled ✓'
    WHEN 'D' THEN 'Disabled ✗'
    ELSE 'Unknown'
  END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'on_auth_user_created';

-- Check 6: Verify RLS policies on profiles
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Check 7: Recent profiles created (with user email)
SELECT
  p.id,
  p.username,
  p.display_name,
  au.email,
  p.created_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC
LIMIT 5;
