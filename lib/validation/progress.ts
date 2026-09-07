import { z } from "zod";

export const vidkingEventSchema = z.object({
  type: z.literal("PLAYER_EVENT"),
  data: z.object({
    event: z.enum(["play", "pause", "ended", "seeked", "timeupdate"]),
    currentTime: z.number().nonnegative(),
    duration: z.number().nonnegative(),
    progress: z.number().min(0).max(100),
    id: z.union([z.string(), z.number()]),
    mediaType: z.enum(["movie", "tv"]),
    season: z.number().int().positive().optional(),
    episode: z.number().int().positive().optional(),
    timestamp: z.number().optional(),
  }),
});

export type VidkingEvent = z.infer<typeof vidkingEventSchema>;

// Body accepted by POST /api/progress
export const progressUpsertSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  season: z.number().int().positive().nullable().optional(),
  episode: z.number().int().positive().nullable().optional(),
  progressSeconds: z.number().nonnegative(),
  durationSeconds: z.number().nonnegative(),
  progressPercent: z.number().min(0).max(100),
});
