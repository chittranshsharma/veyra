-- Migration: 0003_collections.sql
-- Run this in your Supabase SQL Editor

-- Collections table: user-created named lists
CREATE TABLE IF NOT EXISTS public.collections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  description  text,
  is_public    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Collection items: individual movie/TV entries in a collection
CREATE TABLE IF NOT EXISTS public.collection_items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id  uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  tmdb_id        bigint NOT NULL,
  media_type     text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title          text,
  poster_path    text,
  added_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE(collection_id, tmdb_id, media_type)
);

-- Updated_at trigger for collections
CREATE OR REPLACE FUNCTION public.handle_collection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_collection_updated_at ON public.collections;
CREATE TRIGGER set_collection_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE PROCEDURE public.handle_collection_updated_at();

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: collections
-- Anyone can read public collections
CREATE POLICY "public_collections_read"
  ON public.collections FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

-- Only owner can insert
CREATE POLICY "collections_insert"
  ON public.collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only owner can update
CREATE POLICY "collections_update"
  ON public.collections FOR UPDATE
  USING (auth.uid() = user_id);

-- Only owner can delete
CREATE POLICY "collections_delete"
  ON public.collections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies: collection_items
-- Read items from accessible collections
CREATE POLICY "collection_items_read"
  ON public.collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_items.collection_id
        AND (c.is_public = true OR c.user_id = auth.uid())
    )
  );

-- Insert: only the collection owner can add items
CREATE POLICY "collection_items_insert"
  ON public.collection_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_items.collection_id
        AND c.user_id = auth.uid()
    )
  );

-- Delete: only the collection owner can remove items
CREATE POLICY "collection_items_delete"
  ON public.collection_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_items.collection_id
        AND c.user_id = auth.uid()
    )
  );

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON public.collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_tmdb ON public.collection_items(tmdb_id, media_type);
