import { NextRequest, NextResponse } from "next/server";
import { groqChat, isGroqConfigured } from "@/lib/groq/client";
import { tmdb } from "@/lib/tmdb/client";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const promptSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(500, "Prompt cannot exceed 500 characters"),
});

const groqRecItemSchema = z.object({
  title: z.string().min(1),
  year: z.string().optional(),
  mediaType: z.enum(["movie", "tv"]).default("movie"),
  matchReason: z.string().default("Matches your mood"),
});

const groqRecResponseSchema = z.object({
  curatorNote: z.string().min(1),
  recommendations: z.array(groqRecItemSchema).min(1),
});

type GroqRecResponse = z.infer<typeof groqRecResponseSchema>;

// Curated fallbacks if Groq API key is not yet set
const FALLBACK_VIBES: Record<string, GroqRecResponse> = {
  scifi: {
    curatorNote: "Cerebral, reality-bending masterworks with staggering concepts and unforeseen twists.",
    recommendations: [
      { title: "Inception", year: "2010", mediaType: "movie", matchReason: "A subconscious labyrinth where architectural dream layers unravel your grip on reality." },
      { title: "Interstellar", year: "2014", mediaType: "movie", matchReason: "Breathtaking theoretical physics combined with raw, emotional time dilation." },
      { title: "Arrival", year: "2016", mediaType: "movie", matchReason: "A linguistic puzzle with non-linear timelines that alters how you perceive existence." },
      { title: "Dark", year: "2019", mediaType: "tv", matchReason: "The gold standard of time-loop mysteries spanning multiple generations of secrets." },
    ],
  },
  cozy: {
    curatorNote: "Warm, soul-nourishing animation and comforting stories for a rainy evening.",
    recommendations: [
      { title: "Spirited Away", year: "2001", mediaType: "movie", matchReason: "Miyazaki's bathhouse masterpiece wrapped in enchanting folklore and nostalgia." },
      { title: "Your Name", year: "2016", mediaType: "movie", matchReason: "A visually stunning, emotionally transcendent bond bridging time and distance." },
      { title: "Amélie", year: "2001", mediaType: "movie", matchReason: "Playful Parisian whimsy that restores your faith in human kindness." },
    ],
  },
  thriller: {
    curatorNote: "High-octane tension, razor-sharp cat-and-mouse games, and relentless adrenaline.",
    recommendations: [
      { title: "Heat", year: "1995", mediaType: "movie", matchReason: "Michael Mann's magnum opus of precision bank heists and conflicting professional codes." },
      { title: "Sicario", year: "2015", mediaType: "movie", matchReason: "A suffocating, morally murky descent into border warfare with masterclass cinematography." },
      { title: "Shutter Island", year: "2010", mediaType: "movie", matchReason: "A rain-drenched psychiatric fortress hiding a psychological trap door." },
    ],
  },
  default: {
    curatorNote: "Selected based on top cinematic storytelling, deep characters, and unmissable execution.",
    recommendations: [
      { title: "Everything Everywhere All at Once", year: "2022", mediaType: "movie", matchReason: "A chaotic multiverse adventure rooted in a poignant mother-daughter reconciliation." },
      { title: "Blade Runner 2049", year: "2017", mediaType: "movie", matchReason: "A hypnotic neo-noir exploring what it truly means to possess a soul." },
      { title: "Severance", year: "2022", mediaType: "tv", matchReason: "An eerie, razor-sharp corporate mystery that will have you on the edge of your seat." },
    ],
  },
};

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
    const { success } = await checkRateLimit(`ai-recommend:${ip}`, "api");
    if (!success) {
      return NextResponse.json({ error: "Too many recommendation requests. Please wait a moment." }, { status: 429 });
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = promptSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const cleanPrompt = parsed.data.prompt.trim();
    let aiResult: GroqRecResponse | null = null;
    const isLive = isGroqConfigured();

    if (isLive) {
      const systemPrompt = `You are Veyra AI, a warm, friendly, and knowledgeable movie & TV assistant.
The user wants movie or TV recommendations based on what they feel like watching.
Understand the user's mood, taste, and preferences.
Return EXACTLY 3 to 4 real movies or TV shows that perfectly match what they asked for.
Format your output as a strict JSON object with this exact structure:
{
  "curatorNote": "1 warm, friendly sentence explaining what makes these picks great for them",
  "recommendations": [
    {
      "title": "Exact Title of the Movie or TV Show",
      "year": "YYYY",
      "mediaType": "movie",
      "matchReason": "1 friendly, punchy sentence explaining why they will enjoy this"
    }
  ]
}
Only output valid JSON.`;

      const responseText = await groqChat({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: cleanPrompt },
        ],
        jsonMode: true,
        temperature: 0.6,
      });

      if (responseText) {
        try {
          const raw = JSON.parse(responseText);
          const validated = groqRecResponseSchema.safeParse(raw);
          if (validated.success) {
            aiResult = validated.data;
          }
        } catch {
          console.error("Failed to parse or validate Groq response JSON:", responseText);
        }
      }
    }

    // Fallback if Groq is not configured or failed
    if (!aiResult) {
      const lower = cleanPrompt.toLowerCase();
      if (lower.includes("sci-fi") || lower.includes("mind") || lower.includes("twist") || lower.includes("dream")) {
        aiResult = FALLBACK_VIBES.scifi ?? FALLBACK_VIBES.default!;
      } else if (lower.includes("cozy") || lower.includes("rain") || lower.includes("anime") || lower.includes("warm")) {
        aiResult = FALLBACK_VIBES.cozy ?? FALLBACK_VIBES.default!;
      } else if (lower.includes("heist") || lower.includes("thrill") || lower.includes("action") || lower.includes("tension")) {
        aiResult = FALLBACK_VIBES.thriller ?? FALLBACK_VIBES.default!;
      } else {
        aiResult = FALLBACK_VIBES.default!;
      }
    }

    // Concurrently enrich all recommended titles via TMDB searchMulti
    const enrichedPromises = (aiResult?.recommendations ?? []).map(async (rec) => {
      try {
        const searchRes = await tmdb.searchMulti(rec.title, 1);
        const match = searchRes.results.find(
          (r) =>
            (r.media_type === "movie" || r.media_type === "tv") &&
            (r.poster_path != null || r.backdrop_path != null)
        );

        return {
          ...rec,
          tmdbId: match?.id ?? null,
          posterPath: match?.poster_path ?? null,
          backdropPath: match?.backdrop_path ?? null,
          voteAverage: match?.vote_average ?? null,
          releaseYear: (match?.release_date || match?.first_air_date || rec.year || "").slice(0, 4),
          canonicalMediaType: match?.media_type ?? rec.mediaType,
        };
      } catch {
        return {
          ...rec,
          tmdbId: null,
          posterPath: null,
          backdropPath: null,
          voteAverage: null,
          releaseYear: rec.year ?? "",
          canonicalMediaType: rec.mediaType,
        };
      }
    });

    const enrichedRecommendations = await Promise.all(enrichedPromises);

    return NextResponse.json({
      success: true,
      isLiveAi: isLive,
      isLiveGroq: isLive,
      curatorNote: aiResult.curatorNote,
      recommendations: enrichedRecommendations,
    });
  } catch (error) {
    console.error("AI recommend error:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
