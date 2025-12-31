-- =====================================================
-- SIMPLE AUTH CHECK - Run each query ONE AT A TIME
-- =====================================================

-- QUERY 1: Count users in auth.users
-- Copy and run this first:
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- QUERY 2: Count profiles
-- Copy and run this second:
SELECT COUNT(*) as total_profiles FROM profiles;

-- QUERY 3: Find users WITHOUT profiles (THE KEY ONE!)
-- Copy and run this third:
SELECT COUNT(*) as users_missing_profiles
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- QUERY 4: Check if trigger exists
-- Copy and run this fourth:
SELECT
  tgname as trigger_name,
  CASE tgenabled
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    ELSE 'UNKNOWN'
  END as status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- QUERY 5: List users missing profiles (if any)
-- Copy and run this fifth:
SELECT
  au.id,
  au.email,
  au.created_at
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM profiles)
ORDER BY au.created_at DESC;
