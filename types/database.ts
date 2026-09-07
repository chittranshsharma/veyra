export type MediaType = "movie" | "tv";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          media_type: string
          rating: number
          tmdb_id: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          media_type: string
          rating: number
          tmdb_id: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          media_type?: string
          rating?: number
          tmdb_id?: number
          user_id?: string
        }
        Relationships: []
      }
      watch_progress: {
        Row: {
          completed: boolean
          duration_seconds: number
          episode: number | null
          id: string
          last_watched_at: string
          media_type: string
          progress_percent: number
          progress_seconds: number
          season: number | null
          tmdb_id: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          duration_seconds?: number
          episode?: number | null
          id?: string
          last_watched_at?: string
          media_type: string
          progress_percent?: number
          progress_seconds?: number
          season?: number | null
          tmdb_id: number
          user_id: string
        }
        Update: {
          completed?: boolean
          duration_seconds?: number
          episode?: number | null
          id?: string
          last_watched_at?: string
          media_type?: string
          progress_percent?: number
          progress_seconds?: number
          season?: number | null
          tmdb_id?: number
          user_id?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          added_at: string
          id: string
          media_type: string
          poster_path: string | null
          title: string
          tmdb_id: number
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          media_type: string
          poster_path?: string | null
          title: string
          tmdb_id: number
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          media_type?: string
          poster_path?: string | null
          title?: string
          tmdb_id?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
