import { NextRequest, NextResponse } from "next/server";
import { groqChat, isGroqConfigured } from "@/lib/groq/client";
import { tmdb } from "@/lib/tmdb/client";

interface GroqRecItem {
  title: string;
  year?: string;
  mediaType: "movie" | "tv";
  matchReason: string;
}

interface GroqRecResponse {
  curatorNote: string;
  recommendations: GroqRecItem[];
}

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
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const cleanPrompt = prompt.trim();
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
      "mediaType": "movie" | "tv",
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
          aiResult = JSON.parse(responseText);
        } catch {
          console.error("Failed to parse Groq response JSON:", responseText);
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
            (r.title?.toLowerCase() === rec.title.toLowerCase() ||
              r.name?.toLowerCase() === rec.title.toLowerCase() ||
              true)
        ) ?? searchRes.results[0];

        if (!match) {
          return null;
        }

        const mediaType = match.media_type ?? rec.mediaType ?? "movie";
        return {
          id: match.id,
          title: match.title ?? match.name ?? rec.title,
          media_type: mediaType,
          poster_path: match.poster_path,
          backdrop_path: match.backdrop_path,
          vote_average: match.vote_average,
          release_date: match.release_date ?? match.first_air_date ?? rec.year,
          overview: match.overview,
          matchReason: rec.matchReason,
        };
      } catch (err) {
        console.error(`Failed to enrich title "${rec.title}":`, err);
        return null;
      }
    });

    const enrichedItems = (await Promise.all(enrichedPromises)).filter(Boolean);

    return NextResponse.json({
      success: true,
      isLiveAi: isLive,
      isLiveGroq: isLive,
      curatorNote: aiResult?.curatorNote ?? "Handpicked recommendations matching what you want to watch.",
      items: enrichedItems,
    });
  } catch (error: any) {
    console.error("AI recommend route error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate recommendations" }, { status: 500 });
  }
}
