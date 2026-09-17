-- Migration: 0004_user_preferences.sql
-- Creates user_preferences table for single source of truth settings

CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  perf_mode text NOT NULL DEFAULT 'default' CHECK (perf_mode IN ('auto', 'performance', 'default', 'hd')),
  audio_lang text NOT NULL DEFAULT 'en',
  subtitle_lang text NOT NULL DEFAULT 'en',
  region text NOT NULL DEFAULT 'US',
  save_history boolean NOT NULL DEFAULT true,
  hide_mature boolean NOT NULL DEFAULT false,
  hardware_accel boolean NOT NULL DEFAULT true,
  autoplay_next boolean NOT NULL DEFAULT true,
  preferred_server text NOT NULL DEFAULT 'VidKing',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies: users manage only their own preferences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'users manage own preferences'
  ) THEN
    CREATE POLICY "users manage own preferences"
      ON public.user_preferences FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
