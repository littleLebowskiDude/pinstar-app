-- =====================================================
-- ADD GIPHY SUPPORT TO PINS SOURCE CONSTRAINT
-- =====================================================
-- Update the source CHECK constraint to include 'giphy' as a valid source

-- Drop the existing constraint
ALTER TABLE pins
DROP CONSTRAINT IF EXISTS pins_source_check;

-- Add the updated constraint with giphy support
ALTER TABLE pins
ADD CONSTRAINT pins_source_check
CHECK (source IN ('upload', 'unsplash', 'giphy'));

-- Add comment for documentation
COMMENT ON COLUMN pins.source IS 'Source of the pin image: upload (user uploaded), unsplash (from Unsplash API), or giphy (from Giphy API)';
