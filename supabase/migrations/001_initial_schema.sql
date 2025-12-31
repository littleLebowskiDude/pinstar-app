-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- PROFILES TABLE
-- =====================================================
-- Extends Supabase auth.users with additional profile information
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Index for username lookups
CREATE INDEX idx_profiles_username ON profiles(username);

-- =====================================================
-- BOARDS TABLE
-- =====================================================
-- Collections of pins organized by users
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

-- Indexes for common queries
CREATE INDEX idx_boards_owner_id ON boards(owner_id);
CREATE INDEX idx_boards_is_private ON boards(is_private);
CREATE INDEX idx_boards_created_at ON boards(created_at DESC);

-- =====================================================
-- PINS TABLE
-- =====================================================
-- Individual pins with images and metadata
CREATE TABLE pins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  image_width INTEGER,
  image_height INTEGER,
  source_url TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT image_dimensions_positive CHECK (
    (image_width IS NULL AND image_height IS NULL) OR
    (image_width > 0 AND image_height > 0)
  )
);

-- Indexes for common queries
CREATE INDEX idx_pins_created_by ON pins(created_by);
CREATE INDEX idx_pins_created_at ON pins(created_at DESC);

-- Full-text search index on title and description
CREATE INDEX idx_pins_search ON pins USING gin(
  (to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')))
);

-- Trigram index for fuzzy text search
CREATE INDEX idx_pins_title_trgm ON pins USING gin(title gin_trgm_ops);
CREATE INDEX idx_pins_description_trgm ON pins USING gin(description gin_trgm_ops);

-- =====================================================
-- BOARD_PINS JUNCTION TABLE
-- =====================================================
-- Many-to-many relationship between boards and pins
CREATE TABLE board_pins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  pin_id UUID NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: a pin can only be added to a board once
  CONSTRAINT unique_board_pin UNIQUE(board_id, pin_id)
);

-- Indexes for junction table queries
CREATE INDEX idx_board_pins_board_id ON board_pins(board_id);
CREATE INDEX idx_board_pins_pin_id ON board_pins(pin_id);
CREATE INDEX idx_board_pins_position ON board_pins(board_id, position);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
-- Automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AUTO-CREATE PROFILE TRIGGER
-- =====================================================
-- Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_pins ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- PROFILES POLICIES
-- -----------------------------------------------------

-- Anyone can view profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but allow manual insert)
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------
-- BOARDS POLICIES
-- -----------------------------------------------------

-- Anyone can view public boards
CREATE POLICY "Public boards are viewable by everyone"
  ON boards
  FOR SELECT
  USING (is_private = false OR owner_id = auth.uid());

-- Users can create their own boards
CREATE POLICY "Users can create their own boards"
  ON boards
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can update their own boards
CREATE POLICY "Users can update their own boards"
  ON boards
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Users can delete their own boards
CREATE POLICY "Users can delete their own boards"
  ON boards
  FOR DELETE
  USING (auth.uid() = owner_id);

-- -----------------------------------------------------
-- PINS POLICIES
-- -----------------------------------------------------

-- Anyone can view all pins (public content)
CREATE POLICY "Pins are viewable by everyone"
  ON pins
  FOR SELECT
  USING (true);

-- Authenticated users can create pins
CREATE POLICY "Authenticated users can create pins"
  ON pins
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own pins
CREATE POLICY "Users can update their own pins"
  ON pins
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Users can delete their own pins
CREATE POLICY "Users can delete their own pins"
  ON pins
  FOR DELETE
  USING (auth.uid() = created_by);

-- -----------------------------------------------------
-- BOARD_PINS POLICIES
-- -----------------------------------------------------

-- Anyone can view board_pins for public boards
CREATE POLICY "Board pins are viewable for accessible boards"
  ON board_pins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_pins.board_id
      AND (boards.is_private = false OR boards.owner_id = auth.uid())
    )
  );

-- Board owners can add pins to their boards
CREATE POLICY "Board owners can add pins to their boards"
  ON board_pins
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_pins.board_id
      AND boards.owner_id = auth.uid()
    )
  );

-- Board owners can update pins in their boards (e.g., reorder)
CREATE POLICY "Board owners can update pins in their boards"
  ON board_pins
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_pins.board_id
      AND boards.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_pins.board_id
      AND boards.owner_id = auth.uid()
    )
  );

-- Board owners can remove pins from their boards
CREATE POLICY "Board owners can remove pins from their boards"
  ON board_pins
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_pins.board_id
      AND boards.owner_id = auth.uid()
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to search pins by text
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
    to_tsvector('english', COALESCE(p.title, '') || ' ' || COALESCE(p.description, ''))
    @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- INITIAL DATA / COMMENTS
-- =====================================================

COMMENT ON TABLE profiles IS 'User profiles extending auth.users';
COMMENT ON TABLE boards IS 'Collections of pins organized by users';
COMMENT ON TABLE pins IS 'Individual pins with images and metadata';
COMMENT ON TABLE board_pins IS 'Many-to-many relationship between boards and pins';

COMMENT ON COLUMN profiles.username IS 'Unique username for the profile, 3-30 alphanumeric characters';
COMMENT ON COLUMN boards.is_private IS 'Whether the board is private (only visible to owner) or public';
COMMENT ON COLUMN pins.image_width IS 'Width in pixels, used for masonry layout calculations';
COMMENT ON COLUMN pins.image_height IS 'Height in pixels, used for masonry layout calculations';
COMMENT ON COLUMN board_pins.position IS 'Position/order of the pin within the board, lower numbers appear first';
