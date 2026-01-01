-- Migration: Update search_pins to filter by user
-- This migration updates the search_pins function to accept a user_id parameter
-- and filter results to only return pins created by that user

-- Drop the old function
DROP FUNCTION IF EXISTS search_pins(TEXT);

-- Create updated function with user_id parameter
CREATE OR REPLACE FUNCTION search_pins(search_query TEXT, user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  image_url TEXT,
  image_width INTEGER,
  image_height INTEGER,
  source_url TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.image_url,
    p.image_width,
    p.image_height,
    p.source_url,
    p.created_by,
    p.created_at,
    ts_rank(
      to_tsvector('english', COALESCE(p.title, '') || ' ' || COALESCE(p.description, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM pins p
  WHERE
    p.created_by = user_id
    AND to_tsvector('english', COALESCE(p.title, '') || ' ' || COALESCE(p.description, ''))
    @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: search_pins now filters by user_id';
END $$;
