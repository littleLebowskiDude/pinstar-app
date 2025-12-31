-- =====================================================
-- BOARD SEARCH FUNCTION
-- =====================================================

-- Add full-text search indexes for boards
CREATE INDEX IF NOT EXISTS idx_boards_search ON boards USING gin(
  (to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '')))
);

CREATE INDEX IF NOT EXISTS idx_boards_name_trgm ON boards USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_boards_description_trgm ON boards USING gin(description gin_trgm_ops);

-- Function to search boards by text
CREATE OR REPLACE FUNCTION search_boards(search_query TEXT, user_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  cover_image_url TEXT,
  owner_id UUID,
  is_private BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.description,
    b.cover_image_url,
    b.owner_id,
    b.is_private,
    b.created_at,
    b.updated_at,
    ts_rank(
      to_tsvector('english', COALESCE(b.name, '') || ' ' || COALESCE(b.description, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM boards b
  WHERE
    to_tsvector('english', COALESCE(b.name, '') || ' ' || COALESCE(b.description, ''))
    @@ plainto_tsquery('english', search_query)
    AND (
      b.is_private = false
      OR (user_id IS NOT NULL AND b.owner_id = user_id)
    )
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_boards IS 'Search boards by name and description using full-text search. Respects privacy settings.';
