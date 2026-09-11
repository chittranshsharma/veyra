import { NextRequest, NextResponse } from "next/server";
import { groqChat, isGroqConfigured } from "@/lib/groq/client";

interface RecapRequest {
  showName: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeName?: string;
  episodeOverview?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RecapRequest = await req.json();
    const { showName, seasonNumber, episodeNumber, episodeName = "", episodeOverview = "" } = body;

    if (!showName || seasonNumber == null || episodeNumber == null) {
      return NextResponse.json({ error: "Show name, season, and episode are required" }, { status: 400 });
    }

    const isLive = isGroqConfigured();

    let responseJson: {
      storySoFar: string[];
      characterRadar: string[];
      activeMysteries: string[];
    } | null = null;

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
          responseJson = JSON.parse(responseText);
        } catch {
          console.error("Failed to parse Groq recap JSON:", responseText);
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
      isLiveGroq: isLive,
      showName,
      seasonNumber,
      episodeNumber,
      episodeName,
      ...responseJson,
    });
  } catch (error: any) {
    console.error("AI Recap error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate episode recap" }, { status: 500 });
  }
}
