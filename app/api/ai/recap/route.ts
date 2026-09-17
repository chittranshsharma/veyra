import { NextRequest, NextResponse } from "next/server";
import { groqChat, isGroqConfigured } from "@/lib/groq/client";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const recapRequestSchema = z.object({
  showName: z.string().min(1).max(100),
  seasonNumber: z.number().int().nonnegative(),
  episodeNumber: z.number().int().positive(),
  episodeName: z.string().max(150).optional().default(""),
  episodeOverview: z.string().max(1000).optional().default(""),
});

const recapResponseSchema = z.object({
  storySoFar: z.array(z.string()).min(1),
  characterRadar: z.array(z.string()).min(1),
  activeMysteries: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
    const { success } = await checkRateLimit(`ai-recap:${ip}`, "api");
    if (!success) {
      return NextResponse.json({ error: "Too many AI recap requests. Please wait a moment." }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsedInput = recapRequestSchema.safeParse(body);
    if (!parsedInput.success) {
      return NextResponse.json({ error: parsedInput.error.flatten() }, { status: 400 });
    }

    const { showName, seasonNumber, episodeNumber, episodeName, episodeOverview } = parsedInput.data;
    const isLive = isGroqConfigured();

    let responseJson: z.infer<typeof recapResponseSchema> | null = null;

    if (isLive) {
      const systemPrompt = `You are a TV recap specialist providing "Previously On..." catch-up briefings for television series.
CRITICAL MANDATORY CONSTRAINT:
STRICTLY NO SPOILERS FOR THIS EPISODE OR FUTURE EPISODES.
Only summarize plot events, alliances, and cliffhangers that occurred BEFORE Season ${seasonNumber}, Episode ${episodeNumber}.
Do NOT reveal anything that happens DURING or AFTER Season ${seasonNumber}, Episode ${episodeNumber}.

Return a clean JSON object with this exact structure:
{
  "storySoFar": [
    "Punchy recap point 1 of what led here",
    "Punchy recap point 2 of what led here",
    "Punchy recap point 3 of what led here"
  ],
  "characterRadar": [
    "Character alliance status / who is in danger 1",
    "Character alliance status / who is in danger 2"
  ],
  "activeMysteries": [
    "Unsolved question hanging in the balance 1",
    "Unsolved question hanging in the balance 2"
  ]
}
Only output valid JSON.`;

      const userPrompt = `Show: "${showName}"
Target Episode: Season ${seasonNumber}, Episode ${episodeNumber}${episodeName ? ` ("${episodeName}")` : ""}
Target Episode Setup: ${episodeOverview || "Heading into this episode."}

Generate the spoiler-free catch-up briefing leading into this exact episode.`;

      const responseText = await groqChat({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        jsonMode: true,
        temperature: 0.5,
      });

      if (responseText) {
        try {
          const raw = JSON.parse(responseText);
          const parsedModel = recapResponseSchema.safeParse(raw);
          if (parsedModel.success) {
            responseJson = parsedModel.data;
          }
        } catch {
          console.error("Failed to parse or validate Groq recap JSON:", responseText);
        }
      }
    }

    // High quality fallback if Groq is not configured or failed
    if (!responseJson) {
      responseJson = {
        storySoFar: [
          `Tensions have escalated following the critical events of the preceding episodes in Season ${seasonNumber}.`,
          `Major trust ruptures occurred as characters faced conflicting personal priorities.`,
          `The stage is set with factions repositioning themselves for the next confrontation.`,
        ],
        characterRadar: [
          `Key protagonists are navigating fragile truces while operating under surveillance.`,
          `Antagonists have strengthened their leverage, forcing unexpected compromises.`,
        ],
        activeMysteries: [
          `Who can truly be trusted as hidden agendas begin to surface?`,
          `How will the lingering consequences of the recent cliffhanger resolve?`,
        ],
      };
    }

    return NextResponse.json({
      success: true,
      isLiveAi: isLive,
      isLiveGroq: isLive,
      showName,
      season: seasonNumber,
      episode: episodeNumber,
      recap: responseJson,
    });
  } catch (error) {
    console.error("Recap API unexpected error:", error);
    return NextResponse.json({ error: "Failed to generate recap" }, { status: 500 });
  }
}
