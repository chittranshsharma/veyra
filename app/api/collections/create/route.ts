import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(80, "Name cannot exceed 80 characters"),
  description: z.string().max(300, "Description cannot exceed 300 characters").nullable().optional(),
  isPublic: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = await checkRateLimit(user.id, "api");
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { name, description, isPublic } = parsed.data;

    const { data, error } = await supabase
      .from("collections")
      .insert({ user_id: user.id, name, description: description ?? null, is_public: isPublic })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[Collection Create DB error]:", error?.message);
      return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("[Collection Create Unexpected error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
