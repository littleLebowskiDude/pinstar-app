-- =====================================================
-- FIX: Create the auth trigger only
-- =====================================================
-- This is the critical piece that fixes "Database error saving new user"

-- Step 1: Create or replace the function
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop the trigger if it exists (to recreate it fresh)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- Verify the trigger was created
SELECT
  'Trigger created successfully!' as status,
  tgname as trigger_name,
  CASE tgenabled
    WHEN 'O' THEN 'Enabled'
    ELSE 'Disabled'
  END as enabled_status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
