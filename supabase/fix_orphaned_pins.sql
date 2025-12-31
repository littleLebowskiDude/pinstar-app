-- Fix orphaned pins and create the foreign key relationship
-- Run this in your Supabase SQL Editor

-- Step 1: Check for orphaned pins (pins without matching profiles)
-- Uncomment the next line to see orphaned pins
-- SELECT p.* FROM pins p LEFT JOIN profiles pr ON p.created_by = pr.id WHERE pr.id IS NULL;

-- Step 2: Option A - Create missing profiles from auth.users
-- This creates profiles for users who have pins but no profile
INSERT INTO profiles (id, username, display_name, avatar_url, created_at, updated_at)
SELECT DISTINCT
  u.id,
  COALESCE(u.raw_user_meta_data->>'username', 'user_' || substr(u.id::text, 1, 8)),
  COALESCE(u.raw_user_meta_data->>'display_name', u.email),
  COALESCE(u.raw_user_meta_data->>'avatar_url', ''),
  NOW(),
  NOW()
FROM auth.users u
INNER JOIN pins p ON p.created_by = u.id
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Delete any pins that still don't have a matching user in auth.users
-- (These are truly orphaned - no user exists at all)
DELETE FROM pins
WHERE created_by NOT IN (SELECT id FROM auth.users);

-- Step 4: Now add the foreign key constraint
DO $$
BEGIN
  -- Drop the constraint if it exists (to recreate it)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'pins_created_by_fkey'
  ) THEN
    ALTER TABLE pins DROP CONSTRAINT pins_created_by_fkey;
  END IF;

  -- Add the foreign key constraint
  ALTER TABLE pins
  ADD CONSTRAINT pins_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;
END $$;

-- Step 5: Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the fix
SELECT
  'Pins count' as check_type,
  COUNT(*) as count
FROM pins
UNION ALL
SELECT
  'Profiles count' as check_type,
  COUNT(*) as count
FROM profiles
UNION ALL
SELECT
  'Orphaned pins' as check_type,
  COUNT(*) as count
FROM pins p
LEFT JOIN profiles pr ON p.created_by = pr.id
WHERE pr.id IS NULL;
