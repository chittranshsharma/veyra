import { NextRequest, NextResponse } from "next/server";
import { groqChat, isGroqConfigured } from "@/lib/groq/client";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const xrayRequestSchema = z.object({
  title: z.string().min(1).max(120),
  mediaType: z.enum(["movie", "tv"]).optional().default("movie"),
  overview: z.string().max(1000).optional().default(""),
  genres: z.array(z.string().max(40)).max(10).optional().default([]),
  cast: z.array(z.string().max(60)).max(15).optional().default([]),
  mode: z.enum(["trivia", "clarify", "ending", "question"]),
  question: z.string().max(300).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
    const { success } = await checkRateLimit(`ai-xray:${ip}`, "api");
    if (!success) {
      return NextResponse.json({ error: "Too many AI X-Ray requests. Please wait a moment." }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = xrayRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { title, mediaType, overview, genres, cast, mode, question } = parsed.data;

    const isLive = isGroqConfigured();

    let systemPrompt = "";
    let userPrompt = "";

    const contextHeader = `Title: ${title} (${mediaType.toUpperCase()})
Genres: ${genres.join(", ") || "N/A"}
Key Cast: ${cast.slice(0, 6).join(", ") || "N/A"}
Overview: ${overview || "N/A"}`;

    if (mode === "trivia") {
      systemPrompt = `You are a cinematic historian and X-Ray intelligence expert.
Provide 4 fascinating, verified production trivia facts, cinematography secrets, or hidden easter eggs about this title.
Format as 4 concise markdown bullet points with a bold topic label. Make each bullet deeply interesting and specific.`;
      userPrompt = `${contextHeader}\n\nGenerate 4 fascinating trivia and easter egg facts for "${title}".`;
    } else if (mode === "clarify") {
      systemPrompt = `You are a spoiler-free film guide.
Explain the core narrative setup, timeline mechanics, world-building rules, or character motivations for this title.
CRITICAL CONSTRAINT: STRICTLY NO SPOILERS for the third act, plot twists, or ending. Help the viewer follow what is happening without ruining any future reveals. Keep it under 150 words in clear, clean markdown.`;
      userPrompt = `${contextHeader}\n\nClarify the core premise, timeline, and mechanics of "${title}" completely spoiler-free.`;
    } else if (mode === "ending") {
      systemPrompt = `You are a film scholar analyzing story endings.
Analyze the ending of this title: what happened, what the central symbols/metaphors mean, and what the director or creator intended to convey.
Provide an insightful, illuminating breakdown in 2-3 paragraphs of markdown.`;
      userPrompt = `${contextHeader}\n\nDeconstruct the ending, themes, and symbolic resolution of "${title}".`;
    } else if (mode === "question") {
      systemPrompt = `You are an encyclopedia on cinema and television.
Answer the user's specific question about this title concisely and accurately. If answering would reveal a major twist or spoiler, precede the spoiler with a clear warning tag.`;
      userPrompt = `${contextHeader}\n\nUser Question: ${question || "What makes this title unique?"}`;
    }

    let responseContent: string | null = null;

    if (isLive) {
      responseContent = await groqChat({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        maxTokens: 800,
      });
    }

    // Fallback if Groq is not configured or fails
    if (!responseContent) {
      if (mode === "trivia") {
        responseContent = `* **Director's Vision**: The director prioritized practical effects and real on-location stunts wherever possible to ground the spectacle in physical reality.\n* **Soundtrack Synergy**: The musical score was specifically composed to mimic the psychological tempo of the protagonist.\n* **Cinematography Secrets**: The aspect ratio and color palette shift subtly to mirror the protagonist's emotional transformation.\n* **Critical Acclaim**: Widely celebrated by critics and audience polls for pushing genre boundaries.`;
      } else if (mode === "clarify") {
        responseContent = `**The Story Mechanics**: The narrative centers on a high-stakes premise where every character's survival depends on balancing personal trust with hidden motivations.\n\n**Key Rule**: Pay close attention to subtle visual motifs and background dialogue—they often foreshadow pivotal turning points. *(Spoiler-Free Guarantee: No third-act reveals)*`;
      } else if (mode === "ending") {
        responseContent = `The conclusion shifts from external conflict to internal resolution. Rather than providing a simplistic tidy answer, the ending leaves the audience contemplating whether the protagonist truly found closure or accepted a necessary illusion.\n\nThe final imagery reinforces that the journey itself was about self-reckoning rather than external triumph.`;
      } else {
        responseContent = `Regarding **${title}**: The narrative weaves complex character arcs with layered thematic storytelling designed for multiple viewings.`;
      }
    }

    return NextResponse.json({
      success: true,
      isLiveAi: isLive,
      isLiveGroq: isLive,
      mode,
      content: responseContent,
    });
  } catch (error) {
    console.error("AI X-Ray unexpected error:", error);
    return NextResponse.json({ error: "Failed to generate X-Ray data" }, { status: 500 });
  }
}
