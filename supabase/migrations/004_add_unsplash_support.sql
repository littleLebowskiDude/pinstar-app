-- =====================================================
-- ADD UNSPLASH SUPPORT TO PINS TABLE
-- =====================================================
-- Add source and attribution columns to support Unsplash images

-- Add source column (upload or unsplash)
ALTER TABLE pins
ADD COLUMN source TEXT NOT NULL DEFAULT 'upload'
CHECK (source IN ('upload', 'unsplash'));

-- Add attribution column for Unsplash photographer credit
ALTER TABLE pins
ADD COLUMN attribution JSONB;

-- Add index for querying by source
CREATE INDEX idx_pins_source ON pins(source);

-- Add comments for documentation
COMMENT ON COLUMN pins.source IS 'Source of the pin image: upload (user uploaded) or unsplash (from Unsplash API)';
COMMENT ON COLUMN pins.attribution IS 'Attribution data for Unsplash images: {photographer: string, photographerUrl: string, unsplashUrl: string}';

-- =====================================================
-- UPDATE SEARCH FUNCTION TO INCLUDE NEW COLUMNS
-- =====================================================
-- Update the search_pins function to include source and attribution

CREATE OR REPLACE FUNCTION search_pins(search_query TEXT)
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
  source TEXT,
  attribution JSONB,
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
    p.source,
    p.attribution,
    ts_rank(
      to_tsvector('english', COALESCE(p.title, '') || ' ' || COALESCE(p.description, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM pins p
  WHERE
    to_tsvector('english', COALESCE(p.title, '') || ' ' || COALESCE(p.description, ''))
    @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql STABLE;
