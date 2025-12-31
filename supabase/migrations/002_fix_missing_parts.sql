-- =====================================================
-- FIX MISSING PARTS (Safe to run multiple times)
-- =====================================================
-- This migration handles cases where 001 was partially applied

-- Enable extensions (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- CREATE MISSING TABLES
-- =====================================================

-- Boards table (create if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'boards') THEN
    CREATE TABLE boards (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      cover_image_url TEXT,
      owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      is_private BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
    );

    CREATE INDEX idx_boards_owner_id ON boards(owner_id);
    CREATE INDEX idx_boards_is_private ON boards(is_private);
    CREATE INDEX idx_boards_created_at ON boards(created_at DESC);
  END IF;
END $$;

-- Pins table (create if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pins') THEN
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
      CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
      CONSTRAINT image_dimensions_positive CHECK (
        (image_width IS NULL AND image_height IS NULL) OR
        (image_width > 0 AND image_height > 0)
      )
    );

    CREATE INDEX idx_pins_created_by ON pins(created_by);
    CREATE INDEX idx_pins_created_at ON pins(created_at DESC);
    CREATE INDEX idx_pins_search ON pins USING gin(
      (to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')))
    );
    CREATE INDEX idx_pins_title_trgm ON pins USING gin(title gin_trgm_ops);
    CREATE INDEX idx_pins_description_trgm ON pins USING gin(description gin_trgm_ops);
  END IF;
END $$;

-- Board_pins table (create if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'board_pins') THEN
    CREATE TABLE board_pins (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      pin_id UUID NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
      position INTEGER NOT NULL DEFAULT 0,
      added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT unique_board_pin UNIQUE(board_id, pin_id)
    );

    CREATE INDEX idx_board_pins_board_id ON board_pins(board_id);
    CREATE INDEX idx_board_pins_pin_id ON board_pins(pin_id);
    CREATE INDEX idx_board_pins_position ON board_pins(board_id, position);
  END IF;
END $$;

-- =====================================================
-- ENSURE PROFILES TABLE HAS INDEX
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- =====================================================
-- TRIGGER FUNCTIONS (Create or replace - safe)
-- =====================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile trigger function
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

-- =====================================================
-- CREATE TRIGGERS (Drop and recreate to ensure they exist)
-- =====================================================

-- Profiles updated_at trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Boards updated_at trigger (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'boards') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS update_boards_updated_at ON boards';
    EXECUTE 'CREATE TRIGGER update_boards_updated_at
      BEFORE UPDATE ON boards
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()';
  END IF;
END $$;

-- Auth user created trigger (THE CRITICAL ONE!)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'boards') THEN
    ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pins') THEN
    ALTER TABLE pins ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'board_pins') THEN
    ALTER TABLE board_pins ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- =====================================================
-- RLS POLICIES (Drop and recreate to ensure they exist)
-- =====================================================

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- BOARDS POLICIES (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'boards') THEN
    DROP POLICY IF EXISTS "Public boards are viewable by everyone" ON boards;
    CREATE POLICY "Public boards are viewable by everyone"
      ON boards FOR SELECT
      USING (is_private = false OR owner_id = auth.uid());

    DROP POLICY IF EXISTS "Users can create their own boards" ON boards;
    CREATE POLICY "Users can create their own boards"
      ON boards FOR INSERT
      WITH CHECK (auth.uid() = owner_id);

    DROP POLICY IF EXISTS "Users can update their own boards" ON boards;
    CREATE POLICY "Users can update their own boards"
      ON boards FOR UPDATE
      USING (auth.uid() = owner_id)
      WITH CHECK (auth.uid() = owner_id);

    DROP POLICY IF EXISTS "Users can delete their own boards" ON boards;
    CREATE POLICY "Users can delete their own boards"
      ON boards FOR DELETE
      USING (auth.uid() = owner_id);
  END IF;
END $$;

-- PINS POLICIES (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pins') THEN
    DROP POLICY IF EXISTS "Pins are viewable by everyone" ON pins;
    CREATE POLICY "Pins are viewable by everyone"
      ON pins FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Authenticated users can create pins" ON pins;
    CREATE POLICY "Authenticated users can create pins"
      ON pins FOR INSERT
      WITH CHECK (auth.uid() = created_by);

    DROP POLICY IF EXISTS "Users can update their own pins" ON pins;
    CREATE POLICY "Users can update their own pins"
      ON pins FOR UPDATE
      USING (auth.uid() = created_by)
      WITH CHECK (auth.uid() = created_by);

    DROP POLICY IF EXISTS "Users can delete their own pins" ON pins;
    CREATE POLICY "Users can delete their own pins"
      ON pins FOR DELETE
      USING (auth.uid() = created_by);
  END IF;
END $$;

-- BOARD_PINS POLICIES (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'board_pins') THEN
    DROP POLICY IF EXISTS "Board pins are viewable for accessible boards" ON board_pins;
    CREATE POLICY "Board pins are viewable for accessible boards"
      ON board_pins FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM boards
          WHERE boards.id = board_pins.board_id
          AND (boards.is_private = false OR boards.owner_id = auth.uid())
        )
      );

    DROP POLICY IF EXISTS "Board owners can add pins to their boards" ON board_pins;
    CREATE POLICY "Board owners can add pins to their boards"
      ON board_pins FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM boards
          WHERE boards.id = board_pins.board_id
          AND boards.owner_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "Board owners can update pins in their boards" ON board_pins;
    CREATE POLICY "Board owners can update pins in their boards"
      ON board_pins FOR UPDATE
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

    DROP POLICY IF EXISTS "Board owners can remove pins from their boards" ON board_pins;
    CREATE POLICY "Board owners can remove pins from their boards"
      ON board_pins FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM boards
          WHERE boards.id = board_pins.board_id
          AND boards.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

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

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully! All missing parts have been added.';
END $$;
