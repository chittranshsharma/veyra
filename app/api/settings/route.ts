import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

const settingsSchema = z.object({
  perfMode: z.enum(["auto", "performance", "default", "hd"]).optional(),
  audioLang: z.string().max(10).optional(),
  subtitleLang: z.string().max(10).optional(),
  region: z.string().max(10).optional(),
  saveHistory: z.boolean().optional(),
  hideMature: z.boolean().optional(),
  hardwareAccel: z.boolean().optional(),
  autoplayNext: z.boolean().optional(),
  preferredServer: z.string().max(50).optional(),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ preferences: null });
    }

    const { data: prefs, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[Settings GET DB error]:", error.message);
      return NextResponse.json({ error: "Failed to load preferences" }, { status: 500 });
    }

    return NextResponse.json({ preferences: prefs });
  } catch (err) {
    console.error("[Settings GET Unexpected error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(user.id, "api");
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.reset);
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = settingsSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.perfMode !== undefined) updates.perf_mode = parsed.data.perfMode;
    if (parsed.data.audioLang !== undefined) updates.audio_lang = parsed.data.audioLang;
    if (parsed.data.subtitleLang !== undefined) updates.subtitle_lang = parsed.data.subtitleLang;
    if (parsed.data.region !== undefined) updates.region = parsed.data.region;
    if (parsed.data.saveHistory !== undefined) updates.save_history = parsed.data.saveHistory;
    if (parsed.data.hideMature !== undefined) updates.hide_mature = parsed.data.hideMature;
    if (parsed.data.hardwareAccel !== undefined) updates.hardware_accel = parsed.data.hardwareAccel;
    if (parsed.data.autoplayNext !== undefined) updates.autoplay_next = parsed.data.autoplayNext;
    if (parsed.data.preferredServer !== undefined) updates.preferred_server = parsed.data.preferredServer;

    const { data: savedPrefs, error } = await supabase
      .from("user_preferences")
      .upsert(updates as any, { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) {
      console.error("[Settings POST DB error]:", error.message);
      return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, preferences: savedPrefs });
  } catch (err) {
    console.error("[Settings POST Unexpected error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
