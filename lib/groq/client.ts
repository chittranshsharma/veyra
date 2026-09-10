import "server-only";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
// Primary model: Llama 3.3 70B Versatile (fast, smart, high context)
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqChatOptions {
  messages: GroqMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== "");
}

/**
 * Executes a fast Groq chat completion.
 * Returns null if GROQ_API_KEY is not configured so callers can trigger high-quality fallbacks.
 */
export async function groqChat({
  messages,
  model = DEFAULT_MODEL,
  temperature = 0.7,
  maxTokens = 1024,
  jsonMode = false,
}: GroqChatOptions): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Groq API error ${res.status}]:`, errorText);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    console.error("[Groq Fetch Exception]:", err);
    return null;
  }
}
