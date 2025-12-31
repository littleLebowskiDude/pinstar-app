-- =====================================================
-- MIGRATION STATUS CHECK
-- =====================================================
-- Run this in Supabase SQL Editor to check what's already applied

-- Check if tables exist
SELECT
  'profiles' as table_name,
  EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'profiles'
  ) as exists
UNION ALL
SELECT
  'boards',
  EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'boards'
  )
UNION ALL
SELECT
  'pins',
  EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'pins'
  )
UNION ALL
SELECT
  'board_pins',
  EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'board_pins'
  );

-- Check if trigger function exists
SELECT
  'create_profile_for_user' as function_name,
  EXISTS (
    SELECT FROM pg_proc
    WHERE proname = 'create_profile_for_user'
  ) as exists;

-- Check if trigger exists
SELECT
  'on_auth_user_created' as trigger_name,
  EXISTS (
    SELECT FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) as exists;

-- Check RLS status
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'boards', 'pins', 'board_pins')
ORDER BY tablename;
