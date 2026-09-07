-- ---------- 0002_admin.sql ----------
-- Migration: Add is_admin to profiles, add admin moderation policy, and create featured_titles table

-- 1. Add is_admin to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 2. Create featured_titles table
CREATE TABLE IF NOT EXISTS public.featured_titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id integer NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title text,
  poster_path text,
  backdrop_path text,
  overview text,
  added_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tmdb_id, media_type)
);

ALTER TABLE public.featured_titles ENABLE ROW LEVEL SECURITY;

-- Featured titles policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'featured_titles' AND policyname = 'featured titles are viewable by everyone'
  ) THEN
    CREATE POLICY "featured titles are viewable by everyone"
      ON public.featured_titles FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'featured_titles' AND policyname = 'admins can insert featured titles'
  ) THEN
    CREATE POLICY "admins can insert featured titles"
      ON public.featured_titles FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'featured_titles' AND policyname = 'admins can update featured titles'
  ) THEN
    CREATE POLICY "admins can update featured titles"
      ON public.featured_titles FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'featured_titles' AND policyname = 'admins can delete featured titles'
  ) THEN
    CREATE POLICY "admins can delete featured titles"
      ON public.featured_titles FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'admins can delete any review'
  ) THEN
    CREATE POLICY "admins can delete any review"
      ON public.reviews FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
  END IF;
END $$;
