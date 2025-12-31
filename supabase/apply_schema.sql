-- Quick fix: Ensure the foreign key relationship exists and is in the schema cache
-- Run this in your Supabase SQL Editor

-- First, check if the foreign key exists
DO $$
BEGIN
  -- If the foreign key doesn't exist, add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'pins_created_by_fkey'
  ) THEN
    ALTER TABLE pins
    ADD CONSTRAINT pins_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
