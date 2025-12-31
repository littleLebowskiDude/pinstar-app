-- =====================================================
-- FIX PROFILE CREATION TRIGGER
-- =====================================================
-- This fixes the profile creation to handle username conflicts
-- and ensures profiles are created properly for new users

-- Step 1: Drop the old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Create improved trigger function with better conflict handling
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  new_username TEXT;
  username_suffix INTEGER := 0;
BEGIN
  -- Generate base username
  new_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'user_' || substr(NEW.id::text, 1, 8)
  );

  -- Handle username conflicts by adding a suffix
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = new_username) LOOP
    username_suffix := username_suffix + 1;
    new_username := COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || substr(NEW.id::text, 1, 8)
    ) || '_' || username_suffix;
  END LOOP;

  -- Insert the profile
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    new_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- Step 4: Verify the trigger was created
SELECT
  'Trigger: ' || tgname as info,
  'Status: ' ||
  CASE tgenabled
    WHEN 'O' THEN 'Enabled'
    ELSE 'Disabled'
  END as status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Step 5: Create profiles for any existing users that don't have one
DO $$
DECLARE
  user_record RECORD;
  new_username TEXT;
  username_suffix INTEGER;
BEGIN
  FOR user_record IN
    SELECT id, email, raw_user_meta_data
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM profiles)
  LOOP
    -- Generate base username
    new_username := COALESCE(
      user_record.raw_user_meta_data->>'username',
      'user_' || substr(user_record.id::text, 1, 8)
    );

    username_suffix := 0;

    -- Handle username conflicts
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = new_username) LOOP
      username_suffix := username_suffix + 1;
      new_username := COALESCE(
        user_record.raw_user_meta_data->>'username',
        'user_' || substr(user_record.id::text, 1, 8)
      ) || '_' || username_suffix;
    END LOOP;

    -- Insert profile
    INSERT INTO profiles (id, username, display_name, avatar_url)
    VALUES (
      user_record.id,
      new_username,
      COALESCE(user_record.raw_user_meta_data->>'display_name', user_record.email),
      COALESCE(user_record.raw_user_meta_data->>'avatar_url', '')
    );

    RAISE NOTICE 'Created profile for user % with username %', user_record.id, new_username;
  END LOOP;
END $$;

SELECT 'Profile creation trigger fixed successfully!' as status;
