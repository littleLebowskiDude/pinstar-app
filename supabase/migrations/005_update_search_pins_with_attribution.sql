-- Migration: Update search_pins to include source and attribution fields
-- This migration updates the search_pins function to return the new attribution fields

-- Drop the old function
DROP FUNCTION IF EXISTS search_pins(TEXT, UUID);

-- Create updated function with source and attribution fields
CREATE OR REPLACE FUNCTION search_pins(search_query TEXT, user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  image_url TEXT,
  image_width INTEGER,
  image_height INTEGER,
  source_url TEXT,
  source TEXT,
  attribution JSONB,
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
    p.source,
    p.attribution,
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
  RAISE NOTICE 'Migration completed: search_pins now returns source and attribution fields';
END $$;
